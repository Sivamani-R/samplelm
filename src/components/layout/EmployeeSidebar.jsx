import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Scale,
  Calendar,
  Clock,
  Award,
  Briefcase,
  UserCheck,
  MapPin,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const EmployeeSidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: 'SELF-SERVICE PORTAL',
      items: [
        { to: '/employee', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/employee/apply-leave', label: 'Apply Leave', icon: PlusCircle },
        { to: '/employee/leave-history', label: 'Leave History & Status', icon: History },
        { to: '/employee/leave-balance', label: 'Leave Balances', icon: Scale },
        { to: '/employee/holidays', label: 'Holiday Calendar', icon: Calendar }
      ]
    },
    {
      title: 'ATTENDANCE & OVERTIME',
      items: [
        { to: '/employee/attendance-regularization', label: 'Attendance Regularization', icon: UserCheck },
        { to: '/employee/comp-off', label: 'Compensatory Off', icon: Award },
        { to: '/employee/weekend-allowance', label: 'Weekend Allowance', icon: Briefcase }
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
            <div className="brand-tag">Employee Self-Service</div>
          </div>
        </div>

        {/* Location Badge */}
        <div
          style={{
            margin: '12px 14px 4px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MapPin size={14} color="var(--primary-orange)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11.5px', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.location || 'Corporate Office'}
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
              {user?.name?.charAt(0) || 'E'}
            </div>
            <div className="sidebar-user-text">
              <div className="sidebar-user-name" title={user?.name}>
                {user?.name || 'Employee'}
              </div>
              <div className="sidebar-user-role">{user?.id || 'EMP001'} • EMPLOYEE</div>
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
              transition: 'color var(--transition-fast)',
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
