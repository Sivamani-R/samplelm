import React from 'react';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

/**
 * Visual SLA Indicator Chip
 */
export const SLAIndicator = ({ sla }) => {
  if (!sla) return null;

  const { status, elapsedHours, limitHours, isEscalated, waitingFormatted } = sla;

  let bg = '#eff6ff';
  let border = '#bfdbfe';
  let text = '#1d4ed8';
  let icon = <Clock size={13} />;
  let label = waitingFormatted || `${elapsedHours}h / ${limitHours}h SLA`;

  if (isEscalated || status === 'OVERDUE') {
    bg = '#fef2f2';
    border = '#fca5a5';
    text = '#dc2626';
    icon = <AlertTriangle size={13} />;
    label = `OVERDUE (${elapsedHours}h > ${limitHours}h)`;
  } else if (status === 'NEARING_SLA') {
    bg = '#fffbeb';
    border = '#fde68a';
    text = '#b45309';
    icon = <Clock size={13} />;
    label = `Nearing SLA (${elapsedHours}h)`;
  }

  return (
    <span
      title={`SLA Target: ${limitHours} hours. Elapsed: ${elapsedHours} hours.`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
        fontSize: '11.5px',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)'
      }}
    >
      {icon}
      {label}
    </span>
  );
};
