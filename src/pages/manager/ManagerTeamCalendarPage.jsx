import React, { useState, useEffect } from 'react';
import { Calendar, Users } from 'lucide-react';
import { teamService } from '../../services/teamService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { TeamCalendarView } from '../../components/team/TeamCalendarView.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';

export const ManagerTeamCalendarPage = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCalendar = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await teamService.fetchTeamCalendar('2026-08-16', '2026-08-31');
      setCalendarData(data);
    } catch (err) {
      setError(err.message || 'Unable to load department calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Department Leave Schedule Matrix"
        subtitle="Full department attendance, holidays, and active leaves overview"
        breadcrumbs={[
          { label: 'Manager Dashboard', path: '/manager' },
          { label: 'Department Calendar' }
        ]}
      />

      {isLoading ? (
        <LoadingSpinner text="Building department schedule matrix..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadCalendar} />
      ) : (
        <TeamCalendarView calendarData={calendarData} />
      )}
    </div>
  );
};
