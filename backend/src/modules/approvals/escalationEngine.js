import { query, getClient } from '../../shared/database/index.js';
import { eventPublisher, EVENT_TYPES } from '../../shared/events/publisher.js';

export class EscalationEngine {
  /**
   * Scans for leave requests that have exceeded their SLA deadline and escalates them to the next supervisor.
   */
  async checkAndProcessEscalations() {
    // 1. Find all pending leave requests where deadline has elapsed
    const { rows: overdueRequests } = await query(`
      SELECT r.id, r.employee_id, r.current_approver_id, r.escalation_deadline, r.duration,
             u.name as employee_name, u.email as employee_email,
             c.name as leave_type_name
      FROM leave_requests r
      JOIN users u ON r.employee_id = u.id
      JOIN leave_categories c ON r.leave_type_id = c.id
      WHERE r.status = 'PENDING'
        AND r.escalation_deadline IS NOT NULL
        AND r.escalation_deadline <= NOW()
    `);

    if (!overdueRequests.length) {
      return { escalatedCount: 0, processedRequestIds: [] };
    }

    const processedRequestIds = [];

    for (const req of overdueRequests) {
      const client = await getClient();
      try {
        await client.query('BEGIN');

        // Lock the leave request row to prevent race conditions
        const { rows: lockedReqs } = await client.query(
          'SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE',
          [req.id]
        );
        if (!lockedReqs.length || lockedReqs[0].status !== 'PENDING') {
          await client.query('ROLLBACK');
          continue;
        }

        // Get all approval instances for this request
        const { rows: instances } = await client.query(
          'SELECT * FROM approval_instances WHERE leave_request_id = $1 ORDER BY step_order ASC FOR UPDATE',
          [req.id]
        );

        const currentStep = instances.find(i => i.status === 'PENDING');
        if (!currentStep) {
          await client.query('ROLLBACK');
          continue;
        }

        // Mark current step as ESCALATED
        await client.query(`
          UPDATE approval_instances
          SET status = 'ESCALATED',
              remarks = COALESCE(remarks, '') || ' [Auto-escalated: SLA timeout exceeded]',
              action_date = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [currentStep.id]);

        // Find the next approval tier
        const nextStep = instances.find(i => i.step_order === currentStep.step_order + 1);

        if (nextStep && nextStep.approver_id) {
          const timeoutDays = nextStep.timeout_days || 2;
          const { rows: nextApproverUser } = await client.query('SELECT name, role FROM users WHERE id = $1', [nextStep.approver_id]);
          const nextApprover = nextApproverUser[0] || { name: 'Manager', role: 'MANAGER' };

          // Activate next step
          const newDeadline = new Date(Date.now() + timeoutDays * 24 * 60 * 60 * 1000).toISOString();
          await client.query(`
            UPDATE approval_instances
            SET status = 'PENDING',
                deadline = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [newDeadline, nextStep.id]);

          // Shift current_approver_id on leave request
          await client.query(`
            UPDATE leave_requests
            SET current_approver_id = $1,
                escalated = true,
                escalation_deadline = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
          `, [nextStep.approver_id, newDeadline, req.id]);

          // Notify Manager / Next Approver
          const notifId = `NOTIF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const approverLink = nextApprover.role === 'MANAGER' ? '/manager/approvals' : '/team-lead/approvals';
          await client.query(`
            INSERT INTO notifications (id, user_id, title, message, type, link)
            VALUES ($1, $2, $3, $4, 'LEAVE_ESCALATED', $5)
          `, [
            notifId,
            nextStep.approver_id,
            'Leave Request Escalated to You',
            `Leave application #${req.id} from ${req.employee_name} has exceeded the ${currentStep.role} SLA and was auto-escalated to your queue.`,
            approverLink
          ]);

          // Notify Employee
          const empNotifId = `NOTIF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          await client.query(`
            INSERT INTO notifications (id, user_id, title, message, type, link)
            VALUES ($1, $2, $3, $4, 'LEAVE_ESCALATED', '/employee/leave-history')
          `, [
            empNotifId,
            req.employee_id,
            'Leave Application Escalated',
            `Your leave application #${req.id} was auto-escalated to ${nextApprover.name} due to approval SLA timeout.`
          ]);

          // Log Audit
          const auditId = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          await client.query(`
            INSERT INTO audit_logs (id, actor_id, action_type, target, details)
            VALUES ($1, 'SYSTEM', 'LEAVE_ESCALATED', $2, $3)
          `, [
            auditId,
            req.id,
            JSON.stringify({
              fromStep: currentStep.role,
              toStep: nextStep.role,
              newApproverId: nextStep.approver_id,
              reason: 'SLA timeout exceeded'
            })
          ]);

          // Publish Outbox Event
          await eventPublisher.publishTransactionally(client, EVENT_TYPES.LEAVE_ESCALATED, {
            requestId: req.id,
            previousApproverId: currentStep.approver_id,
            newApproverId: nextStep.approver_id
          });
        } else {
          // If no further step in chain, escalate to Admin
          const { rows: admins } = await client.query("SELECT id, name FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE' LIMIT 1");
          if (!admins.length) {
            await client.query('ROLLBACK');
            console.error(`[EscalationEngine] Cannot escalate req #${req.id}: No active ADMIN found`);
            continue;
          }
          const adminId = admins[0].id;

          await client.query(`
            UPDATE leave_requests
            SET current_approver_id = $1,
                escalated = true,
                escalation_deadline = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
          `, [adminId, new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), req.id]);

          const adminNotifId = `NOTIF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          await client.query(`
            INSERT INTO notifications (id, user_id, title, message, type, link)
            VALUES ($1, $2, $3, $4, 'LEAVE_ESCALATED', '/admin/audit')
          `, [
            adminNotifId,
            adminId,
            'Overdue Leave Request Escalated to Admin',
            `Leave application #${req.id} from ${req.employee_name} has exceeded all approval SLAs and requires administrative intervention.`
          ]);
        }

        await client.query('COMMIT');
        processedRequestIds.push(req.id);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[EscalationEngine] Error escalating request #${req.id}:`, err);
      } finally {
        client.release();
      }
    }

    if (processedRequestIds.length > 0) {
      console.log(`[EscalationEngine] Successfully escalated ${processedRequestIds.length} overdue leave request(s):`, processedRequestIds);
    }

    return {
      escalatedCount: processedRequestIds.length,
      processedRequestIds
    };
  }
}

export const escalationEngine = new EscalationEngine();
