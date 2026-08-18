import { Router } from 'express';
import * as adminController from './controller.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { ROLES } from '../../shared/constants/roles.js';

const router = Router();

// Only ADMIN can access these routes
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/employees', adminController.getEmployees);
router.post('/employees', adminController.createEmployee);

router.get('/team-leads', adminController.getTeamLeads);
router.get('/managers', adminController.getManagers);

router.get('/mappings', adminController.getMappings);
router.put('/mappings/:employeeId', adminController.updateMapping);

router.get('/locations', adminController.getLocations);
router.post('/locations', adminController.createLocation);
router.put('/locations/:id', adminController.updateLocation);

router.get('/leave-categories', adminController.getLeaveCategories);
router.post('/leave-categories', adminController.createLeaveCategory);
router.put('/leave-categories/:id', adminController.updateLeaveCategory);

router.get('/leave-policies', adminController.getLeavePolicies);
router.post('/leave-policies', adminController.createLeavePolicy);

router.get('/approval-workflows', adminController.getApprovalWorkflows);
router.post('/approval-workflows', adminController.createApprovalWorkflow);

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/stats', adminController.getStats);

export default router;
