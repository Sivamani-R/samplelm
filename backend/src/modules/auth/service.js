import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../shared/database/index.js';
import { config } from '../../config/env.js';
import { UnauthorizedError } from '../../shared/errors/ApiError.js';

export class AuthService {
  async login(email, password) {
    const { rows } = await query(`
      SELECT u.*, l.name as location_name
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.email = $1
    `, [email]);

    if (rows.length === 0) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = rows[0];
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: user.department,
        designation: user.designation,
        location: user.location_name || user.location_id,
        locationId: user.location_id,
        joiningDate: user.joining_date,
        employmentType: user.employment_type,
        role: user.role,
        status: user.status,
        availability: user.availability
      }
    };
  }

  async getProfile(userId) {
    const { rows } = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.department, u.designation,
             u.location_id as "locationId", l.name as "location",
             u.joining_date as "joiningDate", u.employment_type as "employmentType",
             u.role, u.status, u.availability
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.id = $1
    `, [userId]);

    if (rows.length === 0) {
      throw new UnauthorizedError('User not found');
    }
    return rows[0];
  }
}

export const authService = new AuthService();
