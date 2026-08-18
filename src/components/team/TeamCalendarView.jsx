import React from 'react';
import { Calendar, User } from 'lucide-react';

/**
 * Team Leave Calendar Schedule Matrix (Employee x Days)
 */
export const TeamCalendarView = ({ calendarData }) => {
  if (!calendarData || !calendarData.dates) return null;

  const { dates, matrix } = calendarData;

  const formatDayHeader = (dateStr) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    const dayNum = d.getDate();
    return { dayName, dayNum };
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
        overflowX: 'auto'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Team Leave Schedule Matrix
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Multi-day team coverage view for sprint planning and capacity estimation
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--primary-orange)', borderRadius: '2px' }} />
            Approved Leave
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
            Pending Request
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '2px' }} />
            Holiday
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '2px', border: '1px solid var(--border-light)' }} />
            Weekend
          </span>
        </div>
      </div>

      {/* Schedule Table Matrix */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '700px' }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid var(--border-medium)', backgroundColor: 'var(--bg-surface-secondary)' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', minWidth: '180px', color: 'var(--text-primary)', fontWeight: 700 }}>
              Team Member
            </th>
            {dates.map((d) => {
              const { dayName, dayNum } = formatDayHeader(d);
              const isToday = d === '2026-08-18';
              return (
                <th
                  key={d}
                  style={{
                    padding: '8px 4px',
                    textAlign: 'center',
                    minWidth: '32px',
                    color: isToday ? 'var(--primary-orange)' : 'var(--text-secondary)',
                    fontWeight: isToday ? 800 : 600,
                    backgroundColor: isToday ? 'var(--primary-orange-subtle)' : 'transparent'
                  }}
                >
                  <div style={{ fontSize: '10px' }}>{dayName}</div>
                  <div style={{ fontSize: '12px' }}>{dayNum}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr key={row.member.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.member.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.member.designation}</div>
              </td>

              {row.schedule.map((item) => {
                let bg = '#ffffff';
                let text = '';
                let title = `${item.date}: Working`;

                if (item.status === 'WEEKEND') {
                  bg = 'var(--bg-surface-secondary)';
                  title = `${item.date}: Weekend`;
                } else if (item.status === 'HOLIDAY') {
                  bg = '#ecfdf5';
                  text = 'H';
                  title = `${item.date}: Statutory Holiday`;
                } else if (item.status === 'APPROVED_LEAVE') {
                  bg = 'var(--primary-orange)';
                  text = 'L';
                  title = `${item.date}: Approved Leave (${item.label})`;
                } else if (item.status === 'PENDING_LEAVE') {
                  bg = '#fef3c7';
                  text = 'P';
                  title = `${item.date}: Pending Request (${item.label})`;
                }

                return (
                  <td
                    key={item.date}
                    title={title}
                    style={{
                      padding: '4px',
                      textAlign: 'center',
                      backgroundColor: bg,
                      borderRight: '1px solid var(--border-light)',
                      color: item.status === 'APPROVED_LEAVE' ? '#ffffff' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '11px'
                    }}
                  >
                    {text}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
