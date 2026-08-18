import { apiClient } from './apiClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const mappingApi = {
  async getAll() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getMappings();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.MAPPINGS);
  },

  async update(employeeId, mappingData) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.updateMapping(employeeId, mappingData, currentUser);
    }
    return await apiClient.put(`${API_ENDPOINTS.ADMIN.MAPPINGS}/${employeeId}`, mappingData);
  }
};
