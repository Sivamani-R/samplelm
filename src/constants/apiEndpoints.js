/**
 * Centralized API Endpoint Routes
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me'
  },
  ADMIN: {
    EMPLOYEES: '/admin/employees',
    TEAM_LEADS: '/admin/team-leads',
    MANAGERS: '/admin/managers',
    MAPPINGS: '/admin/mappings',
    LOCATIONS: '/admin/locations',
    LEAVE_CATEGORIES: '/admin/leave-categories',
    LEAVE_POLICIES: '/admin/leave-policies',
    APPROVAL_WORKFLOWS: '/admin/approval-workflows',
    AUDIT_LOGS: '/admin/audit-logs',
    STATS: '/admin/stats'
  }
};
