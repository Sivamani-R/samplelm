import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  PlusCircle,
  Clock,
  Award,
  UserCheck,
  Briefcase,
  AlertCircle,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { dashboardService } from '../../services/dashboardService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LeaveBalanceCard } from '../../components/employee/LeaveBalanceCard.jsx';
import { LeaveBalanceDonut } from '../../components/employee/LeaveBalanceDonut.jsx';
import { LeaveUsageBarChart } from '../../components/employee/LeaveUsageBarChart.jsx';
import { MiniLeaveCalendar } from '../../components/employee/MiniLeaveCalendar.jsx';

export const EmployeeDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await dashboardService.fetchDashboardData();
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to load employee dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading your enterprise employee portal..." fullPage />;
  }

  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <ErrorMessage message={error} onRetry={loadDashboard} />
      </div>
    );
  }

  const { employee, leaveBalances, pendingLeaves, upcomingHolidays, recentLeaveHistory, compOff, attendance } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Welcome Header */}
      <div
        style={{
          backgroundColor: 'var(--nav-dark)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 32px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-orange)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Employee Self-Service
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {employee.id}</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Welcome back, {employee.name} 👋
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '10px', fontSize: '13px', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} color="var(--primary-orange)" />
              <span>Location: <strong>{employee.locationName}</strong></span>
            </div>
            {employee.teamLead && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} color="#38bdf8" />
                <span>Team Lead: <strong>{employee.teamLead.name}</strong></span>
              </div>
            )}
            {employee.manager && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} color="#818cf8" />
                <span>Manager: <strong>{employee.manager.name}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/employee/apply-leave">
            <Button variant="primary" size="md" icon={PlusCircle}>
              Apply Leave
            </Button>
          </Link>
          <Link to="/employee/comp-off">
            <Button variant="outline" size="md" icon={Award} style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Request Comp-Off
            </Button>
          </Link>
        </div>
      </div>

      {/* Leave Balances Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Applicable Leave Balances
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Configured dynamically according to <strong>{employee.locationName}</strong> corporate policies
            </p>
          </div>
          <Link to="/employee/leave-balance" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Formula Breakdown <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {leaveBalances.map((bal) => (
            <LeaveBalanceCard key={bal.id} balance={bal} />
          ))}
        </div>
      </div>

      {/* Power BI-Style Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        <LeaveBalanceDonut balances={leaveBalances} />
        <LeaveUsageBarChart recentLeaves={recentLeaveHistory} />
        <MiniLeaveCalendar holidays={upcomingHolidays} leaves={recentLeaveHistory} />
      </div>

      {/* Two Column Grid: Pending Approvals & Upcoming Holidays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Pending Leaves Tracker */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--primary-orange)" />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Pending Approvals ({pendingLeaves.length})
              </h3>
            </div>
            <Link to="/employee/leave-history" style={{ fontSize: '12px', color: 'var(--info-blue)', fontWeight: 600 }}>
              All Requests
            </Link>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                No Pending Leave Requests
              </div>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                All your submitted leave applications have been fully processed.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingLeaves.map((pl) => (
                <div
                  key={pl.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: '#fffbeb',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {pl.leaveTypeName}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {pl.duration} Day(s)
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Dates: <strong>{pl.startDate}</strong> to <strong>{pl.endDate}</strong>
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--primary-orange)', fontWeight: 600, marginTop: '2px' }}>
                    Awaiting: {pl.currentApprover ? `${pl.currentApprover.name} (${pl.currentApprover.role})` : 'Approval Chain'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location-Specific Upcoming Holidays */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--info-blue)" />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Upcoming Statutory Holidays
              </h3>
            </div>
            <Link to="/employee/holidays" style={{ fontSize: '12px', color: 'var(--info-blue)', fontWeight: 600 }}>
              Full Calendar
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingHolidays.map((hol) => (
              <div
                key={hol.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {hol.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {hol.day} • {hol.type} Holiday
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--info-blue)',
                    backgroundColor: '#e0f2fe',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {hol.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Summary Strip: Comp-Off & Attendance Regularization */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Compensatory Off Available
            </span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-orange)', marginTop: '4px' }}>
              {compOff.available} Day(s)
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {compOff.pending} day(s) pending verification
            </div>
          </div>
          <Link to="/employee/comp-off">
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </Link>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Attendance Regularization
            </span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--nav-dark)', marginTop: '4px' }}>
              {attendance.pendingRegularizations} Pending
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Punch correction & biometric requests
            </div>
          </div>
          <Link to="/employee/attendance-regularization">
            <Button variant="outline" size="sm">
              Regularize
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
