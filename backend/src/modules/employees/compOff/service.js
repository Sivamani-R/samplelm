import { query } from '../../../shared/database/index.js';

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

    await query(
      `INSERT INTO comp_off_requests (id, employee_id, worked_date, hours_worked, comp_off_earned, reason, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, userId, data.workedDate, data.hoursWorked, data.hoursWorked >= 8 ? 1 : 0.5, data.reason, expiryDate]
    );
    return { id, status: 'PENDING' };
  }
}

export const compOffService = new CompOffService();
