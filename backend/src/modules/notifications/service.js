import { query } from '../../shared/database/index.js';

export class NotificationService {
  async getUserNotifications(userId) {
    const { rows } = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    const unreadCount = rows.filter(n => !n.read).length;
    
    return {
      unreadCount,
      notifications: rows
    };
  }

  async markAsRead(notificationId, userId) {
    await query(
      `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  }

  async markAllAsRead(userId) {
    await query(
      `UPDATE notifications SET read = true WHERE user_id = $1`,
      [userId]
    );
  }
}

export const notificationService = new NotificationService();
