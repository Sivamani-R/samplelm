import { apiClient } from './apiClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const employeeApi = {
  async getAll() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getEmployees();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.EMPLOYEES);
  },

  async getTeamLeads() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getTeamLeads();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.TEAM_LEADS);
  },

  async getManagers() {
    if (apiClient.isMockMode()) {
      return await mockBackendService.getManagers();
    }
    return await apiClient.get(API_ENDPOINTS.ADMIN.MANAGERS);
  },

  async create(employeeData) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.createEmployee(employeeData, currentUser);
    }
    return await apiClient.post(API_ENDPOINTS.ADMIN.EMPLOYEES, employeeData);
  }
};
