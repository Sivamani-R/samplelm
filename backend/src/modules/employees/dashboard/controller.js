import { dashboardService } from './service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData(req.user.sub);
    res.json(data);
  } catch (error) { next(error); }
};
