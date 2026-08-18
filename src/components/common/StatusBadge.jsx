import React from 'react';

/**
 * Enterprise Status Badge / Pill
 * Variants: 'success', 'warning', 'danger', 'info', 'primary', 'neutral', 'navy'
 */
export const StatusBadge = ({
  status,
  variant = null,
  showDot = true,
  className = ''
}) => {
  // Auto-detect variant based on standard status strings if not explicitly supplied
  const resolveVariant = () => {
    if (variant) return variant;
    const s = String(status).toUpperCase();
    if (['ACTIVE', 'PAID', 'APPROVED', 'FULL_TIME', 'SUCCESS'].includes(s)) return 'success';
    if (['PENDING', 'PART_TIME', 'WARNING', 'TEAM_LEAD'].includes(s)) return 'warning';
    if (['INACTIVE', 'REJECTED', 'UNPAID', 'CANCELLED', 'DANGER', 'CONTRACT'].includes(s)) return 'danger';
    if (['EMPLOYEE', 'INFO', 'INTERN'].includes(s)) return 'info';
    if (['ADMIN', 'MANAGER', 'PRIMARY'].includes(s)) return 'primary';
    return 'neutral';
  };

  const badgeVariant = resolveVariant();

  return (
    <span className={`status-badge badge-${badgeVariant} ${className}`.trim()}>
      {showDot && <span className="status-badge-dot" />}
      <span>{status}</span>
    </span>
  );
};
