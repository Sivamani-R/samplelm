import React, { useState, useEffect } from 'react';
import { GitFork, Plus, Edit, ArrowRight, UserCheck, Shield, Clock } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { FormField } from '../../components/common/FormField.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateWorkflowForm } from '../../validation/workflowValidation.js';
import { workflowService } from '../../services/workflowService.js';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';

export const ApprovalWorkflowsPage = () => {
  const toast = useToast();

  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    minDays: 1,
    maxDays: 2,
    approvers: [ROLES.TEAM_LEAD, ROLES.MANAGER],
    description: '',
    active: true
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const loadWorkflows = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workflowService.fetchWorkflows();
      setWorkflows(data);
    } catch (err) {
      setError(err.message || 'Failed to load approval workflows');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      minDays: 0,
      maxDays: 1,
      approvers: [ROLES.TEAM_LEAD],
      description: '',
      active: true
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (wf) => {
    setEditingId(wf.id);
    setFormData({
      name: wf.name,
      minDays: wf.minDays,
      maxDays: wf.maxDays,
      approvers: wf.approvers || [],
      description: wf.description || '',
      active: wf.active
    });
    setErrors({});
    setModalOpen(true);
  };

  const toggleApproverRole = (role) => {
    const current = formData.approvers || [];
    let updated;
    if (current.includes(role)) {
      updated = current.filter((r) => r !== role);
    } else {
      updated = [...current, role];
    }
    setFormData({ ...formData, approvers: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validation = validateWorkflowForm(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast.error('Please resolve errors in the workflow tier form', 'Validation Error');
      return;
    }

    setIsSaving(true);
    try {
      await workflowService.saveWorkflow({ id: editingId, ...formData });
      toast.success(
        editingId ? 'Workflow tier updated successfully' : 'New approval workflow tier configured!',
        'Workflow Saved'
      );
      setModalOpen(false);
      await loadWorkflows();
    } catch (err) {
      toast.error(err.message || 'Failed to save workflow', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDurationDisplay = (min, max) => {
    if (min === 0 && max <= 0.5) return '0 to 4 Hours (Half-Day)';
    if (min === 1 && max === 2) return '1 to 2 Days';
    if (min === 3 && max === 15) return '3 to 15 Days';
    if (min === 16 && max === 30) return '16 to 30 Days';
    if (min > 30) return '> 30 Days (Extended)';
    return `${min} to ${max} Days`;
  };

  return (
    <div>
      <PageHeader
        title="Approval Workflow Architecture"
        description="Duration-based multi-tier authorization hierarchy. When employees apply for leave, the system routes requests automatically through these configured chains."
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            Add Workflow Tier
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner message="Loading configured workflow escalation rules..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadWorkflows} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {workflows.map((tier, index) => (
            <div key={tier.id} className="workflow-tier-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="workflow-duration-badge">
                  {formatDurationDisplay(tier.minDays, tier.maxDays)}
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Tier {index + 1}: {tier.name}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {tier.description}
                  </p>
                </div>
              </div>

              {/* Approval Chain Flow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="workflow-chain-flow">
                  {tier.approvers.map((role, i) => (
                    <React.Fragment key={role}>
                      <div className="approver-step-chip">
                        <UserCheck size={14} />
                        <span>{ROLE_LABELS[role] || role}</span>
                      </div>
                      {i < tier.approvers.length - 1 && (
                        <ArrowRight size={16} color="var(--text-tertiary)" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEdit(tier)}>
                  Edit Tier
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Workflow Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Approval Workflow Tier' : 'Configure New Approval Tier'}
        subtitle="Set duration thresholds and define the sequential escalation approvals required."
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
              {editingId ? 'Update Tier' : 'Save Workflow Tier'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} noValidate>
          <Input
            id="wfNameInput"
            name="name"
            label="Tier Name / Description"
            placeholder="e.g. Standard Leave Period (3 to 15 Days)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            error={errors.name}
          />

          <div className="form-grid-2col">
            <Input
              id="wfMinDaysInput"
              name="minDays"
              label="Minimum Duration (Days)"
              type="number"
              step="0.5"
              value={formData.minDays}
              onChange={(e) => setFormData({ ...formData, minDays: e.target.value })}
              required
              error={errors.minDays}
            />

            <Input
              id="wfMaxDaysInput"
              name="maxDays"
              label="Maximum Duration (Days)"
              type="number"
              step="0.5"
              value={formData.maxDays}
              onChange={(e) => setFormData({ ...formData, maxDays: e.target.value })}
              required
              error={errors.maxDays}
            />
          </div>

          <FormField
            label="Required Sequential Approvers"
            required
            error={errors.approvers}
            helperText="Select which authority levels must approve requests in this duration bracket."
          >
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                padding: '12px',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {[ROLES.TEAM_LEAD, ROLES.MANAGER, ROLES.ADMIN].map((role) => {
                const isSelected = formData.approvers?.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleApproverRole(role)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      border: isSelected ? '1px solid var(--primary-orange)' : '1px solid var(--border-medium)',
                      backgroundColor: isSelected ? 'var(--primary-orange-subtle)' : '#ffffff',
                      color: isSelected ? 'var(--primary-orange-hover)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <UserCheck size={14} />
                    <span>{ROLE_LABELS[role] || role}</span>
                  </button>
                );
              })}
            </div>
          </FormField>

          <FormField label="Operational Policy Details">
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Requires Manager sign-off followed by HR audit review..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
