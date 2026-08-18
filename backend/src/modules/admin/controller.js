import { adminService } from './service.js';

export const getEmployees = async (req, res, next) => {
  try { res.json(await adminService.getEmployees()); } catch (error) { next(error); }
};

export const createEmployee = async (req, res, next) => {
  try { res.json(await adminService.createEmployee(req.body, req.user.sub)); } catch (error) { next(error); }
};

export const getTeamLeads = async (req, res, next) => {
  try { res.json(await adminService.getTeamLeads()); } catch (error) { next(error); }
};

export const getManagers = async (req, res, next) => {
  try { res.json(await adminService.getManagers()); } catch (error) { next(error); }
};

export const getMappings = async (req, res, next) => {
  try { res.json(await adminService.getMappings()); } catch (error) { next(error); }
};

export const updateMapping = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    res.json(await adminService.updateMapping(employeeId, req.body, req.user.sub));
  } catch (error) { next(error); }
};

export const getLocations = async (req, res, next) => {
  try { res.json(await adminService.getLocations()); } catch (error) { next(error); }
};

export const createLocation = async (req, res, next) => {
  try { res.json(await adminService.createLocation(req.body, req.user.sub)); } catch (error) { next(error); }
};

export const updateLocation = async (req, res, next) => {
  try { res.json(await adminService.updateLocation(req.params.id, req.body, req.user.sub)); } catch (error) { next(error); }
};

export const getLeaveCategories = async (req, res, next) => {
  try { res.json(await adminService.getLeaveCategories()); } catch (error) { next(error); }
};

export const createLeaveCategory = async (req, res, next) => {
  try { res.json(await adminService.createLeaveCategory(req.body, req.user.sub)); } catch (error) { next(error); }
};

export const updateLeaveCategory = async (req, res, next) => {
  try { res.json(await adminService.updateLeaveCategory(req.params.id, req.body, req.user.sub)); } catch (error) { next(error); }
};

export const getLeavePolicies = async (req, res, next) => {
  try { res.json(await adminService.getLeavePolicies()); } catch (error) { next(error); }
};

export const createLeavePolicy = async (req, res, next) => {
  try { res.json(await adminService.saveLeavePolicy(req.body, req.user.sub)); } catch (error) { next(error); }
};

export const getApprovalWorkflows = async (req, res, next) => {
  try { res.json(await adminService.getApprovalWorkflows()); } catch (error) { next(error); }
};

export const createApprovalWorkflow = async (req, res, next) => {
  try { res.json(await adminService.saveApprovalWorkflow(req.body, req.user.sub)); } catch (error) { next(error); }
};

export const getAuditLogs = async (req, res, next) => {
  try { res.json(await adminService.getAuditLogs()); } catch (error) { next(error); }
};

export const getStats = async (req, res, next) => {
  try { res.json(await adminService.getStats()); } catch (error) { next(error); }
};
