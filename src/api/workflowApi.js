import { apiClient } from './apiClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const workflowApi = {
  async getAll() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getApprovalWorkflows();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.APPROVAL_WORKFLOWS);
  },

  async save(workflowData) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.saveApprovalWorkflow(workflowData, currentUser);
    }
    return await apiClient.post(API_ENDPOINTS.ADMIN.APPROVAL_WORKFLOWS, workflowData);
  }
};
