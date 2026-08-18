import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Standard Form Field Wrapper with Label, Required Indicator, Error, and Helper text
 */
export const FormField = ({
  label,
  required = false,
  error = null,
  helperText = null,
  children,
  id,
  className = ''
}) => {
  return (
    <div className={`form-field ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="form-label">
          <span>
            {label}
            {required && <span className="required-star">*</span>}
          </span>
        </label>
      )}
      {children}
      {error && (
        <div className="form-error-msg">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
      {!error && helperText && (
        <div className="form-helper-text">{helperText}</div>
      )}
    </div>
  );
};
