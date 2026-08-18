import { query, getClient } from '../../../shared/database/index.js';

export class AttendanceService {
  async getAttendance(userId) {
    const { rows } = await query(
      `SELECT * FROM attendance_regularization 
       WHERE employee_id = $1 
       ORDER BY applied_date DESC`,
      [userId]
    );
    return rows;
  }

  async regularize(userId, data) {
    const id = `ATT-${Date.now().toString(36).toUpperCase()}`;
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      await client.query(
        `INSERT INTO attendance_regularization (id, employee_id, date, issue_type, check_in, check_out, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
        [id, userId, data.date, data.issueType, data.checkIn, data.checkOut, data.reason]
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

export const attendanceService = new AttendanceService();
