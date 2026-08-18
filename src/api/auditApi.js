import { apiClient } from './apiClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { mockBackendService } from '../services/mockBackendService.js';

export const auditApi = {
  async getAll() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getAuditLogs();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.AUDIT_LOGS);
  },

  async getDashboardStats() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getDashboardStats();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.STATS);
  }
};
