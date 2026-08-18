import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'nexleave',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'nexleave_db',
  password: process.env.POSTGRES_PASSWORD || 'nexleave_password',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
});

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting migrations...');

    // We will execute a single large SQL string for simplicity in MVP, 
    // but ideally, we'd use a migration tool like Umzug or Knex.
    const schemaSql = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS locations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        timezone VARCHAR(50),
        code VARCHAR(20) UNIQUE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password_hash VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        designation VARCHAR(100),
        location_id VARCHAR(50) REFERENCES locations(id),
        joining_date DATE,
        employment_type VARCHAR(50),
        role VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        availability VARCHAR(50) DEFAULT 'AVAILABLE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employee_manager_mappings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        team_lead_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        manager_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id)
      );

      CREATE TABLE IF NOT EXISTS leave_categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        paid BOOLEAN DEFAULT true,
        allow_full_day BOOLEAN DEFAULT true,
        allow_half_day BOOLEAN DEFAULT true,
        allow_hourly BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leave_policies (
        id VARCHAR(100) PRIMARY KEY,
        location_id VARCHAR(50) REFERENCES locations(id),
        category_id VARCHAR(50) REFERENCES leave_categories(id),
        annual_entitlement NUMERIC(5,2) DEFAULT 0,
        monthly_accrual NUMERIC(5,2) DEFAULT 0,
        max_balance NUMERIC(5,2) DEFAULT 0,
        carry_forward_allowed BOOLEAN DEFAULT false,
        carry_forward_limit NUMERIC(5,2) DEFAULT 0,
        expiry_allowed BOOLEAN DEFAULT false,
        expiry_months INT DEFAULT 0,
        min_notice_days INT DEFAULT 0,
        max_continuous_days INT DEFAULT 0,
        allow_hourly BOOLEAN DEFAULT false,
        allow_half_day BOOLEAN DEFAULT false,
        paid BOOLEAN DEFAULT true,
        require_supporting_document BOOLEAN DEFAULT false,
        doc_threshold_days INT DEFAULT 0,
        active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(location_id, category_id)
      );

      CREATE TABLE IF NOT EXISTS approval_workflows (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        min_days NUMERIC(5,2),
        max_days NUMERIC(5,2),
        approvers JSONB NOT NULL, -- Array of roles like ['TEAM_LEAD', 'MANAGER']
        description TEXT,
        active BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS holidays (
        id VARCHAR(50) PRIMARY KEY,
        location_id VARCHAR(50) REFERENCES locations(id),
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        type VARCHAR(50),
        day VARCHAR(20)
      );

      CREATE TABLE IF NOT EXISTS leave_requests (
        id VARCHAR(50) PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES users(id),
        leave_type_id VARCHAR(50) REFERENCES leave_categories(id),
        location_id VARCHAR(50) REFERENCES locations(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        start_session VARCHAR(50),
        end_session VARCHAR(50),
        duration NUMERIC(5,2) NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        current_approver_id VARCHAR(50) REFERENCES users(id),
        attachments JSONB DEFAULT '[]'::jsonb
      );

      CREATE TABLE IF NOT EXISTS approval_instances (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        leave_request_id VARCHAR(50) REFERENCES leave_requests(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        approver_id VARCHAR(50) REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'PENDING',
        remarks TEXT,
        action_date TIMESTAMP,
        step_order INT
      );

      CREATE TABLE IF NOT EXISTS comp_off_requests (
        id VARCHAR(50) PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES users(id),
        worked_date DATE NOT NULL,
        applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hours_worked NUMERIC(5,2),
        comp_off_earned NUMERIC(5,2),
        reason TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        expiry_date DATE
      );

      CREATE TABLE IF NOT EXISTS attendance_regularization (
        id VARCHAR(50) PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES users(id),
        date DATE NOT NULL,
        issue_type VARCHAR(100),
        check_in TIME,
        check_out TIME,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id),
        title VARCHAR(255),
        message TEXT,
        type VARCHAR(50),
        category VARCHAR(50),
        read BOOLEAN DEFAULT false,
        link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        actor_id VARCHAR(50),
        action_type VARCHAR(100),
        target VARCHAR(255),
        details JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS outbox_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(schemaSql);
    console.log('Migrations completed successfully.');

  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    client.release();
    pool.end();
  }
};

runMigrations();
