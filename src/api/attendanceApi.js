import { apiClient } from './apiClient.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const attendanceApi = {
  async getMyAttendance() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getAttendanceData(currentUser);
    }
    return await apiClient.get('/employee/attendance');
  },

  async submitRegularization(payload) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.submitAttendanceRegularization(payload, currentUser);
    }
    return await apiClient.post('/employee/attendance/regularize', payload);
  }
};
