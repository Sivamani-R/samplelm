import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const { Pool } = pg;
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'nexleave',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'nexleave_db',
  password: process.env.POSTGRES_PASSWORD || 'nexleave_password',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
});

const runAlters = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting ALTER TABLE migrations...');
    await client.query(`
      ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false;
      ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP;
      ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS escalation_reason TEXT;
      ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS escalation_deadline TIMESTAMP;
      ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE approval_instances ADD COLUMN IF NOT EXISTS deadline TIMESTAMP;
      ALTER TABLE approval_instances ADD COLUMN IF NOT EXISTS timeout_days INT;
      ALTER TABLE approval_instances ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP;
      ALTER TABLE approval_instances ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('ALTER TABLE migrations completed successfully.');
  } catch (error) {
    console.error('Error running ALTER TABLE migrations:', error);
  } finally {
    client.release();
    pool.end();
  }
};

runAlters();
