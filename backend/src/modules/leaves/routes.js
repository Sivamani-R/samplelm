import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as leaveController from './controller.js';

const router = Router();

router.use(authenticate);

router.get('/', leaveController.getLeaves);
router.post('/', leaveController.applyLeave);
router.post('/calculate-duration', leaveController.calculateDuration);
router.post('/check-overlap', leaveController.checkOverlap);
router.post('/:id/withdraw', leaveController.withdrawLeave);
router.post('/:id/cancel', leaveController.cancelLeave);

export default router;
