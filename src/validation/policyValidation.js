import {
  validateRequired,
  validateNumber
} from './validators.js';

/**
 * Validates Location-Based Leave Policy setup form data.
 */
export const validatePolicyForm = (formData) => {
  const errors = {};

  const locErr = validateRequired(formData.locationId, 'Location');
  if (locErr) errors.locationId = locErr;

  const catErr = validateRequired(formData.categoryId, 'Leave Category');
  if (catErr) errors.categoryId = catErr;

  const annualErr = validateNumber(formData.annualEntitlement, 'Annual Entitlement', { min: 0, max: 365 });
  if (annualErr) errors.annualEntitlement = annualErr;

  const accrualErr = validateNumber(formData.monthlyAccrual, 'Monthly Accrual', { min: 0, max: 31 });
  if (accrualErr) errors.monthlyAccrual = accrualErr;

  const maxBalErr = validateNumber(formData.maxBalance, 'Maximum Balance', { min: 0, max: 365 });
  if (maxBalErr) errors.maxBalance = maxBalErr;

  if (formData.carryForwardAllowed) {
    const cfLimitErr = validateNumber(formData.carryForwardLimit, 'Carry Forward Limit', { min: 0, max: 365 });
    if (cfLimitErr) errors.carryForwardLimit = cfLimitErr;
  }

  if (formData.expiryAllowed) {
    const expMonthsErr = validateNumber(formData.expiryMonths, 'Expiry Period (Months)', { min: 1, max: 60, integerOnly: true });
    if (expMonthsErr) errors.expiryMonths = expMonthsErr;
  }

  const noticeErr = validateNumber(formData.minNoticeDays, 'Minimum Notice Days', { min: 0, max: 90, integerOnly: true });
  if (noticeErr) errors.minNoticeDays = noticeErr;

  const maxContErr = validateNumber(formData.maxContinuousDays, 'Maximum Continuous Leave Days', { min: 1, max: 365, integerOnly: true });
  if (maxContErr) errors.maxContinuousDays = maxContErr;

  if (formData.requireSupportingDocument) {
    const docThresholdErr = validateNumber(formData.docThresholdDays, 'Document Required Threshold (Days)', { min: 1, max: 365, integerOnly: true });
    if (docThresholdErr) errors.docThresholdDays = docThresholdErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
