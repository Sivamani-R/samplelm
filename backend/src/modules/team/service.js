import { query } from '../../shared/database/index.js';

export class TeamService {
  async getOverview(managerId) {
    // Team size
    const { rows: teamRows } = await query(
      `SELECT COUNT(*) FROM employee_manager_mappings 
       WHERE manager_id = $1 OR team_lead_id = $1`,
      [managerId]
    );
    const teamSize = parseInt(teamRows[0].count, 10);

    // On leave today
    const { rows: leaveRows } = await query(
      `SELECT COUNT(DISTINCT r.employee_id) FROM leave_requests r
       JOIN employee_manager_mappings m ON r.employee_id = m.employee_id
       WHERE (m.manager_id = $1 OR m.team_lead_id = $1)
       AND r.status = 'APPROVED'
       AND CURRENT_DATE BETWEEN r.start_date AND r.end_date`,
      [managerId]
    );
    const onLeaveToday = parseInt(leaveRows[0].count, 10);

    // Pending approvals
    const { rows: pendingRows } = await query(
      `SELECT COUNT(*) FROM approval_instances
       WHERE approver_id = $1 AND status = 'PENDING'`,
      [managerId]
    );
    const pendingApprovals = parseInt(pendingRows[0].count, 10);

    // Upcoming leaves
    const { rows: upcomingLeaves } = await query(
      `SELECT r.id, u.name as employee_name, c.name as leave_type_name, r.start_date, r.end_date
       FROM leave_requests r
       JOIN employee_manager_mappings m ON r.employee_id = m.employee_id
       JOIN users u ON r.employee_id = u.id
       JOIN leave_categories c ON r.leave_type_id = c.id
       WHERE (m.manager_id = $1 OR m.team_lead_id = $1)
       AND r.status = 'APPROVED'
       AND r.start_date > CURRENT_DATE
       ORDER BY r.start_date ASC
       LIMIT 5`,
      [managerId]
    );

    return {
      teamSize,
      onLeaveToday,
      pendingApprovals,
      upcomingLeaves
    };
  }

  async getAvailability(managerId) {
    const { rows: members } = await query(
      `SELECT u.id, u.name, u.designation, u.availability
       FROM users u
       JOIN employee_manager_mappings m ON u.id = m.employee_id
       WHERE m.manager_id = $1 OR m.team_lead_id = $1`,
      [managerId]
    );

    const onLeaveCount = members.filter(m => m.availability !== 'AVAILABLE').length;

    return {
      totalMembers: members.length,
      onLeave: onLeaveCount,
      members
    };
  }

  async getMembers(managerId) {
    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.designation, u.department, u.role, u.availability
       FROM users u
       JOIN employee_manager_mappings m ON u.id = m.employee_id
       WHERE m.manager_id = $1 OR m.team_lead_id = $1`,
      [managerId]
    );
    return rows;
  }

  async getCalendar(managerId) {
    const { rows } = await query(
      `SELECT r.id, u.name as employee_name, r.start_date, r.end_date, r.status
       FROM leave_requests r
       JOIN employee_manager_mappings m ON r.employee_id = m.employee_id
       JOIN users u ON r.employee_id = u.id
       WHERE (m.manager_id = $1 OR m.team_lead_id = $1)
       AND r.status IN ('APPROVED', 'PENDING')`,
      [managerId]
    );
    return rows;
  }
}

export const teamService = new TeamService();
