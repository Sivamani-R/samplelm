import { leaveService } from './service.js';
import { query } from '../../shared/database/index.js';

export const getLeaves = async (req, res, next) => {
  try {
    res.json(await leaveService.getEmployeeLeaves(req.user.sub));
  } catch (e) { next(e); }
};

export const applyLeave = async (req, res, next) => {
  try {
    res.json(await leaveService.applyLeave(req.user.sub, req.body));
  } catch (e) { next(e); }
};

export const calculateDuration = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT location_id FROM users WHERE id = $1', [req.user.sub]);
    const duration = await leaveService.calculateDuration(req.body, rows[0]?.location_id);
    res.json(duration);
  } catch (e) { next(e); }
};

export const checkOverlap = async (req, res, next) => {
  try {
    const result = await leaveService.checkOverlap(req.user.sub, req.body.startDate, req.body.endDate, req.body.excludeLeaveId);
    res.json(result);
  } catch (e) { next(e); }
};

export const withdrawLeave = async (req, res, next) => {
  try {
    await query("UPDATE leave_requests SET status = 'WITHDRAWN', current_approver_id = NULL WHERE id = $1 AND employee_id = $2 AND status = 'PENDING'", [req.params.id, req.user.sub]);
    res.json({ success: true, message: 'Leave request withdrawn successfully' });
  } catch (e) { next(e); }
};

export const cancelLeave = async (req, res, next) => {
  try {
    await query("UPDATE leave_requests SET status = 'CANCELLED', current_approver_id = NULL WHERE id = $1 AND employee_id = $2 AND status = 'APPROVED'", [req.params.id, req.user.sub]);
    res.json({ success: true, message: 'Leave request cancelled successfully' });
  } catch (e) { next(e); }
};
