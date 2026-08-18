import { leavePolicyApi } from '../api/leavePolicyApi.js';

export const leavePolicyService = {
  async fetchPolicies() {
    return await leavePolicyApi.getAll();
  },

  async savePolicy(formData) {
    const payload = {
      locationId: formData.locationId,
      categoryId: formData.categoryId,
      annualEntitlement: Number(formData.annualEntitlement),
      monthlyAccrual: Number(formData.monthlyAccrual),
      maxBalance: Number(formData.maxBalance),
      carryForwardAllowed: Boolean(formData.carryForwardAllowed),
      carryForwardLimit: formData.carryForwardAllowed ? Number(formData.carryForwardLimit) : 0,
      expiryAllowed: Boolean(formData.expiryAllowed),
      expiryMonths: formData.expiryAllowed ? Number(formData.expiryMonths) : 0,
      minNoticeDays: Number(formData.minNoticeDays),
      maxContinuousDays: Number(formData.maxContinuousDays),
      allowHourly: Boolean(formData.allowHourly),
      allowHalfDay: Boolean(formData.allowHalfDay),
      paid: Boolean(formData.paid),
      requireSupportingDocument: Boolean(formData.requireSupportingDocument),
      docThresholdDays: formData.requireSupportingDocument ? Number(formData.docThresholdDays) : 0,
      active: Boolean(formData.active)
    };

    return await leavePolicyApi.save(payload);
  },

  /**
   * Formats a policy summary string for UI display
   */
  formatPolicySummary(policy) {
    if (!policy) return 'Unconfigured';
    const parts = [
      `${policy.annualEntitlement} days/yr`,
      `${policy.monthlyAccrual} days/mo accrual`,
      `Max bal: ${policy.maxBalance}`
    ];
    if (policy.carryForwardAllowed) {
      parts.push(`CF limit: ${policy.carryForwardLimit}`);
    }
    return parts.join(' • ');
  }
};
