import React, { useState, useEffect } from 'react';
import { History, Search, CheckCircle2, XCircle } from 'lucide-react';
import { approvalService } from '../../services/approvalService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';

export const TeamLeadApprovalHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await approvalService.fetchApprovalHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch approval history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Request ID',
      accessor: 'id',
      cell: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--info-blue)' }}>
          {row.id}
        </span>
      )
    },
    {
      header: 'Employee',
      accessor: 'employee',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.employee?.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.employee?.department}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'leaveTypeName',
      cell: (row) => <span>{row.leaveTypeName}</span>
    },
    {
      header: 'Period & Duration',
      cell: (row) => (
        <div style={{ fontSize: '12px' }}>
          <div>{row.startDate} to {row.endDate}</div>
          <strong style={{ color: 'var(--primary-orange)' }}>{row.duration} Day(s)</strong>
        </div>
      )
    },
    {
      header: 'My Decision',
      accessor: 'action',
      cell: (row) => {
        const status = row.myActionStatus || row.action;
        return (
          <StatusBadge
            status={status}
            variant={status === 'APPROVED' ? 'success' : 'danger'}
          />
        );
      }
    },
    {
      header: 'Remarks / Reason',
      accessor: 'remarks',
      cell: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {row.myRemarks || row.remarks || '—'}
        </span>
      )
    },
    {
      header: 'Decision Date',
      accessor: 'actionDate',
      cell: (row) => (
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
          {row.actionDate ? new Date(row.actionDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Approval Decisions History"
        subtitle="Audited record of all team leave applications approved or rejected by you"
        breadcrumbs={[
          { label: 'Lead Dashboard', path: '/team-lead' },
          { label: 'Approval History' }
        ]}
      />

      <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by Employee, ID, or Category..."
        />
      </div>

      {isLoading ? (
        <LoadingSpinner text="Fetching approval history..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadHistory} />
      ) : (
        <Table columns={columns} data={filteredHistory} emptyMessage="No historical approval actions found." />
      )}
    </div>
  );
};
