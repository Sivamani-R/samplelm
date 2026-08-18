import { query } from '../../../shared/database/index.js';
import { balanceService } from '../../leave-balances/service.js';

export class DashboardService {
  async getDashboardData(userId) {
    // 1. Get user profile with location and hierarchy mappings
    const { rows: userRows } = await query(`
      SELECT u.id, u.name, u.email, u.department, u.designation, u.location_id, u.role,
             l.name as location_name,
             tl.id as tl_id, tl.name as tl_name, tl.role as tl_role,
             mgr.id as mgr_id, mgr.name as mgr_name, mgr.role as mgr_role
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      LEFT JOIN employee_manager_mappings m ON u.id = m.employee_id
      LEFT JOIN users tl ON m.team_lead_id = tl.id
      LEFT JOIN users mgr ON m.manager_id = mgr.id
      WHERE u.id = $1
    `, [userId]);

    if (!userRows.length) {
      throw new Error('User not found');
    }
    const u = userRows[0];
    const locationId = u.location_id;

    // 2. Leave balances
    const leaveBalances = await balanceService.getBalancesForEmployee(userId, locationId);

    // 3. Leaves for user
    const { rows: leaves } = await query(`
      SELECT r.id, r.employee_id, r.leave_type_id,
             c.name as leave_type_name, c.code as leave_type_code,
             r.start_date, r.end_date, r.start_session, r.end_session,
             r.duration, r.status, r.reason, r.applied_date
      FROM leave_requests r
      JOIN leave_categories c ON r.leave_type_id = c.id
      WHERE r.employee_id = $1
      ORDER BY r.applied_date DESC
    `, [userId]);

    const pendingLeaves = leaves.filter(l => l.status === 'PENDING');

    // 4. Upcoming holidays for user location
    const { rows: holidays } = await query(`
      SELECT id, location_id, name, date, type, day
      FROM holidays 
      WHERE location_id = $1 AND date >= CURRENT_DATE
      ORDER BY date ASC 
      LIMIT 4
    `, [locationId]);

    // 5. Comp-off stats
    const { rows: compOffs } = await query(`
      SELECT comp_off_earned, status FROM comp_off_requests WHERE employee_id = $1
    `, [userId]);

    const availableCompOff = compOffs
      .filter(c => c.status === 'APPROVED')
      .reduce((sum, c) => sum + Number(c.comp_off_earned || 0), 0);
    const pendingCompOff = compOffs
      .filter(c => c.status === 'PENDING')
      .reduce((sum, c) => sum + Number(c.comp_off_earned || 0), 0);

    // 6. Attendance stats
    const { rows: attendance } = await query(`
      SELECT * FROM attendance_regularization WHERE employee_id = $1 ORDER BY applied_date DESC LIMIT 10
    `, [userId]);

    return {
      employee: {
        id: u.id,
        name: u.name,
        email: u.email,
        department: u.department,
        designation: u.designation,
        locationId: u.location_id,
        locationName: u.location_name || u.location_id,
        teamLead: u.tl_id ? { id: u.tl_id, name: u.tl_name, role: u.tl_role } : null,
        manager: u.mgr_id ? { id: u.mgr_id, name: u.mgr_name, role: u.mgr_role } : null
      },
      leaveBalances,
      pendingLeaves,
      upcomingHolidays: holidays,
      recentLeaveHistory: leaves.slice(0, 5),
      compOff: {
        available: availableCompOff,
        pending: pendingCompOff,
        totalClaimed: compOffs.length
      },
      attendance: {
        pendingRegularizations: attendance.filter(a => a.status === 'PENDING').length,
        recentRequests: attendance.slice(0, 3)
      }
    };
  }
}

export const dashboardService = new DashboardService();
