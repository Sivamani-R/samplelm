/**
 * Policy Document & PDF Generation Service
 * 
 * Generates official, location-aware corporate policy document layouts
 * using backend policy configuration data.
 */

export const pdfService = {
  /**
   * Builds official corporate policy document structure from policy metadata
   */
  generatePolicyDocument(policy, employee) {
    if (!policy) return null;

    return {
      documentId: `DOC-POL-${policy.id || 'GENERIC'}`,
      title: `Official Corporate Leave Policy: ${policy.categoryName}`,
      effectiveDate: '2026-01-01',
      lastRevised: '2026-08-18',
      employee: {
        id: employee?.id || 'EMP001',
        name: employee?.name || 'Employee',
        location: employee?.location || policy.locationName || 'Corporate Jurisdiction',
        department: employee?.department || 'General'
      },
      policy: {
        categoryName: policy.categoryName,
        categoryCode: policy.categoryCode,
        annualEntitlement: policy.annualEntitlement,
        monthlyAccrual: policy.monthlyAccrual,
        maxBalance: policy.maxBalance,
        carryForwardAllowed: policy.carryForwardAllowed,
        carryForwardLimit: policy.carryForwardLimit,
        expiryAllowed: policy.expiryAllowed,
        expiryMonths: policy.expiryMonths || 12,
        minNoticeDays: policy.minNoticeDays,
        maxContinuousDays: policy.maxContinuousDays,
        paid: policy.paid,
        allowHourly: policy.allowHourly,
        allowHalfDay: policy.allowHalfDay,
        requireSupportingDocument: policy.requireSupportingDocument,
        docThresholdDays: policy.docThresholdDays,
        description: policy.description
      },
      approvalWorkflow: [
        { tier: 'Tier-1', role: 'Direct Team Lead', scope: '0 - 2 Days / Hourly' },
        { tier: 'Tier-2', role: 'Department Manager', scope: '3 - 15 Days' },
        { tier: 'Tier-3', role: 'Executive & HR Administration', scope: '> 15 Days / Extended' }
      ]
    };
  }
};
