import React from 'react';

/**
 * Reusable Accessible Toggle Switch
 */
export const ToggleSwitch = ({
  checked = false,
  onChange,
  label,
  description = null,
  disabled = false,
  id,
  name,
  className = ''
}) => {
  const switchId = id || name || `switch-${Math.random().toString(36).substr(2, 6)}`;

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`toggle-switch-container ${disabled ? 'btn-disabled' : ''} ${className}`.trim()}
      onClick={handleToggle}
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${switchId}-label`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className={`toggle-switch ${checked ? 'is-checked' : ''}`}>
        <div className="toggle-slider" />
      </div>
      {(label || description) && (
        <div className="toggle-text-wrap">
          {label && <div id={`${switchId}-label`} className="toggle-label-text">{label}</div>}
          {description && <div className="toggle-description">{description}</div>}
        </div>
      )}
    </div>
  );
};
