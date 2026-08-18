import { attendanceService } from './service.js';

export const getAttendance = async (req, res, next) => {
  try { res.json(await attendanceService.getAttendance(req.user.sub)); } catch (e) { next(e); }
};
export const regularizeAttendance = async (req, res, next) => {
  try { res.json(await attendanceService.regularize(req.user.sub, req.body)); } catch (e) { next(e); }
};
