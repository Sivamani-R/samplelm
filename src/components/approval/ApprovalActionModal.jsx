import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { FormField } from '../common/FormField.jsx';
import { CheckCircle2, XCircle, HelpCircle, AlertCircle } from 'lucide-react';

/**
 * Unified Approval Actions Modal (Approve, Reject, Clarify)
 */
export const ApprovalActionModal = ({
  isOpen,
  onClose,
  actionType, // 'APPROVE' | 'REJECT' | 'CLARIFICATION'
  request,
  onConfirm,
  isLoading = false
}) => {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);

  if (!request) return null;

  const handleClose = () => {
    setInputText('');
    setError(null);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (actionType === 'REJECT' && !inputText.trim()) {
      setError('A detailed reason for rejection is strictly mandatory.');
      return;
    }
    if (actionType === 'CLARIFICATION' && !inputText.trim()) {
      setError('Please provide specific questions or document instructions.');
      return;
    }

    onConfirm(request.id, actionType, inputText.trim());
  };

  let title = 'Approve Leave Request';
  let confirmLabel = 'Confirm Approval';
  let confirmVariant = 'primary';
  let icon = <CheckCircle2 size={18} />;

  if (actionType === 'REJECT') {
    title = 'Reject Leave Request';
    confirmLabel = 'Confirm Rejection';
    confirmVariant = 'danger';
    icon = <XCircle size={18} />;
  } else if (actionType === 'CLARIFICATION') {
    title = 'Request Clarification / Documents';
    confirmLabel = 'Send Clarification Request';
    confirmVariant = 'outline';
    icon = <HelpCircle size={18} />;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleSubmit}
            loading={isLoading}
            icon={() => icon}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Request Brief */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            fontSize: '12.5px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Employee: </span>
            <strong>{request.employee?.name || request.employeeName}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Request ID: </span>
            <code style={{ color: 'var(--info-blue)' }}>{request.id}</code>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Category: </span>
            <strong>{request.leaveTypeName}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Duration: </span>
            <strong style={{ color: 'var(--primary-orange)' }}>{request.duration} Day(s)</strong>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Period: </span>
            <span>{request.startDate} to {request.endDate}</span>
          </div>
        </div>

        {/* Input Fields */}
        {actionType === 'APPROVE' && (
          <FormField label="Approval Remarks (Optional)" helpText="Add any handover notes or approval comments.">
            <textarea
              rows="3"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., Recommended. Tasks are handed over to secondary engineer."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '13px'
              }}
            />
          </FormField>
        )}

        {actionType === 'REJECT' && (
          <FormField
            label="Mandatory Reason for Rejection"
            required
            error={error}
            helpText="This reason will be visible to the employee and logged in the governance audit trail."
          >
            <textarea
              rows="3"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Specify the business justification or conflict for declining this leave..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: error ? '1.5px solid #ef4444' : '1px solid var(--border-medium)',
                fontSize: '13px'
              }}
            />
          </FormField>
        )}

        {actionType === 'CLARIFICATION' && (
          <FormField
            label="Clarification Query or Document Request"
            required
            error={error}
            helpText="The employee will receive an in-app alert to respond with additional details or documents."
          >
            <textarea
              rows="3"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., Please attach the official medical certificate for sick leave exceeding 2 days."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: error ? '1.5px solid #ef4444' : '1px solid var(--border-medium)',
                fontSize: '13px'
              }}
            />
          </FormField>
        )}
      </form>
    </Modal>
  );
};
