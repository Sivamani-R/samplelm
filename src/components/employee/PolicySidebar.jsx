import React, { useState } from 'react';
import { ShieldCheck, FileText, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { PolicyPdfModal } from './PolicyPdfModal.jsx';

/**
 * Live "Know Your Policy" Side Panel
 */
export const PolicySidebar = ({ policy, employee }) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  if (!policy) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-xs)',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}
      >
        <FileText size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Know Your Policy
        </h4>
        <p style={{ fontSize: '12px' }}>
          Select a leave category in the form to view real-time location policies, entitlement limits, and rules.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--primary-orange)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Know Your Policy
            </h3>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: policy.paid ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
              color: policy.paid ? 'var(--status-success-text)' : 'var(--status-danger-text)'
            }}
          >
            {policy.paid ? 'Paid Leave' : 'Unpaid LOP'}
          </span>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--info-blue)', marginBottom: '12px' }}>
          {policy.categoryName} ({policy.categoryCode})
        </div>

        {/* Policy Key Rules Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Annual Entitlement:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{policy.annualEntitlement} Days</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Monthly Accrual:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{policy.monthlyAccrual} Days / mo</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Maximum Balance Cap:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{policy.maxBalance} Days</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Carry Forward to 2027:</span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {policy.carryForwardAllowed ? `Up to ${policy.carryForwardLimit} Days` : 'No'}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Minimum Notice:</span>
            <strong style={{ color: policy.minNoticeDays > 0 ? 'var(--primary-orange)' : 'var(--text-primary)' }}>
              {policy.minNoticeDays > 0 ? `${policy.minNoticeDays} Day(s) in advance` : '0 Days (Immediate)'}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Half-Day Sessions:</span>
            <strong style={{ color: policy.allowHalfDay ? 'var(--status-success-text)' : 'var(--text-tertiary)' }}>
              {policy.allowHalfDay ? 'Allowed' : 'Not Allowed'}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Hourly Permission:</span>
            <strong style={{ color: policy.allowHourly ? 'var(--status-success-text)' : 'var(--text-tertiary)' }}>
              {policy.allowHourly ? 'Allowed' : 'Not Allowed'}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Supporting Document:</span>
            <strong style={{ color: policy.requireSupportingDocument ? 'var(--primary-orange)' : 'var(--text-secondary)' }}>
              {policy.requireSupportingDocument ? `Required if > ${policy.docThresholdDays} days` : 'Optional'}
            </strong>
          </div>
        </div>

        {/* View PDF Button */}
        <Button
          variant="outline"
          size="sm"
          className="btn-block"
          icon={FileText}
          onClick={() => setIsPdfModalOpen(true)}
        >
          View Policy PDF
        </Button>
      </div>

      {/* PDF Modal */}
      <PolicyPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        policy={policy}
        employee={employee}
      />
    </>
  );
};
