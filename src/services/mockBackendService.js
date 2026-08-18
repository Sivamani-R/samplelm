/**
 * Mock Enterprise Backend Database & Service
 * 
 * Simulates a real REST API backend with full relational persistence in LocalStorage.
 * Handles JWT token generation, password checks, duplicate validations,
 * mapping relationships, location policies, approval workflow routing,
 * dynamic leave duration & balance calculations, holidays, comp-off,
 * attendance regularization, audit logging, multi-tier team approvals,
 * SLA & escalation engine, team availability, and notification center.
 */

import { ROLES } from '../constants/roles.js';
import { EMPLOYMENT_TYPES } from '../constants/employmentTypes.js';

const STORAGE_KEYS = {
  USERS: 'nexleave_db_users',
  LOCATIONS: 'nexleave_db_locations',
  CATEGORIES: 'nexleave_db_categories',
  POLICIES: 'nexleave_db_policies',
  MAPPINGS: 'nexleave_db_mappings',
  WORKFLOWS: 'nexleave_db_workflows',
  AUDIT: 'nexleave_db_audit',
  LEAVES: 'nexleave_db_leaves',
  HOLIDAYS: 'nexleave_db_holidays',
  COMPOFF: 'nexleave_db_compoff',
  ATTENDANCE: 'nexleave_db_attendance',
  NOTIFICATIONS: 'nexleave_db_notifications'
};

// Initial Enterprise Seed Data
const INITIAL_LOCATIONS = [
  {
    id: 'LOC-CHN',
    name: 'Chennai Tech Hub',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    timezone: 'Asia/Kolkata',
    code: 'CHN-01',
    createdAt: '2026-01-10T09:00:00Z',
    active: true
  },
  {
    id: 'LOC-LON',
    name: 'London EMEA HQ',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    code: 'LON-01',
    createdAt: '2026-01-12T09:00:00Z',
    active: true
  },
  {
    id: 'LOC-NYC',
    name: 'New York Americas HQ',
    city: 'New York',
    state: 'New York',
    country: 'United States',
    timezone: 'America/New_York',
    code: 'NYC-01',
    createdAt: '2026-01-15T09:00:00Z',
    active: true
  },
  {
    id: 'LOC-SIN',
    name: 'Singapore APAC Office',
    city: 'Singapore',
    state: 'Central Region',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    code: 'SIN-01',
    createdAt: '2026-02-01T09:00:00Z',
    active: true
  }
];

const INITIAL_CATEGORIES = [
  {
    id: 'CAT-PTO',
    name: 'Paid Time Off (PTO)',
    code: 'PTO',
    paid: true,
    allowFullDay: true,
    allowHalfDay: true,
    allowHourly: true,
    active: true,
    description: 'Standard vacation and planned personal leave days.'
  },
  {
    id: 'CAT-SICK',
    name: 'Sick & Medical Leave',
    code: 'SICK',
    paid: true,
    allowFullDay: true,
    allowHalfDay: true,
    allowHourly: false,
    active: true,
    description: 'Leave for medical recovery, illnesses, and healthcare consultations.'
  },
  {
    id: 'CAT-CASUAL',
    name: 'Casual Leave',
    code: 'CASUAL',
    paid: true,
    allowFullDay: true,
    allowHalfDay: true,
    allowHourly: false,
    active: true,
    description: 'Short-notice leave for urgent unforeseen personal matters.'
  },
  {
    id: 'CAT-UNPAID',
    name: 'Unpaid Leave (LOP)',
    code: 'UNPAID',
    paid: false,
    allowFullDay: true,
    allowHalfDay: true,
    allowHourly: false,
    active: true,
    description: 'Loss of Pay leave taken when all eligible paid balances are exhausted.'
  },
  {
    id: 'CAT-COMP',
    name: 'Compensatory Off',
    code: 'COMP',
    paid: true,
    allowFullDay: true,
    allowHalfDay: true,
    allowHourly: true,
    active: true,
    description: 'Compensatory rest credited for authorized weekend or holiday overtime.'
  },
  {
    id: 'CAT-PARENTAL',
    name: 'Parental & Maternity Leave',
    code: 'PARENTAL',
    paid: true,
    allowFullDay: true,
    allowHalfDay: false,
    allowHourly: false,
    active: true,
    description: 'Statutory maternity, paternity, and adoption leave.'
  }
];

const INITIAL_USERS = [
  {
    id: 'ADM001',
    name: 'Devin Vance (Admin)',
    email: 'admin@enterprise.com',
    phone: '+1 (555) 019-2831',
    department: 'Human Resources',
    designation: 'Director of HR Operations',
    locationId: 'LOC-CHN',
    joiningDate: '2022-01-15',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.ADMIN,
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    createdAt: '2022-01-15T08:00:00Z'
  },
  {
    id: 'MGR001',
    name: 'Arun Kumar',
    email: 'arun.k@enterprise.com',
    phone: '+91 98401 23456',
    department: 'Engineering',
    designation: 'Engineering Director',
    locationId: 'LOC-CHN',
    joiningDate: '2023-03-01',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.MANAGER,
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    createdAt: '2023-03-01T08:00:00Z'
  },
  {
    id: 'MGR002',
    name: 'Sarah Jenkins',
    email: 'sarah.j@enterprise.com',
    phone: '+1 (555) 018-9921',
    department: 'Product & Design',
    designation: 'Head of Product',
    locationId: 'LOC-NYC',
    joiningDate: '2023-04-15',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.MANAGER,
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    createdAt: '2023-04-15T08:00:00Z'
  },
  {
    id: 'TL001',
    name: 'Priya Sharma',
    email: 'priya.s@enterprise.com',
    phone: '+91 98840 55432',
    department: 'Engineering',
    designation: 'Lead Frontend Architect',
    locationId: 'LOC-CHN',
    joiningDate: '2023-06-01',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.TEAM_LEAD,
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    createdAt: '2023-06-01T08:00:00Z'
  },
  {
    id: 'TL002',
    name: 'David Miller',
    email: 'david.m@enterprise.com',
    phone: '+44 20 7946 0912',
    department: 'Product & Design',
    designation: 'Staff Product Manager',
    locationId: 'LOC-LON',
    joiningDate: '2023-07-15',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.TEAM_LEAD,
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    createdAt: '2023-07-15T08:00:00Z'
  },
  {
    id: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@enterprise.com',
    phone: '+91 97910 88776',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    locationId: 'LOC-CHN',
    joiningDate: '2024-01-10',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.EMPLOYEE,
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'EMP002',
    name: 'Anita Rao',
    email: 'anita.rao@enterprise.com',
    phone: '+91 98409 11223',
    department: 'Engineering',
    designation: 'QA Automation Engineer',
    locationId: 'LOC-CHN',
    joiningDate: '2024-02-15',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.EMPLOYEE,
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    createdAt: '2024-02-15T08:00:00Z'
  },
  {
    id: 'EMP003',
    name: 'Marcus Chen',
    email: 'marcus.c@enterprise.com',
    phone: '+65 6789 0123',
    department: 'Product & Design',
    designation: 'Product Designer',
    locationId: 'LOC-SIN',
    joiningDate: '2024-03-01',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.EMPLOYEE,
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    createdAt: '2024-03-01T08:00:00Z'
  },
  {
    id: 'EMP004',
    name: 'Elena Rostova',
    email: 'elena.r@enterprise.com',
    phone: '+44 20 7946 0884',
    department: 'Engineering',
    designation: 'DevOps & Cloud Engineer',
    locationId: 'LOC-LON',
    joiningDate: '2024-04-01',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    role: ROLES.EMPLOYEE,
    status: 'ACTIVE',
    availability: 'AVAILABLE',
    createdAt: '2024-04-01T08:00:00Z'
  }
];

const INITIAL_MAPPINGS = [
  {
    employeeId: 'EMP001',
    teamLeadId: 'TL001',
    managerId: 'MGR001',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    employeeId: 'EMP002',
    teamLeadId: 'TL001',
    managerId: 'MGR001',
    updatedAt: '2024-02-15T10:00:00Z'
  },
  {
    employeeId: 'EMP003',
    teamLeadId: 'TL002',
    managerId: 'MGR002',
    updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    employeeId: 'EMP004',
    teamLeadId: null,
    managerId: 'MGR001',
    updatedAt: '2024-04-01T10:00:00Z'
  },
  {
    employeeId: 'TL001',
    teamLeadId: null,
    managerId: 'MGR001',
    updatedAt: '2023-06-01T10:00:00Z'
  },
  {
    employeeId: 'TL002',
    teamLeadId: null,
    managerId: 'MGR002',
    updatedAt: '2023-07-15T10:00:00Z'
  }
];

const INITIAL_POLICIES = [
  {
    id: 'POL-LOC-CHN-CAT-PTO',
    locationId: 'LOC-CHN',
    categoryId: 'CAT-PTO',
    annualEntitlement: 24,
    monthlyAccrual: 2,
    maxBalance: 30,
    carryForwardAllowed: true,
    carryForwardLimit: 5,
    expiryAllowed: false,
    expiryMonths: 0,
    minNoticeDays: 2,
    maxContinuousDays: 30,
    allowHourly: true,
    allowHalfDay: true,
    paid: true,
    requireSupportingDocument: false,
    docThresholdDays: 0,
    active: true,
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'POL-LOC-CHN-CAT-SICK',
    locationId: 'LOC-CHN',
    categoryId: 'CAT-SICK',
    annualEntitlement: 12,
    monthlyAccrual: 1,
    maxBalance: 15,
    carryForwardAllowed: false,
    carryForwardLimit: 0,
    expiryAllowed: true,
    expiryMonths: 12,
    minNoticeDays: 0,
    maxContinuousDays: 7,
    allowHourly: false,
    allowHalfDay: true,
    paid: true,
    requireSupportingDocument: true,
    docThresholdDays: 2,
    active: true,
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'POL-LOC-CHN-CAT-CASUAL',
    locationId: 'LOC-CHN',
    categoryId: 'CAT-CASUAL',
    annualEntitlement: 10,
    monthlyAccrual: 0.83,
    maxBalance: 12,
    carryForwardAllowed: false,
    carryForwardLimit: 0,
    expiryAllowed: true,
    expiryMonths: 12,
    minNoticeDays: 1,
    maxContinuousDays: 3,
    allowHourly: false,
    allowHalfDay: true,
    paid: true,
    requireSupportingDocument: false,
    docThresholdDays: 0,
    active: true,
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'POL-LOC-CHN-CAT-COMP',
    locationId: 'LOC-CHN',
    categoryId: 'CAT-COMP',
    annualEntitlement: 0,
    monthlyAccrual: 0,
    maxBalance: 10,
    carryForwardAllowed: false,
    carryForwardLimit: 0,
    expiryAllowed: true,
    expiryMonths: 3,
    minNoticeDays: 1,
    maxContinuousDays: 2,
    allowHourly: true,
    allowHalfDay: true,
    paid: true,
    requireSupportingDocument: false,
    docThresholdDays: 0,
    active: true,
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'POL-LOC-LON-CAT-PTO',
    locationId: 'LOC-LON',
    categoryId: 'CAT-PTO',
    annualEntitlement: 28,
    monthlyAccrual: 2.33,
    maxBalance: 35,
    carryForwardAllowed: true,
    carryForwardLimit: 8,
    expiryAllowed: true,
    expiryMonths: 18,
    minNoticeDays: 3,
    maxContinuousDays: 25,
    allowHourly: true,
    allowHalfDay: true,
    paid: true,
    requireSupportingDocument: false,
    docThresholdDays: 0,
    active: true,
    updatedAt: '2026-01-12T10:00:00Z'
  },
  {
    id: 'POL-LOC-NYC-CAT-PTO',
    locationId: 'LOC-NYC',
    categoryId: 'CAT-PTO',
    annualEntitlement: 20,
    monthlyAccrual: 1.66,
    maxBalance: 25,
    carryForwardAllowed: true,
    carryForwardLimit: 5,
    expiryAllowed: true,
    expiryMonths: 12,
    minNoticeDays: 2,
    maxContinuousDays: 20,
    allowHourly: true,
    allowHalfDay: true,
    paid: true,
    requireSupportingDocument: false,
    docThresholdDays: 0,
    active: true,
    updatedAt: '2026-01-15T10:00:00Z'
  }
];

const INITIAL_WORKFLOWS = [
  {
    id: 'WF-TIER-1',
    name: 'Micro Duration (Hourly & Half-Day)',
    minDays: 0,
    maxDays: 0.5,
    approvers: [ROLES.TEAM_LEAD],
    description: 'Leaves under 4 hours approved directly by Team Lead.',
    active: true
  },
  {
    id: 'WF-TIER-2',
    name: 'Short Duration (1 to 2 Days)',
    minDays: 1,
    maxDays: 2,
    approvers: [ROLES.TEAM_LEAD, ROLES.MANAGER],
    description: 'Requires Team Lead recommendation followed by Manager sign-off.',
    active: true
  },
  {
    id: 'WF-TIER-3',
    name: 'Standard Duration (3 to 15 Days)',
    minDays: 3,
    maxDays: 15,
    approvers: [ROLES.TEAM_LEAD, ROLES.MANAGER],
    description: 'Team Lead review with final Manager approval for standard leave.',
    active: true
  },
  {
    id: 'WF-TIER-4',
    name: 'Extended Duration (16 to 30 Days)',
    minDays: 16,
    maxDays: 30,
    approvers: [ROLES.MANAGER, ROLES.ADMIN],
    description: 'Manager approval with HR/Admin review for extended leaves.',
    active: true
  }
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

const INITIAL_LEAVES = [
  {
    id: 'LR-2026-001',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    department: 'Engineering',
    locationId: 'LOC-CHN',
    leaveTypeId: 'CAT-PTO',
    leaveTypeName: 'Paid Time Off (PTO)',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    duration: 3,
    reason: 'Family summer vacation and travel.',
    status: 'APPROVED',
    appliedDate: '2026-05-20T10:00:00Z',
    approvalChain: [
      { role: ROLES.TEAM_LEAD, approverId: 'TL001', approverName: 'Priya Sharma', status: 'APPROVED', date: '2026-05-21T11:00:00Z', remarks: 'Recommended' },
      { role: ROLES.MANAGER, approverId: 'MGR001', approverName: 'Arun Kumar', status: 'APPROVED', date: '2026-05-22T09:30:00Z', remarks: 'Approved' }
    ],
    currentApprover: null,
    attachments: []
  },
  {
    id: 'LR-2026-002',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    department: 'Engineering',
    locationId: 'LOC-CHN',
    leaveTypeId: 'CAT-SICK',
    leaveTypeName: 'Sick & Medical Leave',
    startDate: '2026-07-02',
    endDate: '2026-07-03',
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    duration: 2,
    reason: 'Viral fever and prescribed medical rest.',
    status: 'APPROVED',
    appliedDate: '2026-07-02T08:15:00Z',
    approvalChain: [
      { role: ROLES.TEAM_LEAD, approverId: 'TL001', approverName: 'Priya Sharma', status: 'APPROVED', date: '2026-07-02T10:00:00Z', remarks: 'Medical doc verified' }
    ],
    currentApprover: null,
    attachments: [{ name: 'medical_prescription.pdf', size: '142 KB' }]
  },
  {
    id: 'LR-2026-003',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    department: 'Engineering',
    locationId: 'LOC-CHN',
    leaveTypeId: 'CAT-PTO',
    leaveTypeName: 'Paid Time Off (PTO)',
    startDate: '2026-08-26',
    endDate: '2026-08-28',
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    duration: 3,
    reason: 'Attending family wedding and festivities.',
    status: 'PENDING',
    appliedDate: '2026-08-18T09:00:00Z',
    approvalChain: [
      { role: ROLES.TEAM_LEAD, approverId: 'TL001', approverName: 'Priya Sharma', status: 'PENDING', date: null, remarks: null },
      { role: ROLES.MANAGER, approverId: 'MGR001', approverName: 'Arun Kumar', status: 'NOT_STARTED', date: null, remarks: null }
    ],
    currentApprover: { id: 'TL001', name: 'Priya Sharma', role: ROLES.TEAM_LEAD },
    attachments: []
  },
  {
    id: 'LR-2026-005',
    employeeId: 'EMP002',
    employeeName: 'Anita Rao',
    department: 'Engineering',
    locationId: 'LOC-CHN',
    leaveTypeId: 'CAT-CASUAL',
    leaveTypeName: 'Casual Leave',
    startDate: '2026-08-20',
    endDate: '2026-08-21',
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    duration: 2,
    reason: 'Urgent home renovation inspection.',
    status: 'PENDING',
    appliedDate: '2026-08-15T10:00:00Z', // >48h ago -> Overdue / Escalated
    approvalChain: [
      { role: ROLES.TEAM_LEAD, approverId: 'TL001', approverName: 'Priya Sharma', status: 'PENDING', date: null, remarks: null },
      { role: ROLES.MANAGER, approverId: 'MGR001', approverName: 'Arun Kumar', status: 'NOT_STARTED', date: null, remarks: null }
    ],
    currentApprover: { id: 'TL001', name: 'Priya Sharma', role: ROLES.TEAM_LEAD },
    attachments: []
  },
  {
    id: 'LR-2026-006',
    employeeId: 'EMP004',
    employeeName: 'Elena Rostova',
    department: 'Engineering',
    locationId: 'LOC-LON',
    leaveTypeId: 'CAT-PTO',
    leaveTypeName: 'Paid Time Off (PTO)',
    startDate: '2026-08-24',
    endDate: '2026-08-28',
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    duration: 5,
    reason: 'Summer break and hiking trip.',
    status: 'PENDING',
    appliedDate: '2026-08-17T14:00:00Z',
    approvalChain: [
      { role: ROLES.MANAGER, approverId: 'MGR001', approverName: 'Arun Kumar', status: 'PENDING', date: null, remarks: null }
    ],
    currentApprover: { id: 'MGR001', name: 'Arun Kumar', role: ROLES.MANAGER },
    attachments: []
  }
];

const INITIAL_COMPOFF = [
  {
    id: 'CO-001',
    employeeId: 'EMP001',
    workedDate: '2026-08-01',
    appliedDate: '2026-08-03',
    hoursWorked: 8,
    compOffEarned: 1.0,
    reason: 'Emergency database migration and deployment support.',
    status: 'APPROVED',
    expiryDate: '2026-11-01'
  },
  {
    id: 'CO-002',
    employeeId: 'EMP001',
    workedDate: '2026-08-15',
    appliedDate: '2026-08-16',
    hoursWorked: 8,
    compOffEarned: 1.0,
    reason: 'Production cloud incident monitoring during holiday.',
    status: 'PENDING',
    expiryDate: '2026-11-15'
  }
];

const INITIAL_ATTENDANCE = [
  {
    id: 'ATT-001',
    employeeId: 'EMP001',
    date: '2026-08-12',
    issueType: 'MISSING_PUNCH',
    checkIn: '09:15',
    checkOut: '18:00',
    reason: 'Biometric fingerprint reader was offline in morning.',
    status: 'PENDING',
    appliedDate: '2026-08-12T18:30:00Z'
  },
  {
    id: 'ATT-002',
    employeeId: 'EMP001',
    date: '2026-07-20',
    issueType: 'WORK_FROM_HOME',
    checkIn: '09:00',
    checkOut: '17:45',
    reason: 'Scheduled broadband installation at residence.',
    status: 'APPROVED',
    appliedDate: '2026-07-19T16:00:00Z'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    userId: 'TL001',
    title: 'New Leave Request',
    message: 'John Doe submitted a 3-day PTO request for Aug 26 - Aug 28.',
    type: 'LEAVE_SUBMITTED',
    category: 'APPROVAL',
    read: false,
    link: '/team-lead/approvals',
    createdAt: '2026-08-18T09:00:00Z'
  },
  {
    id: 'NOTIF-002',
    userId: 'TL001',
    title: 'SLA Overdue Warning',
    message: 'Leave request LR-2026-005 from Anita Rao has exceeded the 48-hour SLA.',
    type: 'APPROVAL_OVERDUE',
    category: 'ESCALATION',
    read: false,
    link: '/team-lead/approvals',
    createdAt: '2026-08-17T11:00:00Z'
  },
  {
    id: 'NOTIF-003',
    userId: 'MGR001',
    title: 'Escalated Leave Request',
    message: 'Leave request LR-2026-005 from Anita Rao has been escalated to you due to SLA expiry.',
    type: 'LEAVE_ESCALATED',
    category: 'ESCALATION',
    read: false,
    link: '/manager/escalated',
    createdAt: '2026-08-17T11:05:00Z'
  },
  {
    id: 'NOTIF-004',
    userId: 'MGR001',
    title: 'Manager Approval Required',
    message: 'Elena Rostova submitted a 5-day PTO request for Aug 24 - Aug 28.',
    type: 'LEAVE_SUBMITTED',
    category: 'APPROVAL',
    read: false,
    link: '/manager/approvals',
    createdAt: '2026-08-17T14:00:00Z'
  },
  {
    id: 'NOTIF-005',
    userId: 'EMP001',
    title: 'Leave Approved',
    message: 'Your Sick Leave request for Jul 02 - Jul 03 was approved by Priya Sharma.',
    type: 'LEAVE_APPROVED',
    category: 'LEAVE',
    read: true,
    link: '/employee/leave-history',
    createdAt: '2026-07-02T10:00:00Z'
  }
];

// In-Memory / LocalStorage Engine
class MockDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POLICIES)) {
      localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(INITIAL_POLICIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MAPPINGS)) {
      localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(INITIAL_MAPPINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WORKFLOWS)) {
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(INITIAL_WORKFLOWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOLIDAYS)) {
      localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(INITIAL_HOLIDAYS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEAVES)) {
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPOFF)) {
      localStorage.setItem(STORAGE_KEYS.COMPOFF, JSON.stringify(INITIAL_COMPOFF));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }

  get(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  logAudit(actor, actionType, target, details) {
    const logs = this.get(STORAGE_KEYS.AUDIT);
    const newLog = {
      id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      actorId: actor?.id || 'SYSTEM',
      actorName: actor?.name || 'System Admin',
      actionType,
      target,
      details
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.AUDIT, logs.slice(0, 100));
  }

  pushNotification({ userId, title, message, type, category = 'LEAVE', link = '' }) {
    const notifications = this.get(STORAGE_KEYS.NOTIFICATIONS);
    const newNotif = {
      id: `NOTIF-${Date.now().toString(36).toUpperCase()}`,
      userId,
      title,
      message,
      type,
      category,
      read: false,
      link,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications.slice(0, 50));
    return newNotif;
  }
}

const db = new MockDatabase();
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const mockBackendService = {
  // 1. Authentication
  async login({ username, password }) {
    await delay(250);
    const users = db.get(STORAGE_KEYS.USERS);
    const cleanId = username?.trim().toLowerCase();

    const matchedUser = users.find(u => 
      u.id.toLowerCase() === cleanId || 
      u.email.toLowerCase() === cleanId
    );

    if (!matchedUser) {
      const error = new Error('Invalid Employee ID / Email or Password');
      error.status = 401;
      throw error;
    }

    if (!password || password.trim().length < 4) {
      const error = new Error('Password must be at least 4 characters');
      error.status = 401;
      throw error;
    }

    const locations = db.get(STORAGE_KEYS.LOCATIONS);
    const loc = locations.find(l => l.id === matchedUser.locationId);

    const tokenPayload = {
      sub: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      location: loc?.name || matchedUser.locationId,
      locationId: matchedUser.locationId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (86400 * 7)
    };
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(tokenPayload))}.MOCK_SIGNATURE_${Date.now()}`;

    const response = {
      token: mockJwt,
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        phone: matchedUser.phone,
        department: matchedUser.department,
        designation: matchedUser.designation,
        role: matchedUser.role,
        locationId: matchedUser.locationId,
        location: loc?.name || matchedUser.locationId,
        availability: matchedUser.availability || 'AVAILABLE'
      }
    };

    db.logAudit(matchedUser, 'USER_LOGIN', matchedUser.id, `User logged in with role ${matchedUser.role}`);
    return response;
  },

  // 2. Admin APIs (from Module 1)
  async getEmployees() {
    await delay(150);
    const users = db.get(STORAGE_KEYS.USERS);
    const locations = db.get(STORAGE_KEYS.LOCATIONS);
    const mappings = db.get(STORAGE_KEYS.MAPPINGS);

    return users.map(u => {
      const loc = locations.find(l => l.id === u.locationId);
      const mapping = mappings.find(m => m.employeeId === u.id);
      const teamLead = mapping?.teamLeadId ? users.find(tl => tl.id === mapping.teamLeadId) : null;
      const manager = mapping?.managerId ? users.find(mgr => mgr.id === mapping.managerId) : null;

      return {
        ...u,
        locationName: loc?.name || u.locationId,
        locationCity: loc?.city || '',
        teamLeadId: mapping?.teamLeadId || null,
        teamLeadName: teamLead?.name || null,
        managerId: mapping?.managerId || null,
        managerName: manager?.name || null
      };
    });
  },

  async getTeamLeads() {
    await delay(100);
    const users = db.get(STORAGE_KEYS.USERS);
    return users.filter(u => u.role === ROLES.TEAM_LEAD && u.status === 'ACTIVE');
  },

  async getManagers() {
    await delay(100);
    const users = db.get(STORAGE_KEYS.USERS);
    return users.filter(u => u.role === ROLES.MANAGER && u.status === 'ACTIVE');
  },

  async createEmployee(employeeData, currentUser) {
    await delay(250);
    const users = db.get(STORAGE_KEYS.USERS);

    const duplicateId = users.find(u => u.id.toLowerCase() === employeeData.employeeId.trim().toLowerCase());
    if (duplicateId) {
      const err = new Error(`Employee ID "${employeeData.employeeId}" is already assigned`);
      err.status = 409;
      err.field = 'employeeId';
      throw err;
    }

    const duplicateEmail = users.find(u => u.email.toLowerCase() === employeeData.email.trim().toLowerCase());
    if (duplicateEmail) {
      const err = new Error(`Email "${employeeData.email}" is already registered`);
      err.status = 409;
      err.field = 'email';
      throw err;
    }

    const newEmployee = {
      id: employeeData.employeeId.trim().toUpperCase(),
      name: employeeData.name.trim(),
      email: employeeData.email.trim().toLowerCase(),
      phone: employeeData.phone.trim(),
      department: employeeData.department,
      designation: employeeData.designation.trim(),
      locationId: employeeData.locationId,
      joiningDate: employeeData.joiningDate,
      employmentType: employeeData.employmentType,
      role: employeeData.role,
      status: 'ACTIVE',
      availability: 'AVAILABLE',
      createdAt: new Date().toISOString()
    };

    users.push(newEmployee);
    db.set(STORAGE_KEYS.USERS, users);

    if (employeeData.teamLeadId || employeeData.managerId) {
      const mappings = db.get(STORAGE_KEYS.MAPPINGS);
      mappings.push({
        employeeId: newEmployee.id,
        teamLeadId: employeeData.teamLeadId || null,
        managerId: employeeData.managerId || null,
        updatedAt: new Date().toISOString()
      });
      db.set(STORAGE_KEYS.MAPPINGS, mappings);
    }

    db.logAudit(currentUser, 'EMPLOYEE_CREATED', newEmployee.id, `Created new ${newEmployee.role} profile: ${newEmployee.name}`);
    return newEmployee;
  },

  async getMappings() {
    await delay(150);
    const users = db.get(STORAGE_KEYS.USERS);
    const mappings = db.get(STORAGE_KEYS.MAPPINGS);
    const locations = db.get(STORAGE_KEYS.LOCATIONS);

    return users
      .filter(u => u.role !== ROLES.ADMIN)
      .map(emp => {
        const loc = locations.find(l => l.id === emp.locationId);
        const mapping = mappings.find(m => m.employeeId === emp.id);
        const tl = mapping?.teamLeadId ? users.find(u => u.id === mapping.teamLeadId) : null;
        const mgr = mapping?.managerId ? users.find(u => u.id === mapping.managerId) : null;

        return {
          employee: {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            department: emp.department,
            designation: emp.designation,
            role: emp.role,
            locationName: loc?.name || emp.locationId
          },
          teamLead: tl ? { id: tl.id, name: tl.name, email: tl.email, role: tl.role } : null,
          manager: mgr ? { id: mgr.id, name: mgr.name, email: mgr.email, role: mgr.role } : null,
          updatedAt: mapping?.updatedAt || null
        };
      });
  },

  async updateMapping(employeeId, { teamLeadId, managerId }, currentUser) {
    await delay(200);
    const mappings = db.get(STORAGE_KEYS.MAPPINGS);
    const index = mappings.findIndex(m => m.employeeId === employeeId);

    const updated = {
      employeeId,
      teamLeadId: teamLeadId || null,
      managerId: managerId || null,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      mappings[index] = updated;
    } else {
      mappings.push(updated);
    }

    db.set(STORAGE_KEYS.MAPPINGS, mappings);
    db.logAudit(currentUser, 'MAPPING_UPDATED', employeeId, `Updated hierarchy mapping (TL: ${teamLeadId || 'None'}, Mgr: ${managerId || 'None'})`);
    return updated;
  },

  async getLocations() {
    await delay(100);
    return db.get(STORAGE_KEYS.LOCATIONS);
  },

  async createLocation(locationData, currentUser) {
    await delay(200);
    const locations = db.get(STORAGE_KEYS.LOCATIONS);
    const duplicateCode = locations.find(l => l.code.toUpperCase() === locationData.code.trim().toUpperCase());
    if (duplicateCode) {
      const err = new Error(`Location code "${locationData.code}" already exists`);
      err.status = 409;
      err.field = 'code';
      throw err;
    }

    const newLoc = {
      id: `LOC-${locationData.code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
      name: locationData.name.trim(),
      city: locationData.city.trim(),
      state: locationData.state.trim(),
      country: locationData.country.trim(),
      timezone: locationData.timezone,
      code: locationData.code.trim().toUpperCase(),
      active: true,
      createdAt: new Date().toISOString()
    };

    locations.push(newLoc);
    db.set(STORAGE_KEYS.LOCATIONS, locations);
    db.logAudit(currentUser, 'LOCATION_CREATED', newLoc.id, `Created corporate location: ${newLoc.name}`);
    return newLoc;
  },

  async updateLocation(id, locationData, currentUser) {
    await delay(200);
    const locations = db.get(STORAGE_KEYS.LOCATIONS);
    const index = locations.findIndex(l => l.id === id);
    if (index === -1) {
      const err = new Error('Location not found');
      err.status = 404;
      throw err;
    }

    const updated = {
      ...locations[index],
      name: locationData.name.trim(),
      city: locationData.city.trim(),
      state: locationData.state.trim(),
      country: locationData.country.trim(),
      timezone: locationData.timezone,
      code: locationData.code.trim().toUpperCase(),
      active: locationData.active !== undefined ? locationData.active : locations[index].active,
      updatedAt: new Date().toISOString()
    };

    locations[index] = updated;
    db.set(STORAGE_KEYS.LOCATIONS, locations);
    db.logAudit(currentUser, 'LOCATION_UPDATED', id, `Updated location ${updated.name}`);
    return updated;
  },

  async getLeaveCategories() {
    await delay(100);
    return db.get(STORAGE_KEYS.CATEGORIES);
  },

  async createLeaveCategory(categoryData, currentUser) {
    await delay(200);
    const categories = db.get(STORAGE_KEYS.CATEGORIES);
    const duplicateCode = categories.find(c => c.code.toUpperCase() === categoryData.code.trim().toUpperCase());
    if (duplicateCode) {
      const err = new Error(`Category code "${categoryData.code}" already exists`);
      err.status = 409;
      err.field = 'code';
      throw err;
    }

    const newCat = {
      id: `CAT-${categoryData.code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
      name: categoryData.name.trim(),
      code: categoryData.code.trim().toUpperCase(),
      paid: Boolean(categoryData.paid),
      allowFullDay: Boolean(categoryData.allowFullDay),
      allowHalfDay: Boolean(categoryData.allowHalfDay),
      allowHourly: Boolean(categoryData.allowHourly),
      active: Boolean(categoryData.active),
      description: categoryData.description?.trim() || ''
    };

    categories.push(newCat);
    db.set(STORAGE_KEYS.CATEGORIES, categories);
    db.logAudit(currentUser, 'CATEGORY_CREATED', newCat.id, `Created leave category: ${newCat.name}`);
    return newCat;
  },

  async updateLeaveCategory(id, categoryData, currentUser) {
    await delay(200);
    const categories = db.get(STORAGE_KEYS.CATEGORIES);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      const err = new Error('Category not found');
      err.status = 404;
      throw err;
    }

    const updated = {
      ...categories[index],
      name: categoryData.name.trim(),
      code: categoryData.code.trim().toUpperCase(),
      paid: Boolean(categoryData.paid),
      allowFullDay: Boolean(categoryData.allowFullDay),
      allowHalfDay: Boolean(categoryData.allowHalfDay),
      allowHourly: Boolean(categoryData.allowHourly),
      active: Boolean(categoryData.active),
      description: categoryData.description?.trim() || ''
    };

    categories[index] = updated;
    db.set(STORAGE_KEYS.CATEGORIES, categories);
    db.logAudit(currentUser, 'CATEGORY_UPDATED', id, `Updated leave category ${updated.name}`);
    return updated;
  },

  async getLeavePolicies() {
    await delay(150);
    const policies = db.get(STORAGE_KEYS.POLICIES);
    const locations = db.get(STORAGE_KEYS.LOCATIONS);
    const categories = db.get(STORAGE_KEYS.CATEGORIES);

    return policies.map(p => {
      const loc = locations.find(l => l.id === p.locationId);
      const cat = categories.find(c => c.id === p.categoryId);
      return {
        ...p,
        locationName: loc?.name || p.locationId,
        locationCity: loc?.city || '',
        categoryName: cat?.name || p.categoryId,
        categoryCode: cat?.code || ''
      };
    });
  },

  async saveLeavePolicy(policyData, currentUser) {
    await delay(200);
    const policies = db.get(STORAGE_KEYS.POLICIES);
    const existingIndex = policies.findIndex(
      p => p.locationId === policyData.locationId && p.categoryId === policyData.categoryId
    );

    const policyPayload = {
      id: existingIndex >= 0 ? policies[existingIndex].id : `POL-${policyData.locationId}-${policyData.categoryId}`,
      locationId: policyData.locationId,
      categoryId: policyData.categoryId,
      annualEntitlement: Number(policyData.annualEntitlement),
      monthlyAccrual: Number(policyData.monthlyAccrual),
      maxBalance: Number(policyData.maxBalance),
      carryForwardAllowed: Boolean(policyData.carryForwardAllowed),
      carryForwardLimit: policyData.carryForwardAllowed ? Number(policyData.carryForwardLimit) : 0,
      expiryAllowed: Boolean(policyData.expiryAllowed),
      expiryMonths: policyData.expiryAllowed ? Number(policyData.expiryMonths) : 0,
      minNoticeDays: Number(policyData.minNoticeDays),
      maxContinuousDays: Number(policyData.maxContinuousDays),
      allowHourly: Boolean(policyData.allowHourly),
      allowHalfDay: Boolean(policyData.allowHalfDay),
      paid: Boolean(policyData.paid),
      requireSupportingDocument: Boolean(policyData.requireSupportingDocument),
      docThresholdDays: policyData.requireSupportingDocument ? Number(policyData.docThresholdDays) : 0,
      active: Boolean(policyData.active),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      policies[existingIndex] = policyPayload;
    } else {
      policies.push(policyPayload);
    }

    db.set(STORAGE_KEYS.POLICIES, policies);
    db.logAudit(
      currentUser,
      existingIndex >= 0 ? 'POLICY_UPDATED' : 'POLICY_CREATED',
      policyPayload.id,
      `Configured policy for Location ${policyData.locationId} and Category ${policyData.categoryId}`
    );
    return policyPayload;
  },

  async getApprovalWorkflows() {
    await delay(100);
    return db.get(STORAGE_KEYS.WORKFLOWS);
  },

  async saveApprovalWorkflow(workflowData, currentUser) {
    await delay(200);
    const workflows = db.get(STORAGE_KEYS.WORKFLOWS);
    const index = workflows.findIndex(w => w.id === workflowData.id);

    const payload = {
      id: workflowData.id || `WF-TIER-${Date.now()}`,
      name: workflowData.name.trim(),
      minDays: Number(workflowData.minDays),
      maxDays: Number(workflowData.maxDays),
      approvers: workflowData.approvers || [],
      description: workflowData.description?.trim() || '',
      active: Boolean(workflowData.active)
    };

    if (index >= 0) {
      workflows[index] = payload;
    } else {
      workflows.push(payload);
    }

    db.set(STORAGE_KEYS.WORKFLOWS, workflows);
    db.logAudit(currentUser, 'WORKFLOW_CONFIGURED', payload.id, `Configured approval tier: ${payload.name}`);
    return payload;
  },

  async getAuditLogs() {
    await delay(100);
    return db.get(STORAGE_KEYS.AUDIT);
  },

  async getDashboardStats() {
    await delay(150);
    const users = db.get(STORAGE_KEYS.USERS);
    const locations = db.get(STORAGE_KEYS.LOCATIONS);
    const policies = db.get(STORAGE_KEYS.POLICIES);
    const categories = db.get(STORAGE_KEYS.CATEGORIES);
    const mappings = db.get(STORAGE_KEYS.MAPPINGS);

    const totalEmployees = users.length;
    const activeEmployees = users.filter(u => u.status === 'ACTIVE').length;
    const teamLeads = users.filter(u => u.role === ROLES.TEAM_LEAD).length;
    const managers = users.filter(u => u.role === ROLES.MANAGER).length;
    const activeLocations = locations.filter(l => l.active).length;
    const activePolicies = policies.filter(p => p.active).length;

    const mappedIds = new Set(mappings.filter(m => m.managerId || m.teamLeadId).map(m => m.employeeId));
    const unmappedEmployees = users.filter(u => u.role === ROLES.EMPLOYEE && !mappedIds.has(u.id)).length;
    const totalPotentialPolicies = activeLocations * categories.filter(c => c.active).length;
    const missingPolicies = Math.max(0, totalPotentialPolicies - activePolicies);

    return {
      totalEmployees,
      activeEmployees,
      teamLeads,
      managers,
      totalLocations: locations.length,
      activeLocations,
      totalCategories: categories.length,
      activePolicies,
      pendingConfigurations: unmappedEmployees + (missingPolicies > 0 ? 1 : 0),
      unmappedEmployees,
      missingPolicies
    };
  },

  // 3. Employee Portal Functions (Module 2)
  async calculateLeaveDuration({ startDate, endDate, startSession = 'FULL_DAY', endSession = 'FULL_DAY', isHourly = false, hours = 0, currentUser }) {
    await delay(100);
    if (isHourly) {
      const numHours = Number(hours) || 0;
      const dayEquivalent = Number((numHours / 8).toFixed(2));
      return {
        workingDays: dayEquivalent,
        calendarDays: 1,
        holidayDays: 0,
        weekendDays: 0,
        isHourly: true,
        hours: numHours,
        breakdown: `${numHours} hours (${dayEquivalent} day equivalent based on 8h shift)`
      };
    }

    if (!startDate || !endDate) {
      return { workingDays: 0, calendarDays: 0, holidayDays: 0, weekendDays: 0 };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return { workingDays: 0, calendarDays: 0, holidayDays: 0, weekendDays: 0 };
    }

    const holidays = db.get(STORAGE_KEYS.HOLIDAYS).filter(h => h.locationId === currentUser.locationId);
    const holidayDates = new Set(holidays.map(h => h.date));

    let calendarDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    let workingDays = 0;

    const current = new Date(start);
    while (current <= end) {
      calendarDays++;
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
      } else if (holidayDates.has(dateStr)) {
        holidayDays++;
      } else {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    if (workingDays > 0) {
      if (startDate === endDate) {
        if (startSession === 'FIRST_HALF' || startSession === 'SECOND_HALF') {
          workingDays = 0.5;
        }
      } else {
        if (startSession === 'SECOND_HALF') {
          workingDays -= 0.5;
        }
        if (endSession === 'FIRST_HALF') {
          workingDays -= 0.5;
        }
      }
    }

    return {
      workingDays: Math.max(0, workingDays),
      calendarDays,
      holidayDays,
      weekendDays,
      breakdown: `${workingDays} working day(s) charged (${weekendDays} weekend days & ${holidayDays} statutory holidays excluded)`
    };
  },

  async checkLeaveOverlap({ startDate, endDate, excludeLeaveId = null, currentUser }) {
    await delay(100);
    const leaves = db.get(STORAGE_KEYS.LEAVES).filter(l => 
      l.employeeId === currentUser.id && 
      !['REJECTED', 'WITHDRAWN', 'CANCELLED'].includes(l.status) &&
      l.id !== excludeLeaveId
    );

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    const overlapping = leaves.find(l => {
      const existingStart = new Date(l.startDate);
      const existingEnd = new Date(l.endDate);
      return newStart <= existingEnd && newEnd >= existingStart;
    });

    if (overlapping) {
      return {
        hasOverlap: true,
        conflictingLeave: overlapping,
        message: `Leave request overlaps with active application #${overlapping.id} (${overlapping.leaveTypeName}: ${overlapping.startDate} to ${overlapping.endDate})`
      };
    }

    return { hasOverlap: false, conflictingLeave: null, message: null };
  },

  async getEmployeeLeaveBalances(currentUser) {
    await delay(150);
    const policies = db.get(STORAGE_KEYS.POLICIES).filter(p => p.locationId === currentUser.locationId && p.active);
    const categories = db.get(STORAGE_KEYS.CATEGORIES);
    const leaves = db.get(STORAGE_KEYS.LEAVES).filter(l => l.employeeId === currentUser.id);
    const compOffs = db.get(STORAGE_KEYS.COMPOFF).filter(c => c.employeeId === currentUser.id && c.status === 'APPROVED');

    return policies.map(policy => {
      const category = categories.find(c => c.id === policy.categoryId);
      const categoryLeaves = leaves.filter(l => l.leaveTypeId === policy.categoryId);

      const openingBalance = policy.carryForwardAllowed ? Math.min(policy.annualEntitlement * 0.3, policy.carryForwardLimit) : 0;
      const accrued = policy.categoryId === 'CAT-COMP' 
        ? compOffs.reduce((acc, c) => acc + c.compOffEarned, 0)
        : Number((policy.monthlyAccrual * 8).toFixed(1));
      
      const used = categoryLeaves
        .filter(l => l.status === 'APPROVED')
        .reduce((sum, l) => sum + l.duration, 0);

      const pending = categoryLeaves
        .filter(l => l.status === 'PENDING')
        .reduce((sum, l) => sum + l.duration, 0);

      const encashed = 0;
      const rawClosing = openingBalance + accrued - used - pending - encashed;
      const closingBalance = Math.max(0, Math.min(rawClosing, policy.maxBalance));

      return {
        id: policy.id,
        categoryId: policy.categoryId,
        categoryName: category?.name || policy.categoryId,
        categoryCode: category?.code || '',
        paid: policy.paid,
        openingBalance: Number(openingBalance.toFixed(1)),
        accrued: Number(accrued.toFixed(1)),
        used: Number(used.toFixed(1)),
        pending: Number(pending.toFixed(1)),
        encashed,
        closingBalance: Number(closingBalance.toFixed(1)),
        annualEntitlement: policy.annualEntitlement,
        maxBalance: policy.maxBalance,
        carryForwardLimit: policy.carryForwardLimit,
        carryForwardAllowed: policy.carryForwardAllowed,
        allowHourly: policy.allowHourly,
        allowHalfDay: policy.allowHalfDay,
        minNoticeDays: policy.minNoticeDays,
        maxContinuousDays: policy.maxContinuousDays,
        requireSupportingDocument: policy.requireSupportingDocument,
        docThresholdDays: policy.docThresholdDays,
        description: category?.description || ''
      };
    });
  },

  async getEmployeeDashboard(currentUser) {
    await delay(200);
    const users = db.get(STORAGE_KEYS.USERS);
    const locations = db.get(STORAGE_KEYS.LOCATIONS);
    const mappings = db.get(STORAGE_KEYS.MAPPINGS);
    const holidays = db.get(STORAGE_KEYS.HOLIDAYS).filter(h => h.locationId === currentUser.locationId);
    const leaves = db.get(STORAGE_KEYS.LEAVES).filter(l => l.employeeId === currentUser.id);
    const compOffs = db.get(STORAGE_KEYS.COMPOFF).filter(c => c.employeeId === currentUser.id);
    const attendance = db.get(STORAGE_KEYS.ATTENDANCE).filter(a => a.employeeId === currentUser.id);

    const userProfile = users.find(u => u.id === currentUser.id) || currentUser;
    const loc = locations.find(l => l.id === userProfile.locationId);
    const mapping = mappings.find(m => m.employeeId === userProfile.id);
    const teamLead = mapping?.teamLeadId ? users.find(u => u.id === mapping.teamLeadId) : null;
    const manager = mapping?.managerId ? users.find(u => u.id === mapping.managerId) : null;

    const leaveBalances = await this.getEmployeeLeaveBalances(userProfile);
    const pendingLeaves = leaves.filter(l => l.status === 'PENDING');

    const todayStr = '2026-08-18';
    const upcomingHolidays = holidays
      .filter(h => h.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);

    const availableCompOff = compOffs.filter(c => c.status === 'APPROVED').reduce((sum, c) => sum + c.compOffEarned, 0);
    const pendingCompOff = compOffs.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.compOffEarned, 0);

    return {
      employee: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        department: userProfile.department,
        designation: userProfile.designation,
        locationId: userProfile.locationId,
        locationName: loc?.name || userProfile.locationId,
        teamLead: teamLead ? { id: teamLead.id, name: teamLead.name, role: teamLead.role } : null,
        manager: manager ? { id: manager.id, name: manager.name, role: manager.role } : null
      },
      leaveBalances,
      pendingLeaves,
      upcomingHolidays,
      recentLeaveHistory: leaves.slice(0, 5),
      compOff: {
        available: availableCompOff,
        pending: pendingCompOff,
        totalClaimed: compOffs.length
      },
      attendance: {
        pendingRegularizations: attendance.filter(a => a.status === 'PENDING').length,
        recentRequests: attendance.slice(0, 3)
      }
    };
  },

  async getEmployeeLeaves(currentUser) {
    await delay(150);
    const leaves = db.get(STORAGE_KEYS.LEAVES).filter(l => l.employeeId === currentUser.id);
    return leaves.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
  },

  async applyLeave(payload, currentUser) {
    await delay(300);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const categories = db.get(STORAGE_KEYS.CATEGORIES);
    const policies = db.get(STORAGE_KEYS.POLICIES);
    const mappings = db.get(STORAGE_KEYS.MAPPINGS);
    const users = db.get(STORAGE_KEYS.USERS);
    const workflows = db.get(STORAGE_KEYS.WORKFLOWS);

    const category = categories.find(c => c.id === payload.leaveTypeId);
    const policy = policies.find(p => p.locationId === currentUser.locationId && p.categoryId === payload.leaveTypeId);
    if (!policy || !policy.active) {
      const err = new Error('Selected leave category is not available for your location');
      err.status = 422;
      throw err;
    }

    const overlapResult = await this.checkLeaveOverlap({
      startDate: payload.startDate,
      endDate: payload.endDate,
      currentUser
    });
    if (overlapResult.hasOverlap) {
      const err = new Error(overlapResult.message);
      err.status = 409;
      throw err;
    }

    const durationInfo = await this.calculateLeaveDuration({
      startDate: payload.startDate,
      endDate: payload.endDate,
      startSession: payload.startSession,
      endSession: payload.endSession,
      isHourly: payload.isHourly,
      hours: payload.hours,
      currentUser
    });

    if (durationInfo.workingDays <= 0) {
      const err = new Error('Selected dates contain only weekends or statutory holidays. No working days charged.');
      err.status = 422;
      throw err;
    }

    const balances = await this.getEmployeeLeaveBalances(currentUser);
    const catBalance = balances.find(b => b.categoryId === payload.leaveTypeId);
    if (catBalance && catBalance.closingBalance < durationInfo.workingDays) {
      const err = new Error(
        `Insufficient leave balance. You requested ${durationInfo.workingDays} days, but only ${catBalance.closingBalance} days are available.`
      );
      err.status = 422;
      throw err;
    }

    const mapping = mappings.find(m => m.employeeId === currentUser.id);
    const teamLead = mapping?.teamLeadId ? users.find(u => u.id === mapping.teamLeadId) : null;
    const manager = mapping?.managerId ? users.find(u => u.id === mapping.managerId) : null;

    const matchedWf = workflows.find(wf => wf.active && durationInfo.workingDays >= wf.minDays && durationInfo.workingDays <= wf.maxDays) || workflows[0];
    const approvalChain = [];

    if (matchedWf.approvers.includes(ROLES.TEAM_LEAD) && teamLead) {
      approvalChain.push({
        role: ROLES.TEAM_LEAD,
        approverId: teamLead.id,
        approverName: teamLead.name,
        status: 'PENDING',
        date: null,
        remarks: null
      });
    }

    if (matchedWf.approvers.includes(ROLES.MANAGER) && manager) {
      approvalChain.push({
        role: ROLES.MANAGER,
        approverId: manager.id,
        approverName: manager.name,
        status: approvalChain.length === 0 ? 'PENDING' : 'NOT_STARTED',
        date: null,
        remarks: null
      });
    }

    if (matchedWf.approvers.includes(ROLES.ADMIN) || approvalChain.length === 0) {
      approvalChain.push({
        role: ROLES.ADMIN,
        approverId: 'ADM001',
        approverName: 'HR Administration',
        status: approvalChain.length === 0 ? 'PENDING' : 'NOT_STARTED',
        date: null,
        remarks: null
      });
    }

    const currentApprover = approvalChain.find(a => a.status === 'PENDING') || null;

    const newLeave = {
      id: `LR-2026-${String(leaves.length + 1).padStart(3, '0')}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department || 'Engineering',
      locationId: currentUser.locationId,
      leaveTypeId: payload.leaveTypeId,
      leaveTypeName: category.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      startSession: payload.startSession || 'FULL_DAY',
      endSession: payload.endSession || 'FULL_DAY',
      duration: durationInfo.workingDays,
      isHourly: Boolean(payload.isHourly),
      hours: payload.hours || 0,
      reason: payload.reason?.trim() || '',
      status: 'PENDING',
      appliedDate: new Date().toISOString(),
      approvalChain,
      currentApprover: currentApprover ? {
        id: currentApprover.approverId,
        name: currentApprover.approverName,
        role: currentApprover.role
      } : null,
      attachments: payload.attachments || []
    };

    leaves.unshift(newLeave);
    db.set(STORAGE_KEYS.LEAVES, leaves);

    // Notify Approver
    if (currentApprover) {
      db.pushNotification({
        userId: currentApprover.approverId,
        title: 'New Leave Request',
        message: `${currentUser.name} submitted a ${newLeave.duration}-day ${newLeave.leaveTypeName} request for ${newLeave.startDate} to ${newLeave.endDate}.`,
        type: 'LEAVE_SUBMITTED',
        category: 'APPROVAL',
        link: currentApprover.role === ROLES.TEAM_LEAD ? '/team-lead/approvals' : '/manager/approvals'
      });
    }

    db.logAudit(
      currentUser,
      'LEAVE_APPLICATION_SUBMITTED',
      newLeave.id,
      `Applied for ${newLeave.duration} day(s) of ${newLeave.leaveTypeName} (${newLeave.startDate} to ${newLeave.endDate})`
    );

    return newLeave;
  },

  async withdrawLeave(id, currentUser) {
    await delay(200);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex(l => l.id === id && l.employeeId === currentUser.id);

    if (index === -1) {
      const err = new Error('Leave application not found');
      err.status = 404;
      throw err;
    }

    const leave = leaves[index];
    if (leave.status !== 'PENDING') {
      const err = new Error(`Only pending leave requests can be withdrawn. Current status: ${leave.status}`);
      err.status = 422;
      throw err;
    }

    leave.status = 'WITHDRAWN';
    leave.currentApprover = null;
    leave.withdrawnDate = new Date().toISOString();

    leaves[index] = leave;
    db.set(STORAGE_KEYS.LEAVES, leaves);

    db.logAudit(currentUser, 'LEAVE_WITHDRAWN', leave.id, `Withdrew leave application #${leave.id}`);
    return leave;
  },

  async cancelLeave(id, reason, currentUser) {
    await delay(200);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex(l => l.id === id && l.employeeId === currentUser.id);

    if (index === -1) {
      const err = new Error('Leave application not found');
      err.status = 404;
      throw err;
    }

    const leave = leaves[index];
    if (leave.status !== 'APPROVED') {
      const err = new Error('Only approved leaves can be requested for cancellation.');
      err.status = 422;
      throw err;
    }

    leave.status = 'CANCELLED';
    leave.cancellationReason = reason || 'Employee requested cancellation';
    leave.cancelledDate = new Date().toISOString();

    leaves[index] = leave;
    db.set(STORAGE_KEYS.LEAVES, leaves);

    db.logAudit(currentUser, 'LEAVE_CANCELLED', leave.id, `Cancelled approved leave #${leave.id}`);
    return leave;
  },

  async getEmployeeHolidays(currentUser) {
    await delay(100);
    const holidays = db.get(STORAGE_KEYS.HOLIDAYS).filter(h => h.locationId === currentUser.locationId);
    return holidays.sort((a, b) => a.date.localeCompare(b.date));
  },

  async getCompOffData(currentUser) {
    await delay(150);
    const compOffs = db.get(STORAGE_KEYS.COMPOFF).filter(c => c.employeeId === currentUser.id);
    const earned = compOffs.filter(c => c.status === 'APPROVED').reduce((sum, c) => sum + c.compOffEarned, 0);
    const pending = compOffs.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.compOffEarned, 0);

    return {
      history: compOffs,
      summary: {
        available: earned,
        pending,
        used: 0,
        expired: 0
      }
    };
  },

  async requestCompOff(payload, currentUser) {
    await delay(250);
    const compOffs = db.get(STORAGE_KEYS.COMPOFF);

    const hours = Number(payload.hoursWorked) || 8;
    const earned = hours >= 8 ? 1.0 : Number((hours / 8).toFixed(2));

    const newRecord = {
      id: `CO-${Date.now().toString(36).toUpperCase()}`,
      employeeId: currentUser.id,
      workedDate: payload.workedDate,
      appliedDate: new Date().toISOString().split('T')[0],
      hoursWorked: hours,
      compOffEarned: earned,
      reason: payload.reason?.trim() || '',
      status: 'PENDING',
      expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
    };

    compOffs.unshift(newRecord);
    db.set(STORAGE_KEYS.COMPOFF, compOffs);
    db.logAudit(currentUser, 'COMP_OFF_REQUESTED', newRecord.id, `Requested ${earned} day comp-off for weekend work on ${payload.workedDate}`);
    return newRecord;
  },

  async getAttendanceData(currentUser) {
    await delay(150);
    const records = db.get(STORAGE_KEYS.ATTENDANCE).filter(a => a.employeeId === currentUser.id);
    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async submitAttendanceRegularization(payload, currentUser) {
    await delay(250);
    const attendance = db.get(STORAGE_KEYS.ATTENDANCE);

    const newRecord = {
      id: `ATT-${Date.now().toString(36).toUpperCase()}`,
      employeeId: currentUser.id,
      date: payload.date,
      issueType: payload.issueType,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      reason: payload.reason?.trim() || '',
      status: 'PENDING',
      appliedDate: new Date().toISOString()
    };

    attendance.unshift(newRecord);
    db.set(STORAGE_KEYS.ATTENDANCE, attendance);
    db.logAudit(currentUser, 'ATTENDANCE_REGULARIZATION_SUBMITTED', newRecord.id, `Submitted regularization for ${payload.date} (${payload.issueType})`);
    return newRecord;
  },

  // =========================================================================
  // 4. MODULE 3: TEAM LEAD & MANAGER APPROVAL ENGINE & NOTIFICATIONS
  // =========================================================================

  /**
   * Computes SLA metrics for a leave request based on appliedDate and 48-hour threshold
   */
  _computeSla(leave) {
    const appliedTime = new Date(leave.appliedDate || leave.createdAt || '2026-08-18T09:00:00Z').getTime();
    const nowTime = new Date('2026-08-18T19:00:00Z').getTime(); // simulation current time
    const elapsedMs = Math.max(0, nowTime - appliedTime);
    const elapsedHours = Math.round(elapsedMs / (1000 * 60 * 60));
    const limitHours = 48; // 2 business days SLA threshold

    let status = 'WITHIN_SLA';
    let isEscalated = false;

    if (elapsedHours > limitHours) {
      status = 'OVERDUE';
      isEscalated = true;
    } else if (elapsedHours > 36) {
      status = 'NEARING_SLA';
    }

    const remainingHours = Math.max(0, limitHours - elapsedHours);

    return {
      limitHours,
      elapsedHours,
      remainingHours,
      status,
      isEscalated,
      waitingFormatted: `${Math.floor(elapsedHours / 24)}d ${elapsedHours % 24}h elapsed`
    };
  },

  /**
   * Fetches pending approval queue for Team Lead or Manager
   */
  async getMyApprovals(currentUser) {
    await delay(180);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const users = db.get(STORAGE_KEYS.USERS);
    const mappings = db.get(STORAGE_KEYS.MAPPINGS);

    // Identify reportees
    let reporteeIds = new Set();
    if (currentUser.role === ROLES.TEAM_LEAD) {
      const myMappings = mappings.filter(m => m.teamLeadId === currentUser.id);
      reporteeIds = new Set(myMappings.map(m => m.employeeId));
    } else if (currentUser.role === ROLES.MANAGER) {
      const myMappings = mappings.filter(m => m.managerId === currentUser.id);
      reporteeIds = new Set(myMappings.map(m => m.employeeId));
    } else if (currentUser.role === ROLES.ADMIN) {
      reporteeIds = new Set(users.map(u => u.id));
    }

    // Filter requests currently awaiting this user or escalated to them
    const pendingQueue = leaves
      .filter(l => {
        if (l.status !== 'PENDING') return false;

        // Current approver matches
        if (l.currentApprover?.id === currentUser.id) return true;

        // Escalated to manager if Team Lead overdue
        if (currentUser.role === ROLES.MANAGER && reporteeIds.has(l.employeeId)) {
          const sla = this._computeSla(l);
          if (sla.isEscalated) return true;
        }

        return false;
      })
      .map(leave => {
        const emp = users.find(u => u.id === leave.employeeId);
        const sla = this._computeSla(leave);

        return {
          ...leave,
          employee: {
            id: emp?.id || leave.employeeId,
            name: emp?.name || leave.employeeName,
            department: emp?.department || leave.department,
            designation: emp?.designation || 'Software Engineer',
            locationId: emp?.locationId || leave.locationId
          },
          sla
        };
      });

    return pendingQueue.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
  },

  /**
   * Fetches single approval request with complete employee profile, balance, policy rules
   */
  async getApprovalRequest(id, currentUser) {
    await delay(150);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const users = db.get(STORAGE_KEYS.USERS);
    const policies = db.get(STORAGE_KEYS.POLICIES);

    const leave = leaves.find(l => l.id === id);
    if (!leave) {
      const err = new Error(`Approval request #${id} not found.`);
      err.status = 404;
      throw err;
    }

    const emp = users.find(u => u.id === leave.employeeId) || { id: leave.employeeId, name: leave.employeeName };
    const empBalances = await this.getEmployeeLeaveBalances(emp);
    const categoryBalance = empBalances.find(b => b.categoryId === leave.leaveTypeId);
    const policy = policies.find(p => p.locationId === emp.locationId && p.categoryId === leave.leaveTypeId);
    const sla = this._computeSla(leave);

    return {
      ...leave,
      employee: {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        locationId: emp.locationId
      },
      balance: categoryBalance || null,
      policy: policy || null,
      sla
    };
  },

  /**
   * Approve a leave request (advances to next tier or completes)
   */
  async approveRequest(id, { remarks = '' }, currentUser) {
    await delay(250);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const users = db.get(STORAGE_KEYS.USERS);
    const index = leaves.findIndex(l => l.id === id);

    if (index === -1) {
      const err = new Error('Leave request not found');
      err.status = 404;
      throw err;
    }

    const leave = leaves[index];
    if (leave.status !== 'PENDING') {
      const err = new Error(`Request is already ${leave.status}. Cannot approve.`);
      err.status = 422;
      throw err;
    }

    // Update current step in approval chain
    const chain = [...leave.approvalChain];
    const currentStepIdx = chain.findIndex(step => 
      step.status === 'PENDING' || step.approverId === currentUser.id || currentUser.role === ROLES.ADMIN
    );

    if (currentStepIdx >= 0) {
      chain[currentStepIdx] = {
        ...chain[currentStepIdx],
        status: 'APPROVED',
        approverId: currentUser.id,
        approverName: currentUser.name,
        date: new Date().toISOString(),
        remarks: remarks?.trim() || 'Approved'
      };
    }

    // Check next step
    const nextStepIdx = chain.findIndex(step => step.status === 'NOT_STARTED');

    if (nextStepIdx >= 0) {
      // Advance to next approver
      chain[nextStepIdx] = {
        ...chain[nextStepIdx],
        status: 'PENDING'
      };

      const nextApprover = chain[nextStepIdx];
      leave.currentApprover = {
        id: nextApprover.approverId,
        name: nextApprover.approverName,
        role: nextApprover.role
      };
      leave.approvalChain = chain;

      // Notify next approver
      db.pushNotification({
        userId: nextApprover.approverId,
        title: 'Leave Approval Required',
        message: `Leave request #${leave.id} from ${leave.employeeName} was recommended by ${currentUser.name} and requires your approval.`,
        type: 'LEAVE_SUBMITTED',
        category: 'APPROVAL',
        link: nextApprover.role === ROLES.MANAGER ? '/manager/approvals' : '/team-lead/approvals'
      });
    } else {
      // Final level approved
      leave.status = 'APPROVED';
      leave.currentApprover = null;
      leave.approvalChain = chain;
      leave.approvedDate = new Date().toISOString();

      // Notify Employee
      db.pushNotification({
        userId: leave.employeeId,
        title: 'Leave Application Approved 🎉',
        message: `Your ${leave.duration}-day ${leave.leaveTypeName} (${leave.startDate} to ${leave.endDate}) has been fully approved.`,
        type: 'LEAVE_APPROVED',
        category: 'LEAVE',
        link: '/employee/leave-history'
      });
    }

    leaves[index] = leave;
    db.set(STORAGE_KEYS.LEAVES, leaves);

    db.logAudit(
      currentUser,
      'LEAVE_APPROVED',
      leave.id,
      `${currentUser.name} (${currentUser.role}) approved leave #${leave.id}. Status: ${leave.status}`
    );

    return leave;
  },

  /**
   * Reject a leave request with mandatory reason
   */
  async rejectRequest(id, { reason }, currentUser) {
    await delay(250);
    if (!reason || !reason.trim()) {
      const err = new Error('A detailed reason for rejection is strictly required.');
      err.status = 422;
      err.field = 'reason';
      throw err;
    }

    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex(l => l.id === id);

    if (index === -1) {
      const err = new Error('Leave request not found');
      err.status = 404;
      throw err;
    }

    const leave = leaves[index];
    leave.status = 'REJECTED';
    leave.rejectionReason = reason.trim();
    leave.rejectedBy = {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role
    };
    leave.rejectedDate = new Date().toISOString();
    leave.currentApprover = null;

    // Update chain step
    const chain = [...leave.approvalChain];
    const currentStepIdx = chain.findIndex(step => step.status === 'PENDING' || step.approverId === currentUser.id);
    if (currentStepIdx >= 0) {
      chain[currentStepIdx] = {
        ...chain[currentStepIdx],
        status: 'REJECTED',
        approverId: currentUser.id,
        approverName: currentUser.name,
        date: new Date().toISOString(),
        remarks: reason.trim()
      };
    }
    leave.approvalChain = chain;

    leaves[index] = leave;
    db.set(STORAGE_KEYS.LEAVES, leaves);

    // Notify Employee
    db.pushNotification({
      userId: leave.employeeId,
      title: 'Leave Application Rejected',
      message: `Your ${leave.leaveTypeName} (${leave.startDate} to ${leave.endDate}) was rejected by ${currentUser.name}. Reason: "${reason.trim()}"`,
      type: 'LEAVE_REJECTED',
      category: 'LEAVE',
      link: '/employee/leave-history'
    });

    db.logAudit(
      currentUser,
      'LEAVE_REJECTED',
      leave.id,
      `${currentUser.name} rejected leave #${leave.id}. Reason: ${reason.trim()}`
    );

    return leave;
  },

  /**
   * Request clarification from the employee
   */
  async requestClarification(id, { clarificationMessage }, currentUser) {
    await delay(250);
    if (!clarificationMessage || !clarificationMessage.trim()) {
      const err = new Error('Clarification instructions are required.');
      err.status = 422;
      err.field = 'clarificationMessage';
      throw err;
    }

    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex(l => l.id === id);

    if (index === -1) {
      const err = new Error('Leave request not found');
      err.status = 404;
      throw err;
    }

    const leave = leaves[index];
    leave.status = 'CLARIFICATION_REQUIRED';
    leave.clarificationNote = clarificationMessage.trim();
    leave.clarificationRequestedBy = {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role
    };

    leaves[index] = leave;
    db.set(STORAGE_KEYS.LEAVES, leaves);

    // Notify Employee
    db.pushNotification({
      userId: leave.employeeId,
      title: 'Clarification Required on Leave Request',
      message: `${currentUser.name} requested clarification for #${leave.id}: "${clarificationMessage.trim()}"`,
      type: 'CLARIFICATION_REQUIRED',
      category: 'LEAVE',
      link: '/employee/leave-history'
    });

    db.logAudit(
      currentUser,
      'CLARIFICATION_REQUESTED',
      leave.id,
      `${currentUser.name} requested clarification on #${leave.id}`
    );

    return leave;
  },

  /**
   * Fetches historical approval decisions taken by this user
   */
  async getApprovalHistory(currentUser) {
    await delay(150);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const users = db.get(STORAGE_KEYS.USERS);

    return leaves
      .filter(l => {
        return l.approvalChain?.some(step => 
          step.approverId === currentUser.id && ['APPROVED', 'REJECTED'].includes(step.status)
        );
      })
      .map(leave => {
        const emp = users.find(u => u.id === leave.employeeId);
        const myStep = leave.approvalChain.find(step => step.approverId === currentUser.id);

        return {
          id: leave.id,
          employee: {
            id: emp?.id || leave.employeeId,
            name: emp?.name || leave.employeeName,
            department: emp?.department || leave.department
          },
          leaveTypeName: leave.leaveTypeName,
          startDate: leave.startDate,
          endDate: leave.endDate,
          duration: leave.duration,
          action: myStep?.status || leave.status,
          actionDate: myStep?.date || leave.approvedDate || leave.rejectedDate,
          remarks: myStep?.remarks || leave.rejectionReason || 'Completed'
        };
      })
      .sort((a, b) => new Date(b.actionDate) - new Date(a.actionDate));
  },

  /**
   * Fetches requests that were escalated due to SLA expiration or approver absence
   */
  async getEscalatedRequests(currentUser) {
    await delay(150);
    const approvals = await this.getMyApprovals(currentUser);
    return approvals.filter(a => a.sla?.isEscalated);
  },

  /**
   * Team Availability & Calendar APIs
   */
  async getTeamMembers(currentUser) {
    await delay(120);
    const users = db.get(STORAGE_KEYS.USERS);
    const mappings = db.get(STORAGE_KEYS.MAPPINGS);

    let reportees = [];
    if (currentUser.role === ROLES.TEAM_LEAD) {
      const myMappings = mappings.filter(m => m.teamLeadId === currentUser.id);
      const ids = new Set(myMappings.map(m => m.employeeId));
      reportees = users.filter(u => ids.has(u.id));
    } else if (currentUser.role === ROLES.MANAGER) {
      const myMappings = mappings.filter(m => m.managerId === currentUser.id);
      const ids = new Set(myMappings.map(m => m.employeeId));
      reportees = users.filter(u => ids.has(u.id));
    } else {
      reportees = users.filter(u => u.role !== ROLES.ADMIN);
    }

    return reportees;
  },

  async getTeamAvailability(currentUser) {
    await delay(150);
    const teamMembers = await this.getTeamMembers(currentUser);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const holidays = db.get(STORAGE_KEYS.HOLIDAYS);
    const todayStr = '2026-08-18'; // Simulation date

    let workingCount = 0;
    let onLeaveCount = 0;
    let pendingCount = 0;
    let holidayCount = 0;

    const memberStatusList = teamMembers.map(member => {
      // Check Holiday
      const isHol = holidays.some(h => h.locationId === member.locationId && h.date === todayStr);
      if (isHol) {
        holidayCount++;
        return { ...member, todayStatus: 'ON_HOLIDAY', statusLabel: 'Statutory Holiday' };
      }

      // Check Leave
      const activeLeave = leaves.find(l => 
        l.employeeId === member.id && 
        ['APPROVED', 'PENDING'].includes(l.status) &&
        l.startDate <= todayStr && 
        l.endDate >= todayStr
      );

      if (activeLeave) {
        if (activeLeave.status === 'APPROVED') {
          onLeaveCount++;
          return { ...member, todayStatus: 'ON_LEAVE', statusLabel: `On Leave (${activeLeave.leaveTypeName})` };
        } else {
          pendingCount++;
          return { ...member, todayStatus: 'PENDING_LEAVE', statusLabel: `Pending Leave (${activeLeave.leaveTypeName})` };
        }
      }

      workingCount++;
      return { ...member, todayStatus: 'WORKING', statusLabel: 'Available / Working' };
    });

    return {
      totalMembers: teamMembers.length,
      working: workingCount,
      onLeave: onLeaveCount,
      pending: pendingCount,
      onHoliday: holidayCount,
      members: memberStatusList
    };
  },

  async getTeamCalendar(currentUser, { startDate = '2026-08-16', endDate = '2026-08-31' } = {}) {
    await delay(200);
    const teamMembers = await this.getTeamMembers(currentUser);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const holidays = db.get(STORAGE_KEYS.HOLIDAYS);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];

    const cur = new Date(start);
    while (cur <= end) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    const matrix = teamMembers.map(member => {
      const memberHolidays = new Set(
        holidays.filter(h => h.locationId === member.locationId).map(h => h.date)
      );

      const memberLeaves = leaves.filter(l => 
        l.employeeId === member.id && ['APPROVED', 'PENDING'].includes(l.status)
      );

      const schedule = dates.map(dateStr => {
        const d = new Date(dateStr);
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (isWeekend) {
          return { date: dateStr, status: 'WEEKEND', label: 'Weekend' };
        }

        if (memberHolidays.has(dateStr)) {
          return { date: dateStr, status: 'HOLIDAY', label: 'Holiday' };
        }

        const activeLeave = memberLeaves.find(l => l.startDate <= dateStr && l.endDate >= dateStr);
        if (activeLeave) {
          return {
            date: dateStr,
            status: activeLeave.status === 'APPROVED' ? 'APPROVED_LEAVE' : 'PENDING_LEAVE',
            label: activeLeave.leaveTypeName,
            leaveId: activeLeave.id
          };
        }

        return { date: dateStr, status: 'WORKING', label: 'Working' };
      });

      return {
        member: {
          id: member.id,
          name: member.name,
          designation: member.designation,
          department: member.department
        },
        schedule
      };
    });

    return { dates, matrix };
  },

  async getTeamOverview(currentUser) {
    await delay(180);
    const teamAvailability = await this.getTeamAvailability(currentUser);
    const approvals = await this.getMyApprovals(currentUser);
    const leaves = db.get(STORAGE_KEYS.LEAVES);
    const teamMembers = await this.getTeamMembers(currentUser);
    const teamIds = new Set(teamMembers.map(m => m.id));

    const teamLeaves = leaves.filter(l => teamIds.has(l.employeeId));
    const approvedThisMonth = teamLeaves.filter(l => l.status === 'APPROVED' && l.startDate?.startsWith('2026-08')).length;
    const rejectedThisMonth = teamLeaves.filter(l => l.status === 'REJECTED' && l.appliedDate?.startsWith('2026-08')).length;
    const escalatedCount = approvals.filter(a => a.sla?.isEscalated).length;

    // Leave distribution by category
    const categoryCounts = {};
    teamLeaves.filter(l => l.status === 'APPROVED').forEach(l => {
      categoryCounts[l.leaveTypeName] = (categoryCounts[l.leaveTypeName] || 0) + l.duration;
    });

    return {
      totalMembers: teamMembers.length,
      workingToday: teamAvailability.working,
      onLeaveToday: teamAvailability.onLeave,
      pendingApprovals: approvals.length,
      approvedThisMonth,
      rejectedThisMonth,
      escalatedCount,
      categoryDistribution: categoryCounts
    };
  },

  // 5. Notifications
  async getNotifications(currentUser) {
    await delay(100);
    const notifications = db.get(STORAGE_KEYS.NOTIFICATIONS).filter(n => n.userId === currentUser.id);
    const unreadCount = notifications.filter(n => !n.read).length;
    return {
      unreadCount,
      notifications: notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };
  },

  async markNotificationAsRead(id, currentUser) {
    await delay(100);
    const notifications = db.get(STORAGE_KEYS.NOTIFICATIONS);
    const index = notifications.findIndex(n => n.id === id && n.userId === currentUser.id);
    if (index >= 0) {
      notifications[index].read = true;
      db.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
    return { success: true };
  },

  async markAllNotificationsAsRead(currentUser) {
    await delay(100);
    const notifications = db.get(STORAGE_KEYS.NOTIFICATIONS);
    notifications.forEach(n => {
      if (n.userId === currentUser.id) {
        n.read = true;
      }
    });
    db.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return { success: true };
  }
};
