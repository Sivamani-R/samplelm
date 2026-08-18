import {
  validateName,
  validateRequired,
  validateCode
} from './validators.js';

/**
 * Validates Location creation and update form data.
 */
export const validateLocationForm = (formData) => {
  const errors = {};

  const nameErr = validateName(formData.name, 'Location Name');
  if (nameErr) errors.name = nameErr;

  const cityErr = validateName(formData.city, 'City');
  if (cityErr) errors.city = cityErr;

  const stateErr = validateName(formData.state, 'State / Region');
  if (stateErr) errors.state = stateErr;

  const countryErr = validateName(formData.country, 'Country');
  if (countryErr) errors.country = countryErr;

  const tzErr = validateRequired(formData.timezone, 'Time Zone');
  if (tzErr) errors.timezone = tzErr;

  const codeErr = validateCode(formData.code, 'Location Code');
  if (codeErr) errors.code = codeErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
