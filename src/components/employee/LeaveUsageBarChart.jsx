import React from 'react';

/**
 * Enterprise Power BI-style SVG Monthly Leave Usage Bar Chart
 */
export const LeaveUsageBarChart = ({ recentLeaves = [] }) => {
  // Monthly aggregation for 2026
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyCounts = Array(12).fill(0);

  recentLeaves.forEach((leave) => {
    if (leave.status === 'APPROVED' && leave.startDate) {
      const monthIdx = new Date(leave.startDate).getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        monthlyCounts[monthIdx] += Number(leave.duration) || 0;
      }
    }
  });

  const maxVal = Math.max(...monthlyCounts, 5);

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
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Monthly Leave Utilization
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Approved working days taken across fiscal year 2026
        </p>
      </div>

      <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 4px', position: 'relative' }}>
        {monthlyCounts.map((val, idx) => {
          const heightPct = (val / maxVal) * 100;
          const isCurrentMonth = idx === 7; // August (idx 7)

          return (
            <div
              key={months[idx]}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end'
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: val > 0 ? 'var(--text-primary)' : 'transparent',
                  marginBottom: '4px'
                }}
              >
                {val > 0 ? `${val}d` : ''}
              </div>

              <div
                style={{
                  width: '100%',
                  maxWidth: '22px',
                  height: `${Math.max(6, heightPct)}%`,
                  backgroundColor: val > 0 ? 'var(--primary-orange)' : 'var(--bg-surface-secondary)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease-out, background-color 0.2s',
                  border: isCurrentMonth ? '1.5px solid var(--info-blue)' : 'none'
                }}
                title={`${months[idx]}: ${val} days taken`}
              />

              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: isCurrentMonth ? 800 : 500,
                  color: isCurrentMonth ? 'var(--primary-orange)' : 'var(--text-tertiary)',
                  marginTop: '8px'
                }}
              >
                {months[idx]}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '14px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
        <span>Total Utilized: <strong style={{ color: 'var(--text-primary)' }}>{monthlyCounts.reduce((a, b) => a + b, 0)} Days</strong></span>
        <span style={{ color: 'var(--info-blue)', fontWeight: 600 }}>Active Month: Aug 2026</span>
      </div>
    </div>
  );
};
