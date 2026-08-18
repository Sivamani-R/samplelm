import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import * as dashboardController from './dashboard/controller.js';
import * as holidaysController from './holidays/controller.js';
import * as compOffController from './compOff/controller.js';
import * as attendanceController from './attendance/controller.js';
import * as balancesController from './balances/controller.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', dashboardController.getDashboard);

router.get('/holidays', holidaysController.getHolidays);

router.get('/comp-off', compOffController.getCompOffs);
router.post('/comp-off', compOffController.applyCompOff);

router.get('/attendance', attendanceController.getAttendance);
router.post('/attendance/regularize', attendanceController.regularizeAttendance);

router.get('/leave-balances', balancesController.getBalances);

export default router;
