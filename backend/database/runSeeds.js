import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'nexleave',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'nexleave_db',
  password: process.env.POSTGRES_PASSWORD || 'nexleave_password',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
});

// Seed Data Configuration
const INITIAL_LOCATIONS = [
  { id: 'LOC-CHN', name: 'Chennai Tech Hub', city: 'Chennai', state: 'Tamil Nadu', country: 'India', timezone: 'Asia/Kolkata', code: 'CHN-01' },
  { id: 'LOC-LON', name: 'London EMEA HQ', city: 'London', state: 'Greater London', country: 'United Kingdom', timezone: 'Europe/London', code: 'LON-01' },
  { id: 'LOC-NYC', name: 'New York Americas HQ', city: 'New York', state: 'New York', country: 'United States', timezone: 'America/New_York', code: 'NYC-01' },
  { id: 'LOC-SIN', name: 'Singapore APAC Office', city: 'Singapore', state: 'Central Region', country: 'Singapore', timezone: 'Asia/Singapore', code: 'SIN-01' }
];

const INITIAL_CATEGORIES = [
  { id: 'CAT-PTO', name: 'Paid Time Off (PTO)', code: 'PTO', paid: true, allowFullDay: true, allowHalfDay: true, allowHourly: true, active: true, description: 'Standard vacation' },
  { id: 'CAT-SICK', name: 'Sick & Medical Leave', code: 'SICK', paid: true, allowFullDay: true, allowHalfDay: true, allowHourly: false, active: true, description: 'Medical recovery' },
  { id: 'CAT-CASUAL', name: 'Casual Leave', code: 'CASUAL', paid: true, allowFullDay: true, allowHalfDay: true, allowHourly: false, active: true, description: 'Short-notice leave' },
  { id: 'CAT-UNPAID', name: 'Unpaid Leave (LOP)', code: 'UNPAID', paid: false, allowFullDay: true, allowHalfDay: true, allowHourly: false, active: true, description: 'Loss of Pay' },
  { id: 'CAT-COMP', name: 'Compensatory Off', code: 'COMP', paid: true, allowFullDay: true, allowHalfDay: true, allowHourly: true, active: true, description: 'Compensatory rest' },
  { id: 'CAT-PARENTAL', name: 'Parental & Maternity Leave', code: 'PARENTAL', paid: true, allowFullDay: true, allowHalfDay: false, allowHourly: false, active: true, description: 'Parental leave' }
];

const INITIAL_USERS = [
  { id: 'ADM001', name: 'Devin Vance (Admin)', email: 'admin@enterprise.com', phone: '+1 (555) 019-2831', department: 'Human Resources', designation: 'Director of HR Operations', locationId: 'LOC-CHN', joiningDate: '2022-01-15', employmentType: 'FULL_TIME', role: 'ADMIN' },
  { id: 'MGR001', name: 'Arun Kumar', email: 'arun.k@enterprise.com', phone: '+91 98401 23456', department: 'Engineering', designation: 'Engineering Director', locationId: 'LOC-CHN', joiningDate: '2023-03-01', employmentType: 'FULL_TIME', role: 'MANAGER' },
  { id: 'MGR002', name: 'Sarah Jenkins', email: 'sarah.j@enterprise.com', phone: '+1 (555) 018-9921', department: 'Product & Design', designation: 'Head of Product', locationId: 'LOC-NYC', joiningDate: '2023-04-15', employmentType: 'FULL_TIME', role: 'MANAGER' },
  { id: 'TL001', name: 'Priya Sharma', email: 'priya.s@enterprise.com', phone: '+91 98840 55432', department: 'Engineering', designation: 'Lead Frontend Architect', locationId: 'LOC-CHN', joiningDate: '2023-06-01', employmentType: 'FULL_TIME', role: 'TEAM_LEAD' },
  { id: 'TL002', name: 'David Miller', email: 'david.m@enterprise.com', phone: '+44 20 7946 0912', department: 'Product & Design', designation: 'Staff Product Manager', locationId: 'LOC-LON', joiningDate: '2023-07-15', employmentType: 'FULL_TIME', role: 'TEAM_LEAD' },
  { id: 'EMP001', name: 'John Doe', email: 'john.doe@enterprise.com', phone: '+91 97910 88776', department: 'Engineering', designation: 'Senior Software Engineer', locationId: 'LOC-CHN', joiningDate: '2024-01-10', employmentType: 'FULL_TIME', role: 'EMPLOYEE' },
  { id: 'EMP002', name: 'Anita Rao', email: 'anita.rao@enterprise.com', phone: '+91 98409 11223', department: 'Engineering', designation: 'QA Automation Engineer', locationId: 'LOC-CHN', joiningDate: '2024-02-15', employmentType: 'FULL_TIME', role: 'EMPLOYEE' },
  { id: 'EMP003', name: 'Marcus Chen', email: 'marcus.c@enterprise.com', phone: '+65 6789 0123', department: 'Product & Design', designation: 'Product Designer', locationId: 'LOC-SIN', joiningDate: '2024-03-01', employmentType: 'FULL_TIME', role: 'EMPLOYEE' },
  { id: 'EMP004', name: 'Elena Rostova', email: 'elena.r@enterprise.com', phone: '+44 20 7946 0884', department: 'Engineering', designation: 'DevOps & Cloud Engineer', locationId: 'LOC-LON', joiningDate: '2024-04-01', employmentType: 'FULL_TIME', role: 'EMPLOYEE' }
];

const INITIAL_MAPPINGS = [
  { employeeId: 'EMP001', teamLeadId: 'TL001', managerId: 'MGR001' },
  { employeeId: 'EMP002', teamLeadId: 'TL001', managerId: 'MGR001' },
  { employeeId: 'EMP003', teamLeadId: 'TL002', managerId: 'MGR002' },
  { employeeId: 'EMP004', teamLeadId: null, managerId: 'MGR001' },
  { employeeId: 'TL001', teamLeadId: null, managerId: 'MGR001' },
  { employeeId: 'TL002', teamLeadId: null, managerId: 'MGR002' }
];

const INITIAL_POLICIES = [
  { id: 'POL-LOC-CHN-CAT-PTO', locationId: 'LOC-CHN', categoryId: 'CAT-PTO', annualEntitlement: 24, monthlyAccrual: 2, maxBalance: 30, carryForwardAllowed: true, carryForwardLimit: 5, expiryAllowed: false, expiryMonths: 0, minNoticeDays: 2, maxContinuousDays: 30, allowHourly: true, allowHalfDay: true, paid: true, requireSupportingDocument: false, docThresholdDays: 0 },
  { id: 'POL-LOC-CHN-CAT-SICK', locationId: 'LOC-CHN', categoryId: 'CAT-SICK', annualEntitlement: 12, monthlyAccrual: 1, maxBalance: 15, carryForwardAllowed: false, carryForwardLimit: 0, expiryAllowed: true, expiryMonths: 12, minNoticeDays: 0, maxContinuousDays: 7, allowHourly: false, allowHalfDay: true, paid: true, requireSupportingDocument: true, docThresholdDays: 2 },
  { id: 'POL-LOC-CHN-CAT-CASUAL', locationId: 'LOC-CHN', categoryId: 'CAT-CASUAL', annualEntitlement: 10, monthlyAccrual: 0.83, maxBalance: 12, carryForwardAllowed: false, carryForwardLimit: 0, expiryAllowed: true, expiryMonths: 12, minNoticeDays: 1, maxContinuousDays: 3, allowHourly: false, allowHalfDay: true, paid: true, requireSupportingDocument: false, docThresholdDays: 0 },
  { id: 'POL-LOC-CHN-CAT-COMP', locationId: 'LOC-CHN', categoryId: 'CAT-COMP', annualEntitlement: 0, monthlyAccrual: 0, maxBalance: 10, carryForwardAllowed: false, carryForwardLimit: 0, expiryAllowed: true, expiryMonths: 3, minNoticeDays: 1, maxContinuousDays: 2, allowHourly: true, allowHalfDay: true, paid: true, requireSupportingDocument: false, docThresholdDays: 0 },
  { id: 'POL-LOC-LON-CAT-PTO', locationId: 'LOC-LON', categoryId: 'CAT-PTO', annualEntitlement: 28, monthlyAccrual: 2.33, maxBalance: 35, carryForwardAllowed: true, carryForwardLimit: 8, expiryAllowed: true, expiryMonths: 18, minNoticeDays: 3, maxContinuousDays: 25, allowHourly: true, allowHalfDay: true, paid: true, requireSupportingDocument: false, docThresholdDays: 0 },
  { id: 'POL-LOC-NYC-CAT-PTO', locationId: 'LOC-NYC', categoryId: 'CAT-PTO', annualEntitlement: 20, monthlyAccrual: 1.66, maxBalance: 25, carryForwardAllowed: true, carryForwardLimit: 5, expiryAllowed: true, expiryMonths: 12, minNoticeDays: 2, maxContinuousDays: 20, allowHourly: true, allowHalfDay: true, paid: true, requireSupportingDocument: false, docThresholdDays: 0 }
];

const INITIAL_WORKFLOWS = [
  { id: 'WF-TIER-1', name: 'Micro Duration (Hourly & Half-Day)', minDays: 0, maxDays: 0.5, approvers: ['TEAM_LEAD'], description: 'Leaves under 4 hours' },
  { id: 'WF-TIER-2', name: 'Short Duration (1 to 2 Days)', minDays: 1, maxDays: 2, approvers: ['TEAM_LEAD', 'MANAGER'], description: 'Short leave' },
  { id: 'WF-TIER-3', name: 'Standard Duration (3 to 15 Days)', minDays: 3, maxDays: 15, approvers: ['TEAM_LEAD', 'MANAGER'], description: 'Standard leave' },
  { id: 'WF-TIER-4', name: 'Extended Duration (16 to 30 Days)', minDays: 16, maxDays: 30, approvers: ['MANAGER', 'ADMIN'], description: 'Extended leaves' }
];

const INITIAL_HOLIDAYS = [
  { id: 'HOL-CHN-01', locationId: 'LOC-CHN', name: 'Pongal Harvest Festival', date: '2026-01-15', type: 'Mandatory', day: 'Thursday' },
  { id: 'HOL-CHN-02', locationId: 'LOC-CHN', name: 'Thiruvalluvar Day', date: '2026-01-16', type: 'Mandatory', day: 'Friday' },
  { id: 'HOL-CHN-03', locationId: 'LOC-CHN', name: 'Republic Day', date: '2026-01-26', type: 'National', day: 'Monday' },
  { id: 'HOL-CHN-04', locationId: 'LOC-CHN', name: 'Tamil New Year', date: '2026-04-14', type: 'Regional', day: 'Tuesday' },
  { id: 'HOL-CHN-05', locationId: 'LOC-CHN', name: 'May Day / Labour Day', date: '2026-05-01', type: 'National', day: 'Friday' },
  { id: 'HOL-CHN-06', locationId: 'LOC-CHN', name: 'Independence Day', date: '2026-08-15', type: 'National', day: 'Saturday' },
  { id: 'HOL-CHN-07', locationId: 'LOC-CHN', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'National', day: 'Friday' },
  { id: 'HOL-CHN-08', locationId: 'LOC-CHN', name: 'Diwali Festival of Lights', date: '2026-10-20', type: 'Mandatory', day: 'Tuesday' },
  { id: 'HOL-CHN-09', locationId: 'LOC-CHN', name: 'Christmas Day', date: '2026-12-25', type: 'National', day: 'Friday' }
];

const runSeeds = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Clearing existing data...');
    await client.query('DELETE FROM outbox_events; DELETE FROM audit_logs; DELETE FROM notifications; DELETE FROM attendance_regularization; DELETE FROM comp_off_requests; DELETE FROM approval_instances; DELETE FROM leave_requests; DELETE FROM holidays; DELETE FROM approval_workflows; DELETE FROM leave_policies; DELETE FROM leave_categories; DELETE FROM employee_manager_mappings; DELETE FROM users; DELETE FROM locations;');

    console.log('Seeding locations...');
    for (const loc of INITIAL_LOCATIONS) {
      await client.query('INSERT INTO locations (id, name, city, state, country, timezone, code) VALUES ($1, $2, $3, $4, $5, $6, $7)', [loc.id, loc.name, loc.city, loc.state, loc.country, loc.timezone, loc.code]);
    }

    console.log('Seeding categories...');
    for (const cat of INITIAL_CATEGORIES) {
      await client.query('INSERT INTO leave_categories (id, name, code, paid, allow_full_day, allow_half_day, allow_hourly, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [cat.id, cat.name, cat.code, cat.paid, cat.allowFullDay, cat.allowHalfDay, cat.allowHourly, cat.description]);
    }

    console.log('Seeding users...');
    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    for (const user of INITIAL_USERS) {
      await client.query(`
        INSERT INTO users (id, name, email, phone, password_hash, department, designation, location_id, joining_date, employment_type, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [user.id, user.name, user.email, user.phone, defaultPasswordHash, user.department, user.designation, user.locationId, user.joiningDate, user.employmentType, user.role]);
    }

    console.log('Seeding mappings...');
    for (const map of INITIAL_MAPPINGS) {
      await client.query('INSERT INTO employee_manager_mappings (employee_id, team_lead_id, manager_id) VALUES ($1, $2, $3)', [map.employeeId, map.teamLeadId, map.managerId]);
    }

    console.log('Seeding policies...');
    for (const pol of INITIAL_POLICIES) {
      await client.query(`
        INSERT INTO leave_policies (id, location_id, category_id, annual_entitlement, monthly_accrual, max_balance, carry_forward_allowed, carry_forward_limit, expiry_allowed, expiry_months, min_notice_days, max_continuous_days, allow_hourly, allow_half_day, paid, require_supporting_document, doc_threshold_days)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [pol.id, pol.locationId, pol.categoryId, pol.annualEntitlement, pol.monthlyAccrual, pol.maxBalance, pol.carryForwardAllowed, pol.carryForwardLimit, pol.expiryAllowed, pol.expiryMonths, pol.minNoticeDays, pol.maxContinuousDays, pol.allowHourly, pol.allowHalfDay, pol.paid, pol.requireSupportingDocument, pol.docThresholdDays]);
    }

    console.log('Seeding workflows...');
    for (const wf of INITIAL_WORKFLOWS) {
      await client.query('INSERT INTO approval_workflows (id, name, min_days, max_days, approvers, description) VALUES ($1, $2, $3, $4, $5, $6)', [wf.id, wf.name, wf.minDays, wf.maxDays, JSON.stringify(wf.approvers), wf.description]);
    }

    console.log('Seeding holidays...');
    for (const hol of INITIAL_HOLIDAYS) {
      await client.query('INSERT INTO holidays (id, location_id, name, date, type, day) VALUES ($1, $2, $3, $4, $5, $6)', [hol.id, hol.locationId, hol.name, hol.date, hol.type, hol.day]);
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', err);
  } finally {
    client.release();
    pool.end();
  }
};

runSeeds();
