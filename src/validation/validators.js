/**
 * Pure Reusable Frontend Validation Utilities
 */

/**
 * Validates that a string or value is non-empty.
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validates Employee ID format (alphanumeric, hyphens, min 3, max 20).
 */
export const validateEmployeeId = (id) => {
  const req = validateRequired(id, 'Employee ID');
  if (req) return req;

  const trimmed = id.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return 'Employee ID must be between 3 and 20 characters';
  }

  const validIdRegex = /^[A-Za-z0-9_-]+$/;
  if (!validIdRegex.test(trimmed)) {
    return 'Employee ID can only contain letters, numbers, hyphens, and underscores';
  }

  return null;
};

/**
 * Validates full person name (min 2 chars, letters, spaces, hyphens, apostrophes).
 */
export const validateName = (name, fieldName = 'Full Name') => {
  const req = validateRequired(name, fieldName);
  if (req) return req;

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  if (trimmed.length > 100) {
    return `${fieldName} cannot exceed 100 characters`;
  }

  const nameRegex = /^[A-Za-z\s.'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return `${fieldName} contains invalid characters`;
  }

  return null;
};

/**
 * Validates standard email address format.
 */
export const validateEmail = (email) => {
  const req = validateRequired(email, 'Email address');
  if (req) return req;

  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid work email address (e.g., name@company.com)';
  }

  return null;
};

/**
 * Validates international/local phone numbers.
 */
export const validatePhone = (phone) => {
  const req = validateRequired(phone, 'Phone number');
  if (req) return req;

  const trimmed = phone.trim();
  // Validates digits, optional leading +, spaces, dashes, parentheses (length 7-18)
  const phoneRegex = /^\+?[0-9\s()-]{7,18}$/;
  if (!phoneRegex.test(trimmed)) {
    return 'Please enter a valid phone number (7 to 18 digits with optional + and hyphens)';
  }

  return null;
};

/**
 * Validates date string and verifies it parses to a real calendar date.
 */
export const validateDate = (dateString, fieldName = 'Date') => {
  const req = validateRequired(dateString, fieldName);
  if (req) return req;

  const timestamp = Date.parse(dateString);
  if (isNaN(timestamp)) {
    return `${fieldName} must be a valid date`;
  }

  return null;
};

/**
 * Validates positive number / non-negative number.
 */
export const validateNumber = (value, fieldName = 'Value', options = {}) => {
  const { min = 0, max = Infinity, integerOnly = false, allowZero = true } = options;

  if (value === '' || value === null || value === undefined) {
    return `${fieldName} is required`;
  }

  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }

  if (integerOnly && !Number.isInteger(num)) {
    return `${fieldName} must be an integer`;
  }

  if (!allowZero && num === 0) {
    return `${fieldName} must be greater than 0`;
  }

  if (num < min) {
    return `${fieldName} cannot be less than ${min}`;
  }

  if (num > max) {
    return `${fieldName} cannot exceed ${max}`;
  }

  return null;
};

/**
 * Validates standard code identifiers (e.g. LOC-CHN, PTO, SICK).
 */
export const validateCode = (code, fieldName = 'Code') => {
  const req = validateRequired(code, fieldName);
  if (req) return req;

  const trimmed = code.trim();
  if (trimmed.length < 2 || trimmed.length > 12) {
    return `${fieldName} must be between 2 and 12 characters`;
  }

  const codeRegex = /^[A-Za-z0-9_-]+$/;
  if (!codeRegex.test(trimmed)) {
    return `${fieldName} can only contain uppercase letters, numbers, and hyphens`;
  }

  return null;
};
