import React from 'react';

/**
 * Enterprise Page Header with Title, Description, and Action Buttons
 */
export const PageHeader = ({
  title,
  description = null,
  actions = null,
  className = ''
}) => {
  return (
    <div className={`page-header ${className}`.trim()}>
      <div className="page-header-info">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};
