import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  PlusCircle,
  Clock,
  Eye,
  Undo2,
  XCircle,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { leaveService } from '../../services/leaveService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Table } from '../../components/common/Table.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { ApprovalTracker } from '../../components/employee/ApprovalTracker.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';

export const LeaveHistoryPage = () => {
  const { role } = useAuth();
  const { showSuccess, showError } = useToast();

  const getBasePath = () => {
    if (role === ROLES.TEAM_LEAD) return '/team-lead';
    if (role === ROLES.MANAGER) return '/manager';
    return '/employee';
  };
  const basePath = getBasePath();

  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const loadLeaves = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await leaveService.fetchMyLeaves();
      setLeaves(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch leave history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // Handle Withdraw
  const handleWithdrawConfirm = async () => {
    if (!withdrawTarget) return;

    try {
      setIsWithdrawing(true);
      await leaveService.withdrawLeave(withdrawTarget.id);
      showSuccess(`Leave request #${withdrawTarget.id} has been withdrawn.`);
      setWithdrawTarget(null);
      loadLeaves();
    } catch (err) {
      showError(err.message || 'Failed to withdraw leave request.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Handle Cancel Approved Leave
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;

    try {
      setIsCancelling(true);
      await leaveService.cancelLeave(cancelTarget.id, cancelReason);
      showSuccess(`Leave #${cancelTarget.id} cancellation submitted.`);
      setCancelTarget(null);
      setCancelReason('');
      loadLeaves();
    } catch (err) {
      showError(err.message || 'Failed to cancel leave.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Filtered Roster
  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || leave.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'danger';
      case 'WITHDRAWN': return 'neutral';
      case 'CANCELLED': return 'neutral';
      default: return 'neutral';
    }
  };

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
      header: 'Leave Category',
      accessor: 'leaveTypeName',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.leaveTypeName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.reason ? (row.reason.length > 35 ? `${row.reason.substring(0, 35)}...` : row.reason) : 'No remarks'}</div>
        </div>
      )
    },
    {
      header: 'Leave Period',
      accessor: 'startDate',
      cell: (row) => (
        <div style={{ fontSize: '12.5px' }}>
          <div>{row.startDate} <span style={{ color: 'var(--text-tertiary)' }}>to</span> {row.endDate}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {row.isHourly ? `${row.hours} Hours` : `${row.startSession !== 'FULL_DAY' ? 'Half Day • ' : ''}${row.duration} Day(s)`}
          </div>
        </div>
      )
    },
    {
      header: 'Duration',
      accessor: 'duration',
      cell: (row) => (
        <span style={{ fontWeight: 800, color: 'var(--primary-orange)', fontSize: '13.5px' }}>
          {row.duration} {row.isHourly ? 'h eq.' : 'd'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <StatusBadge status={row.status} variant={getStatusVariant(row.status)} />
      )
    },
    {
      header: 'Current Approver',
      accessor: 'currentApprover',
      cell: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {row.status === 'PENDING' && row.currentApprover ? (
            <strong style={{ color: 'var(--primary-orange)' }}>
              {row.currentApprover.name} ({row.currentApprover.role})
            </strong>
          ) : row.status === 'APPROVED' ? (
            <span style={{ color: '#059669', fontWeight: 600 }}>Completed</span>
          ) : (
            '—'
          )}
        </span>
      )
    },
    {
      header: 'Applied Date',
      accessor: 'appliedDate',
      cell: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {new Date(row.appliedDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => {
              setSelectedLeave(row);
              setIsTimelineModalOpen(true);
            }}
            title="View Approval Progress"
          >
            Track
          </Button>

          {row.status === 'PENDING' && (
            <Button
              variant="ghost"
              size="sm"
              icon={Undo2}
              onClick={() => setWithdrawTarget(row)}
              style={{ color: '#dc2626' }}
              title="Withdraw Application"
            >
              Withdraw
            </Button>
          )}

          {row.status === 'APPROVED' && new Date(row.startDate) >= new Date('2026-08-18') && (
            <Button
              variant="ghost"
              size="sm"
              icon={XCircle}
              onClick={() => setCancelTarget(row)}
              style={{ color: 'var(--text-secondary)' }}
              title="Cancel Approved Leave"
            >
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Leave History & Approval Status"
        subtitle="Track personal leave requests, pending multi-tier approvals, and withdrawals"
        breadcrumbs={[
          { label: 'Dashboard', path: basePath },
          { label: 'Leave History' }
        ]}
        actions={
          <Link to={`${basePath}/apply-leave`}>
            <Button variant="primary" icon={PlusCircle}>
              Apply Leave
            </Button>
          </Link>
        }
      />

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)'
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', maxWidth: '400px' }}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Request ID, Category, or Reason..."
          />
        </div>

        <div style={{ width: '200px' }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending Approvals' },
              { value: 'APPROVED', label: 'Approved Leaves' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'WITHDRAWN', label: 'Withdrawn' },
              { value: 'CANCELLED', label: 'Cancelled' }
            ]}
          />
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <LoadingSpinner text="Fetching leave applications..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadLeaves} />
      ) : (
        <Table
          columns={columns}
          data={filteredLeaves}
          emptyMessage="No leave applications match your selected filters."
        />
      )}

      {/* Approval Timeline Modal */}
      {selectedLeave && (
        <Modal
          isOpen={isTimelineModalOpen}
          onClose={() => {
            setIsTimelineModalOpen(false);
            setSelectedLeave(null);
          }}
          title={`Approval Progress: #${selectedLeave.id}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Leave Type: </span>
                <strong>{selectedLeave.leaveTypeName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Total Duration: </span>
                <strong style={{ color: 'var(--primary-orange)' }}>{selectedLeave.duration} Day(s)</strong>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Reason: <em>"{selectedLeave.reason || 'Personal leave'}"</em>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Multi-Level Approval Timeline
              </h4>
              <ApprovalTracker
                approvalChain={selectedLeave.approvalChain}
                status={selectedLeave.status}
                appliedDate={selectedLeave.appliedDate}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Withdraw Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdrawConfirm}
        title="Withdraw Leave Request"
        message={`Are you sure you want to withdraw leave application #${withdrawTarget?.id}? This action will cancel the approval process and restore your reserved leave balance.`}
        confirmText="Confirm Withdrawal"
        variant="danger"
        isLoading={isWithdrawing}
      />

      {/* Cancel Approved Leave Modal */}
      {cancelTarget && (
        <Modal
          isOpen={Boolean(cancelTarget)}
          onClose={() => setCancelTarget(null)}
          title={`Cancel Approved Leave #${cancelTarget.id}`}
          size="md"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" onClick={() => setCancelTarget(null)}>
                Keep Leave
              </Button>
              <Button variant="danger" loading={isCancelling} onClick={handleCancelConfirm}>
                Submit Cancellation
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              You are requesting to cancel approved leave from <strong>{cancelTarget.startDate}</strong> to <strong>{cancelTarget.endDate}</strong> ({cancelTarget.duration} days).
            </p>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Reason for Cancellation
              </label>
              <textarea
                rows="3"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Explain why you wish to cancel this approved leave..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
