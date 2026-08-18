import React from 'react';
import { Calendar } from 'lucide-react';
import { FormField } from './FormField.jsx';

/**
 * Reusable Date Picker Input with Calendar Icon
 */
export const DateInput = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  required = false,
  error = null,
  helperText = null,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || name;

  const dateElement = (
    <div className="input-container">
      <span className="input-prefix-icon">
        <Calendar size={16} />
      </span>
      <input
        id={inputId}
        name={name}
        type="date"
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        min={min}
        max={max}
        disabled={disabled}
        className={`form-input has-prefix-icon ${error ? 'is-invalid' : ''} ${className}`.trim()}
        {...props}
      />
    </div>
  );

  if (label || error || helperText) {
    return (
      <FormField id={inputId} label={label} required={required} error={error} helperText={helperText}>
        {dateElement}
      </FormField>
    );
  }

  return dateElement;
};
