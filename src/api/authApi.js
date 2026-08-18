import { apiClient } from './apiClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { mockBackendService } from '../services/mockBackendService.js';

export const authApi = {
  /**
   * Submits employee login credentials
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<{ token: string, user: { id: string, name: string, email: string, role: string, location: string } }>}
   */
  async login(credentials) {
    if (apiClient.isMockMode()) {
      return await mockBackendService.login(credentials);
    }
    return await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  async logout() {
    if (apiClient.isMockMode()) {
      return { success: true };
    }
    return await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async getProfile() {
    if (apiClient.isMockMode()) {
      return { success: true };
    }
    return await apiClient.get(API_ENDPOINTS.AUTH.ME);
  }
};
