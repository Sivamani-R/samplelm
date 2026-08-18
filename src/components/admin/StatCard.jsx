import React from 'react';

/**
 * Enterprise Metric Stat Card
 */
export const StatCard = ({
  label,
  value,
  icon: Icon,
  subtext = null,
  trend = null,
  colorVariant = 'primary' // 'primary' | 'blue' | 'success' | 'warning'
}) => {
  const getIconStyles = () => {
    switch (colorVariant) {
      case 'primary':
        return { backgroundColor: 'var(--primary-orange-subtle)', color: 'var(--primary-orange)' };
      case 'blue':
        return { backgroundColor: 'var(--info-blue-subtle)', color: 'var(--info-blue)' };
      case 'success':
        return { backgroundColor: 'var(--status-success-subtle)', color: 'var(--status-success)' };
      case 'warning':
        return { backgroundColor: 'var(--status-warning-subtle)', color: 'var(--status-warning)' };
      default:
        return { backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <div className="stat-card-icon" style={getIconStyles()}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <div className="stat-card-value">{value}</div>
        {subtext && <div className="stat-card-subtext">{subtext}</div>}
      </div>
    </div>
  );
};
