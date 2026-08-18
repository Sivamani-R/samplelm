import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  PlusCircle,
  FileText,
  Info,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { leaveBalanceService } from '../../services/leaveBalanceService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { PolicyPdfModal } from '../../components/employee/PolicyPdfModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';

export const LeaveBalanceDetailPage = () => {
  const { role } = useAuth();
  const getBasePath = () => {
    if (role === ROLES.TEAM_LEAD) return '/team-lead';
    if (role === ROLES.MANAGER) return '/manager';
    return '/employee';
  };
  const basePath = getBasePath();

  const [balances, setBalances] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPolicyForPdf, setSelectedPolicyForPdf] = useState(null);

  const loadBalances = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await leaveBalanceService.fetchMyBalances();
      setBalances(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch leave balances.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Calculating formula balances from backend..." fullPage />;
  }

  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <ErrorMessage message={error} onRetry={loadBalances} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Leave Balance & Formula Breakdown"
        subtitle="Transparent entitlement calculations, monthly accruals, utilization, and carry-forward metrics"
        breadcrumbs={[
          { label: 'Dashboard', path: basePath },
          { label: 'Leave Balances' }
        ]}
        actions={
          <Link to={`${basePath}/apply-leave`}>
            <Button variant="primary" icon={PlusCircle}>
              Apply Leave
            </Button>
          </Link>
        }
      />

      {/* Formula Explanation Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#eff6ff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <Info size={24} color="#2563eb" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
          <strong>Corporate Balance Calculation Formula:</strong>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '4px', color: '#1e40af' }}>
            Closing Available Balance = Opening Balance + YTD Accrued − Approved Used − Pending Reserved − Encashed
          </div>
        </div>
      </div>

      {/* Detailed Balance Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {balances.map((bal, idx) => (
          <div
            key={bal.id || bal.categoryId || `balance-card-${idx}`}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-orange)' }}>
                    {bal.categoryCode}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {bal.categoryName}
                  </h3>
                  <StatusBadge status={bal.paid ? 'PAID LEAVE' : 'UNPAID'} variant={bal.paid ? 'success' : 'danger'} />
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  {bal.description || 'Statutory employee leave entitlement configured by HR.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileText}
                  onClick={() => setSelectedPolicyForPdf(bal)}
                >
                  View Policy PDF
                </Button>
                <Link to={`/employee/apply-leave?type=${bal.categoryId}`}>
                  <Button variant="primary" size="sm" icon={PlusCircle}>
                    Apply
                  </Button>
                </Link>
              </div>
            </div>

            {/* Formula Step-by-Step Visualization */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                padding: '16px',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                alignItems: 'center'
              }}
            >
              {/* Opening */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Opening Balance</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {bal.openingBalance}d
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--text-tertiary)' }}>+</div>

              {/* Accrued */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--info-blue)', fontWeight: 600 }}>YTD Accrued</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--info-blue)', marginTop: '2px' }}>
                  +{bal.accrued}d
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--text-tertiary)' }}>−</div>

              {/* Used */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Approved Used</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {bal.used}d
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--text-tertiary)' }}>−</div>

              {/* Pending */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--status-warning-text)', fontWeight: 600 }}>Pending Reserved</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--status-warning-text)', marginTop: '2px' }}>
                  {bal.pending}d
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--text-tertiary)' }}>=</div>

              {/* Closing Available */}
              <div
                style={{
                  textAlign: 'center',
                  backgroundColor: 'var(--primary-orange-subtle)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--primary-orange-border)'
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--primary-orange-hover)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Available Balance
                </span>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary-orange)', marginTop: '2px' }}>
                  {bal.closingBalance} Days
                </div>
              </div>
            </div>

            {/* Policy Parameters Footer */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '14px'
              }}
            >
              <div>
                Statutory Annual Entitlement: <strong>{bal.annualEntitlement} Days</strong>
              </div>
              <div>
                Monthly Accrual Rate: <strong>{bal.monthlyAccrual} Days/mo</strong>
              </div>
              <div>
                Accumulation Cap: <strong>{bal.maxBalance} Days</strong>
              </div>
              <div>
                Carry Forward Cap: <strong>{bal.carryForwardAllowed ? `${bal.carryForwardLimit} Days` : 'No'}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy PDF Modal */}
      {selectedPolicyForPdf && (
        <PolicyPdfModal
          isOpen={Boolean(selectedPolicyForPdf)}
          onClose={() => setSelectedPolicyForPdf(null)}
          policy={selectedPolicyForPdf}
          employee={user}
        />
      )}
    </div>
  );
};
