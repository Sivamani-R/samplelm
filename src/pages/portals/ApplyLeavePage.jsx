import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Paperclip,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { leaveService } from '../../services/leaveService.js';
import { leaveBalanceService } from '../../services/leaveBalanceService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { FormField } from '../../components/common/FormField.jsx';
import { Select } from '../../components/common/Select.jsx';
import { DateInput } from '../../components/common/DateInput.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { PolicySidebar } from '../../components/employee/PolicySidebar.jsx';
import { DurationPreview } from '../../components/employee/DurationPreview.jsx';

export const ApplyLeavePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type');

  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [balances, setBalances] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    isHourly: false,
    hours: '2',
    reason: '',
    attachments: []
  });

  const [durationInfo, setDurationInfo] = useState(null);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [realTimeErrors, setRealTimeErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch available leave policies for employee location
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setIsLoadingBalances(true);
        const data = await leaveBalanceService.fetchMyBalances();
        setBalances(data);

        if (data.length > 0) {
          const initialType = preselectedType && data.find(b => b.categoryId === preselectedType)
            ? preselectedType
            : data[0].categoryId;

          setFormData(prev => ({ ...prev, leaveTypeId: initialType }));
          const matched = data.find(b => b.categoryId === initialType);
          setSelectedPolicy(matched || null);
        }
      } catch (err) {
        showError(err.message || 'Unable to fetch applicable leave policies.');
      } finally {
        setIsLoadingBalances(false);
      }
    };

    loadPolicies();
  }, [preselectedType]);

  // 2. Handle Leave Category Change
  const handleCategoryChange = (e) => {
    const typeId = e.target.value;
    const policy = balances.find(b => b.categoryId === typeId);
    setSelectedPolicy(policy || null);
    setFormData(prev => ({
      ...prev,
      leaveTypeId: typeId,
      isHourly: false
    }));
  };

  // 3. Real-time Duration & Overlap Calculation
  useEffect(() => {
    let isCancelled = false;

    const compute = async () => {
      if (!formData.startDate || (!formData.isHourly && !formData.endDate)) {
        setDurationInfo(null);
        setOverlapWarning(null);
        return;
      }

      const effectiveEnd = formData.isHourly ? formData.startDate : formData.endDate;
      if (new Date(effectiveEnd) < new Date(formData.startDate)) {
        setDurationInfo(null);
        return;
      }

      setIsCalculatingDuration(true);
      try {
        // Calculate Duration
        const dur = await leaveService.calculateDuration({
          startDate: formData.startDate,
          endDate: effectiveEnd,
          startSession: formData.startSession,
          endSession: formData.endSession,
          isHourly: formData.isHourly,
          hours: formData.hours,
          leaveTypeId: formData.leaveTypeId
        });

        if (!isCancelled) {
          setDurationInfo(dur);
        }

        // Check Overlap
        const overlap = await leaveService.checkOverlap({
          startDate: formData.startDate,
          endDate: effectiveEnd
        });

        if (!isCancelled) {
          setOverlapWarning(overlap.hasOverlap ? overlap.message : null);
        }
      } catch (err) {
        if (!isCancelled) {
          setDurationInfo(null);
        }
      } finally {
        if (!isCancelled) {
          setIsCalculatingDuration(false);
        }
      }
    };

    compute();

    return () => {
      isCancelled = true;
    };
  }, [
    formData.startDate,
    formData.endDate,
    formData.startSession,
    formData.endSession,
    formData.isHourly,
    formData.hours,
    formData.leaveTypeId
  ]);

  // 3.5 Clear form errors when user modifies the form
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      setFormErrors({});
    }
  }, [
    formData.startDate,
    formData.endDate,
    formData.startSession,
    formData.endSession,
    formData.isHourly,
    formData.hours,
    formData.leaveTypeId,
    formData.reason,
    formData.attachments
  ]);

  // 3.6 Real-time validations for notice period and balance
  useEffect(() => {
    const rErrors = {};
    
    // Minimum Notice Validation
    if (selectedPolicy && selectedPolicy.minNoticeDays > 0 && formData.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(formData.startDate);
      const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));

      if (diffDays < selectedPolicy.minNoticeDays) {
        rErrors.startDate = `Policy requires at least ${selectedPolicy.minNoticeDays} day(s) advance notice for ${selectedPolicy.categoryName}`;
      }
    }

    // Insufficient balance check
    if (selectedPolicy && durationInfo && durationInfo.workingDays > selectedPolicy.closingBalance) {
      rErrors.balance = `Insufficient balance. You requested ${durationInfo.workingDays} days, but only ${selectedPolicy.closingBalance} days are available.`;
    }

    setRealTimeErrors(rErrors);
  }, [formData.startDate, durationInfo, selectedPolicy]);

  // 4. File Attachment Upload Handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter(f => {
      const isSizeOk = f.size <= 5 * 1024 * 1024; // 5MB limit
      const isTypeOk = ['application/pdf', 'image/jpeg', 'image/png'].includes(f.type);
      return isSizeOk && isTypeOk;
    });

    if (validFiles.length < files.length) {
      showError('Only PDF, JPG, and PNG files up to 5MB are permitted.');
    }

    const fileMeta = validFiles.map(f => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...fileMeta]
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // 5. Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.leaveTypeId) {
      errors.leaveTypeId = 'Please select a leave category';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.isHourly && !formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (!formData.isHourly && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date cannot be prior to start date';
    }

    // Minimum Notice Validation
    if (selectedPolicy && selectedPolicy.minNoticeDays > 0 && formData.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(formData.startDate);
      const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));

      if (diffDays < selectedPolicy.minNoticeDays) {
        errors.startDate = `Policy requires at least ${selectedPolicy.minNoticeDays} day(s) advance notice for ${selectedPolicy.categoryName}`;
      }
    }

    // Overlap Error
    if (overlapWarning) {
      errors.startDate = overlapWarning;
    }

    // Reason validation
    if (!formData.reason.trim()) {
      errors.reason = 'Reason for leave is required for audit and approval records';
    }

    // Mandatory attachment validation
    if (
      selectedPolicy?.requireSupportingDocument &&
      durationInfo?.workingDays > selectedPolicy?.docThresholdDays &&
      formData.attachments.length === 0
    ) {
      errors.attachments = `Supporting documentation is mandatory for leave exceeding ${selectedPolicy.docThresholdDays} days`;
    }

    // Insufficient balance check
    if (selectedPolicy && durationInfo && durationInfo.workingDays > selectedPolicy.closingBalance) {
      errors.balance = `Insufficient balance. You requested ${durationInfo.workingDays} days, but only ${selectedPolicy.closingBalance} days are available.`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 6. Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please resolve the validation errors before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await leaveService.applyLeave({
        ...formData,
        endDate: formData.isHourly ? formData.startDate : formData.endDate
      });

      const reqId = result?.requestId || result?.id || '';
      showSuccess(`Leave application ${reqId ? '#' + reqId : ''} submitted successfully.`);
      
      const getHistoryPath = () => {
        if (user?.role === 'TEAM_LEAD') return '/team-lead/leave-history';
        if (user?.role === 'MANAGER') return '/manager/leave-history';
        return '/employee/leave-history';
      };
      navigate(getHistoryPath());
    } catch (err) {
      showError(err.message || 'Failed to submit leave application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingBalances) {
    return <LoadingSpinner text="Loading your location leave policies..." fullPage />;
  }

  const categoryOptions = balances.map(b => ({
    value: b.categoryId,
    label: `${b.categoryName} (${b.closingBalance} days available)`
  }));

  const sessionOptions = [
    { value: 'FULL_DAY', label: 'Full Day (1.0 Day)' },
    { value: 'FIRST_HALF', label: 'First Half Session (0.5 Day)' },
    { value: 'SECOND_HALF', label: 'Second Half Session (0.5 Day)' }
  ];

  const getBasePath = () => {
    if (user?.role === 'TEAM_LEAD') return '/team-lead';
    if (user?.role === 'MANAGER') return '/manager';
    return '/employee';
  };
  const basePath = getBasePath();

  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const todayStr = new Date(today.getTime() - offset).toISOString().split('T')[0];
  
  const minDateObj = new Date(today);
  minDateObj.setMonth(minDateObj.getMonth() - 3);
  const minDateStr = new Date(minDateObj.getTime() - offset).toISOString().split('T')[0];

  const maxDateObj = new Date(today);
  maxDateObj.setMonth(maxDateObj.getMonth() + 3);
  const maxDateStr = new Date(maxDateObj.getTime() - offset).toISOString().split('T')[0];

  return (
    <div>
      <PageHeader
        title="Apply Leave"
        subtitle="Submit a planned absence or medical leave request for approval"
        breadcrumbs={[
          { label: 'Dashboard', path: basePath },
          { label: 'Apply Leave' }
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main Application Form */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Category Selector */}
            <FormField
              label="Leave Type / Category"
              required
              error={formErrors.leaveTypeId}
              helpText="Loaded dynamically from your corporate office location policy"
            >
              <Select
                name="leaveTypeId"
                value={formData.leaveTypeId}
                onChange={handleCategoryChange}
                options={categoryOptions}
                placeholder="-- Select Leave Category --"
              />
            </FormField>

            {/* Hourly Switch (if policy allows) */}
            {selectedPolicy?.allowHourly && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Hourly Permission / Short Absence
                  </span>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                    Allowed under {selectedPolicy.categoryName} policy for minor appointments
                  </p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isHourly}
                    onChange={(e) => setFormData(prev => ({ ...prev, isHourly: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary-orange)' }}
                  />
                  Request Hours
                </label>
              </div>
            )}

            {/* Hourly Duration Selector */}
            {formData.isHourly ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Leave Date" required error={formErrors.startDate || realTimeErrors.startDate}>
                  <DateInput
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value, endDate: e.target.value }))}
                    min={minDateStr}
                    max={maxDateStr}
                  />
                </FormField>

                <FormField label="Duration (Hours)" required>
                  <Select
                    name="hours"
                    value={formData.hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                    options={[
                      { value: '1', label: '1 Hour (0.125 Day Eq.)' },
                      { value: '2', label: '2 Hours (0.25 Day Eq.)' },
                      { value: '3', label: '3 Hours (0.375 Day Eq.)' },
                      { value: '4', label: '4 Hours (Half Day Eq.)' }
                    ]}
                  />
                </FormField>
              </div>
            ) : (
              /* Daily Leave Date Range */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Start Date" required error={formErrors.startDate || realTimeErrors.startDate}>
                  <DateInput
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    min={minDateStr}
                    max={formData.endDate || maxDateStr}
                  />
                </FormField>

                <FormField label="End Date" required error={formErrors.endDate}>
                  <DateInput
                    name="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate || minDateStr}
                    max={maxDateStr}
                  />
                </FormField>
              </div>
            )}

            {/* Half Day / Session Pickers (if policy allows) */}
            {!formData.isHourly && selectedPolicy?.allowHalfDay && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Start Date Session">
                  <Select
                    name="startSession"
                    value={formData.startSession}
                    onChange={(e) => setFormData(prev => ({ ...prev, startSession: e.target.value }))}
                    options={sessionOptions}
                  />
                </FormField>

                {formData.startDate !== formData.endDate && (
                  <FormField label="End Date Session">
                    <Select
                      name="endSession"
                      value={formData.endSession}
                      onChange={(e) => setFormData(prev => ({ ...prev, endSession: e.target.value }))}
                      options={sessionOptions}
                    />
                  </FormField>
                )}
              </div>
            )}

            {/* Real-time Duration Preview Card */}
            <DurationPreview
              durationInfo={durationInfo}
              isLoading={isCalculatingDuration}
              error={formErrors.balance || realTimeErrors.balance || overlapWarning}
            />

            {/* Reason */}
            <FormField label="Reason for Leave" required error={formErrors.reason}>
              <textarea
                name="reason"
                rows="3"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="State the reason or context for this leave request..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13.5px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </FormField>

            {/* Supporting Document Attachment Upload */}
            <FormField
              label={`Supporting Document ${selectedPolicy?.requireSupportingDocument ? '(Mandatory for > ' + selectedPolicy.docThresholdDays + ' days)' : '(Optional)'}`}
              error={formErrors.attachments}
              helpText="Supported formats: PDF, JPG, PNG up to 5MB"
            >
              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <Upload size={24} color="var(--primary-orange)" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Click to upload medical certificate or document
                </div>
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {formData.attachments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {formData.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Paperclip size={14} color="var(--primary-orange)" />
                        <span style={{ fontWeight: 600 }}>{file.name}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>({file.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        title="Remove file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormField>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '18px' }}>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  if (user?.role === 'TEAM_LEAD') navigate('/team-lead');
                  else if (user?.role === 'MANAGER') navigate('/manager');
                  else navigate('/employee');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                disabled={Boolean(overlapWarning || formErrors.balance || realTimeErrors.balance || realTimeErrors.startDate)}
                icon={CheckCircle2}
              >
                Submit Leave Application
              </Button>
            </div>
          </form>
        </div>

        {/* Live Policy Sidebar */}
        <div>
          <PolicySidebar policy={selectedPolicy} employee={user} />
        </div>
      </div>
    </div>
  );
};
