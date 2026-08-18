import React, { useState, useEffect } from 'react';
import {
  Award,
  PlusCircle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { compOffService } from '../../services/compOffService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { FormField } from '../../components/common/FormField.jsx';
import { Select } from '../../components/common/Select.jsx';
import { DateInput } from '../../components/common/DateInput.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Table } from '../../components/common/Table.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';

export const CompOffPage = () => {
  const { role } = useAuth();
  const { showSuccess, showError } = useToast();

  const getBasePath = () => {
    if (role === ROLES.TEAM_LEAD) return '/team-lead';
    if (role === ROLES.MANAGER) return '/manager';
    return '/employee';
  };
  const basePath = getBasePath();

  const [data, setData] = useState({ history: [], summary: { available: 0, pending: 0, used: 0, expired: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    workedDate: '',
    hoursWorked: '8',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await compOffService.fetchCompOffData();
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to fetch comp-off data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.workedDate) errs.workedDate = 'Worked date is required';
    if (!formData.hoursWorked || Number(formData.hoursWorked) <= 0) errs.hoursWorked = 'Valid hours worked is required';
    if (!formData.reason.trim()) errs.reason = 'Business reason for overtime / weekend work is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await compOffService.requestCompOff(formData);
      showSuccess('Comp-off credit request submitted for manager approval.');
      setFormData({ workedDate: '', hoursWorked: '8', reason: '' });
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to submit comp-off request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Claim ID',
      accessor: 'id',
      cell: (row) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--info-blue)' }}>{row.id}</span>
    },
    {
      header: 'Weekend/Holiday Date',
      accessor: 'workedDate',
      cell: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.workedDate}</strong>
    },
    {
      header: 'Hours Worked',
      accessor: 'hoursWorked',
      cell: (row) => <span>{row.hoursWorked} Hours</span>
    },
    {
      header: 'Comp-Off Earned',
      accessor: 'compOffEarned',
      cell: (row) => (
        <span style={{ fontWeight: 800, color: 'var(--primary-orange)' }}>
          {row.compOffEarned} Day(s)
        </span>
      )
    },
    {
      header: 'Reason',
      accessor: 'reason',
      cell: (row) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.reason}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <StatusBadge
          status={row.status}
          variant={row.status === 'APPROVED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'danger'}
        />
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Compensatory Off (Comp-Off)"
        subtitle="Claim compensatory rest for authorized weekend shifts and emergency holiday support"
        breadcrumbs={[
          { label: 'Dashboard', path: basePath },
          { label: 'Comp-Off' }
        ]}
      />

      {/* Summary Stat Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Available Comp-Off</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-orange)', marginTop: '4px' }}>
            {data.summary.available} Day(s)
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Manager Review</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--status-warning-text)', marginTop: '4px' }}>
            {data.summary.pending} Day(s)
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Used This Year</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {data.summary.used} Day(s)
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'flex-start' }}>
        {/* Request Form */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Request Comp-Off Credit
          </h3>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="Worked Date (Weekend / Holiday)" required error={formErrors.workedDate}>
                <DateInput
                  name="workedDate"
                  value={formData.workedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, workedDate: e.target.value }))}
                />
              </FormField>

              <FormField label="Hours Logged" required error={formErrors.hoursWorked}>
                <Select
                  name="hoursWorked"
                  value={formData.hoursWorked}
                  onChange={(e) => setFormData(prev => ({ ...prev, hoursWorked: e.target.value }))}
                  options={[
                    { value: '4', label: '4 Hours (0.5 Day Comp-Off)' },
                    { value: '8', label: '8 Hours (1.0 Full Day Comp-Off)' },
                    { value: '12', label: '12 Hours (1.5 Days Comp-Off)' }
                  ]}
                />
              </FormField>
            </div>

            <FormField label="Business Justification & Project Task" required error={formErrors.reason}>
              <textarea
                rows="3"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Mention the client release, incident ticket, or deployment reason..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13px'
                }}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <Button variant="primary" type="submit" loading={isSubmitting} icon={CheckCircle2}>
                Submit Comp-Off Claim
              </Button>
            </div>
          </form>
        </div>

        {/* Policy Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            fontSize: '12.5px',
            color: 'var(--text-secondary)'
          }}
        >
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Comp-Off Policy Rules
          </h4>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Comp-Off must be claimed within <strong>15 days</strong> of the weekend worked date.</li>
            <li>Credited Comp-Off expires within <strong>90 days</strong> from the earned date.</li>
            <li>Conversion: Minimum 4 hours = 0.5 Day; 8 hours = 1.0 Day.</li>
          </ul>
        </div>
      </div>

      {/* History Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Comp-Off Claim History
        </h3>

        {isLoading ? (
          <LoadingSpinner text="Fetching comp-off claims..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadData} />
        ) : (
          <Table columns={columns} data={data.history} emptyMessage="No comp-off claim records found." />
        )}
      </div>
    </div>
  );
};
