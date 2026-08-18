import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Globe, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { ToggleSwitch } from '../../components/common/ToggleSwitch.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateLocationForm } from '../../validation/locationValidation.js';
import { locationService } from '../../services/locationService.js';
import { TIMEZONES } from '../../constants/timezones.js';

export const LocationsPage = () => {
  const toast = useToast();

  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    country: '',
    timezone: 'Asia/Kolkata',
    code: '',
    active: true
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const loadLocations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await locationService.fetchLocations();
      setLocations(data);
    } catch (err) {
      setError(err.message || 'Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      city: '',
      state: '',
      country: '',
      timezone: 'Asia/Kolkata',
      code: '',
      active: true
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingId(loc.id);
    setFormData({
      name: loc.name,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      timezone: loc.timezone,
      code: loc.code,
      active: loc.active
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validation = validateLocationForm(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast.error('Please fix the errors in the location form', 'Validation Error');
      return;
    }

    setIsSaving(true);
    try {
      await locationService.saveLocation(formData, editingId);
      toast.success(
        editingId ? `Location updated successfully` : `Location ${formData.name} created!`,
        'Location Saved'
      );
      setModalOpen(false);
      await loadLocations();
    } catch (err) {
      toast.error(err.message || 'Failed to save location', 'Error');
      if (err.field) {
        setErrors((prev) => ({ ...prev, [err.field]: err.message }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: 'Location Code',
      key: 'code',
      width: '130px',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-orange)' }}>
          {row.code}
        </span>
      )
    },
    {
      header: 'Office / Facility Name',
      key: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="var(--info-blue)" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {row.city}, {row.state}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Country',
      key: 'country',
      render: (row) => <span style={{ fontWeight: 600 }}>{row.country}</span>
    },
    {
      header: 'Time Zone Jurisdiction',
      key: 'timezone',
      render: (row) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <Clock size={12} color="var(--text-tertiary)" />
          {row.timezone}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'active',
      width: '100px',
      render: (row) => <StatusBadge status={row.active ? 'ACTIVE' : 'INACTIVE'} />
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      width: '100px',
      render: (row) => (
        <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEdit(row)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Corporate Operating Locations"
        description="Regional office locations determine statutory leave entitlement rules, accrual policies, and public holiday calendars."
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            Add Location
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner message="Loading registered corporate locations..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadLocations} />
      ) : (
        <Table columns={columns} data={locations} keyField="id" />
      )}

      {/* Add / Edit Location Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Corporate Location' : 'Register New Corporate Location'}
        subtitle="Locations serve as the primary scope for leave policies and regional work calendars."
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
              {editingId ? 'Update Location' : 'Save Location'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} noValidate>
          <div className="form-grid-2col">
            <Input
              id="locNameInput"
              name="name"
              label="Location Name"
              placeholder="e.g. Chennai Tech Hub"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              error={errors.name}
            />

            <Input
              id="locCodeInput"
              name="code"
              label="Location Code"
              placeholder="e.g. CHN-01"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              error={errors.code}
              helperText="Unique uppercase identifier (e.g. LON-01, NYC-01)"
            />
          </div>

          <div className="form-grid-3col">
            <Input
              id="locCityInput"
              name="city"
              label="City"
              placeholder="e.g. Chennai"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              error={errors.city}
            />

            <Input
              id="locStateInput"
              name="state"
              label="State / Province"
              placeholder="e.g. Tamil Nadu"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
              error={errors.state}
            />

            <Input
              id="locCountryInput"
              name="country"
              label="Country"
              placeholder="e.g. India"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
              error={errors.country}
            />
          </div>

          <Select
            id="locTimezoneInput"
            name="timezone"
            label="Corporate Time Zone"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            options={TIMEZONES}
            required
            error={errors.timezone}
            helperText="Used to accurately compute working hours and shift boundaries."
          />

          <div style={{ marginTop: '16px' }}>
            <ToggleSwitch
              checked={formData.active}
              onChange={(val) => setFormData({ ...formData, active: val })}
              label="Operating Location Active"
              description="Inactive locations cannot have new policies or employees assigned."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
