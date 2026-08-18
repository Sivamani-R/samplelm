import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Check, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { DateInput } from '../../components/common/DateInput.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateEmployeeForm } from '../../validation/employeeValidation.js';
import { employeeService } from '../../services/employeeService.js';
import { locationService } from '../../services/locationService.js';
import { DEPARTMENTS } from '../../constants/departments.js';
import { EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_LABELS } from '../../constants/employmentTypes.js';
import { ROLES } from '../../constants/roles.js';

export const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [locations, setLocations] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    locationId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.EMPLOYEE,
    teamLeadId: '',
    managerId: ''
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Load locations and potential approvers
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [locList, tlList, mgrList] = await Promise.all([
          locationService.fetchLocations(),
          employeeService.fetchTeamLeads(),
          employeeService.fetchManagers()
        ]);
        setLocations(locList);
        setTeamLeads(tlList);
        setManagers(mgrList);

        if (locList.length > 0) {
          setFormData((prev) => ({ ...prev, locationId: prev.locationId || locList[0].id }));
        }
      } catch (err) {
        toast.error('Failed to load setup metadata');
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  // Validate on field change
  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      const validation = validateEmployeeForm(updated);
      setErrors((prev) => ({
        ...prev,
        [field]: validation.errors[field] || null
      }));
    }

    if (apiError) setApiError(null);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validation = validateEmployeeForm(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: validation.errors[field] || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Touch all fields
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const validation = validateEmployeeForm(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast.error('Please review the form errors before submitting', 'Validation Failed');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await employeeService.registerEmployee(formData);
      toast.success(`Employee ${created.name} (${created.id}) created successfully!`, 'Account Provisioned');
      navigate('/admin/employees');
    } catch (err) {
      setApiError(err.message || 'Failed to create employee profile');
      if (err.field) {
        setErrors((prev) => ({ ...prev, [err.field]: err.message }));
      }
      toast.error(err.message || 'Creation failed', 'Server Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is currently valid to handle button state
  const currentValidation = validateEmployeeForm(formData);
  const isFormValid = currentValidation.isValid;

  const roleOptions = [
    { value: ROLES.EMPLOYEE, label: 'Employee (Standard User)' },
    { value: ROLES.TEAM_LEAD, label: 'Team Lead (Tier-1 Reviewer)' },
    { value: ROLES.MANAGER, label: 'Manager (Department Approver)' }
  ];

  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: `${loc.name} (${loc.city}, ${loc.country})`
  }));

  const employmentTypeOptions = Object.entries(EMPLOYMENT_TYPES).map(([key, value]) => ({
    value,
    label: EMPLOYMENT_TYPE_LABELS[value]
  }));

  return (
    <div>
      <PageHeader
        title="Provision New Employee"
        description="Register a new staff member into the organization and assign regional policy jurisdiction."
        actions={
          <Link to="/admin/employees">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Employee List
            </Button>
          </Link>
        }
      />

      {apiError && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--status-danger-subtle)',
            border: '1px solid var(--status-danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-danger-text)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Error:</strong> {apiError}
          </div>
        </div>
      )}

      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Identification & Personal Info */}
          <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              1. Basic Identity & Credentials
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Unique corporate identifier and official communication details.
            </p>

            <div className="form-grid-3col">
              <Input
                id="empIdInput"
                name="employeeId"
                label="Employee ID"
                placeholder="e.g. EMP005"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                onBlur={() => handleBlur('employeeId')}
                required
                error={touched.employeeId ? errors.employeeId : null}
                helperText="Unique identifier (alphanumeric, 3-20 chars)"
              />

              <Input
                id="empNameInput"
                name="name"
                label="Full Name"
                placeholder="e.g. Rachel Adams"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                required
                error={touched.name ? errors.name : null}
              />

              <Input
                id="empEmailInput"
                name="email"
                label="Work Email Address"
                type="email"
                placeholder="e.g. rachel.a@enterprise.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                required
                error={touched.email ? errors.email : null}
              />
            </div>

            <div className="form-grid-3col" style={{ marginTop: '8px' }}>
              <Input
                id="empPhoneInput"
                name="phone"
                label="Phone Number"
                placeholder="e.g. +1 (555) 234-5678"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                required
                error={touched.phone ? errors.phone : null}
              />

              <DateInput
                id="empJoiningDateInput"
                name="joiningDate"
                label="Joining Date"
                value={formData.joiningDate}
                onChange={(e) => handleChange('joiningDate', e.target.value)}
                onBlur={() => handleBlur('joiningDate')}
                required
                error={touched.joiningDate ? errors.joiningDate : null}
              />

              <Select
                id="empTypeInput"
                name="employmentType"
                label="Employment Type"
                value={formData.employmentType}
                onChange={(e) => handleChange('employmentType', e.target.value)}
                onBlur={() => handleBlur('employmentType')}
                options={employmentTypeOptions}
                required
                error={touched.employmentType ? errors.employmentType : null}
              />
            </div>
          </div>

          {/* Section 2: Department, Role & Location */}
          <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              2. Role & Organizational Placement
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Assign system privileges and location-specific policy jurisdiction.
            </p>

            <div className="form-grid-3col">
              <Select
                id="empRoleInput"
                name="role"
                label="Assigned System Role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                onBlur={() => handleBlur('role')}
                options={roleOptions}
                required
                error={touched.role ? errors.role : null}
                helperText="Admin accounts can only be provisioned by superadmins."
              />

              <Select
                id="empDeptInput"
                name="department"
                label="Department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                onBlur={() => handleBlur('department')}
                options={DEPARTMENTS}
                placeholder="-- Select Department --"
                required
                error={touched.department ? errors.department : null}
              />

              <Input
                id="empDesignationInput"
                name="designation"
                label="Designation / Job Title"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                onBlur={() => handleBlur('designation')}
                required
                error={touched.designation ? errors.designation : null}
              />
            </div>

            <div className="form-grid-2col" style={{ marginTop: '8px' }}>
              <Select
                id="empLocationInput"
                name="locationId"
                label="Assigned Location (Statutory Leave Jurisdiction)"
                value={formData.locationId}
                onChange={(e) => handleChange('locationId', e.target.value)}
                onBlur={() => handleBlur('locationId')}
                options={locationOptions}
                placeholder="-- Select Location --"
                required
                error={touched.locationId ? errors.locationId : null}
                helperText="Leave accrual, balance rules, and holiday calendar depend on this location."
              />
            </div>
          </div>

          {/* Section 3: Optional Initial Reporting Line */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              3. Initial Hierarchy Mapping (Optional)
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              You can map direct approvers now or later in the Employee Mapping console.
            </p>

            <div className="form-grid-2col">
              <Select
                id="empTLInput"
                name="teamLeadId"
                label="Direct Team Lead (Tier-1 Reviewer)"
                value={formData.teamLeadId}
                onChange={(e) => handleChange('teamLeadId', e.target.value)}
                options={teamLeads.map((tl) => ({ value: tl.id, label: `${tl.id} - ${tl.name} (${tl.department})` }))}
                placeholder="-- None / Direct Report --"
              />

              <Select
                id="empMgrInput"
                name="managerId"
                label="Department Manager (Tier-2 Approver)"
                value={formData.managerId}
                onChange={(e) => handleChange('managerId', e.target.value)}
                options={managers.map((m) => ({ value: m.id, label: `${m.id} - ${m.name} (${m.department})` }))}
                placeholder="-- Select Department Manager --"
              />
            </div>
          </div>

          {/* Actions Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            <Link to="/admin/employees">
              <Button variant="outline" size="md" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={!isFormValid && Object.keys(touched).length > 0}
              icon={Check}
            >
              Provision Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
