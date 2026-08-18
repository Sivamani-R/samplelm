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
      `SELECT u.id, u.name, u.designation, u.availability, u.location_id
       FROM users u
       JOIN employee_manager_mappings m ON u.id = m.employee_id
       WHERE m.manager_id = $1 OR m.team_lead_id = $1`,
      [managerId]
    );

    const { rows: todaysLeaves } = await query(
      `SELECT r.employee_id, r.status
       FROM leave_requests r
       JOIN employee_manager_mappings m ON r.employee_id = m.employee_id
       WHERE (m.manager_id = $1 OR m.team_lead_id = $1)
       AND r.status IN ('APPROVED', 'PENDING', 'CLARIFICATION_REQUIRED')
       AND CURRENT_DATE BETWEEN r.start_date AND r.end_date`,
      [managerId]
    );

    const { rows: todaysHolidays } = await query(
      `SELECT location_id FROM holidays WHERE date = CURRENT_DATE`
    );
    const holidayLocations = new Set(todaysHolidays.map(h => h.location_id));

    let working = 0;
    let onLeave = 0;
    let pending = 0;
    let onHoliday = 0;

    for (const member of members) {
      if (holidayLocations.has(member.location_id)) {
        onHoliday++;
        continue;
      }
      
      const memberLeaves = todaysLeaves.filter(l => l.employee_id === member.id);
      if (memberLeaves.some(l => l.status === 'APPROVED')) {
        onLeave++;
      } else if (memberLeaves.some(l => l.status === 'PENDING' || l.status === 'CLARIFICATION_REQUIRED')) {
        pending++;
      } else {
        working++;
      }
    }

    return {
      totalMembers: members.length,
      working,
      onLeave,
      pending,
      onHoliday,
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

  async getCalendar(managerId, startDate = '2026-08-16', endDate = '2026-08-31') {
    const { rows: members } = await query(
      `SELECT u.id, u.name, u.designation, u.location_id
       FROM users u
       JOIN employee_manager_mappings m ON u.id = m.employee_id
       WHERE m.manager_id = $1 OR m.team_lead_id = $1`,
      [managerId]
    );

    const { rows: leaves } = await query(
      `SELECT r.id, r.employee_id, c.name as leave_type_name, r.start_date, r.end_date, r.status
       FROM leave_requests r
       JOIN employee_manager_mappings m ON r.employee_id = m.employee_id
       JOIN leave_categories c ON r.leave_type_id = c.id
       WHERE (m.manager_id = $1 OR m.team_lead_id = $1)
       AND r.status IN ('APPROVED', 'PENDING')`,
      [managerId]
    );

    const { rows: holidays } = await query(`SELECT date, location_id FROM holidays`);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    const cur = new Date(start);
    while (cur <= end) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    const matrix = members.map(member => {
      const memberHolidays = new Set(
        holidays.filter(h => h.location_id === member.location_id).map(h => 
          typeof h.date === 'string' ? h.date : h.date.toISOString().split('T')[0]
        )
      );

      const memberLeaves = leaves.filter(l => l.employee_id === member.id);

      const schedule = dates.map(dateStr => {
        const d = new Date(dateStr);
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (isWeekend) {
          return { date: dateStr, status: 'WEEKEND', label: 'Weekend' };
        }

        if (memberHolidays.has(dateStr)) {
          return { date: dateStr, status: 'HOLIDAY', label: 'Holiday' };
        }

        const activeLeave = memberLeaves.find(l => {
          const s = typeof l.start_date === 'string' ? l.start_date : l.start_date.toISOString().split('T')[0];
          const e = typeof l.end_date === 'string' ? l.end_date : l.end_date.toISOString().split('T')[0];
          return s <= dateStr && e >= dateStr;
        });

        if (activeLeave) {
          return {
            date: dateStr,
            status: activeLeave.status === 'APPROVED' ? 'APPROVED_LEAVE' : 'PENDING_LEAVE',
            label: activeLeave.leave_type_name
          };
        }

        return { date: dateStr, status: 'WORKING', label: 'Working' };
      });

      return {
        member: {
          id: member.id,
          name: member.name,
          designation: member.designation
        },
        schedule
      };
    });

    return { dates, matrix };
  }
}

export const teamService = new TeamService();
