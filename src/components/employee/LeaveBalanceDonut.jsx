import React from 'react';

/**
 * Enterprise Power BI-style SVG Donut Chart showing Leave Allocation
 */
export const LeaveBalanceDonut = ({ balances = [] }) => {
  const totalAvailable = balances.reduce((sum, b) => sum + (Number(b.closingBalance) || 0), 0);
  const totalUsed = balances.reduce((sum, b) => sum + (Number(b.used) || 0), 0);
  const totalPending = balances.reduce((sum, b) => sum + (Number(b.pending) || 0), 0);
  const total = totalAvailable + totalUsed + totalPending || 1;

  const availablePct = totalAvailable / total;
  const usedPct = totalUsed / total;
  const pendingPct = totalPending / total;

  // SVG circle calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const strokeAvailable = circumference * availablePct;
  const strokeUsed = circumference * usedPct;
  const strokePending = circumference * pendingPct;

  const offsetAvailable = 0;
  const offsetUsed = -strokeAvailable;
  const offsetPending = -(strokeAvailable + strokeUsed);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Annual Leave Allocation
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Real-time ratio of Available vs Utilized vs Reserved days
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '10px 0' }}>
        <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          {/* Base Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="var(--bg-surface-secondary)"
            strokeWidth="14"
          />

          {/* Available (Orange) */}
          {totalAvailable > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="var(--primary-orange)"
              strokeWidth="14"
              strokeDasharray={`${strokeAvailable} ${circumference}`}
              strokeDashoffset={offsetAvailable}
            />
          )}

          {/* Used (Navy Blue) */}
          {totalUsed > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="var(--nav-dark)"
              strokeWidth="14"
              strokeDasharray={`${strokeUsed} ${circumference}`}
              strokeDashoffset={offsetUsed}
            />
          )}

          {/* Pending (Amber) */}
          {totalPending > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="var(--status-warning)"
              strokeWidth="14"
              strokeDasharray={`${strokePending} ${circumference}`}
              strokeDashoffset={offsetPending}
            />
          )}
        </svg>

        {/* Center Number */}
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {totalAvailable.toFixed(1)}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
            Available
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '16px', borderTop: '1px solid var(--border-light)', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-orange)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Available:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{totalAvailable.toFixed(1)}d</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--nav-dark)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Used:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{totalUsed.toFixed(1)}d</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-warning)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Pending:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{totalPending.toFixed(1)}d</strong>
        </div>
      </div>
    </div>
  );
};
