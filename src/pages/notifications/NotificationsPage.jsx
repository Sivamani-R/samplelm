import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { notificationService } from '../../services/notificationService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { NotificationItem } from '../../components/notification/NotificationItem.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const NotificationsPage = () => {
  const { showSuccess } = useToast();
  const [data, setData] = useState({ unreadCount: 0, notifications: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await notificationService.fetchNotifications();
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to fetch notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    showSuccess('All notifications marked as read.');
    loadNotifications();
  };

  const categories = [
    { key: 'ALL', label: 'All Notifications' },
    { key: 'UNREAD', label: `Unread (${data.unreadCount})` },
    { key: 'APPROVAL', label: 'Team Approvals' },
    { key: 'ESCALATION', label: 'SLA Escalations' },
    { key: 'LEAVE', label: 'My Leaves' }
  ];

  const filteredList = data.notifications.filter((n) => {
    if (activeCategory === 'UNREAD') return !n.read;
    if (activeCategory !== 'ALL') return n.category === activeCategory;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader
        title="Notification Center"
        subtitle="Real-time alerts, leave status updates, and SLA escalation notices"
        actions={
          data.unreadCount > 0 && (
            <Button variant="outline" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark All as Read
            </Button>
          )
        }
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: activeCategory === cat.key ? '1.5px solid var(--primary-orange)' : '1px solid var(--border-light)',
              backgroundColor: activeCategory === cat.key ? 'var(--primary-orange-subtle)' : 'var(--bg-surface)',
              color: activeCategory === cat.key ? 'var(--primary-orange-hover)' : 'var(--text-secondary)',
              fontSize: '12.5px',
              fontWeight: activeCategory === cat.key ? 700 : 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {isLoading ? (
        <LoadingSpinner text="Fetching notification stream..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadNotifications} />
      ) : filteredList.length === 0 ? (
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)'
          }}
        >
          <Bell size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            No Notifications Found
          </h4>
          <p style={{ fontSize: '12.5px', marginTop: '4px' }}>
            You have no notifications matching the selected filter.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xs)',
            overflow: 'hidden'
          }}
        >
          {filteredList.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};
