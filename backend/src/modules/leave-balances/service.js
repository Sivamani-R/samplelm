import { query } from '../../shared/database/index.js';

export class BalanceService {
  async getBalancesForEmployee(employeeId, locationId) {
    // 1. Get applicable policies
    const { rows: policies } = await query(`
      SELECT p.*, c.name as category_name, c.code as category_code, c.description as category_description
      FROM leave_policies p
      JOIN leave_categories c ON p.category_id = c.id
      WHERE p.location_id = $1 AND p.active = true AND c.active = true
      ORDER BY c.code ASC
    `, [locationId]);

    // 2. Get used and pending leaves
    const { rows: leaves } = await query(`
      SELECT leave_type_id, status, SUM(duration) as total_duration
      FROM leave_requests
      WHERE employee_id = $1 AND status IN ('APPROVED', 'PENDING')
      GROUP BY leave_type_id, status
    `, [employeeId]);

    // 3. Get approved comp offs
    const { rows: compOffs } = await query(`
      SELECT SUM(comp_off_earned) as total_earned
      FROM comp_off_requests
      WHERE employee_id = $1 AND status = 'APPROVED'
    `, [employeeId]);

    const compOffEarned = compOffs.length && compOffs[0].total_earned ? Number(compOffs[0].total_earned) : 0;

    return policies.map(policy => {
      const categoryLeaves = leaves.filter(l => l.leave_type_id === policy.category_id);
      const usedLeaves = categoryLeaves.find(l => l.status === 'APPROVED');
      const pendingLeaves = categoryLeaves.find(l => l.status === 'PENDING');

      const used = usedLeaves ? Number(usedLeaves.total_duration) : 0;
      const pending = pendingLeaves ? Number(pendingLeaves.total_duration) : 0;
      const annualEntitlement = Number(policy.annual_entitlement || 0);
      const monthlyAccrual = Number(policy.monthly_accrual || 0);
      const maxBalance = Number(policy.max_balance || 0);
      const carryForwardLimit = Number(policy.carry_forward_limit || 0);

      const openingBalance = policy.carry_forward_allowed ? Math.min(annualEntitlement * 0.3, carryForwardLimit) : 0;
      const accrued = policy.category_id === 'CAT-COMP' 
        ? compOffEarned 
        : Number((monthlyAccrual * 8).toFixed(1));

      const encashed = 0;
      const rawClosing = openingBalance + accrued - used - pending - encashed;
      const closingBalance = Math.max(0, maxBalance > 0 ? Math.min(rawClosing, maxBalance) : rawClosing);

      return {
        id: policy.id,
        categoryId: policy.category_id,
        categoryName: policy.category_name || policy.category_id,
        categoryCode: policy.category_code || '',
        paid: Boolean(policy.paid),
        openingBalance: Number(openingBalance.toFixed(1)),
        accrued: Number(accrued.toFixed(1)),
        used: Number(used.toFixed(1)),
        pending: Number(pending.toFixed(1)),
        encashed: 0,
        closingBalance: Number(closingBalance.toFixed(1)),
        available: Number(closingBalance.toFixed(1)),
        annualEntitlement,
        monthlyAccrual,
        maxBalance,
        carryForwardLimit,
        carryForwardAllowed: Boolean(policy.carry_forward_allowed),
        allowHourly: Boolean(policy.allow_hourly),
        allowHalfDay: Boolean(policy.allow_half_day),
        minNoticeDays: Number(policy.min_notice_days || 0),
        maxContinuousDays: Number(policy.max_continuous_days || 0),
        requireSupportingDocument: Boolean(policy.require_supporting_document),
        docThresholdDays: Number(policy.doc_threshold_days || 0),
        description: policy.category_description || ''
      };
    });
  }
}

export const balanceService = new BalanceService();
