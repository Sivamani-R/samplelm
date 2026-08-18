import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './shared/middleware/errorHandler.js';

import { toCamelCase } from './shared/utils/serializer.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Auto camelCase response serializer middleware
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    return originalJson(toCamelCase(data));
  };
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'NexLeave Enterprise API is running' });
});

// API Routes
import authRoutes from './modules/auth/routes.js';
import adminRoutes from './modules/admin/routes.js';
import employeeRoutes from './modules/employees/routes.js';
import leavesRoutes from './modules/leaves/routes.js';
import approvalsRoutes from './modules/approvals/routes.js';
import teamRoutes from './modules/team/routes.js';
import notificationsRoutes from './modules/notifications/routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee/leaves', leavesRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationsRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
