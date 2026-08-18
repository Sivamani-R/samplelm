import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Real-Time Duration Calculation Breakdown Preview Card
 */
export const DurationPreview = ({ durationInfo = null, isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          fontSize: '12.5px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <Clock size={16} className="spinning" />
        Calculating working days and checking location calendar...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: 'var(--status-danger-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--status-danger-border)',
          fontSize: '12.5px',
          color: 'var(--status-danger-text)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <AlertTriangle size={16} />
        {error}
      </div>
    );
  }

  if (!durationInfo || durationInfo.workingDays === undefined) {
    return null;
  }

  return (
    <div
      style={{
        padding: '16px 20px',
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--primary-orange-border)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="var(--primary-orange)" />
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Calculated Leave Duration:
          </span>
        </div>
        <span
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--primary-orange)',
            backgroundColor: 'var(--primary-orange-subtle)',
            padding: '2px 12px',
            borderRadius: 'var(--radius-full)'
          }}
        >
          {durationInfo.workingDays} {durationInfo.isHourly ? 'Hours (Day Eq.)' : 'Working Day(s)'}
        </span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
        {durationInfo.breakdown}
      </p>
    </div>
  );
};
