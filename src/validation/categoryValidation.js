import {
  validateName,
  validateRequired,
  validateCode
} from './validators.js';

/**
 * Validates Leave Category creation and update form data.
 */
export const validateCategoryForm = (formData) => {
  const errors = {};

  const nameErr = validateName(formData.name, 'Category Name');
  if (nameErr) errors.name = nameErr;

  const codeErr = validateCode(formData.code, 'Category Code');
  if (codeErr) errors.code = codeErr;

  const descErr = validateRequired(formData.description, 'Description');
  if (descErr) errors.description = descErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
