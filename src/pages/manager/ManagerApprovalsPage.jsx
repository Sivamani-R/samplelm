import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { approvalService } from '../../services/approvalService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Table } from '../../components/common/Table.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { Select } from '../../components/common/Select.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { SLAIndicator } from '../../components/approval/SLAIndicator.jsx';
import { ApprovalDetailModal } from '../../components/approval/ApprovalDetailModal.jsx';
import { ApprovalActionModal } from '../../components/approval/ApprovalActionModal.jsx';

export const ManagerApprovalsPage = () => {
  const { showSuccess, showError } = useToast();

  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [slaFilter, setSlaFilter] = useState('ALL');

  // Modals
  const [detailModalId, setDetailModalId] = useState(null);
  const [actionModalData, setActionModalData] = useState({ isOpen: false, request: null, actionType: 'APPROVE' });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadApprovals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await approvalService.fetchMyApprovals();
      setApprovals(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch manager approvals queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleOpenActionModal = (request, actionType) => {
    setDetailModalId(null);
    setActionModalData({ isOpen: true, request, actionType });
  };

  const handleConfirmAction = async (id, actionType, text) => {
    try {
      setIsProcessingAction(true);
      if (actionType === 'APPROVE') {
        await approvalService.approveRequest(id, text);
        showSuccess(`Leave application #${id} approved successfully.`);
      } else if (actionType === 'REJECT') {
        await approvalService.rejectRequest(id, text);
        showSuccess(`Leave application #${id} has been rejected.`);
      } else if (actionType === 'CLARIFICATION') {
        await approvalService.requestClarification(id, text);
        showSuccess(`Clarification requested for #${id}.`);
      }
      setActionModalData({ isOpen: false, request: null, actionType: 'APPROVE' });
      loadApprovals();
    } catch (err) {
      showError(err.message || 'Failed to process approval action.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const filteredApprovals = approvals.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSla =
      slaFilter === 'ALL' ||
      (slaFilter === 'OVERDUE' && item.sla?.isEscalated) ||
      (slaFilter === 'WITHIN_SLA' && !item.sla?.isEscalated);

    return matchesSearch && matchesSla;
  });

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
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.employee?.name || row.employeeName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.employee?.id} • {row.employee?.department}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'leaveTypeName',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.leaveTypeName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.reason || 'No remarks'}</div>
        </div>
      )
    },
    {
      header: 'Period & Duration',
      accessor: 'duration',
      cell: (row) => (
        <div style={{ fontSize: '12px' }}>
          <div>{row.startDate} to {row.endDate}</div>
          <strong style={{ color: 'var(--primary-orange)', fontSize: '13px' }}>{row.duration} Days</strong>
        </div>
      )
    },
    {
      header: 'SLA Tracking',
      accessor: 'sla',
      cell: (row) => <SLAIndicator sla={row.sla} />
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setDetailModalId(row.id)}
            title="Inspect Request & Policy"
          >
            Review
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenActionModal(row, 'APPROVE')}
            title="Approve Leave"
          >
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ color: '#dc2626' }}
            onClick={() => handleOpenActionModal(row, 'REJECT')}
            title="Reject Leave"
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Manager Approval Queue"
        subtitle="Review standard, multi-tier, and escalated leave applications across your department"
        breadcrumbs={[
          { label: 'Manager Dashboard', path: '/manager' },
          { label: 'Approvals' }
        ]}
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
            placeholder="Search by Employee, ID, or Category..."
          />
        </div>

        <div style={{ width: '200px' }}>
          <Select
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Requests' },
              { value: 'OVERDUE', label: 'Overdue Escalations' },
              { value: 'WITHIN_SLA', label: 'Within 48h SLA' }
            ]}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner text="Fetching manager approvals queue..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadApprovals} />
      ) : (
        <Table
          columns={columns}
          data={filteredApprovals}
          emptyMessage="No pending leave applications require manager approval at this time."
        />
      )}

      {/* Modals */}
      <ApprovalDetailModal
        isOpen={Boolean(detailModalId)}
        onClose={() => setDetailModalId(null)}
        requestId={detailModalId}
        onOpenActionModal={handleOpenActionModal}
      />

      <ApprovalActionModal
        isOpen={actionModalData.isOpen}
        onClose={() => setActionModalData({ isOpen: false, request: null, actionType: 'APPROVE' })}
        actionType={actionModalData.actionType}
        request={actionModalData.request}
        onConfirm={handleConfirmAction}
        isLoading={isProcessingAction}
      />
    </div>
  );
};
