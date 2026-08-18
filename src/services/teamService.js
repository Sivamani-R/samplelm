import { teamApi } from '../api/teamApi.js';

export const teamService = {
  async fetchTeamMembers() {
    return await teamApi.getMyTeam();
  },

  async fetchTeamAvailability() {
    return await teamApi.getTeamAvailability();
  },

  async fetchTeamCalendar(startDate, endDate) {
    return await teamApi.getTeamCalendar({ startDate, endDate });
  },

  async fetchTeamOverview() {
    return await teamApi.getTeamOverview();
  }
};
