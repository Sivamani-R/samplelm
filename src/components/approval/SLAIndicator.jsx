import React from 'react';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

/**
 * Visual SLA Indicator Chip
 */
export const SLAIndicator = ({ sla }) => {
  if (!sla) return null;

  const limit = sla.limitHours || sla.slaHours || 48;
  
  let elapsed = sla.elapsedHours;
  if (elapsed === undefined) {
    if (sla.appliedDate) {
      elapsed = Math.round((Date.now() - new Date(sla.appliedDate).getTime()) / (1000 * 60 * 60));
    } else {
      elapsed = Math.max(0, limit - (sla.hoursRemaining || 0));
    }
  }

  const escalated = sla.isEscalated || sla.status === 'OVERDUE';
  const currentStatus = sla.status || (escalated ? 'OVERDUE' : (limit - elapsed <= 12 ? 'NEARING_SLA' : 'NORMAL'));

  let bg = '#eff6ff';
  let border = '#bfdbfe';
  let text = '#1d4ed8';
  let icon = <Clock size={13} />;
  let label = sla.waitingFormatted || `${elapsed}h / ${limit}h SLA`;

  if (escalated || currentStatus === 'OVERDUE') {
    bg = '#fef2f2';
    border = '#fca5a5';
    text = '#dc2626';
    icon = <AlertTriangle size={13} />;
    label = `OVERDUE (${elapsed}h > ${limit}h)`;
  } else if (currentStatus === 'NEARING_SLA') {
    bg = '#fffbeb';
    border = '#fde68a';
    text = '#b45309';
    icon = <Clock size={13} />;
    label = `Nearing SLA (${elapsed}h)`;
  }

  return (
    <span
      title={`SLA Target: ${limit} hours. Elapsed: ${elapsed} hours.`}
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
