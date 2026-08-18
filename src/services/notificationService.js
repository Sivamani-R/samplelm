import { notificationApi } from '../api/notificationApi.js';

export const notificationService = {
  async fetchNotifications() {
    return await notificationApi.getNotifications();
  },

  async markAsRead(id) {
    return await notificationApi.markAsRead(id);
  },

  async markAllAsRead() {
    return await notificationApi.markAllAsRead();
  }
};
