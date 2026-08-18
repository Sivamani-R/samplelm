import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

/**
 * Reusable Confirmation Dialog for Destructive or Important Operations
 */
export const ConfirmDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div
          style={{
            color: confirmVariant === 'danger' ? 'var(--status-danger)' : 'var(--primary-orange)',
            backgroundColor: confirmVariant === 'danger' ? 'var(--status-danger-subtle)' : 'var(--primary-orange-subtle)',
            padding: '10px',
            borderRadius: 'var(--radius-full)',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '2px' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};
