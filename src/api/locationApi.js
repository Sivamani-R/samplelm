import { apiClient } from './apiClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const locationApi = {
  async getAll() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getLocations();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.LOCATIONS);
  },

  async create(locationData) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.createLocation(locationData, currentUser);
    }
    return await apiClient.post(API_ENDPOINTS.ADMIN.LOCATIONS, locationData);
  },

  async update(id, locationData) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.updateLocation(id, locationData, currentUser);
    }
    return await apiClient.put(`${API_ENDPOINTS.ADMIN.LOCATIONS}/${id}`, locationData);
  }
};
