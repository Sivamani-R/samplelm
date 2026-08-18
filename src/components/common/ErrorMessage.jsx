import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * Reusable Error Message Banner / Card
 */
export const ErrorMessage = ({
  title = 'Something went wrong',
  message,
  onRetry = null,
  className = ''
}) => {
  return (
    <div
      className={`error-message-card ${className}`}
      style={{
        padding: '16px 20px',
        backgroundColor: 'var(--status-danger-subtle)',
        border: '1px solid var(--status-danger-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        margin: '16px 0'
      }}
    >
      <div style={{ color: 'var(--status-danger)', marginTop: '2px', flexShrink: 0 }}>
        <AlertTriangle size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--status-danger-text)', marginBottom: '4px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {message || 'An unexpected error occurred while communicating with the service.'}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={RefreshCw}>
          Retry
        </Button>
      )}
    </div>
  );
};
