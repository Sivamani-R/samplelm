import { query } from '../../../shared/database/index.js';

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
    await query(
      `INSERT INTO attendance_regularization (id, employee_id, date, issue_type, check_in, check_out, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, userId, data.date, data.issueType, data.checkIn, data.checkOut, data.reason]
    );
    return { id, status: 'PENDING' };
  }
}

export const attendanceService = new AttendanceService();
