import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Building2,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { approvalService } from '../../services/approvalService.js';
import { teamService } from '../../services/teamService.js';
import { leaveBalanceService } from '../../services/leaveBalanceService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { SLAIndicator } from '../../components/approval/SLAIndicator.jsx';
import { TeamAvailabilityCard } from '../../components/team/TeamAvailabilityCard.jsx';
import { LeaveBalanceCard } from '../../components/employee/LeaveBalanceCard.jsx';
import { ApprovalDetailModal } from '../../components/approval/ApprovalDetailModal.jsx';
import { ApprovalActionModal } from '../../components/approval/ApprovalActionModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const ManagerDashboardPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [myBalances, setMyBalances] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [teamOverview, setTeamOverview] = useState(null);
  const [teamAvailability, setTeamAvailability] = useState(null);

  // Modals
  const [detailModalId, setDetailModalId] = useState(null);
  const [actionModalData, setActionModalData] = useState({ isOpen: false, request: null, actionType: 'APPROVE' });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [balances, myApprovals, overview, availability] = await Promise.all([
        leaveBalanceService.fetchMyBalances(),
        approvalService.fetchMyApprovals(),
        teamService.fetchTeamOverview(),
        teamService.fetchTeamAvailability()
      ]);
      setMyBalances(balances);
      setApprovals(myApprovals);
      setTeamOverview(overview);
      setTeamAvailability(availability);
    } catch (err) {
      setError(err.message || 'Unable to load Manager dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to process approval action.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading Executive Manager dashboard & department overview..." fullPage />;
  }

  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  const escalatedList = approvals.filter(a => a.sla?.isEscalated);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
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
              Manager Executive Portal
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {user?.id}</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            {user?.name} — {user?.designation || 'Director'} 👋
          </h1>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '13px', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={15} color="var(--primary-orange)" />
              <span>Department: <strong>{user?.department || 'Engineering'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} color="#38bdf8" />
              <span>Department Headcount: <strong>{teamOverview?.totalMembers || 0} Engineers</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/manager/approvals">
            <Button variant="primary" size="md" icon={CheckSquare}>
              Approvals Queue ({approvals.length})
            </Button>
          </Link>
          <Link to="/manager/apply-leave">
            <Button variant="outline" size="md" icon={PlusCircle} style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Apply My Leave
            </Button>
          </Link>
        </div>
      </div>

      {/* Escalated Alert Banner (if any) */}
      {escalatedList.length > 0 && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#fef2f2',
            border: '1.5px solid #fca5a5',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>
                {escalatedList.length} Request(s) Escalated Exceeding 48h SLA
              </div>
              <p style={{ fontSize: '12.5px', color: '#b91c1c', margin: '2px 0 0' }}>
                Action required: Prior approvers did not take action within the designated timeline.
              </p>
            </div>
          </div>

          <Link to="/manager/escalated">
            <Button variant="danger" size="sm">
              Review Escalations ({escalatedList.length})
            </Button>
          </Link>
        </div>
      )}

      {/* Department KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Department</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {teamOverview?.totalMembers || 0}
          </div>
          <div style={{ fontSize: '11.5px', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
            {teamOverview?.workingToday || 0} working today
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>On Leave Today</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-orange)', marginTop: '4px' }}>
            {teamOverview?.onLeaveToday || 0}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Active approved absences
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Approvals</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: approvals.length > 0 ? 'var(--primary-orange)' : 'var(--text-primary)', marginTop: '4px' }}>
            {approvals.length}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Awaiting executive sign-off
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Approved This Month</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {teamOverview?.approvedThisMonth || 0}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            August 2026 throughput
          </div>
        </div>
      </div>

      {/* Two Column Section: Manager Approvals & Team Availability */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'flex-start' }}>
        {/* Approvals Queue Table */}
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
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Department Approval Queue
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Multi-tier leave applications and SLA escalations requiring your decision
              </p>
            </div>
            <Link to="/manager/approvals" style={{ fontSize: '12.5px', color: 'var(--primary-orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Full Queue ({approvals.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {approvals.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                All Approvals Completed
              </div>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                There are no leave requests awaiting manager sign-off.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {approvals.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                        {item.employee?.name || item.employeeName}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--info-blue)', fontWeight: 700 }}>
                        #{item.id}
                      </span>
                      <SLAIndicator sla={item.sla} />
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {item.leaveTypeName} • <strong>{item.duration} Day(s)</strong> ({item.startDate} to {item.endDate})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setDetailModalId(item.id)}
                    >
                      Inspect
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenActionModal(item, 'APPROVE')}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Availability Card */}
        <div>
          <TeamAvailabilityCard availability={teamAvailability} />
        </div>
      </div>

      {/* Personal Leave Balances (Shared Inheritance) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              My Personal Leave Balances
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Your personal entitlement and accrual metrics
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {myBalances.map((bal) => (
            <LeaveBalanceCard key={bal.id} balance={bal} />
          ))}
        </div>
      </div>

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
