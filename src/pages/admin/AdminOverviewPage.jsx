import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Briefcase,
  MapPin,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  GitMerge,
  FileText,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { auditService } from '../../services/auditService.js';

export const AdminOverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, logsData] = await Promise.all([
        auditService.fetchDashboardStats(),
        auditService.fetchAuditLogs()
      ]);
      setStats(statsData);
      setRecentLogs(logsData.slice(0, 5));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Calculating organization statistics & policies..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  return (
    <div>
      <PageHeader
        title="Admin Control Center"
        description="System initialization, policy rules configuration, and employee hierarchy orchestration."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/admin/employees/create">
              <Button variant="primary" size="sm" icon={PlusCircle}>
                Provision Employee
              </Button>
            </Link>
            <Link to="/admin/leave-policies">
              <Button variant="secondary" size="sm" icon={ShieldCheck}>
                Configure Policies
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="dashboard-stats-grid">
        <StatCard
          label="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          subtext={`${stats?.activeEmployees || 0} active accounts`}
          colorVariant="blue"
        />

        <StatCard
          label="Team Leads"
          value={stats?.teamLeads || 0}
          icon={UserCheck}
          subtext="Tier-1 initial reviewers"
          colorVariant="warning"
        />

        <StatCard
          label="Department Managers"
          value={stats?.managers || 0}
          icon={Briefcase}
          subtext="Tier-2 escalation authorities"
          colorVariant="primary"
        />

        <StatCard
          label="Operating Locations"
          value={stats?.activeLocations || 0}
          icon={MapPin}
          subtext="Regional policy jurisdictions"
          colorVariant="blue"
        />

        <StatCard
          label="Active Leave Policies"
          value={stats?.activePolicies || 0}
          icon={ShieldCheck}
          subtext="Location + Category rules"
          colorVariant="success"
        />

        <StatCard
          label="Pending Configurations"
          value={stats?.pendingConfigurations || 0}
          icon={AlertCircle}
          subtext={
            stats?.unmappedEmployees > 0
              ? `${stats.unmappedEmployees} unmapped employees`
              : 'All systems mapped'
          }
          colorVariant={stats?.pendingConfigurations > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Main Split Grid */}
      <div className="dashboard-layout-columns">
        {/* Left Column: Quick Actions & Policy Readiness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Setup Actions */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Quick Administrative Actions
            </h2>

            <div className="quick-action-grid">
              <Link to="/admin/employees/create" className="quick-action-card">
                <div className="quick-action-icon">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <div className="quick-action-title">Create Employee</div>
                  <div className="quick-action-desc">Provision staff credentials & role assignment</div>
                </div>
              </Link>

              <Link to="/admin/mappings" className="quick-action-card">
                <div className="quick-action-icon" style={{ backgroundColor: 'var(--info-blue-subtle)', color: 'var(--info-blue)' }}>
                  <GitMerge size={20} />
                </div>
                <div>
                  <div className="quick-action-title">Map Hierarchy</div>
                  <div className="quick-action-desc">Assign Team Leads & Managers to employees</div>
                </div>
              </Link>

              <Link to="/admin/locations" className="quick-action-card">
                <div className="quick-action-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="quick-action-title">Locations Setup</div>
                  <div className="quick-action-desc">Define corporate offices and timezones</div>
                </div>
              </Link>

              <Link to="/admin/leave-policies" className="quick-action-card">
                <div className="quick-action-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="quick-action-title">Location Policies</div>
                  <div className="quick-action-desc">Configure PTO, accrual & carry-forward</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Module 1 Readiness Checklist */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >

          </div>
        </div>

        {/* Right Column: Recent Audit Trail Feed */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--primary-orange)" />
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Recent System Activity
                </h2>
              </div>
              <Link to="/admin/audit" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--primary-orange)' }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--primary-orange)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {log.actionType}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <Link to="/admin/audit">
              <Button variant="outline" size="sm" className="btn-block" icon={ArrowRight} iconPosition="right">
                Open Full Audit Logs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
