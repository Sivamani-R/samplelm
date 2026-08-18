import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';

/**
 * Single Notification Item Renderer
 */
export const NotificationItem = ({ notification, onMarkAsRead, onClickItem }) => {
  const { id, title, message, type, category, read, link, createdAt } = notification;

  let icon = <Bell size={16} color="var(--info-blue)" />;
  let iconBg = '#eff6ff';

  if (type === 'LEAVE_APPROVED') {
    icon = <CheckCircle2 size={16} color="#059669" />;
    iconBg = '#ecfdf5';
  } else if (type === 'LEAVE_REJECTED') {
    icon = <XCircle size={16} color="#dc2626" />;
    iconBg = '#fef2f2';
  } else if (type === 'LEAVE_ESCALATED' || type === 'APPROVAL_OVERDUE') {
    icon = <ShieldAlert size={16} color="var(--primary-orange)" />;
    iconBg = 'var(--primary-orange-subtle)';
  } else if (type === 'CLARIFICATION_REQUIRED') {
    icon = <HelpCircle size={16} color="#d97706" />;
    iconBg = '#fffbeb';
  }

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handleClick = () => {
    if (!read && onMarkAsRead) {
      onMarkAsRead(id);
    }
    if (onClickItem) {
      onClickItem();
    }
  };

  const content = (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: read ? 'transparent' : 'rgba(234, 88, 12, 0.04)',
        borderBottom: '1px solid var(--border-light)',
        cursor: 'pointer',
        transition: 'background-color var(--transition-fast)'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-secondary)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = read ? 'transparent' : 'rgba(234, 88, 12, 0.04)')}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: read ? 600 : 800, color: 'var(--text-primary)' }}>
            {title}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
            {formatTimeAgo(createdAt)}
          </span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0', lineHeight: 1.4 }}>
          {message}
        </p>
      </div>

      {!read && (
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-orange)',
            marginTop: '6px',
            flexShrink: 0
          }}
        />
      )}
    </div>
  );

  return link ? (
    <Link to={link} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      {content}
    </Link>
  ) : (
    content
  );
};
