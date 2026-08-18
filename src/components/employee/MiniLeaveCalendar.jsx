import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

/**
 * Location-Aware Mini Leave Calendar Grid showing leaves, holidays, weekends
 */
export const MiniLeaveCalendar = ({ holidays = [], leaves = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Map dates to events
  const dateMap = {};

  // 1. Mark Holidays
  holidays.forEach((h) => {
    const [hY, hM, hD] = h.date.split('-').map(Number);
    if (hY === year && hM - 1 === month) {
      dateMap[hD] = { type: 'holiday', label: h.name, title: `Holiday: ${h.name}` };
    }
  });

  // 2. Mark Leaves
  leaves.forEach((l) => {
    if (['APPROVED', 'PENDING'].includes(l.status)) {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);

      const cur = new Date(start);
      while (cur <= end) {
        if (cur.getFullYear() === year && cur.getMonth() === month) {
          const day = cur.getDate();
          dateMap[day] = {
            type: l.status === 'APPROVED' ? 'leave-approved' : 'leave-pending',
            label: l.leaveTypeName,
            title: `${l.status === 'APPROVED' ? 'Approved Leave' : 'Pending Request'}: ${l.leaveTypeName}`
          };
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
  });

  const daysGrid = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push({ empty: true, key: `empty-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const event = dateMap[d];

    daysGrid.push({
      empty: false,
      day: d,
      isWeekend,
      event,
      isToday: year === 2026 && month === 7 && d === 18,
      key: `day-${d}`
    });
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={18} color="var(--primary-orange)" />
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)'
            }}
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)'
            }}
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          textAlign: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          marginBottom: '8px'
        }}
      >
        <span>SUN</span>
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {daysGrid.map((item) => {
          if (item.empty) {
            return <div key={item.key} style={{ height: '34px' }} />;
          }

          let bg = item.isWeekend ? 'var(--bg-surface-secondary)' : '#ffffff';
          let textColor = item.isWeekend ? 'var(--text-tertiary)' : 'var(--text-primary)';
          let border = item.isToday ? '2px solid var(--primary-orange)' : '1px solid var(--border-light)';

          if (item.event?.type === 'holiday') {
            bg = '#ecfdf5';
            textColor = '#065f46';
            border = '1px solid #a7f3d0';
          } else if (item.event?.type === 'leave-approved') {
            bg = 'var(--primary-orange-subtle)';
            textColor = 'var(--primary-orange-hover)';
            border = '1px solid var(--primary-orange-border)';
          } else if (item.event?.type === 'leave-pending') {
            bg = '#fffbeb';
            textColor = '#92400e';
            border = '1px solid #fde68a';
          }

          return (
            <div
              key={item.key}
              title={item.event ? item.event.title : (item.isToday ? 'Today (Aug 18)' : '')}
              style={{
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: bg,
                color: textColor,
                fontSize: '12px',
                fontWeight: item.event || item.isToday ? 700 : 500,
                border,
                position: 'relative'
              }}
            >
              {item.day}
              {item.event && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor:
                      item.event.type === 'holiday'
                        ? '#10b981'
                        : item.event.type === 'leave-approved'
                        ? 'var(--primary-orange)'
                        : '#f59e0b'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-light)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-orange)' }} />
          Approved Leave
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          Pending Leave
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          Location Holiday
        </span>
      </div>
    </div>
  );
};
