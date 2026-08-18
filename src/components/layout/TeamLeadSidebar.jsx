import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  History,
  Calendar,
  PlusCircle,
  Award,
  UserCheck,
  MapPin,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const TeamLeadSidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: 'LEAD DASHBOARD & APPROVALS',
      items: [
        { to: '/team-lead', label: 'Lead Overview', icon: LayoutDashboard, end: true },
        { to: '/team-lead/approvals', label: 'Team Approvals', icon: CheckSquare },
        { to: '/team-lead/approval-history', label: 'Approval History', icon: History },
        { to: '/team-lead/team-calendar', label: 'Team Leave Calendar', icon: Calendar }
      ]
    },
    {
      title: 'MY SELF-SERVICE',
      items: [
        { to: '/team-lead/apply-leave', label: 'Apply Leave', icon: PlusCircle },
        { to: '/team-lead/leave-history', label: 'My Leave History', icon: History },
        { to: '/team-lead/holidays', label: 'Holiday Calendar', icon: Calendar },
        { to: '/team-lead/attendance-regularization', label: 'My Attendance', icon: UserCheck },
        { to: '/team-lead/comp-off', label: 'My Comp-Off', icon: Award }
      ]
    }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`admin-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div className="brand-icon-logo">
            <Sparkles size={20} />
          </div>
          <div className="brand-meta-info">
            <div className="brand-name">
              Nex<span>Leave</span>
            </div>
            <div className="brand-tag">Team Lead Portal</div>
          </div>
        </div>

        {/* Location & Availability Badge */}
        <div
          style={{
            margin: '12px 14px 4px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#cbd5e1' }}>
            <MapPin size={13} color="var(--primary-orange)" />
            <span>{user?.location || 'Corporate Office'}</span>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: 'var(--radius-sm)' }}>
            ACTIVE LEAD
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav-container">
          {navSections.map((section) => (
            <div key={section.title} className="nav-section">
              <div className="nav-group-title">{section.title}</div>
              <ul className="nav-group-items">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `nav-link-item ${isActive ? 'active' : ''}`
                        }
                        onClick={onClose}
                      >
                        <Icon size={17} className="nav-icon" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer Profile & Logout */}
        <div className="sidebar-footer-profile">
          <div className="sidebar-user-summary">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0) || 'L'}
            </div>
            <div className="sidebar-user-text">
              <div className="sidebar-user-name" title={user?.name}>
                {user?.name || 'Team Lead'}
              </div>
              <div className="sidebar-user-role">{user?.id || 'TL001'} • TEAM LEAD</div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Logout"
            style={{
              color: '#94a3b8',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
