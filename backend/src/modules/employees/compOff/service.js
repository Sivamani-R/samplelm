import { query, getClient } from '../../../shared/database/index.js';

export class CompOffService {
  async getCompOffs(userId) {
    const { rows } = await query(
      `SELECT * FROM comp_off_requests 
       WHERE employee_id = $1 
       ORDER BY applied_date DESC`,
      [userId]
    );

    const history = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      workedDate: typeof r.worked_date === 'string' ? r.worked_date : (r.worked_date ? r.worked_date.toISOString().split('T')[0] : null),
      hoursWorked: r.hours_worked,
      compOffEarned: Number(r.comp_off_earned),
      reason: r.reason,
      status: r.status,
      expiryDate: r.expiry_date,
      appliedDate: r.applied_date
    }));

    const earned = history.filter(c => c.status === 'APPROVED').reduce((sum, c) => sum + c.compOffEarned, 0);
    const pending = history.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.compOffEarned, 0);

    return {
      history,
      summary: {
        available: earned,
        pending,
        used: 0,
        expired: 0
      }
    };
  }

  async createCompOff(userId, data) {
    const id = `CO-${Date.now().toString(36).toUpperCase()}`;
    const expiryDate = new Date(data.workedDate);
    expiryDate.setMonth(expiryDate.getMonth() + 3);

    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      await client.query(
        `INSERT INTO comp_off_requests (id, employee_id, worked_date, hours_worked, comp_off_earned, reason, expiry_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
        [id, userId, data.workedDate, data.hoursWorked, data.hoursWorked >= 8 ? 1 : 0.5, data.reason, expiryDate]
      );

      const { rows: mappingRows } = await client.query(
        'SELECT manager_id, team_lead_id FROM employee_manager_mappings WHERE employee_id = $1',
        [userId]
      );
      
      const mapping = mappingRows[0] || {};
      const approverId = mapping.manager_id || mapping.team_lead_id;
      
      if (approverId) {
        const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        const role = mapping.manager_id ? 'MANAGER' : 'TEAM_LEAD';
        
        await client.query(
          `INSERT INTO approval_instances (leave_request_id, role, approver_id, step_order, status, deadline, timeout_days)
           VALUES ($1, $2, $3, 1, 'PENDING', $4, 2)`,
          [id, role, approverId, deadline]
        );
      }

      await client.query('COMMIT');
      return { id, status: 'PENDING' };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

export const compOffService = new CompOffService();
