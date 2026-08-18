import React, { useState, useEffect, useMemo } from 'react';
import { GitMerge, LayoutGrid, List, Search, Filter, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Table } from '../../components/common/Table.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { HierarchyTree } from '../../components/admin/HierarchyTree.jsx';
import { MappingModal } from '../../components/admin/MappingModal.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { mappingService } from '../../services/mappingService.js';
import { employeeService } from '../../services/employeeService.js';
import { locationService } from '../../services/locationService.js';
import { DEPARTMENTS } from '../../constants/departments.js';

export const EmployeeMappingPage = () => {
  const toast = useToast();

  const [mappings, setMappings] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [managers, setManagers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // View state: 'visual' or 'table'
  const [viewMode, setViewMode] = useState('visual');

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Modal states
  const [editingMapping, setEditingMapping] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [unmappingTarget, setUnmappingTarget] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [mapList, tlList, mgrList, locList] = await Promise.all([
        mappingService.fetchMappings(),
        employeeService.fetchTeamLeads(),
        employeeService.fetchManagers(),
        locationService.fetchLocations()
      ]);
      setMappings(mapList);
      setTeamLeads(tlList);
      setManagers(mgrList);
      setLocations(locList);
    } catch (err) {
      setError(err.message || 'Failed to load employee hierarchy mappings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMappings = useMemo(() => {
    return mappings.filter((item) => {
      const emp = item.employee;
      const matchSearch =
        !search ||
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());

      const matchDept = !departmentFilter || emp.department === departmentFilter;
      const matchLoc = !locationFilter || emp.locationName === locationFilter;

      return matchSearch && matchDept && matchLoc;
    });
  }, [mappings, search, departmentFilter, locationFilter]);

  const handleSaveMapping = async (employeeId, payload) => {
    setIsSaving(true);
    try {
      await mappingService.updateMapping(employeeId, payload);
      toast.success('Hierarchy mapping updated successfully!', 'Mapping Saved');
      setEditingMapping(null);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update mapping', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMapping = async () => {
    if (!unmappingTarget) return;
    setIsSaving(true);
    try {
      await mappingService.updateMapping(unmappingTarget.employee.id, { teamLeadId: null, managerId: null });
      toast.success(`Removed hierarchy mapping for ${unmappingTarget.employee.name}`, 'Mapping Cleared');
      setUnmappingTarget(null);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to remove mapping', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  const tableColumns = [
    {
      header: 'Employee',
      key: 'employee',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.employee.name}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            {row.employee.id} • {row.employee.department}
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Team Lead (Tier-1)',
      key: 'teamLead',
      render: (row) =>
        row.teamLead ? (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.teamLead.name}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{row.teamLead.id}</div>
          </div>
        ) : (
          <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '12px' }}>
            — Direct to Manager —
          </span>
        )
    },
    {
      header: 'Assigned Manager (Tier-2)',
      key: 'manager',
      render: (row) =>
        row.manager ? (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.manager.name}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{row.manager.id}</div>
          </div>
        ) : (
          <StatusBadge status="UNASSIGNED" variant="danger" />
        )
    },
    {
      header: 'Location',
      key: 'location',
      render: (row) => <span style={{ fontWeight: 600, color: 'var(--info-blue)' }}>{row.employee.locationName}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" icon={Edit} onClick={() => setEditingMapping(row)}>
            Edit
          </Button>
          {(row.teamLead || row.manager) && (
            <Button
              variant="ghost"
              size="sm"
              className="btn-icon-only"
              title="Remove Hierarchy Mapping"
              onClick={() => setUnmappingTarget(row)}
            >
              <Trash2 size={15} color="var(--status-danger)" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Employee Escalation & Hierarchy Mapping"
        description="Establish direct Team Lead (Tier-1) and Manager (Tier-2) reporting lines for automated approval escalation."
      />

      {/* Toolbar & Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search employee or approver..."
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="form-select"
            style={{ width: '180px', padding: '6px 10px', fontSize: '12.5px' }}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="form-select"
            style={{ width: '160px', padding: '6px 10px', fontSize: '12.5px' }}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              style={{
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: viewMode === 'visual' ? 'var(--primary-orange)' : 'var(--bg-surface)',
                color: viewMode === 'visual' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <LayoutGrid size={14} />
              <span>Tree View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: viewMode === 'table' ? 'var(--primary-orange)' : 'var(--bg-surface)',
                color: viewMode === 'table' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <List size={14} />
              <span>Table View</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading organizational hierarchy trees..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : filteredMappings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No employee records match the active hierarchy filters.</p>
        </div>
      ) : viewMode === 'visual' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredMappings.map((mapping) => (
            <HierarchyTree
              key={mapping.employee.id}
              mapping={mapping}
              onEdit={() => setEditingMapping(mapping)}
            />
          ))}
        </div>
      ) : (
        <Table
          columns={tableColumns}
          data={filteredMappings}
          keyField={(r) => r.employee.id}
        />
      )}

      {/* Edit Mapping Modal */}
      {editingMapping && (
        <MappingModal
          isOpen={Boolean(editingMapping)}
          onClose={() => setEditingMapping(null)}
          mapping={editingMapping}
          teamLeads={teamLeads}
          managers={managers}
          onSave={handleSaveMapping}
          isLoading={isSaving}
        />
      )}

      {/* Remove Mapping Confirm Dialog */}
      {unmappingTarget && (
        <ConfirmDialog
          isOpen={Boolean(unmappingTarget)}
          onClose={() => setUnmappingTarget(null)}
          onConfirm={handleRemoveMapping}
          title="Remove Hierarchy Mapping?"
          message={`Are you sure you want to unmap approvers from ${unmappingTarget.employee.name} (${unmappingTarget.employee.id})? Leave requests for this employee will lack a designated approver until remapped.`}
          confirmLabel="Remove Approvers"
          confirmVariant="danger"
          isLoading={isSaving}
        />
      )}
    </div>
  );
};
