import React from 'react';
import { MapPin, Calendar, Clock, AlertCircle, Edit, Check, X } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { Button } from '../common/Button.jsx';

/**
 * Enterprise Location-Based Leave Policy Summary Card
 */
export const PolicyCard = ({ policy, onEdit }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--info-blue)', fontWeight: 700 }}>
              <MapPin size={14} />
              <span>{policy.locationName} ({policy.locationCity})</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {policy.categoryName}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <StatusBadge status={policy.paid ? 'PAID' : 'UNPAID'} variant={policy.paid ? 'success' : 'danger'} />
            <StatusBadge status={policy.active ? 'ACTIVE' : 'INACTIVE'} variant={policy.active ? 'primary' : 'neutral'} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>ENTITLEMENT</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-orange)' }}>
              {policy.annualEntitlement} <span style={{ fontSize: '11px', fontWeight: 500 }}>days/yr</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>ACCRUAL</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--nav-dark)' }}>
              {policy.monthlyAccrual} <span style={{ fontSize: '11px', fontWeight: 500 }}>/mo</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>MAX BAL</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--info-blue)' }}>
              {policy.maxBalance} <span style={{ fontSize: '11px', fontWeight: 500 }}>days</span>
            </div>
          </div>
        </div>

        {/* Policy Rule Flags */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Carry Forward:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {policy.carryForwardAllowed ? `Yes (Up to ${policy.carryForwardLimit} days)` : 'No'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Min Notice Required:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {policy.minNoticeDays > 0 ? `${policy.minNoticeDays} day(s)` : 'None (Emergency allowed)'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Max Continuous Leave:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {policy.maxContinuousDays} days
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {policy.allowHourly ? <Check size={14} color="var(--status-success)" /> : <X size={14} color="var(--text-tertiary)" />}
              Hourly Leave
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {policy.allowHalfDay ? <Check size={14} color="var(--status-success)" /> : <X size={14} color="var(--text-tertiary)" />}
              Half Day
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {policy.requireSupportingDocument ? <Check size={14} color="var(--status-warning)" /> : <X size={14} color="var(--text-tertiary)" />}
              Doc Required {policy.requireSupportingDocument && `(>${policy.docThresholdDays}d)`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
        <Button variant="outline" size="sm" icon={Edit} onClick={() => onEdit(policy)} className="btn-block">
          Edit Policy Rules
        </Button>
      </div>
    </div>
  );
};
