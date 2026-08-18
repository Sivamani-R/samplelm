import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  db: {
    user: process.env.POSTGRES_USER || 'nexleave',
    password: process.env.POSTGRES_PASSWORD || 'nexleave_password',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'nexleave_db',
  },
  jwtSecret: process.env.JWT_SECRET || 'super_secret_dev_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
};
