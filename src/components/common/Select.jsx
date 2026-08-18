import React from 'react';
import { FormField } from './FormField.jsx';

/**
 * Reusable Select Dropdown
 */
export const Select = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option...',
  required = false,
  error = null,
  helperText = null,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = id || name;

  const selectElement = (
    <select
      id={selectId}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={`form-select ${error ? 'is-invalid' : ''} ${className}`.trim()}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const lbl = typeof opt === 'object' ? opt.label : opt;
        return (
          <option key={val} value={val}>
            {lbl}
          </option>
        );
      })}
    </select>
  );

  if (label || error || helperText) {
    return (
      <FormField id={selectId} label={label} required={required} error={error} helperText={helperText}>
        {selectElement}
      </FormField>
    );
  }

  return selectElement;
};
