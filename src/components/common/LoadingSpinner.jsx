import React from 'react';

/**
 * Reusable Full and Inline Loading Spinner
 */
export const LoadingSpinner = ({ message = 'Loading data...', size = 'md' }) => {
  return (
    <div className="spinner-container">
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
      {message && <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{message}</span>}
    </div>
  );
};
