import { Router } from 'express';
import * as authController from './controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
