import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Lock, User, ShieldCheck, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ROLES } from '../../constants/roles.js';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const DEMO_ACCOUNTS = [
    { role: 'ADMIN', id: 'admin@enterprise.com', pass: 'password123', label: 'Admin (Devin Vance)' },
    { role: 'MANAGER', id: 'arun.k@enterprise.com', pass: 'password123', label: 'Manager (Arun Kumar)' },
    { role: 'TEAM_LEAD', id: 'priya.s@enterprise.com', pass: 'password123', label: 'Team Lead (Priya Sharma)' },
    { role: 'EMPLOYEE', id: 'john.doe@enterprise.com', pass: 'password123', label: 'Employee (John Doe)' }
  ];

  const handleQuickFill = (acc) => {
    setUsername(acc.id);
    setPassword(acc.pass);
    setFieldErrors({});
    setApiError(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Employee ID or Work Email is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    try {
      const user = await login({ username: username.trim(), password });
      toast.success(`Welcome back, ${user.name}!`, 'Authentication Successful');

      // Role-based destination redirect
      const getRoleHome = (r) => {
        switch (r) {
          case ROLES.ADMIN:
            return '/admin';
          case ROLES.TEAM_LEAD:
            return '/team-lead';
          case ROLES.MANAGER:
            return '/manager';
          case ROLES.EMPLOYEE:
          default:
            return '/employee';
        }
      };

      const from = location.state?.from?.pathname;
      const isRoleAllowedForPath = (r, path) => {
        if (!path || path === '/' || path.includes('/login') || path.includes('/unauthorized')) return false;
        if (path.startsWith('/admin')) return r === ROLES.ADMIN;
        if (path.startsWith('/team-lead')) return r === ROLES.TEAM_LEAD;
        if (path.startsWith('/manager')) return r === ROLES.MANAGER;
        if (path.startsWith('/employee') || path.startsWith('/leaves')) return true;
        return false;
      };

      if (from && isRoleAllowedForPath(user.role, from)) {
        navigate(from, { replace: true });
      } else {
        navigate(getRoleHome(user.role), { replace: true });
      }
    } catch (err) {
      setApiError(err.message || 'Authentication failed. Please verify your credentials.');
      toast.error(err.message || 'Login failed', 'Authentication Error');
    }
  };

  return (
    <div className="login-page-shell">
      {/* Brand Hero Panel */}
      <div className="login-brand-panel">
        <div className="login-brand-header">
          <div className="login-brand-logo">
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              NexLeave
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.06em' }}>
              ENTERPRISE PTO & LEAVE SYSTEM
            </div>
          </div>
        </div>

        <div className="login-hero-content">
          <div className="login-hero-badge">
            <ShieldCheck size={14} />
            <span>ENTERPRISE GOVERNANCE • MODULE 1</span>
          </div>

          <h1 className="login-hero-title">
            Dynamic, Location-Aware Leave Management.
          </h1>

          <p className="login-hero-desc">
            Autonomous organizational setup, location-specific statutory accrual policies, and multi-tier approval workflow schemas built for enterprise scale.
          </p>

          <div className="login-feature-list">
            <div className="login-feature-item">
              <CheckCircle size={17} className="login-feature-icon" />
              <span>Location-based PTO, Sick & Casual leave entitlement policies</span>
            </div>
            <div className="login-feature-item">
              <CheckCircle size={17} className="login-feature-icon" />
              <span>Multi-tier Employee → Team Lead → Manager hierarchy mapping</span>
            </div>
            <div className="login-feature-item">
              <CheckCircle size={17} className="login-feature-icon" />
              <span>Configurable duration-based approval workflow tiers</span>
            </div>
            <div className="login-feature-item">
              <CheckCircle size={17} className="login-feature-icon" />
              <span>Strict Role-Based Access Control (Admin, TL, Manager, Employee)</span>
            </div>
          </div>
        </div>

        <div className="login-brand-footer">
          © {new Date().getFullYear()} NexLeave Systems Inc. Module 1: Auth & Org Configuration.
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-header">
          <h2 className="login-form-title">Sign In to NexLeave</h2>
          <p className="login-form-subtitle">
            Enter your employee credentials to access your portal.
          </p>
        </div>

        {apiError && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--status-danger-subtle)',
              border: '1px solid var(--status-danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-danger-text)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="loginUsername"
            name="username"
            label="Employee ID or Work Email"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: null }));
            }}
            placeholder="e.g. ADM001 or admin@enterprise.com"
            required
            error={fieldErrors.username}
            icon={User}
            disabled={isLoading}
          />

          <Input
            id="loginPassword"
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
            }}
            placeholder="••••••••••••"
            required
            error={fieldErrors.password}
            icon={Lock}
            disabled={isLoading}
          />

          <div style={{ marginTop: '24px' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="btn-block"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to Account
            </Button>
          </div>
        </form>

        {/* Demo Fast Pickers */}
        <div className="demo-accounts-card">
          <div className="demo-card-title">
            <span>Demo Test Credentials</span>
            <span style={{ fontSize: '11px', color: 'var(--primary-orange)', fontWeight: 600 }}>1-Click Fill</span>
          </div>
          <div className="demo-account-grid">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                type="button"
                className="demo-account-btn"
                onClick={() => handleQuickFill(acc)}
                title={`Click to fill ${acc.label}`}
              >
                <span className="demo-btn-role">{acc.role}</span>
                <span className="demo-btn-id">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
