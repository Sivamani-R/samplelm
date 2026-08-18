import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Check, X, Info } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { ToggleSwitch } from '../../components/common/ToggleSwitch.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { FormField } from '../../components/common/FormField.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateCategoryForm } from '../../validation/categoryValidation.js';
import { leaveCategoryService } from '../../services/leaveCategoryService.js';

export const LeaveCategoriesPage = () => {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    paid: true,
    allowFullDay: true,
    allowHalfDay: true,
    allowHourly: false,
    active: true,
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leaveCategoryService.fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to load leave categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      paid: true,
      allowFullDay: true,
      allowHalfDay: true,
      allowHourly: false,
      active: true,
      description: ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      code: cat.code,
      paid: cat.paid,
      allowFullDay: cat.allowFullDay,
      allowHalfDay: cat.allowHalfDay,
      allowHourly: cat.allowHourly,
      active: cat.active,
      description: cat.description || ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validation = validateCategoryForm(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast.error('Please resolve form errors before saving', 'Validation Error');
      return;
    }

    setIsSaving(true);
    try {
      await leaveCategoryService.saveCategory(formData, editingId);
      toast.success(
        editingId ? 'Leave category updated successfully' : `Category ${formData.name} created!`,
        'Category Saved'
      );
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save leave category', 'Error');
      if (err.field) {
        setErrors((prev) => ({ ...prev, [err.field]: err.message }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: 'Category Code',
      key: 'code',
      width: '130px',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-orange)' }}>
          {row.code}
        </span>
      )
    },
    {
      header: 'Category Name & Scope',
      key: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{row.description}</div>
        </div>
      )
    },
    {
      header: 'Remuneration',
      key: 'paid',
      width: '120px',
      render: (row) => (
        <StatusBadge status={row.paid ? 'PAID' : 'UNPAID'} variant={row.paid ? 'success' : 'danger'} />
      )
    },
    {
      header: 'Duration Units Allowed',
      key: 'units',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
          {row.allowFullDay && (
            <span style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
              Full Day
            </span>
          )}
          {row.allowHalfDay && (
            <span style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
              Half Day
            </span>
          )}
          {row.allowHourly && (
            <span style={{ backgroundColor: 'var(--primary-orange-subtle)', color: 'var(--primary-orange)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              Hourly
            </span>
          )}
        </div>
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
        title="Leave Categories & Classification"
        description="Configure dynamic leave classifications (PTO, Sick, Casual, Comp-Off). These categories are later customized per operating location."
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            Add Category
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner message="Loading configured leave classifications..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadCategories} />
      ) : (
        <Table columns={columns} data={categories} keyField="id" />
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Leave Category' : 'Create Leave Category'}
        subtitle="Define category characteristics, paid/unpaid classification, and allowed increments."
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
              {editingId ? 'Update Category' : 'Save Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} noValidate>
          <div className="form-grid-2col">
            <Input
              id="catNameInput"
              name="name"
              label="Category Name"
              placeholder="e.g. Paid Time Off (PTO)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              error={errors.name}
            />

            <Input
              id="catCodeInput"
              name="code"
              label="Category Code"
              placeholder="e.g. PTO, SICK, CASUAL"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              error={errors.code}
              helperText="Unique uppercase system key"
            />
          </div>

          <FormField
            id="catDescInput"
            label="Category Description & Policy Intent"
            required
            error={errors.description}
          >
            <textarea
              id="catDescInput"
              rows={3}
              className="form-textarea"
              placeholder="Describe the purpose, eligibility guidelines, and statutory intent of this category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormField>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginTop: '16px'
            }}
          >
            <ToggleSwitch
              checked={formData.paid}
              onChange={(val) => setFormData({ ...formData, paid: val })}
              label="Paid Leave Classification"
              description="Leave taken under this category is fully remunerated by default."
            />

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Allowed Leave Increments
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <ToggleSwitch
                  checked={formData.allowFullDay}
                  onChange={(val) => setFormData({ ...formData, allowFullDay: val })}
                  label="Allow Full-Day Leaves"
                />
                <ToggleSwitch
                  checked={formData.allowHalfDay}
                  onChange={(val) => setFormData({ ...formData, allowHalfDay: val })}
                  label="Allow Half-Day Leaves"
                />
                <ToggleSwitch
                  checked={formData.allowHourly}
                  onChange={(val) => setFormData({ ...formData, allowHourly: val })}
                  label="Allow Hourly / Partial-Day Leaves (Under 4 hours)"
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
              <ToggleSwitch
                checked={formData.active}
                onChange={(val) => setFormData({ ...formData, active: val })}
                label="Category Active Across Organization"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
