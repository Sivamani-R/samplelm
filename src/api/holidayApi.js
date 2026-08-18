import { apiClient } from './apiClient.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const holidayApi = {
  async getMyHolidays() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getEmployeeHolidays(currentUser);
    }
    return await apiClient.get('/employee/holidays');
  }
};
