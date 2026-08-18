import { teamService } from './service.js';

export const getMembers = async (req, res, next) => {
  try { res.json(await teamService.getMembers(req.user.sub)); } catch (e) { next(e); }
};
export const getAvailability = async (req, res, next) => {
  try { res.json(await teamService.getAvailability(req.user.sub)); } catch (e) { next(e); }
};
export const getCalendar = async (req, res, next) => {
  try { res.json(await teamService.getCalendar(req.user.sub, req.query.startDate, req.query.endDate)); } catch (e) { next(e); }
};
export const getOverview = async (req, res, next) => {
  try { res.json(await teamService.getOverview(req.user.sub)); } catch (e) { next(e); }
};
