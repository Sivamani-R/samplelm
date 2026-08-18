import React, { useState, useEffect } from 'react';
import { Calendar, Users, Filter } from 'lucide-react';
import { teamService } from '../../services/teamService.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { TeamCalendarView } from '../../components/team/TeamCalendarView.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';

export const TeamLeadTeamCalendarPage = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCalendar = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const start = new Date();
      start.setDate(start.getDate() - 3);
      const end = new Date();
      end.setDate(end.getDate() + 12);
      
      const startLocal = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const endLocal = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      
      const data = await teamService.fetchTeamCalendar(startLocal, endLocal);
      
      setCalendarData(data);
    } catch (err) {
      setError(err.message || 'Unable to load team calendar.');
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
        title="Team Leave Calendar"
        subtitle="Multi-day coverage and leave overlap matrix for your direct reportees"
        breadcrumbs={[
          { label: 'Lead Dashboard', path: '/team-lead' },
          { label: 'Team Calendar' }
        ]}
      />

      {isLoading ? (
        <LoadingSpinner text="Building team leave schedule matrix..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadCalendar} />
      ) : (
        <TeamCalendarView calendarData={calendarData} />
      )}
    </div>
  );
};
