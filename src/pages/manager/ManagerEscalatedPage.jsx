import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { approvalService } from '../../services/approvalService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Table } from '../../components/common/Table.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { SLAIndicator } from '../../components/approval/SLAIndicator.jsx';
import { ApprovalDetailModal } from '../../components/approval/ApprovalDetailModal.jsx';
import { ApprovalActionModal } from '../../components/approval/ApprovalActionModal.jsx';

export const ManagerEscalatedPage = () => {
  const { showSuccess, showError } = useToast();

  const [escalations, setEscalations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [detailModalId, setDetailModalId] = useState(null);
  const [actionModalData, setActionModalData] = useState({ isOpen: false, request: null, actionType: 'APPROVE' });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadEscalations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await approvalService.fetchEscalatedRequests();
      setEscalations(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch escalated requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEscalations();
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
        showSuccess(`Escalated leave #${id} approved.`);
      } else if (actionType === 'REJECT') {
        await approvalService.rejectRequest(id, text);
        showSuccess(`Escalated leave #${id} rejected.`);
      } else if (actionType === 'CLARIFICATION') {
        await approvalService.requestClarification(id, text);
        showSuccess(`Clarification requested for #${id}.`);
      }
      setActionModalData({ isOpen: false, request: null, actionType: 'APPROVE' });
      loadEscalations();
    } catch (err) {
      showError(err.message || 'Failed to action escalated request.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const filteredEscalations = escalations.filter((item) =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Request ID',
      accessor: 'id',
      cell: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#dc2626' }}>
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
      header: 'Category & Duration',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.leaveTypeName}</div>
          <div style={{ fontSize: '11px', color: 'var(--primary-orange)', fontWeight: 700 }}>{row.duration} Days ({row.startDate} to {row.endDate})</div>
        </div>
      )
    },
    {
      header: 'Escalation Reason',
      cell: (row) => (
        <div style={{ fontSize: '12px', color: '#b91c1c' }}>
          <strong>SLA Exceeded (&gt; 48 Hours)</strong>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Prior tier did not action in time</div>
        </div>
      )
    },
    {
      header: 'SLA Status',
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
          >
            Inspect
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenActionModal(row, 'APPROVE')}
          >
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ color: '#dc2626' }}
            onClick={() => handleOpenActionModal(row, 'REJECT')}
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Escalated Leave Applications"
        subtitle="Priority queue for leave requests that automatically escalated to you due to SLA expiry"
        breadcrumbs={[
          { label: 'Manager Dashboard', path: '/manager' },
          { label: 'Escalated Requests' }
        ]}
      />

      <div style={{ maxWidth: '400px' }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search escalated requests..."
        />
      </div>

      {isLoading ? (
        <LoadingSpinner text="Fetching escalated requests..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadEscalations} />
      ) : (
        <Table
          columns={columns}
          data={filteredEscalations}
          emptyMessage="No escalated requests in your department queue."
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
