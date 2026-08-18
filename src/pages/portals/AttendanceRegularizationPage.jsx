import React, { useState, useEffect } from 'react';
import {
  Clock,
  UserCheck,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileText
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService.js';
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

export const AttendanceRegularizationPage = () => {
  const { role } = useAuth();
  const { showSuccess, showError } = useToast();

  const getBasePath = () => {
    if (role === ROLES.TEAM_LEAD) return '/team-lead';
    if (role === ROLES.MANAGER) return '/manager';
    return '/employee';
  };
  const basePath = getBasePath();

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    date: '2026-08-17',
    issueType: 'MISSING_PUNCH',
    checkIn: '09:00',
    checkOut: '18:00',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await attendanceService.fetchAttendanceData();
      setRecords(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch attendance regularization records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.date) errs.date = 'Date is required';
    if (!formData.checkIn) errs.checkIn = 'Check-in time is required';
    if (!formData.checkOut) errs.checkOut = 'Check-out time is required';
    if (!formData.reason.trim()) errs.reason = 'Reason for regularization is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await attendanceService.submitRegularization(formData);
      showSuccess('Attendance regularization request submitted for manager review.');
      setFormData({
        date: '',
        issueType: 'MISSING_PUNCH',
        checkIn: '09:00',
        checkOut: '18:00',
        reason: ''
      });
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to submit regularization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const issueOptions = [
    { value: 'MISSING_PUNCH', label: 'Missing Punch (In/Out)' },
    { value: 'BIOMETRIC_FAILURE', label: 'Biometric Machine Offline / Not Recognized' },
    { value: 'WORK_FROM_HOME', label: 'Work From Home (Approved Remote)' },
    { value: 'ON_DUTY_TRAVEL', label: 'On Duty / Official Client Visit' }
  ];

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      cell: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.date}</strong>
    },
    {
      header: 'Issue Type',
      accessor: 'issueType',
      cell: (row) => (
        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--info-blue)' }}>
          {row.issueType.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      header: 'Timestamps',
      cell: (row) => (
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          In: {row.checkIn} • Out: {row.checkOut}
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
        title="Attendance Regularization & Missed Punches"
        subtitle="Submit discrepancy correction requests for biometric attendance and swipe anomalies"
        breadcrumbs={[
          { label: 'Dashboard', path: basePath },
          { label: 'Attendance Regularization' }
        ]}
      />

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
            New Regularization Request
          </h3>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="Incident Date" required error={formErrors.date}>
                <DateInput
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </FormField>

              <FormField label="Exception Reason Type" required>
                <Select
                  name="issueType"
                  value={formData.issueType}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueType: e.target.value }))}
                  options={issueOptions}
                />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="Actual Check-In" required error={formErrors.checkIn}>
                <Input
                  type="time"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                />
              </FormField>

              <FormField label="Actual Check-Out" required error={formErrors.checkOut}>
                <Input
                  type="time"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                />
              </FormField>
            </div>

            <FormField label="Detailed Justification" required error={formErrors.reason}>
              <textarea
                rows="3"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain the reason for missing punch or attendance irregularity..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13px'
                }}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <Button variant="primary" type="submit" loading={isSubmitting} icon={CheckCircle2}>
                Submit Regularization
              </Button>
            </div>
          </form>
        </div>

        {/* Regularization Guidelines Box */}
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
            HR Attendance Policy Guidelines
          </h4>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Regularization must be raised within <strong>48 hours</strong> of the attendance discrepancy.</li>
            <li>Maximum <strong>3 regularizations</strong> permitted per calendar month without HR escalation.</li>
            <li>All approved requests will automatically update your monthly payroll work hours.</li>
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
          Recent Regularization Submissions
        </h3>

        {isLoading ? (
          <LoadingSpinner text="Fetching attendance records..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadData} />
        ) : (
          <Table columns={columns} data={records} emptyMessage="No attendance regularization requests found." />
        )}
      </div>
    </div>
  );
};
