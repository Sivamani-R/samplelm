import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Award,
  Calendar,
  Clock,
  PlusCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { compOffService } from '../../services/compOffService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Table } from '../../components/common/Table.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';

export const WeekendAllowancePage = () => {
  const { role } = useAuth();
  const getBasePath = () => {
    if (role === ROLES.TEAM_LEAD) return '/team-lead';
    if (role === ROLES.MANAGER) return '/manager';
    return '/employee';
  };
  const basePath = getBasePath();

  const [data, setData] = useState({ history: [], summary: { available: 0, pending: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await compOffService.fetchCompOffData();
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to fetch weekend work logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      header: 'Worked Date',
      accessor: 'workedDate',
      cell: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.workedDate}</strong>
    },
    {
      header: 'Applied Date',
      accessor: 'appliedDate',
      cell: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.appliedDate}</span>
    },
    {
      header: 'Hours Worked',
      accessor: 'hoursWorked',
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.hoursWorked} Hours</span>
    },
    {
      header: 'Comp Off Earned',
      accessor: 'compOffEarned',
      cell: (row) => (
        <span style={{ fontWeight: 800, color: 'var(--primary-orange)' }}>
          {row.compOffEarned} Day(s)
        </span>
      )
    },
    {
      header: 'Request Status',
      accessor: 'status',
      cell: (row) => (
        <StatusBadge
          status={row.status}
          variant={row.status === 'APPROVED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'danger'}
        />
      )
    },
    {
      header: 'Expiry Date',
      accessor: 'expiryDate',
      cell: (row) => (
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
          {row.expiryDate || '—'}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Weekend Shift & Special Allowance"
        subtitle="Claim and review authorized compensation for working over scheduled weekends"
        breadcrumbs={[
          { label: 'Dashboard', path: basePath },
          { label: 'Weekend Allowance' }
        ]}
        actions={
          <Link to="/employee/comp-off">
            <Button variant="primary" icon={PlusCircle}>
              Log Weekend Work
            </Button>
          </Link>
        }
      />

      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        {isLoading ? (
          <LoadingSpinner text="Fetching weekend work log..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadData} />
        ) : (
          <Table columns={columns} data={data.history} emptyMessage="No weekend work records found." />
        )}
      </div>
    </div>
  );
};
