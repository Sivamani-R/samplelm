import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Plus, Check, MapPin, Tag, Sliders, Calendar, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { ToggleSwitch } from '../../components/common/ToggleSwitch.jsx';
import { PolicyCard } from '../../components/admin/PolicyCard.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validatePolicyForm } from '../../validation/policyValidation.js';
import { leavePolicyService } from '../../services/leavePolicyService.js';
import { locationService } from '../../services/locationService.js';
import { leaveCategoryService } from '../../services/leaveCategoryService.js';

export const LeavePoliciesPage = () => {
  const toast = useToast();

  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Policy Form State
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [policyForm, setPolicyForm] = useState({
    annualEntitlement: 20,
    monthlyAccrual: 1.66,
    maxBalance: 25,
    carryForwardAllowed: true,
    carryForwardLimit: 5,
    expiryAllowed: false,
    expiryMonths: 12,
    minNoticeDays: 2,
    maxContinuousDays: 30,
    allowHourly: true,
    allowHalfDay: true,
    paid: true,
    requireSupportingDocument: false,
    docThresholdDays: 2,
    active: true
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Filter for configured policies list
  const [filterLocationId, setFilterLocationId] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [locList, catList, polList] = await Promise.all([
        locationService.fetchLocations(),
        leaveCategoryService.fetchCategories(),
        leavePolicyService.fetchPolicies()
      ]);
      setLocations(locList);
      setCategories(catList);
      setPolicies(polList);

      if (locList.length > 0) {
        setSelectedLocationId(locList[0].id);
      }
      if (catList.length > 0) {
        setSelectedCategoryId(catList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load policy data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When selected location or category changes, populate existing policy values if found
  useEffect(() => {
    if (selectedLocationId && selectedCategoryId && policies.length > 0) {
      const existing = policies.find(
        (p) => p.locationId === selectedLocationId && p.categoryId === selectedCategoryId
      );

      if (existing) {
        setPolicyForm({
          annualEntitlement: existing.annualEntitlement,
          monthlyAccrual: existing.monthlyAccrual,
          maxBalance: existing.maxBalance,
          carryForwardAllowed: existing.carryForwardAllowed,
          carryForwardLimit: existing.carryForwardLimit,
          expiryAllowed: existing.expiryAllowed,
          expiryMonths: existing.expiryMonths || 12,
          minNoticeDays: existing.minNoticeDays,
          maxContinuousDays: existing.maxContinuousDays,
          allowHourly: existing.allowHourly,
          allowHalfDay: existing.allowHalfDay,
          paid: existing.paid,
          requireSupportingDocument: existing.requireSupportingDocument,
          docThresholdDays: existing.docThresholdDays || 2,
          active: existing.active
        });
      } else {
        // Find default category config
        const cat = categories.find((c) => c.id === selectedCategoryId);
        setPolicyForm({
          annualEntitlement: 20,
          monthlyAccrual: 1.66,
          maxBalance: 25,
          carryForwardAllowed: true,
          carryForwardLimit: 5,
          expiryAllowed: false,
          expiryMonths: 12,
          minNoticeDays: 2,
          maxContinuousDays: 30,
          allowHourly: cat?.allowHourly ?? true,
          allowHalfDay: cat?.allowHalfDay ?? true,
          paid: cat?.paid ?? true,
          requireSupportingDocument: false,
          docThresholdDays: 2,
          active: true
        });
      }
      setErrors({});
    }
  }, [selectedLocationId, selectedCategoryId, policies, categories]);

  const handleEditExistingPolicy = (policy) => {
    setSelectedLocationId(policy.locationId);
    setSelectedCategoryId(policy.categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();

    const fullPayload = {
      locationId: selectedLocationId,
      categoryId: selectedCategoryId,
      ...policyForm
    };

    const validation = validatePolicyForm(fullPayload);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast.error('Please fix the policy validation errors before saving', 'Validation Error');
      return;
    }

    setIsSaving(true);
    try {
      await leavePolicyService.savePolicy(fullPayload);
      const locName = locations.find((l) => l.id === selectedLocationId)?.name;
      const catName = categories.find((c) => c.id === selectedCategoryId)?.name;
      toast.success(
        `Leave policy for ${locName} (${catName}) saved successfully!`,
        'Policy Saved'
      );
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save policy', 'Server Error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPolicies = useMemo(() => {
    if (!filterLocationId) return policies;
    return policies.filter((p) => p.locationId === filterLocationId);
  }, [policies, filterLocationId]);

  return (
    <div>
      <PageHeader
        title="Location-Based Leave Policy Setup"
        description="Configure location-specific statutory entitlements, monthly accruals, carry-forward caps, and absence rules."
      />

      {isLoading ? (
        <LoadingSpinner message="Loading location policy rules & matrices..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <>
          {/* Policy Configuration Console */}
          <div className="policy-form-card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Sliders size={20} color="var(--primary-orange)" />
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Policy Rule Editor: Location + Category Matrix
              </h2>
            </div>

            {/* Scope Selection Box */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                padding: '18px',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                marginBottom: '28px'
              }}
            >
              <Select
                id="policyLocationSelect"
                name="locationId"
                label="Target Operating Location"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                options={locations.map((l) => ({ value: l.id, label: `${l.name} (${l.city}, ${l.country})` }))}
                required
                error={errors.locationId}
                helperText="Select the regional office jurisdiction for this policy rule."
              />

              <Select
                id="policyCategorySelect"
                name="categoryId"
                label="Target Leave Category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                options={categories.map((c) => ({ value: c.id, label: `${c.name} [${c.code}]` }))}
                required
                error={errors.categoryId}
                helperText="Select the category classification (e.g. PTO, Sick, Casual)."
              />
            </div>

            <form onSubmit={handleSavePolicy} noValidate>
              {/* Section 1: Entitlement & Accrual Metrics */}
              <div className="policy-section-group">
                <div className="policy-section-title">
                  <Calendar size={18} color="var(--primary-orange)" />
                  <span>1. Annual Entitlement, Accrual & Balance Limits</span>
                </div>
                <div className="policy-section-desc">
                  Define annual credit allocation, monthly dynamic accrual rates, and total balance ceiling.
                </div>

                <div className="form-grid-3col">
                  <Input
                    id="annualEntitlementInput"
                    name="annualEntitlement"
                    label="Annual Entitlement (Days)"
                    type="number"
                    step="0.5"
                    value={policyForm.annualEntitlement}
                    onChange={(e) => setPolicyForm({ ...policyForm, annualEntitlement: e.target.value })}
                    required
                    error={errors.annualEntitlement}
                    helperText="Total statutory days per calendar year (e.g. 24)"
                  />

                  <Input
                    id="monthlyAccrualInput"
                    name="monthlyAccrual"
                    label="Monthly Accrual Rate (Days/Mo)"
                    type="number"
                    step="0.01"
                    value={policyForm.monthlyAccrual}
                    onChange={(e) => setPolicyForm({ ...policyForm, monthlyAccrual: e.target.value })}
                    required
                    error={errors.monthlyAccrual}
                    helperText="Credits added at close of each payroll month (e.g. 2.0)"
                  />

                  <Input
                    id="maxBalanceInput"
                    name="maxBalance"
                    label="Maximum Balance Cap (Days)"
                    type="number"
                    step="1"
                    value={policyForm.maxBalance}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxBalance: e.target.value })}
                    required
                    error={errors.maxBalance}
                    helperText="Accrual pauses when employee reaches this cap (e.g. 30)"
                  />
                </div>
              </div>

              {/* Section 2: Carry-Forward & Expiry Rules */}
              <div className="policy-section-group">
                <div className="policy-section-title">
                  <ShieldCheck size={18} color="var(--info-blue)" />
                  <span>2. Year-End Carry Forward & Expiry Provisions</span>
                </div>
                <div className="policy-section-desc">
                  Rules governing unused balance transfer into the subsequent fiscal year.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <ToggleSwitch
                    checked={policyForm.carryForwardAllowed}
                    onChange={(val) => setPolicyForm({ ...policyForm, carryForwardAllowed: val })}
                    label="Allow Year-End Carry Forward"
                    description="Unused leave credits transfer automatically to the next year."
                  />

                  {policyForm.carryForwardAllowed && (
                    <div className="form-grid-2col" style={{ paddingLeft: '20px', borderLeft: '3px solid var(--primary-orange)' }}>
                      <Input
                        id="carryForwardLimitInput"
                        name="carryForwardLimit"
                        label="Carry-Forward Limit (Maximum Days)"
                        type="number"
                        value={policyForm.carryForwardLimit}
                        onChange={(e) => setPolicyForm({ ...policyForm, carryForwardLimit: e.target.value })}
                        required
                        error={errors.carryForwardLimit}
                        helperText="Excess days above this limit lapse automatically."
                      />
                    </div>
                  )}

                  <ToggleSwitch
                    checked={policyForm.expiryAllowed}
                    onChange={(val) => setPolicyForm({ ...policyForm, expiryAllowed: val })}
                    label="Enforce Carried-Forward Leave Expiry"
                    description="Carried-forward days must be utilized within a set expiration window."
                  />

                  {policyForm.expiryAllowed && (
                    <div className="form-grid-2col" style={{ paddingLeft: '20px', borderLeft: '3px solid var(--info-blue)' }}>
                      <Input
                        id="expiryMonthsInput"
                        name="expiryMonths"
                        label="Expiry Window (Months from Year Start)"
                        type="number"
                        value={policyForm.expiryMonths}
                        onChange={(e) => setPolicyForm({ ...policyForm, expiryMonths: e.target.value })}
                        required
                        error={errors.expiryMonths}
                        helperText="e.g. 6 or 12 months after January 1st."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Notice & Duration Limits */}
              <div className="policy-section-group">
                <div className="policy-section-title">
                  <Tag size={18} color="var(--status-warning-text)" />
                  <span>3. Request Notice, Continuity & Verification</span>
                </div>
                <div className="policy-section-desc">
                  Notice period thresholds and supporting documentation criteria.
                </div>

                <div className="form-grid-2col">
                  <Input
                    id="minNoticeDaysInput"
                    name="minNoticeDays"
                    label="Minimum Advance Notice (Days)"
                    type="number"
                    value={policyForm.minNoticeDays}
                    onChange={(e) => setPolicyForm({ ...policyForm, minNoticeDays: e.target.value })}
                    required
                    error={errors.minNoticeDays}
                    helperText="Days required prior to leave start (0 for emergency leave)."
                  />

                  <Input
                    id="maxContinuousDaysInput"
                    name="maxContinuousDays"
                    label="Maximum Continuous Leave (Days)"
                    type="number"
                    value={policyForm.maxContinuousDays}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxContinuousDays: e.target.value })}
                    required
                    error={errors.maxContinuousDays}
                    helperText="Maximum unbroken consecutive leave allowed per single request."
                  />
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <ToggleSwitch
                    checked={policyForm.requireSupportingDocument}
                    onChange={(val) => setPolicyForm({ ...policyForm, requireSupportingDocument: val })}
                    label="Require Supporting Documentation (e.g. Medical Certificate)"
                    description="Requires attachment upload before request can be submitted."
                  />

                  {policyForm.requireSupportingDocument && (
                    <div className="form-grid-2col" style={{ paddingLeft: '20px', borderLeft: '3px solid var(--status-warning)' }}>
                      <Input
                        id="docThresholdDaysInput"
                        name="docThresholdDays"
                        label="Document Requirement Threshold (Days)"
                        type="number"
                        value={policyForm.docThresholdDays}
                        onChange={(e) => setPolicyForm({ ...policyForm, docThresholdDays: e.target.value })}
                        required
                        error={errors.docThresholdDays}
                        helperText="Attachment required only if duration exceeds this number of days."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Increments & Paid Status */}
              <div className="policy-section-group">
                <div className="policy-section-title">
                  <Check size={18} color="var(--status-success)" />
                  <span>4. Allowed Increments & Paid Classification</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <ToggleSwitch
                    checked={policyForm.allowHourly}
                    onChange={(val) => setPolicyForm({ ...policyForm, allowHourly: val })}
                    label="Allow Hourly Partial-Day Leave"
                  />
                  <ToggleSwitch
                    checked={policyForm.allowHalfDay}
                    onChange={(val) => setPolicyForm({ ...policyForm, allowHalfDay: val })}
                    label="Allow Half-Day Leave"
                  />
                  <ToggleSwitch
                    checked={policyForm.paid}
                    onChange={(val) => setPolicyForm({ ...policyForm, paid: val })}
                    label="Paid Leave Compensation"
                  />
                  <ToggleSwitch
                    checked={policyForm.active}
                    onChange={(val) => setPolicyForm({ ...policyForm, active: val })}
                    label="Policy Rule Active"
                  />
                </div>
              </div>

              {/* Save Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSaving}
                  icon={Check}
                >
                  Save Location Policy
                </Button>
              </div>
            </form>
          </div>

          {/* Configured Policies List */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Configured Location Policies ({filteredPolicies.length})
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Active policies enforceable for dynamic leave calculations and balance deductions.
                </p>
              </div>

              <select
                value={filterLocationId}
                onChange={(e) => setFilterLocationId(e.target.value)}
                className="form-select"
                style={{ width: '200px', padding: '6px 10px', fontSize: '12.5px' }}
              >
                <option value="">All Operating Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px'
              }}
            >
              {filteredPolicies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  onEdit={handleEditExistingPolicy}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
