import { apiClient } from './apiClient.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const dashboardApi = {
  async getEmployeeDashboard() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getEmployeeDashboard(currentUser);
    }
    return await apiClient.get('/employee/dashboard');
  }
};
