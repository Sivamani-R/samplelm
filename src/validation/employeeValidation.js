import {
  validateEmployeeId,
  validateName,
  validateEmail,
  validatePhone,
  validateDate,
  validateRequired
} from './validators.js';
import { ROLES } from '../constants/roles.js';

/**
 * Validates the Create Employee form fields.
 * Returns an object: { isValid: boolean, errors: Record<string, string> }
 */
export const validateEmployeeForm = (formData) => {
  const errors = {};

  // 1. Employee ID
  const empIdErr = validateEmployeeId(formData.employeeId);
  if (empIdErr) errors.employeeId = empIdErr;

  // 2. Full Name
  const nameErr = validateName(formData.name, 'Full Name');
  if (nameErr) errors.name = nameErr;

  // 3. Email
  const emailErr = validateEmail(formData.email);
  if (emailErr) errors.email = emailErr;

  // 4. Phone
  const phoneErr = validatePhone(formData.phone);
  if (phoneErr) errors.phone = phoneErr;

  // 5. Department
  const deptErr = validateRequired(formData.department, 'Department');
  if (deptErr) errors.department = deptErr;

  // 6. Designation
  const desigErr = validateRequired(formData.designation, 'Designation');
  if (desigErr) errors.designation = desigErr;

  // 7. Location ID
  const locErr = validateRequired(formData.locationId, 'Location');
  if (locErr) errors.locationId = locErr;

  // 8. Joining Date
  const dateErr = validateDate(formData.joiningDate, 'Joining Date');
  if (dateErr) errors.joiningDate = dateErr;

  // 9. Employment Type
  const empTypeErr = validateRequired(formData.employmentType, 'Employment Type');
  if (empTypeErr) errors.employmentType = empTypeErr;

  // 10. Role
  const roleErr = validateRequired(formData.role, 'Role');
  if (roleErr) {
    errors.role = roleErr;
  } else if (![ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.MANAGER].includes(formData.role)) {
    // Admin cannot create another ADMIN through this standard form
    errors.role = 'Invalid role selected. Only Employee, Team Lead, or Manager can be provisioned.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
