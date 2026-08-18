import { apiClient } from './apiClient.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const compOffApi = {
  async getMyCompOff() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getCompOffData(currentUser);
    }
    return await apiClient.get('/employee/comp-off');
  },

  async requestCompOff(payload) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.requestCompOff(payload, currentUser);
    }
    return await apiClient.post('/employee/comp-off', payload);
  }
};
