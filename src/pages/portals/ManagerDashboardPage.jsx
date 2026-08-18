import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LogOut, Briefcase, MapPin, GitPullRequest, ShieldCheck } from 'lucide-react';

export const ManagerDashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface)',
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xs)',
            marginBottom: '24px',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              {user?.name?.charAt(0) || 'M'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {user?.name}
                </h1>
                <StatusBadge status="MANAGER" variant="primary" />
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                {user?.id} • {user?.designation} • {user?.department}
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" icon={LogOut} onClick={logout}>
            Sign Out
          </Button>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-orange)', fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>
            <ShieldCheck size={18} />
            <span>MODULE 1 VERIFIED: MANAGER PORTAL ACTIVE</span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Department Management Console
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            You have logged in under the <strong>MANAGER</strong> role. In future modules, this portal will receive second-tier escalation approvals, team capacity heatmaps, and department absence reports.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>DEPARTMENT</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={15} color="var(--primary-orange)" />
                {user?.department || 'Department'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>MANAGEMENT ROLE</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-orange)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GitPullRequest size={15} />
                Department Tier-2 Approver
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>UPCOMING INTEGRATION</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--status-success-text)', marginTop: '4px' }}>
                Module 5: Leave Balance Management
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
