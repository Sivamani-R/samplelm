import { compOffService } from './service.js';

export const getCompOffs = async (req, res, next) => {
  try { res.json(await compOffService.getCompOffs(req.user.sub)); } catch (e) { next(e); }
};
export const applyCompOff = async (req, res, next) => {
  try { res.json(await compOffService.createCompOff(req.user.sub, req.body)); } catch (e) { next(e); }
};
