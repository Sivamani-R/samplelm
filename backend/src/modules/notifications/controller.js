import { notificationService } from './service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getUserNotifications(req.user.sub);
    res.json(data);
  } catch (error) { next(error); }
};

export const markRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.sub);
    res.json({ success: true });
  } catch (error) { next(error); }
};

export const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.sub);
    res.json({ success: true });
  } catch (error) { next(error); }
};
