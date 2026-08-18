import { apiClient } from './apiClient.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const notificationApi = {
  async getNotifications() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getNotifications(currentUser);
    }
    return await apiClient.get('/notifications');
  },

  async markAsRead(id) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.markNotificationAsRead(id, currentUser);
    }
    return await apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.markAllNotificationsAsRead(currentUser);
    }
    return await apiClient.post('/notifications/mark-all-read');
  }
};
