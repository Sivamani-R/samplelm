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
      ORDER BY r.applied_date DESC
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
      WHERE r.id = $1
    `, [leaveRequestId]);

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
      ORDER BY ai.action_date DESC
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

      const { rows: reqRows } = await client.query(
        'SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE',
        [leaveRequestId]
      );
      if (!reqRows.length) throw new NotFoundError('Leave request not found');
      const leaveReq = reqRows[0];

      const { rows: approverUser } = await client.query('SELECT role, name FROM users WHERE id = $1', [approverId]);
      const isApproverAdmin = approverUser.length && approverUser[0].role === 'ADMIN';

      if (leaveReq.current_approver_id !== approverId && !isApproverAdmin) {
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

          await client.query(`
            UPDATE leave_requests
            SET current_approver_id = $1,
                escalation_deadline = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
          `, [nextStep.approver_id, nextDeadline, leaveRequestId]);

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
          await client.query(`
            UPDATE leave_requests
            SET status = 'APPROVED', current_approver_id = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `, [leaveRequestId]);
          await eventPublisher.publishTransactionally(client, EVENT_TYPES.LEAVE_APPROVED, { leaveRequestId });
        }
      } else if (action === 'REJECT') {
        await client.query(`
          UPDATE approval_instances
          SET status = 'REJECTED', action_date = CURRENT_TIMESTAMP, remarks = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [remarks || 'Rejected', currentStep.id]);

        await client.query(`
          UPDATE leave_requests
          SET status = 'REJECTED', current_approver_id = NULL, reason = COALESCE(reason, '') || ' [Rejected: ' || $1 || ']', updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [remarks || 'Rejected by approver', leaveRequestId]);

        await eventPublisher.publishTransactionally(client, EVENT_TYPES.LEAVE_REJECTED, { leaveRequestId });
      } else if (action === 'CLARIFY' || action === 'CLARIFICATION') {
        await client.query(`
          UPDATE leave_requests
          SET status = 'CLARIFICATION_REQUIRED', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [leaveRequestId]);
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
