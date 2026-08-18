import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';

/**
 * Multi-Tier Approval Chain Visualizer
 */
export const ApprovalTracker = ({ approvalChain = [], status = 'PENDING', appliedDate = null }) => {
  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
        {/* Step 1: Employee Submitted */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              zIndex: 2,
              flexShrink: 0
            }}
          >
            <CheckCircle2 size={16} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Application Submitted
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {appliedDate ? new Date(appliedDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Submitted'}
            </div>
          </div>
        </div>

        {/* Approval Chain Steps */}
        {approvalChain.map((step, index) => {
          const isApproved = step.status === 'APPROVED';
          const isPending = step.status === 'PENDING';
          const isRejected = step.status === 'REJECTED';
          const isNotStarted = step.status === 'NOT_STARTED';

          let icon = <Clock size={16} />;
          let circleBg = 'var(--bg-surface-secondary)';
          let circleBorder = 'var(--border-medium)';
          let iconColor = 'var(--text-tertiary)';
          let statusText = 'Awaiting Prior Level';

          if (isApproved) {
            icon = <CheckCircle2 size={16} />;
            circleBg = '#ecfdf5';
            circleBorder = '#10b981';
            iconColor = '#059669';
            statusText = step.date ? `Approved on ${new Date(step.date).toLocaleDateString()}` : 'Approved';
          } else if (isPending) {
            icon = <Clock size={16} />;
            circleBg = '#fffbeb';
            circleBorder = 'var(--primary-orange)';
            iconColor = 'var(--primary-orange)';
            statusText = 'Under Review (Pending)';
          } else if (isRejected) {
            icon = <XCircle size={16} />;
            circleBg = '#fef2f2';
            circleBorder = '#ef4444';
            iconColor = '#dc2626';
            statusText = 'Rejected';
          }

          return (
            <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: circleBg,
                  border: `2px solid ${circleBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: iconColor,
                  zIndex: 2,
                  flexShrink: 0
                }}
              >
                {icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ROLE_LABELS[step.role] || step.role}
                  </span>
                  {step.approverName && (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      ({step.approverName})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11.5px', color: isPending ? 'var(--primary-orange)' : 'var(--text-tertiary)', fontWeight: isPending ? 600 : 400 }}>
                  {statusText}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
