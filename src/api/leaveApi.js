import { apiClient } from './apiClient.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const leaveApi = {
  async getMyLeaves() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getEmployeeLeaves(currentUser);
    }
    return await apiClient.get('/employee/leaves');
  },

  async applyLeave(leaveData) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.applyLeave(leaveData, currentUser);
    }
    return await apiClient.post('/employee/leaves', leaveData);
  },

  async calculateDuration(params) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.calculateLeaveDuration({ ...params, currentUser });
    }
    return await apiClient.post('/employee/leaves/calculate-duration', params);
  },

  async checkOverlap(params) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.checkLeaveOverlap({ ...params, currentUser });
    }
    return await apiClient.post('/employee/leaves/check-overlap', params);
  },

  async withdrawLeave(id) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.withdrawLeave(id, currentUser);
    }
    return await apiClient.post(`/employee/leaves/${id}/withdraw`);
  },

  async cancelLeave(id, reason) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.cancelLeave(id, reason, currentUser);
    }
    return await apiClient.post(`/employee/leaves/${id}/cancel`, { reason });
  }
};
