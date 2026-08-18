import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as controller from './controller.js';

const router = Router();
router.use(authenticate);

router.get('/members', controller.getMembers);
router.get('/availability', controller.getAvailability);
router.get('/calendar', controller.getCalendar);
router.get('/overview', controller.getOverview);

export default router;
