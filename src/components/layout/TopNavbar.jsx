import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Breadcrumbs } from './Breadcrumbs.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { NotificationBell } from '../notification/NotificationBell.jsx';

export const TopNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <Breadcrumbs />
      </div>

      <div className="topbar-right">
        {/* Active System Indicator */}
        <div className="system-status-indicator" title="System Operational & Policy Engine Ready">
          System Live
        </div>

        {/* Live Notification Bell with Dropdown */}
        <NotificationBell />

        {/* User Pill with Role Badge */}
        <div className="user-profile-menu">
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-orange-subtle)',
              color: 'var(--primary-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px'
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '4px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.name || 'Administrator'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <StatusBadge status={user?.role || 'ADMIN'} variant="primary" showDot={false} />
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Log out of session"
            style={{
              padding: '6px',
              color: 'var(--text-tertiary)',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '4px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            aria-label="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
