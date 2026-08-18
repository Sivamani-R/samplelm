import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as controller from './controller.js';

const router = Router();
router.use(authenticate);

router.get('/', controller.getNotifications);
router.put('/:id/read', controller.markRead);
router.post('/mark-all-read', controller.markAllRead);

export default router;
