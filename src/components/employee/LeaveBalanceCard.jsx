import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Clock, PlusCircle } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { Button } from '../common/Button.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';

/**
 * Dynamic Leave Balance Card with formula visualization
 */
export const LeaveBalanceCard = ({ balance, onApply = null }) => {
  const { role } = useAuth();
  const getBasePath = () => {
    if (role === ROLES.TEAM_LEAD) return '/team-lead';
    if (role === ROLES.MANAGER) return '/manager';
    return '/employee';
  };
  const basePath = getBasePath();

  const totalEarned = (balance.openingBalance || 0) + (balance.accrued || 0);
  const percentAvailable = totalEarned > 0
    ? Math.min(100, Math.max(0, Math.round((balance.closingBalance / totalEarned) * 100)))
    : 100;

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
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--info-blue)', letterSpacing: '0.04em' }}>
              {balance.categoryCode || 'LEAVE'}
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {balance.categoryName}
            </h3>
          </div>
          <StatusBadge
            status={balance.paid ? 'PAID' : 'UNPAID'}
            variant={balance.paid ? 'success' : 'danger'}
          />
        </div>

        {/* Availability Number */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-orange)', lineHeight: 1 }}>
              {balance.closingBalance}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              / {totalEarned} days available
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: '6px',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-full)',
              marginTop: '8px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${percentAvailable}%`,
                height: '100%',
                backgroundColor: 'var(--primary-orange)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.5s ease-out'
              }}
            />
          </div>
        </div>

        {/* Formula Stats Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            padding: '10px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '11.5px',
            textAlign: 'center',
            marginBottom: '14px'
          }}
        >
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>Opening</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {balance.openingBalance} d
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>Accrued</div>
            <div style={{ fontWeight: 700, color: 'var(--info-blue)', marginTop: '2px' }}>
              +{balance.accrued} d
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>Used</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {balance.used} d
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>Pending</div>
            <div style={{ fontWeight: 700, color: 'var(--status-warning-text)', marginTop: '2px' }}>
              {balance.pending} d
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
        <Link to={`${basePath}/apply-leave?type=${balance.categoryId}`} style={{ flex: 1 }}>
          <Button variant="primary" size="sm" className="btn-block" icon={PlusCircle}>
            Apply
          </Button>
        </Link>
        <Link to={basePath === '/employee' ? '/employee/leave-balance' : `${basePath}/leave-history`}>
          <Button variant="outline" size="sm" title="View Full Formula Breakdown">
            Details
          </Button>
        </Link>
      </div>
    </div>
  );
};
