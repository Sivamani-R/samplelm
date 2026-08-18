import { apiClient } from './apiClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const leaveCategoryApi = {
  async getAll() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getLeaveCategories();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.LEAVE_CATEGORIES);
  },

  async create(categoryData) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.createLeaveCategory(categoryData, currentUser);
    }
    return await apiClient.post(API_ENDPOINTS.ADMIN.LEAVE_CATEGORIES, categoryData);
  },

  async update(id, categoryData) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.updateLeaveCategory(id, categoryData, currentUser);
    }
    return await apiClient.put(`${API_ENDPOINTS.ADMIN.LEAVE_CATEGORIES}/${id}`, categoryData);
  }
};
