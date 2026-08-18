import { approvalService } from './service.js';

export const getMyApprovals = async (req, res, next) => {
  try { res.json(await approvalService.getMyApprovals(req.user.sub)); } catch (e) { next(e); }
};

export const getApprovalHistory = async (req, res, next) => {
  try { res.json(await approvalService.getApprovalHistory(req.user.sub)); } catch (e) { next(e); }
};

export const getEscalatedApprovals = async (req, res, next) => {
  try { res.json(await approvalService.getEscalatedApprovals(req.user.sub)); } catch (e) { next(e); }
};

export const getApprovalById = async (req, res, next) => {
  try { res.json(await approvalService.getApprovalById(req.params.id)); } catch (e) { next(e); }
};

export const approve = async (req, res, next) => {
  try {
    await approvalService.processApproval(req.params.id, req.user.sub, 'APPROVE', req.body.remarks);
    res.json({ success: true });
  } catch (e) { next(e); }
};

export const reject = async (req, res, next) => {
  try {
    await approvalService.processApproval(req.params.id, req.user.sub, 'REJECT', req.body.remarks);
    res.json({ success: true });
  } catch (e) { next(e); }
};

export const clarification = async (req, res, next) => {
  try {
    await approvalService.processApproval(req.params.id, req.user.sub, 'CLARIFY', req.body.remarks);
    res.json({ success: true });
  } catch (e) { next(e); }
};
