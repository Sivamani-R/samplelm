import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';

export const UnauthorizedPage = ({ requiredRoles = [], currentRole = null }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const getRoleHome = () => {
    switch (currentRole) {
      case ROLES.ADMIN:
        return '/admin';
      case ROLES.TEAM_LEAD:
        return '/team-lead';
      case ROLES.MANAGER:
        return '/manager';
      case ROLES.EMPLOYEE:
        return '/employee';
      default:
        return '/login';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-page)'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--status-danger-subtle)',
            color: 'var(--status-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}
        >
          <ShieldAlert size={34} />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          403 — Access Denied
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
          You do not have administrative privileges to view this section of NexLeave.
          This area is restricted to authenticated <strong>{requiredRoles.join(' / ')}</strong> roles.
        </p>

        <div
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>Your Assigned Role:</span>
          <span style={{ fontWeight: 700, color: 'var(--primary-orange)' }}>
            {currentRole || 'GUEST / UNKNOWN'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button
            variant="outline"
            size="md"
            icon={ArrowLeft}
            onClick={() => navigate(getRoleHome())}
          >
            Return to Dashboard
          </Button>
          <Button
            variant="ghost"
            size="md"
            icon={LogOut}
            onClick={logout}
          >
            Switch Account
          </Button>
        </div>
      </div>
    </div>
  );
};
