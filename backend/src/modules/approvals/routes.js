import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as controller from './controller.js';

const router = Router();

router.use(authenticate);

router.get('/my', controller.getMyApprovals);
router.get('/history', controller.getApprovalHistory);
router.get('/escalated', controller.getEscalatedApprovals);

router.get('/:id', controller.getApprovalById);
router.post('/:id/approve', controller.approve);
router.post('/:id/reject', controller.reject);
router.post('/:id/clarification', controller.clarification);

export default router;
