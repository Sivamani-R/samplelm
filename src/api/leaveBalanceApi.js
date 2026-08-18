import { apiClient } from './apiClient.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const leaveBalanceApi = {
  async getMyBalances() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getEmployeeLeaveBalances(currentUser);
    }
    return await apiClient.get('/employee/leave-balances');
  }
};
