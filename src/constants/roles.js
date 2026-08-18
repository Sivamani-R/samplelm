/**
 * System User Roles for Dynamic PTO & Leave Management System
 */
export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  TEAM_LEAD: 'TEAM_LEAD',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN'
};

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.TEAM_LEAD]: 'Team Lead',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.ADMIN]: 'Administrator'
};

export const ROLE_BADGE_VARIANTS = {
  [ROLES.EMPLOYEE]: 'info',
  [ROLES.TEAM_LEAD]: 'warning',
  [ROLES.MANAGER]: 'primary',
  [ROLES.ADMIN]: 'accent'
};
