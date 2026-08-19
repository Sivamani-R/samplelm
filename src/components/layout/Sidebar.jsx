import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GitMerge,
  MapPin,
  Tag,
  ShieldCheck,
  GitFork,
  Activity,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: 'DASHBOARD & PEOPLE',
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/employees', label: 'Employees', icon: Users, end: true },
        { to: '/admin/employees/create', label: 'Create Employee', icon: UserPlus },
        { to: '/admin/mappings', label: 'Employee Mapping', icon: GitMerge }
      ]
    },
    {
      title: 'ORGANIZATION CONFIG',
      items: [
        { to: '/admin/locations', label: 'Locations', icon: MapPin },
        { to: '/admin/leave-categories', label: 'Leave Categories', icon: Tag },
        { to: '/admin/leave-policies', label: 'Leave Policies', icon: ShieldCheck },
        { to: '/admin/approval-workflows', label: 'Approval Workflows', icon: GitFork }
      ]
    },
    {
      title: 'GOVERNANCE & SYSTEM',
      items: [
        { to: '/admin/audit', label: 'Audit / Activity Logs', icon: Activity }
      ]
    }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`admin-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO4Om_xkHI-SdgQLoDn5EW5qcDsSfM2DIbNLa1PRvAa_m8yxQScX7ERdw&s=10" 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="brand-meta-info">
            <div className="brand-name" style={{ fontSize: '14px', whiteSpace: 'normal', lineHeight: '1.2' }}>
              Leave Management System
            </div>
            <div className="brand-tag">Enterprise Dynamic PTO</div>
          </div>
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
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="sidebar-user-text">
              <div className="sidebar-user-name" title={user?.name}>
                {user?.name || 'Administrator'}
              </div>
              <div className="sidebar-user-role">{user?.id || 'ADM001'} • ADMIN</div>
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
              transition: 'color var(--transition-fast)'
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
