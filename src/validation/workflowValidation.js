import {
  validateRequired,
  validateNumber
} from './validators.js';

/**
 * Validates Approval Workflow Tier rule form data.
 */
export const validateWorkflowForm = (formData) => {
  const errors = {};

  const nameErr = validateRequired(formData.name, 'Tier Name');
  if (nameErr) errors.name = nameErr;

  const minErr = validateNumber(formData.minDays, 'Minimum Duration (Days)', { min: 0, max: 365 });
  if (minErr) errors.minDays = minErr;

  const maxErr = validateNumber(formData.maxDays, 'Maximum Duration (Days)', { min: 0, max: 999 });
  if (maxErr) errors.maxDays = maxErr;

  if (Number(formData.minDays) > Number(formData.maxDays)) {
    errors.maxDays = 'Maximum duration must be greater than or equal to minimum duration';
  }

  if (!formData.approvers || formData.approvers.length === 0) {
    errors.approvers = 'At least one approval role must be selected in the chain';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
