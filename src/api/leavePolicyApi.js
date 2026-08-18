import { apiClient } from './apiClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const leavePolicyApi = {
  async getAll() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getLeavePolicies();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.LEAVE_POLICIES);
  },

  async save(policyData) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.saveLeavePolicy(policyData, currentUser);
    }
    return await apiClient.post(API_ENDPOINTS.ADMIN.LEAVE_POLICIES, policyData);
  }
};
