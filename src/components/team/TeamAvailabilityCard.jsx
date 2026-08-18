import React from 'react';
import { Users, UserCheck, UserX, Clock, Calendar } from 'lucide-react';

/**
 * Real-Time Team Availability Metric Card
 */
export const TeamAvailabilityCard = ({ availability }) => {
  if (!availability) return null;

  const { totalMembers, working, onLeave, pending, onHoliday } = availability;
  const workingPct = totalMembers > 0 ? Math.round((working / totalMembers) * 100) : 100;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Today's Team Availability
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Real-time workforce attendance & active leaves
          </p>
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: workingPct >= 80 ? '#ecfdf5' : '#fffbeb',
            color: workingPct >= 80 ? '#065f46' : '#92400e',
            border: workingPct >= 80 ? '1px solid #a7f3d0' : '1px solid #fde68a'
          }}
        >
          {workingPct}% Available
        </span>
      </div>

      {/* Headcount Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', margin: '8px 0' }}>
        <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>Working</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#166534', marginTop: '2px' }}>{working}</div>
        </div>

        <div style={{ padding: '10px', backgroundColor: 'var(--primary-orange-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-orange-border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--primary-orange-hover)', fontWeight: 700 }}>On Leave</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary-orange)', marginTop: '2px' }}>{onLeave}</div>
        </div>

        <div style={{ padding: '10px', backgroundColor: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 700 }}>Pending</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#92400e', marginTop: '2px' }}>{pending}</div>
        </div>

        <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700 }}>Holiday</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e40af', marginTop: '2px' }}>{onHoliday}</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Total Team Roster: <strong>{totalMembers} Members</strong></span>
        <span>Simulation Date: <strong>Aug 18, 2026</strong></span>
      </div>
    </div>
  );
};
