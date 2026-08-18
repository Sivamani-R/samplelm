import { dashboardApi } from '../api/dashboardApi.js';

export const dashboardService = {
  async fetchDashboardData() {
    return await dashboardApi.getEmployeeDashboard();
  }
};
