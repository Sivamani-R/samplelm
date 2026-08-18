import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Select } from '../common/Select.jsx';
import { FormField } from '../common/FormField.jsx';
import { UserCheck, Shield } from 'lucide-react';

/**
 * Mapping Editor Modal to assign Team Lead and Manager
 */
export const MappingModal = ({
  isOpen = false,
  onClose,
  mapping,
  teamLeads = [],
  managers = [],
  onSave,
  isLoading = false
}) => {
  const [teamLeadId, setTeamLeadId] = useState('');
  const [managerId, setManagerId] = useState('');

  useEffect(() => {
    if (mapping) {
      setTeamLeadId(mapping.teamLead?.id || mapping.teamLeadId || '');
      setManagerId(mapping.manager?.id || mapping.managerId || '');
    }
  }, [mapping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mapping) return;
    const empId = mapping.employee?.id || mapping.id;
    onSave(empId, { teamLeadId: teamLeadId || null, managerId: managerId || null });
  };

  if (!mapping) return null;

  const emp = mapping.employee || mapping;

  const tlOptions = teamLeads
    .filter((tl) => tl.id !== emp.id)
    .map((tl) => ({
      value: tl.id,
      label: `${tl.id} - ${tl.name} (${tl.department})`
    }));

  const mgrOptions = managers
    .filter((m) => m.id !== emp.id)
    .map((m) => ({
      value: m.id,
      label: `${m.id} - ${m.name} (${m.department})`
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Employee Hierarchy Mapping"
      subtitle={`Set Team Lead and Manager escalation chain for ${emp.name} (${emp.id})`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Mapping
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Employee Summary Card */}
        <div
          style={{
            padding: '14px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            border: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{emp.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {emp.id} • {emp.designation} • {emp.department}
            </div>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--info-blue)' }}>
            {emp.locationName || emp.locationId}
          </div>
        </div>

        {/* Step 1: Team Lead Selection */}
        <Select
          id="mappingTeamLead"
          name="teamLeadId"
          label="Direct Team Lead (First-Tier Approver)"
          value={teamLeadId}
          onChange={(e) => setTeamLeadId(e.target.value)}
          options={tlOptions}
          placeholder="-- None / Direct to Manager --"
          helperText="Optional for senior engineers or direct manager reports."
        />

        {/* Step 2: Manager Selection */}
        <Select
          id="mappingManager"
          name="managerId"
          label="Department Manager (Escalation & Tier-2 Approver)"
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          options={mgrOptions}
          placeholder="-- Select Department Manager --"
          helperText="Primary authorizing manager for extended leaves."
        />
      </form>
    </Modal>
  );
};
