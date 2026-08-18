import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../errors/ApiError.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid token'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // { sub: 'EMP001', role: 'EMPLOYEE', ... }
    next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};
