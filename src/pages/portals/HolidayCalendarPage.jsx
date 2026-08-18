import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Filter,
  CheckCircle2,
  Building2,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { holidayService } from '../../services/holidayService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Select } from '../../components/common/Select.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';

export const HolidayCalendarPage = () => {
  const { user } = useAuth();
  const getBasePath = () => {
    if (user?.role === 'TEAM_LEAD') return '/team-lead';
    if (user?.role === 'MANAGER') return '/manager';
    return '/employee';
  };
  const basePath = getBasePath();

  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthFilter, setMonthFilter] = useState('ALL');

  const loadHolidays = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await holidayService.fetchMyHolidays();
      setHolidays(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch location holiday calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const months = [
    { value: 'ALL', label: 'All Months (Full Year)' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const filteredHolidays = holidays.filter((h) => {
    if (monthFilter === 'ALL') return true;
    const [, month] = h.date.split('-');
    return month === monthFilter;
  });

  const todayStr = '2026-08-18';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Location Holiday Calendar"
        subtitle={`Official corporate statutory and regional holidays observed at ${user?.location || 'your office location'}`}
        breadcrumbs={[
          { label: 'Dashboard', path: basePath },
          { label: 'Holiday Calendar' }
        ]}
      />

      {/* Location Meta Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-orange-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-orange)'
            }}
          >
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {user?.location || 'Corporate Office'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Calendar Year: <strong>2026</strong> • Total Statutory Holidays: <strong>{holidays.length} Days</strong>
            </div>
          </div>
        </div>

        {/* Month Filter */}
        <div style={{ width: '220px' }}>
          <Select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            options={months}
          />
        </div>
      </div>

      {/* Holiday Cards Grid */}
      {isLoading ? (
        <LoadingSpinner text="Fetching official holiday roster for your location..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadHolidays} />
      ) : filteredHolidays.length === 0 ? (
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)'
          }}
        >
          <Calendar size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            No Holidays in Selected Month
          </h4>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            There are no official public holidays observed in this specific calendar month.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredHolidays.map((h) => {
            const isPast = h.date < todayStr;
            const isUpcoming = h.date >= todayStr;

            return (
              <div
                key={h.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: isUpcoming ? '1.5px solid var(--info-blue)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isPast ? 0.75 : 1,
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#e0f2fe',
                        color: 'var(--info-blue)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {h.type}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isUpcoming ? 'var(--primary-orange)' : 'var(--text-tertiary)' }}>
                      {isUpcoming ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {h.name}
                  </h3>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    <Calendar size={15} color="var(--primary-orange)" />
                    {h.date}
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {h.day}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
