import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { notificationService } from '../../services/notificationService.js';
import { NotificationItem } from './NotificationItem.jsx';

/**
 * Interactive Notification Bell with live unread badge and dropdown preview
 */
export const NotificationBell = () => {
  const [data, setData] = useState({ unreadCount: 0, notifications: [] });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.fetchNotifications();
      setData(res);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  const previewList = data.notifications.slice(0, 4);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        className="topbar-action-icon"
        title="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {data.unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: 'var(--primary-orange)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              borderRadius: 'var(--radius-full)',
              padding: '1px 5px',
              lineHeight: 1.2,
              border: '1.5px solid var(--bg-surface)'
            }}
          >
            {data.unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxWidth: '90vw',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface-secondary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Notifications</strong>
              {data.unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'var(--primary-orange-subtle)',
                    color: 'var(--primary-orange)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {data.unreadCount} new
                </span>
              )}
            </div>

            {data.unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--info-blue)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {previewList.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                No notifications right now
              </div>
            ) : (
              previewList.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkAsRead={handleMarkAsRead}
                  onClickItem={() => setIsOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-light)',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface-secondary)'
            }}
          >
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--primary-orange)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View All Notifications <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
