import { apiClient } from './apiClient.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const teamApi = {
  async getMyTeam() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getTeamMembers(currentUser);
    }
    return await apiClient.get('/team/members');
  },

  async getTeamAvailability() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getTeamAvailability(currentUser);
    }
    return await apiClient.get('/team/availability');
  },

  async getTeamCalendar(params = {}) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getTeamCalendar(currentUser, params);
    }
    return await apiClient.get('/team/calendar', { params });
  },

  async getTeamOverview() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getTeamOverview(currentUser);
    }
    return await apiClient.get('/team/overview');
  }
};
