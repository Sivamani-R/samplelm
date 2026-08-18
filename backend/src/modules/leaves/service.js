import { query, getClient } from '../../shared/database/index.js';
import { BusinessLogicError, NotFoundError } from '../../shared/errors/ApiError.js';
import { balanceService } from '../leave-balances/service.js';
import { durationCalculator } from './durationCalculator.js';
import { eventPublisher, EVENT_TYPES } from '../../shared/events/publisher.js';

export class LeaveService {
  async calculateDuration(leaveData, locationId) {
    const { rows: holidays } = await query(
      'SELECT date FROM holidays WHERE location_id = $1',
      [locationId]
    );
    const holidayDates = holidays.map(h => typeof h.date === 'string' ? h.date : h.date.toISOString().split('T')[0]);

    return durationCalculator.calculate({
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      startSession: leaveData.startSession,
      endSession: leaveData.endSession,
      isHourly: leaveData.isHourly,
      hours: leaveData.hours,
      holidays: holidayDates
    });
  }

  async checkOverlap(employeeId, startDate, endDate, excludeLeaveId = null) {
    let sql = `
      SELECT r.id, r.start_date, r.end_date, r.status, c.name as leave_type_name
      FROM leave_requests r
      JOIN leave_categories c ON r.leave_type_id = c.id
      WHERE r.employee_id = $1 
        AND r.status IN ('PENDING', 'APPROVED')
        AND r.start_date <= $3
        AND r.end_date >= $2
    `;
    const params = [employeeId, startDate, endDate];
    if (excludeLeaveId) {
      sql += ' AND r.id != $4';
      params.push(excludeLeaveId);
    }

    const { rows } = await query(sql, params);
    if (rows.length > 0) {
      const conflict = rows[0];
      return {
        hasOverlap: true,
        overlappingRequest: conflict,
        message: `Leave request overlaps with active application #${conflict.id} (${conflict.leave_type_name}: ${conflict.start_date} to ${conflict.end_date})`
      };
    }

    return { hasOverlap: false, overlappingRequest: null, message: 'No overlap detected' };
  }

  async applyLeave(employeeId, leaveData) {
    // 1. Get user details & supervisor mapping
    const { rows: userRows } = await query('SELECT role, location_id, name FROM users WHERE id = $1', [employeeId]);
    if (!userRows.length) throw new NotFoundError('User not found');
    const applicant = userRows[0];
    const locationId = applicant.location_id;

    const { rows: mappingRows } = await query(
      'SELECT team_lead_id, manager_id FROM employee_manager_mappings WHERE employee_id = $1',
      [employeeId]
    );
    const mapping = mappingRows[0] || {};

    // 2. Calculate true duration
    const durationObj = await this.calculateDuration(leaveData, locationId);
    if (durationObj.workingDays <= 0) {
      throw new BusinessLogicError('Leave duration must be greater than 0 working days');
    }

    // 3. Check overlap
    const overlapResult = await this.checkOverlap(employeeId, leaveData.startDate, leaveData.endDate);
    if (overlapResult.hasOverlap) {
      throw new BusinessLogicError(overlapResult.message, 'OVERLAP_ERROR');
    }

    // 4. Validate balances
    const balances = await balanceService.getBalancesForEmployee(employeeId, locationId);
    const balance = balances.find(b => b.categoryId === leaveData.leaveTypeId);
    if (!balance) throw new BusinessLogicError('Invalid leave category or policy not found');
    if (balance.available < durationObj.workingDays) {
      throw new BusinessLogicError('Insufficient leave balance', 'INSUFFICIENT_BALANCE');
    }

    // 5. Determine Workflow Tiers
    const { rows: workflows } = await query('SELECT * FROM approval_workflows WHERE active = true ORDER BY min_days ASC');
    let workflow = workflows.find(wf => durationObj.workingDays >= wf.min_days && durationObj.workingDays <= wf.max_days);
    if (!workflow) {
      workflow = workflows[workflows.length - 1] || { approvers: ['MANAGER'] };
    }
    const approversList = typeof workflow.approvers === 'string' ? JSON.parse(workflow.approvers) : workflow.approvers;

    const getFallbackAdmin = async () => {
      const { rows: admins } = await query("SELECT id FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE' LIMIT 1");
      if (!admins.length) throw new BusinessLogicError('Configuration Error: No active Administrator found in the system for workflow fallback');
      return admins[0].id;
    };

    // Build the concrete approval chain steps based on hierarchy
    const chainSteps = [];
    for (const role of approversList) {
      if (role === 'TEAM_LEAD') {
        if (applicant.role === 'EMPLOYEE' && mapping.team_lead_id) {
          chainSteps.push({ role: 'TEAM_LEAD', approverId: mapping.team_lead_id });
        }
      } else if (role === 'MANAGER') {
        if (mapping.manager_id) {
          chainSteps.push({ role: 'MANAGER', approverId: mapping.manager_id });
        } else if (!chainSteps.some(s => s.role === 'MANAGER' || s.role === 'ADMIN')) {
          // Fallback to top manager or admin
          chainSteps.push({ role: 'ADMIN', approverId: await getFallbackAdmin() });
        }
      } else if (role === 'ADMIN') {
        chainSteps.push({ role: 'ADMIN', approverId: await getFallbackAdmin() });
      }
    }

    // Fallback if no specific step matched
    if (chainSteps.length === 0) {
      if (mapping.team_lead_id && applicant.role === 'EMPLOYEE') {
        chainSteps.push({ role: 'TEAM_LEAD', approverId: mapping.team_lead_id });
      } else if (mapping.manager_id) {
        chainSteps.push({ role: 'MANAGER', approverId: mapping.manager_id });
      } else {
        chainSteps.push({ role: 'ADMIN', approverId: await getFallbackAdmin() });
      }
    }

    const currentApprover = chainSteps[0];
    const currentApproverId = currentApprover ? currentApprover.approverId : null;

    // 6. DB Transaction to save request & approval instances
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const requestId = `LR-${Date.now().toString(36).toUpperCase()}`;

      const initialTimeoutDays = 2; // Default 48 hrs SLA
      const initialDeadline = new Date(Date.now() + initialTimeoutDays * 24 * 60 * 60 * 1000).toISOString();

      await client.query(
        `INSERT INTO leave_requests (id, employee_id, leave_type_id, location_id, start_date, end_date, start_session, end_session, duration, reason, current_approver_id, escalation_deadline, attachments)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          requestId,
          employeeId,
          leaveData.leaveTypeId,
          locationId,
          leaveData.startDate,
          leaveData.endDate,
          leaveData.startSession || 'FULL_DAY',
          leaveData.endSession || 'FULL_DAY',
          durationObj.workingDays,
          leaveData.reason || '',
          currentApproverId,
          initialDeadline,
          JSON.stringify(leaveData.attachments || [])
        ]
      );

      // Create workflow instances
      let stepOrder = 1;
      for (const step of chainSteps) {
        if (stepOrder === 1) {
          await client.query(
            `INSERT INTO approval_instances (leave_request_id, role, approver_id, step_order, status, deadline, timeout_days)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [requestId, step.role, step.approverId, stepOrder, 'PENDING', initialDeadline, initialTimeoutDays]
          );
        } else {
          await client.query(
            `INSERT INTO approval_instances (leave_request_id, role, approver_id, step_order, status, timeout_days)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [requestId, step.role, step.approverId, stepOrder, 'NOT_STARTED', initialTimeoutDays]
          );
        }
        stepOrder++;
      }

      // Notify approver
      if (currentApproverId) {
        const notifId = `NOTIF-${Date.now().toString(36).toUpperCase()}`;
        const approverLink = currentApprover.role === 'TEAM_LEAD' ? '/team-lead/approvals' : '/manager/approvals';
        await client.query(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, 'LEAVE_REQUESTED', $5)`,
          [
            notifId,
            currentApproverId,
            'New Leave Request',
            `${applicant.name} submitted a ${durationObj.workingDays}-day leave request (${leaveData.startDate} to ${leaveData.endDate})`,
            approverLink
          ]
        );
      }

      // Outbox Pattern
      await eventPublisher.publishTransactionally(client, EVENT_TYPES.LEAVE_SUBMITTED, {
        requestId,
        employeeId,
        approverId: currentApproverId
      });

      await client.query('COMMIT');
      return { success: true, requestId, id: requestId };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getEmployeeLeaves(employeeId) {
    const { rows: leaves } = await query(
      `SELECT r.id, r.employee_id, r.leave_type_id,
              c.name as leave_type_name, c.code as leave_type_code,
              r.start_date, r.end_date,
              r.start_session, r.end_session,
              r.duration, r.status, r.reason, r.applied_date,
              r.current_approver_id, r.attachments,
              u.name as current_approver_name, u.role as current_approver_role
       FROM leave_requests r
       JOIN leave_categories c ON r.leave_type_id = c.id
       LEFT JOIN users u ON r.current_approver_id = u.id
       WHERE r.employee_id = $1
       ORDER BY r.applied_date DESC`,
      [employeeId]
    );

    if (!leaves.length) return [];

    const leaveIds = leaves.map(l => l.id);
    const { rows: allSteps } = await query(
      `SELECT ai.id, ai.leave_request_id, ai.role, ai.approver_id, ai.step_order, ai.status, ai.action_date, ai.remarks,
              u.name as approver_name
       FROM approval_instances ai
       LEFT JOIN users u ON ai.approver_id = u.id
       WHERE ai.leave_request_id = ANY($1::varchar[])
       ORDER BY ai.step_order ASC`,
      [leaveIds]
    );

    return leaves.map(leave => {
      const steps = allSteps
        .filter(s => s.leave_request_id === leave.id)
        .map(s => ({
          id: s.id,
          role: s.role,
          approverId: s.approver_id,
          approverName: s.approver_name || s.role,
          stepOrder: s.step_order,
          status: s.status,
          date: s.action_date,
          remarks: s.remarks
        }));

      return {
        ...leave,
        approvalChain: steps,
        currentApprover: leave.current_approver_id ? {
          id: leave.current_approver_id,
          name: leave.current_approver_name,
          role: leave.current_approver_role
        } : null
      };
    });
  }
}

export const leaveService = new LeaveService();
