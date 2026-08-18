import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Filter, GitMerge, Eye, Mail, Phone, Calendar, MapPin, Briefcase } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Button } from '../../components/common/Button.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { Select } from '../../components/common/Select.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { employeeService } from '../../services/employeeService.js';
import { locationService } from '../../services/locationService.js';
import { DEPARTMENTS } from '../../constants/departments.js';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';

export const EmployeesListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Selected Employee for View Modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [empList, locList] = await Promise.all([
        employeeService.fetchEmployees(),
        locationService.fetchLocations()
      ]);
      setEmployees(empList);
      setLocations(locList);
    } catch (err) {
      setError(err.message || 'Failed to load employee directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search
      const matchSearch =
        !search ||
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());

      // Department
      const matchDept = !departmentFilter || emp.department === departmentFilter;

      // Role
      const matchRole = !roleFilter || emp.role === roleFilter;

      // Location
      const matchLoc = !locationFilter || emp.locationId === locationFilter;

      return matchSearch && matchDept && matchRole && matchLoc;
    });
  }, [employees, search, departmentFilter, roleFilter, locationFilter]);

  const columns = [
    {
      header: 'Employee ID',
      key: 'id',
      width: '120px',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
          {row.id}
        </span>
      )
    },
    {
      header: 'Employee Name',
      key: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{row.email}</div>
        </div>
      )
    },
    {
      header: 'Department & Designation',
      key: 'department',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.department}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{row.designation}</div>
        </div>
      )
    },
    {
      header: 'Location',
      key: 'locationName',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--info-blue)', fontWeight: 600 }}>
          <MapPin size={13} />
          {row.locationName || row.locationId}
        </span>
      )
    },
    {
      header: 'System Role',
      key: 'role',
      render: (row) => <StatusBadge status={row.role} />
    },
    {
      header: 'Escalation Manager',
      key: 'managerName',
      render: (row) => (
        <span style={{ color: row.managerName ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: '12.5px' }}>
          {row.managerName || '— None (Direct) —'}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      width: '100px',
      render: (row) => <StatusBadge status={row.status || 'ACTIVE'} />
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '120px',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            className="btn-icon-only"
            title="View Profile Details"
            onClick={() => setSelectedEmployee(row)}
          >
            <Eye size={15} />
          </Button>
          <Link to="/admin/mappings" title="Configure Hierarchy Mapping">
            <Button variant="ghost" size="sm" className="btn-icon-only">
              <GitMerge size={15} color="var(--primary-orange)" />
            </Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Employee Directory"
        description="Comprehensive enterprise roster of authorized personnel, roles, and regional office assignments."
        actions={
          <Link to="/admin/employees/create">
            <Button variant="primary" size="sm" icon={UserPlus}>
              Create New Employee
            </Button>
          </Link>
        }
      />

      {/* Filters Bar */}
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
          placeholder="Search by name, ID, or email..."
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Department Filter */}
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

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select"
            style={{ width: '150px', padding: '6px 10px', fontSize: '12.5px' }}
          >
            <option value="">All Roles</option>
            <option value={ROLES.EMPLOYEE}>Employee</option>
            <option value={ROLES.TEAM_LEAD}>Team Lead</option>
            <option value={ROLES.MANAGER}>Manager</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="form-select"
            style={{ width: '160px', padding: '6px 10px', fontSize: '12.5px' }}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          {(search || departmentFilter || roleFilter || locationFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setDepartmentFilter('');
                setRoleFilter('');
                setLocationFilter('');
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Fetching verified employee directory..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <Table
          columns={columns}
          data={filteredEmployees}
          keyField="id"
          emptyTitle="No Employees Found"
          emptyDescription="No employee records match the current filters. Try changing or resetting your search parameters."
        />
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={Boolean(selectedEmployee)}
          onClose={() => setSelectedEmployee(null)}
          title={`Employee Record: ${selectedEmployee.name}`}
          subtitle={`${selectedEmployee.id} • ${selectedEmployee.designation}`}
          size="md"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>WORK EMAIL</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '2px' }}>
                  <Mail size={14} color="var(--primary-orange)" />
                  {selectedEmployee.email}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>PHONE NUMBER</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '2px' }}>
                  <Phone size={14} color="var(--primary-orange)" />
                  {selectedEmployee.phone || 'N/A'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>DEPARTMENT</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '2px' }}>
                  <Briefcase size={14} color="var(--info-blue)" />
                  {selectedEmployee.department}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>LOCATION OFFICE</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '2px' }}>
                  <MapPin size={14} color="var(--info-blue)" />
                  {selectedEmployee.locationName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>JOINING DATE</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '2px' }}>
                  <Calendar size={14} />
                  {selectedEmployee.joiningDate}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>EMPLOYMENT TYPE</span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={selectedEmployee.employmentType} variant="neutral" />
                </div>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>REPORTING ESCALATION LINE</span>
              <div style={{ fontSize: '13px', marginTop: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedEmployee.teamLeadName ? `Team Lead: ${selectedEmployee.teamLeadName} → ` : ''}
                Manager: {selectedEmployee.managerName || 'Direct Department Head'}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
