import { query, getClient } from '../../shared/database/index.js';
import { BusinessLogicError, NotFoundError, UnauthorizedError } from '../../shared/errors/ApiError.js';
import { eventPublisher, EVENT_TYPES } from '../../shared/events/publisher.js';
import { balanceService } from '../leave-balances/service.js';
import { escalationEngine } from './escalationEngine.js';

export class ApprovalService {
  async getMyApprovals(approverId) {
    // 1. Trigger JIT auto-escalation check to guarantee real-time consistency
    try {
      await escalationEngine.checkAndProcessEscalations();
    } catch (err) {
      console.warn('[ApprovalService] Escalation scan warning:', err.message);
    }

    // 2. Fetch pending queue for this specific approver
    const { rows } = await query(`
      SELECT r.id, r.employee_id, r.leave_type_id, r.location_id,
             r.start_date, r.end_date, r.start_session, r.end_session,
             r.duration, r.reason, r.status, r.applied_date, r.current_approver_id,
             r.escalated, r.escalation_deadline, r.attachments,
             c.name as leave_type_name, c.code as leave_type_code,
             u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
             l.name as location_name
      FROM leave_requests r
      JOIN leave_categories c ON r.leave_type_id = c.id
      JOIN users u ON r.employee_id = u.id
      LEFT JOIN locations l ON r.location_id = l.id
      WHERE r.current_approver_id = $1 AND r.status IN ('PENDING', 'CLARIFICATION_REQUIRED')
      
      UNION ALL
      
      SELECT a.id, a.employee_id, NULL as leave_type_id, u.location_id,
             a.date as start_date, a.date as end_date, 'FULL_DAY' as start_session, 'FULL_DAY' as end_session,
             0 as duration, a.reason, a.status, a.applied_date, ai.approver_id as current_approver_id,
             false as escalated, ai.deadline as escalation_deadline, '[]' as attachments,
             'Attendance Regularization' as leave_type_name, 'ATT' as leave_type_code,
             u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
             l.name as location_name
      FROM attendance_regularization a
      JOIN approval_instances ai ON a.id = ai.leave_request_id
      JOIN users u ON a.employee_id = u.id
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE ai.approver_id = $1 AND ai.status = 'PENDING' AND a.status IN ('PENDING', 'CLARIFICATION_REQUIRED')
      
      UNION ALL
      
      SELECT c.id, c.employee_id, NULL as leave_type_id, u.location_id,
             c.worked_date as start_date, c.worked_date as end_date, 'FULL_DAY' as start_session, 'FULL_DAY' as end_session,
             c.comp_off_earned as duration, c.reason, c.status, c.applied_date, ai.approver_id as current_approver_id,
             false as escalated, ai.deadline as escalation_deadline, '[]' as attachments,
             'Comp-Off Claim' as leave_type_name, 'COMP_OFF' as leave_type_code,
             u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
             l.name as location_name
      FROM comp_off_requests c
      JOIN approval_instances ai ON c.id = ai.leave_request_id
      JOIN users u ON c.employee_id = u.id
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE ai.approver_id = $1 AND ai.status = 'PENDING' AND c.status IN ('PENDING', 'CLARIFICATION_REQUIRED')
      
      ORDER BY applied_date DESC
    `, [approverId]);

    return rows.map(r => {
      const sDate = typeof r.start_date === 'string' ? r.start_date : r.start_date.toISOString().split('T')[0];
      const eDate = typeof r.end_date === 'string' ? r.end_date : r.end_date.toISOString().split('T')[0];

      let hoursRemaining = 48;
      let isEscalated = Boolean(r.escalated);
      if (r.escalation_deadline) {
        const diffMs = new Date(r.escalation_deadline).getTime() - Date.now();
        hoursRemaining = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
        if (diffMs <= 0) isEscalated = true;
      }

      return {
        ...r,
        startDate: sDate,
        endDate: eDate,
        leaveTypeName: r.leave_type_name,
        leaveTypeCode: r.leave_type_code,
        appliedDate: r.applied_date,
        employee: {
          id: r.employee_id,
          name: r.employee_name,
          email: r.employee_email,
          department: r.employee_department,
          designation: r.employee_designation,
          locationId: r.location_id,
          locationName: r.location_name || ''
        },
        sla: {
          appliedDate: r.applied_date,
          slaHours: 48,
          hoursRemaining,
          escalationDeadline: r.escalation_deadline,
          isEscalated
        }
      };
    });
  }

  async getApprovalById(leaveRequestId) {
    const isAtt = leaveRequestId.startsWith('ATT-');
    const isCo = leaveRequestId.startsWith('CO-');
    
    let rows;
    if (isAtt) {
      const res = await query(`
        SELECT a.id, a.employee_id, NULL as leave_type_id, u.location_id,
               a.date as start_date, a.date as end_date, 'FULL_DAY' as start_session, 'FULL_DAY' as end_session,
               0 as duration, a.reason, a.status, a.applied_date, NULL as current_approver_id,
               false as escalated, NULL as escalation_deadline, '[]' as attachments,
               'Attendance Regularization' as leave_type_name, 'ATT' as leave_type_code,
               u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
               l.name as location_name
        FROM attendance_regularization a
        JOIN users u ON a.employee_id = u.id
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE a.id = $1
      `, [leaveRequestId]);
      rows = res.rows;
    } else if (isCo) {
      const res = await query(`
        SELECT c.id, c.employee_id, NULL as leave_type_id, u.location_id,
               c.worked_date as start_date, c.worked_date as end_date, 'FULL_DAY' as start_session, 'FULL_DAY' as end_session,
               c.comp_off_earned as duration, c.reason, c.status, c.applied_date, NULL as current_approver_id,
               false as escalated, NULL as escalation_deadline, '[]' as attachments,
               'Comp-Off Claim' as leave_type_name, 'COMP_OFF' as leave_type_code,
               u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
               l.name as location_name
        FROM comp_off_requests c
        JOIN users u ON c.employee_id = u.id
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE c.id = $1
      `, [leaveRequestId]);
      rows = res.rows;
    } else {
      const res = await query(`
        SELECT r.id, r.employee_id, r.leave_type_id, r.location_id,
               r.start_date, r.end_date, r.start_session, r.end_session,
               r.duration, r.reason, r.status, r.applied_date, r.current_approver_id,
               r.escalated, r.escalation_deadline, r.attachments,
               c.name as leave_type_name, c.code as leave_type_code,
               u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
               l.name as location_name
        FROM leave_requests r
        JOIN leave_categories c ON r.leave_type_id = c.id
        JOIN users u ON r.employee_id = u.id
        LEFT JOIN locations l ON r.location_id = l.id
        WHERE r.id = $1
      `, [leaveRequestId]);
      rows = res.rows;
    }

    if (!rows.length) throw new NotFoundError('Approval not found');
    const r = rows[0];

    const { rows: instances } = await query(`
      SELECT ai.id, ai.leave_request_id, ai.role, ai.approver_id, ai.step_order, ai.status,
             ai.action_date, ai.deadline, ai.timeout_days, ai.remarks,
             u.name as approver_name, u.email as approver_email
      FROM approval_instances ai
      LEFT JOIN users u ON ai.approver_id = u.id
      WHERE ai.leave_request_id = $1
      ORDER BY ai.step_order ASC
    `, [leaveRequestId]);

    const approvalChain = instances.map(inst => ({
      id: inst.id,
      role: inst.role,
      approverId: inst.approver_id,
      approverName: inst.approver_name || inst.role,
      stepOrder: inst.step_order,
      status: inst.status,
      date: inst.action_date,
      deadline: inst.deadline,
      remarks: inst.remarks
    }));

    let categoryBalance = null;
    let policy = null;
    try {
      const balances = await balanceService.getBalancesForEmployee(r.employee_id, r.location_id);
      categoryBalance = balances.find(b => b.categoryId === r.leave_type_id) || null;
      const { rows: policyRows } = await query(
        'SELECT * FROM leave_policies WHERE location_id = $1 AND category_id = $2',
        [r.location_id, r.leave_type_id]
      );
      policy = policyRows[0] || null;
    } catch (err) {
      console.warn('Failed to attach balance in approval details:', err);
    }

    const sDate = typeof r.start_date === 'string' ? r.start_date : r.start_date.toISOString().split('T')[0];
    const eDate = typeof r.end_date === 'string' ? r.end_date : r.end_date.toISOString().split('T')[0];

    let hoursRemaining = 48;
    let isEscalated = Boolean(r.escalated);
    if (r.escalation_deadline) {
      const diffMs = new Date(r.escalation_deadline).getTime() - Date.now();
      hoursRemaining = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
      if (diffMs <= 0) isEscalated = true;
    }

    return {
      ...r,
      startDate: sDate,
      endDate: eDate,
      leaveTypeName: r.leave_type_name,
      leaveTypeCode: r.leave_type_code,
      appliedDate: r.applied_date,
      employee: {
        id: r.employee_id,
        name: r.employee_name,
        email: r.employee_email,
        department: r.employee_department,
        designation: r.employee_designation,
        locationId: r.location_id,
        locationName: r.location_name || ''
      },
      balance: categoryBalance,
      policy,
      approvalChain,
      steps: approvalChain,
      sla: {
        appliedDate: r.applied_date,
        slaHours: 48,
        hoursRemaining,
        escalationDeadline: r.escalation_deadline,
        isEscalated
      }
    };
  }

  async getApprovalHistory(approverId) {
    const { rows } = await query(`
      SELECT r.id, r.employee_id, r.leave_type_id, r.location_id,
             r.start_date, r.end_date, r.start_session, r.end_session,
             r.duration, r.reason, r.status, r.applied_date,
             c.name as leave_type_name, c.code as leave_type_code,
             u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
             ai.status as my_action_status, ai.action_date, ai.remarks as my_remarks
      FROM approval_instances ai
      JOIN leave_requests r ON ai.leave_request_id = r.id
      JOIN leave_categories c ON r.leave_type_id = c.id
      JOIN users u ON r.employee_id = u.id
      WHERE ai.approver_id = $1 AND ai.status NOT IN ('PENDING', 'NOT_STARTED')
      
      UNION ALL
      
      SELECT a.id, a.employee_id, NULL as leave_type_id, u.location_id,
             a.date as start_date, a.date as end_date, 'FULL_DAY' as start_session, 'FULL_DAY' as end_session,
             0 as duration, a.reason, a.status, a.applied_date,
             'Attendance Regularization' as leave_type_name, 'ATT' as leave_type_code,
             u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
             ai.status as my_action_status, ai.action_date, ai.remarks as my_remarks
      FROM approval_instances ai
      JOIN attendance_regularization a ON ai.leave_request_id = a.id
      JOIN users u ON a.employee_id = u.id
      WHERE ai.approver_id = $1 AND ai.status NOT IN ('PENDING', 'NOT_STARTED')
      
      UNION ALL
      
      SELECT c.id, c.employee_id, NULL as leave_type_id, u.location_id,
             c.worked_date as start_date, c.worked_date as end_date, 'FULL_DAY' as start_session, 'FULL_DAY' as end_session,
             c.comp_off_earned as duration, c.reason, c.status, c.applied_date,
             'Comp-Off Claim' as leave_type_name, 'COMP_OFF' as leave_type_code,
             u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
             ai.status as my_action_status, ai.action_date, ai.remarks as my_remarks
      FROM approval_instances ai
      JOIN comp_off_requests c ON ai.leave_request_id = c.id
      JOIN users u ON c.employee_id = u.id
      WHERE ai.approver_id = $1 AND ai.status NOT IN ('PENDING', 'NOT_STARTED')
      
      ORDER BY action_date DESC
    `, [approverId]);

    return rows.map(r => {
      const sDate = typeof r.start_date === 'string' ? r.start_date : r.start_date.toISOString().split('T')[0];
      const eDate = typeof r.end_date === 'string' ? r.end_date : r.end_date.toISOString().split('T')[0];
      return {
        ...r,
        startDate: sDate,
        endDate: eDate,
        leaveTypeName: r.leave_type_name,
        leaveTypeCode: r.leave_type_code,
        appliedDate: r.applied_date,
        employee: {
          id: r.employee_id,
          name: r.employee_name,
          email: r.employee_email,
          department: r.employee_department,
          designation: r.employee_designation
        }
      };
    });
  }

  async getEscalatedApprovals(managerId) {
    try {
      await escalationEngine.checkAndProcessEscalations();
    } catch (err) {
      console.warn('[ApprovalService] Escalation scan warning:', err.message);
    }

    const { rows: mappings } = await query(
      'SELECT employee_id FROM employee_manager_mappings WHERE manager_id = $1',
      [managerId]
    );
    const reporteeIds = mappings.map(m => m.employee_id);

    const { rows } = await query(`
      SELECT r.id, r.employee_id, r.leave_type_id, r.location_id,
             r.start_date, r.end_date, r.start_session, r.end_session,
             r.duration, r.reason, r.status, r.applied_date, r.current_approver_id,
             r.escalated, r.escalation_deadline, r.attachments,
             c.name as leave_type_name, c.code as leave_type_code,
             u.name as employee_name, u.email as employee_email, u.department as employee_department, u.designation as employee_designation,
             l.name as location_name
      FROM leave_requests r
      JOIN leave_categories c ON r.leave_type_id = c.id
      JOIN users u ON r.employee_id = u.id
      LEFT JOIN locations l ON r.location_id = l.id
      WHERE (r.current_approver_id = $1 AND r.escalated = true AND r.status = 'PENDING')
         OR (r.employee_id = ANY($2::varchar[]) AND r.status = 'PENDING' AND (r.escalated = true OR r.escalation_deadline <= NOW()))
      ORDER BY r.applied_date DESC
    `, [managerId, reporteeIds]);

    return rows.map(r => {
      const sDate = typeof r.start_date === 'string' ? r.start_date : r.start_date.toISOString().split('T')[0];
      const eDate = typeof r.end_date === 'string' ? r.end_date : r.end_date.toISOString().split('T')[0];
      return {
        ...r,
        startDate: sDate,
        endDate: eDate,
        leaveTypeName: r.leave_type_name,
        leaveTypeCode: r.leave_type_code,
        appliedDate: r.applied_date,
        employee: {
          id: r.employee_id,
          name: r.employee_name,
          email: r.employee_email,
          department: r.employee_department,
          designation: r.employee_designation
        },
        sla: {
          appliedDate: r.applied_date,
          slaHours: 48,
          hoursRemaining: 0,
          escalationDeadline: r.escalation_deadline,
          isEscalated: true
        }
      };
    });
  }

  async processApproval(leaveRequestId, approverId, action, remarks = '') {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const isAtt = leaveRequestId.startsWith('ATT-');
      const isCo = leaveRequestId.startsWith('CO-');
      const table = isAtt ? 'attendance_regularization' : (isCo ? 'comp_off_requests' : 'leave_requests');

      const { rows: reqRows } = await client.query(
        `SELECT * FROM ${table} WHERE id = $1 FOR UPDATE`,
        [leaveRequestId]
      );
      if (!reqRows.length) throw new NotFoundError('Request not found');
      const leaveReq = reqRows[0];

      const { rows: approverUser } = await client.query('SELECT role, name FROM users WHERE id = $1', [approverId]);
      const isApproverAdmin = approverUser.length && approverUser[0].role === 'ADMIN';

      if (!isAtt && !isCo && leaveReq.current_approver_id !== approverId && !isApproverAdmin) {
        throw new UnauthorizedError('You are not authorized to approve this request right now');
      }

      if (leaveReq.status !== 'PENDING' && leaveReq.status !== 'CLARIFICATION_REQUIRED') {
        throw new BusinessLogicError('Leave request is not in a processable state');
      }

      const { rows: instances } = await client.query(
        'SELECT * FROM approval_instances WHERE leave_request_id = $1 ORDER BY step_order ASC FOR UPDATE',
        [leaveRequestId]
      );
      const currentStep = instances.find(i => i.status === 'PENDING');
      if (!currentStep) throw new BusinessLogicError('No pending approval steps found');
      if (currentStep.approver_id !== approverId && !isApproverAdmin) {
        throw new UnauthorizedError('You are not authorized to act on this approval step');
      }

      if (action === 'APPROVE') {
        await client.query(`
          UPDATE approval_instances
          SET status = 'APPROVED', action_date = CURRENT_TIMESTAMP, remarks = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [remarks || 'Approved', currentStep.id]);

        const nextStep = instances.find(i => i.step_order === currentStep.step_order + 1);
        if (nextStep && nextStep.approver_id) {
          const timeoutDays = nextStep.timeout_days || 2;
          const nextDeadline = new Date(Date.now() + timeoutDays * 24 * 60 * 60 * 1000).toISOString();

          await client.query(`
            UPDATE approval_instances
            SET status = 'PENDING', deadline = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [nextDeadline, nextStep.id]);

          if (!isAtt && !isCo) {
            await client.query(`
              UPDATE leave_requests
              SET current_approver_id = $1,
                  escalation_deadline = $2,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $3
            `, [nextStep.approver_id, nextDeadline, leaveRequestId]);
          }

          const nextNotifId = `NOTIF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const link = nextStep.role === 'MANAGER' ? '/manager/approvals' : '/team-lead/approvals';
          await client.query(`
            INSERT INTO notifications (id, user_id, title, message, type, link)
            VALUES ($1, $2, $3, $4, 'LEAVE_ESCALATED', $5)
          `, [
            nextNotifId,
            nextStep.approver_id,
            'Leave Request Awaiting Your Approval',
            `Leave application #${leaveRequestId} has been approved at Step ${currentStep.step_order} and is now awaiting your decision.`,
            link
          ]);
        } else {
          if (!isAtt && !isCo) {
            await client.query(`
              UPDATE leave_requests
              SET status = 'APPROVED', current_approver_id = NULL, updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
            `, [leaveRequestId]);
          } else if (isAtt) {
            await client.query(`
              UPDATE attendance_regularization
              SET status = 'APPROVED'
              WHERE id = $1
            `, [leaveRequestId]);
          } else if (isCo) {
            await client.query(`
              UPDATE comp_off_requests
              SET status = 'APPROVED'
              WHERE id = $1
            `, [leaveRequestId]);
          }
          await eventPublisher.publishTransactionally(client, EVENT_TYPES.LEAVE_APPROVED, { leaveRequestId });
        }
      } else if (action === 'REJECT') {
        await client.query(`
          UPDATE approval_instances
          SET status = 'REJECTED', action_date = CURRENT_TIMESTAMP, remarks = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [remarks || 'Rejected', currentStep.id]);

        if (!isAtt && !isCo) {
          await client.query(`
            UPDATE leave_requests
            SET status = 'REJECTED', current_approver_id = NULL, reason = COALESCE(reason, '') || ' [Rejected: ' || $1 || ']', updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [remarks || 'Rejected by approver', leaveRequestId]);
        } else if (isAtt) {
          await client.query(`
            UPDATE attendance_regularization
            SET status = 'REJECTED', reason = COALESCE(reason, '') || ' [Rejected: ' || $1 || ']'
            WHERE id = $2
          `, [remarks || 'Rejected by approver', leaveRequestId]);
        } else if (isCo) {
          await client.query(`
            UPDATE comp_off_requests
            SET status = 'REJECTED', reason = COALESCE(reason, '') || ' [Rejected: ' || $1 || ']'
            WHERE id = $2
          `, [remarks || 'Rejected by approver', leaveRequestId]);
        }

        await eventPublisher.publishTransactionally(client, EVENT_TYPES.LEAVE_REJECTED, { leaveRequestId });
      } else if (action === 'CLARIFY' || action === 'CLARIFICATION') {
        if (!isAtt && !isCo) {
          await client.query(`
            UPDATE leave_requests
            SET status = 'CLARIFICATION_REQUIRED', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `, [leaveRequestId]);
        } else if (isAtt) {
          await client.query(`
            UPDATE attendance_regularization
            SET status = 'CLARIFICATION_REQUIRED'
            WHERE id = $1
          `, [leaveRequestId]);
        } else if (isCo) {
          await client.query(`
            UPDATE comp_off_requests
            SET status = 'CLARIFICATION_REQUIRED'
            WHERE id = $1
          `, [leaveRequestId]);
        }
        await eventPublisher.publishTransactionally(client, EVENT_TYPES.CLARIFICATION_REQUESTED, { leaveRequestId, remarks });
      }

      const notifId = `NOTIF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await client.query(`
        INSERT INTO notifications (id, user_id, title, message, type, link)
        VALUES ($1, $2, $3, $4, $5, '/employee/leave-history')
      `, [
        notifId,
        leaveReq.employee_id,
        `Leave Request ${action === 'APPROVE' ? 'Approved' : (action === 'REJECT' ? 'Rejected' : 'Clarification Requested')}`,
        `Your leave request #${leaveRequestId} was ${action.toLowerCase()}d${remarks ? ': ' + remarks : '.'}`,
        `LEAVE_${action}`
      ]);

      const auditId = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await client.query(`
        INSERT INTO audit_logs (id, actor_id, action_type, target, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        auditId,
        approverId,
        `LEAVE_${action}`,
        leaveRequestId,
        JSON.stringify({ remarks, action, approverRole: approverUser[0]?.role })
      ]);

      await client.query('COMMIT');
      return { success: true, message: `Leave request ${action.toLowerCase()}d successfully` };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

export const approvalService = new ApprovalService();
