import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { LoadingSpinner } from '../common/LoadingSpinner.jsx';
import { ApprovalTracker } from '../employee/ApprovalTracker.jsx';
import { SLAIndicator } from './SLAIndicator.jsx';
import { approvalService } from '../../services/approvalService.js';
import {
  User,
  Calendar,
  Clock,
  FileText,
  Paperclip,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  MapPin
} from 'lucide-react';

/**
 * Complete Request Inspection & Action Modal
 */
export const ApprovalDetailModal = ({
  isOpen,
  onClose,
  requestId,
  onOpenActionModal
}) => {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requestId || !isOpen) {
      setDetail(null);
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await approvalService.fetchApprovalRequest(requestId);
        setDetail(data);
      } catch (err) {
        setError(err.message || 'Unable to load approval details.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [requestId, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Leave Request Details: #${requestId}`}
      size="lg"
      footer={
        detail && detail.status === 'PENDING' ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
              variant="outline"
              icon={HelpCircle}
              onClick={() => onOpenActionModal(detail, 'CLARIFICATION')}
            >
              Request Clarification
            </Button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="danger"
                icon={XCircle}
                onClick={() => onOpenActionModal(detail, 'REJECT')}
              >
                Reject Request
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle2}
                onClick={() => onOpenActionModal(detail, 'APPROVE')}
              >
                Approve Request
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        )
      }
    >
      {isLoading ? (
        <LoadingSpinner text="Fetching full request & policy information..." />
      ) : error ? (
        <div style={{ padding: '20px', color: '#ef4444' }}>{error}</div>
      ) : detail ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Employee Header Profile */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary-orange-subtle)',
                  color: 'var(--primary-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '16px'
                }}
              >
                {detail.employee?.name?.charAt(0) || 'E'}
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {detail.employee?.name}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {detail.employee?.id} • {detail.employee?.designation} • {detail.employee?.department}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SLAIndicator sla={detail.sla} />
              <StatusBadge status={detail.status} variant={detail.status === 'APPROVED' ? 'success' : detail.status === 'PENDING' ? 'warning' : 'danger'} />
            </div>
          </div>

          {/* Leave Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              fontSize: '12.5px'
            }}
          >
            <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Leave Category:</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {detail.leaveTypeName}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Leave Period:</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {detail.startDate} to {detail.endDate}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Calculated Duration:</span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-orange)', marginTop: '2px' }}>
                {detail.duration} Working Day(s)
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Employee Balance Available:</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--info-blue)', marginTop: '2px' }}>
                {detail.balance?.closingBalance ?? '—'} Days Available
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Employee Reason & Remarks
            </h5>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                fontStyle: 'italic'
              }}
            >
              "{detail.reason || 'No remarks provided.'}"
            </div>
          </div>

          {/* Attachments */}
          {detail.attachments?.length > 0 && (
            <div>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Supporting Attachments ({detail.attachments.length})
              </h5>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {detail.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px'
                    }}
                  >
                    <Paperclip size={14} color="var(--primary-orange)" />
                    <span style={{ fontWeight: 600 }}>{att.name}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>({att.size})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multi-Tier Approval Workflow Timeline */}
          <div>
            <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Approval Chain Progression
            </h5>
            <ApprovalTracker
              approvalChain={detail.approvalChain}
              status={detail.status}
              appliedDate={detail.appliedDate}
            />
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
