import React from 'react';
import { FormField } from './FormField.jsx';

/**
 * Reusable Text / Number / Email / Password Input
 */
export const Input = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  error = null,
  helperText = null,
  disabled = false,
  readOnly = false,
  icon: Icon = null,
  className = '',
  ...props
}) => {
  const inputId = id || name;

  const inputElement = (
    <div className="input-container">
      {Icon && (
        <span className="input-prefix-icon">
          <Icon size={16} />
        </span>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`form-input ${Icon ? 'has-prefix-icon' : ''} ${error ? 'is-invalid' : ''} ${className}`.trim()}
        {...props}
      />
    </div>
  );

  if (label || error || helperText) {
    return (
      <FormField id={inputId} label={label} required={required} error={error} helperText={helperText}>
        {inputElement}
      </FormField>
    );
  }

  return inputElement;
};
