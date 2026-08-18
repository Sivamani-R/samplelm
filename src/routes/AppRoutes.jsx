import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { RoleBasedRoute } from './RoleBasedRoute.jsx';
import { ROLES } from '../constants/roles.js';

// Layouts
import { AdminLayout } from '../components/layout/AdminLayout.jsx';
import { EmployeeLayout } from '../components/layout/EmployeeLayout.jsx';
import { TeamLeadLayout } from '../components/layout/TeamLeadLayout.jsx';
import { ManagerLayout } from '../components/layout/ManagerLayout.jsx';

// Auth & Admin Pages
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage.jsx';
import { EmployeesListPage } from '../pages/admin/EmployeesListPage.jsx';
import { CreateEmployeePage } from '../pages/admin/CreateEmployeePage.jsx';
import { EmployeeMappingPage } from '../pages/admin/EmployeeMappingPage.jsx';
import { LocationsPage } from '../pages/admin/LocationsPage.jsx';
import { LeaveCategoriesPage } from '../pages/admin/LeaveCategoriesPage.jsx';
import { LeavePoliciesPage } from '../pages/admin/LeavePoliciesPage.jsx';
import { ApprovalWorkflowsPage } from '../pages/admin/ApprovalWorkflowsPage.jsx';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage.jsx';

// Employee Portal Pages (Shared Self-Service)
import { EmployeeDashboardPage } from '../pages/portals/EmployeeDashboardPage.jsx';
import { ApplyLeavePage } from '../pages/portals/ApplyLeavePage.jsx';
import { LeaveHistoryPage } from '../pages/portals/LeaveHistoryPage.jsx';
import { LeaveBalanceDetailPage } from '../pages/portals/LeaveBalanceDetailPage.jsx';
import { HolidayCalendarPage } from '../pages/portals/HolidayCalendarPage.jsx';
import { AttendanceRegularizationPage } from '../pages/portals/AttendanceRegularizationPage.jsx';
import { CompOffPage } from '../pages/portals/CompOffPage.jsx';
import { WeekendAllowancePage } from '../pages/portals/WeekendAllowancePage.jsx';

// Team Lead Portal Pages (Module 3)
import { TeamLeadDashboardPage } from '../pages/teamLead/TeamLeadDashboardPage.jsx';
import { TeamLeadApprovalsPage } from '../pages/teamLead/TeamLeadApprovalsPage.jsx';
import { TeamLeadApprovalHistoryPage } from '../pages/teamLead/TeamLeadApprovalHistoryPage.jsx';
import { TeamLeadTeamCalendarPage } from '../pages/teamLead/TeamLeadTeamCalendarPage.jsx';

// Manager Portal Pages (Module 3)
import { ManagerDashboardPage } from '../pages/manager/ManagerDashboardPage.jsx';
import { ManagerApprovalsPage } from '../pages/manager/ManagerApprovalsPage.jsx';
import { ManagerEscalatedPage } from '../pages/manager/ManagerEscalatedPage.jsx';
import { ManagerApprovalHistoryPage } from '../pages/manager/ManagerApprovalHistoryPage.jsx';
import { ManagerTeamCalendarPage } from '../pages/manager/ManagerTeamCalendarPage.jsx';

// Global Notifications Center
import { NotificationsPage } from '../pages/notifications/NotificationsPage.jsx';

// Error Pages
import { UnauthorizedPage } from '../pages/errors/UnauthorizedPage.jsx';
import { NotFoundPage } from '../pages/errors/NotFoundPage.jsx';

/**
 * Root Router Component
 */
export const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();

  const getHomeRoute = () => {
    if (!isAuthenticated) return '/login';
    switch (role) {
      case ROLES.ADMIN:
        return '/admin';
      case ROLES.TEAM_LEAD:
        return '/team-lead';
      case ROLES.MANAGER:
        return '/manager';
      case ROLES.EMPLOYEE:
      default:
        return '/employee';
    }
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />

      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Module (Protected + Role: ADMIN) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="employees" element={<EmployeesListPage />} />
        <Route path="employees/create" element={<CreateEmployeePage />} />
        <Route path="mappings" element={<EmployeeMappingPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="leave-categories" element={<LeaveCategoriesPage />} />
        <Route path="leave-policies" element={<LeavePoliciesPage />} />
        <Route path="approval-workflows" element={<ApprovalWorkflowsPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
      </Route>

      {/* Employee Portal (Protected + Shared Self-Service for All Roles) */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.MANAGER, ROLES.ADMIN]}>
              <EmployeeLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboardPage />} />
        <Route path="apply-leave" element={<ApplyLeavePage />} />
        <Route path="leave-history" element={<LeaveHistoryPage />} />
        <Route path="leave-balance" element={<LeaveBalanceDetailPage />} />
        <Route path="holidays" element={<HolidayCalendarPage />} />
        <Route path="attendance-regularization" element={<AttendanceRegularizationPage />} />
        <Route path="comp-off" element={<CompOffPage />} />
        <Route path="weekend-allowance" element={<WeekendAllowancePage />} />
      </Route>

      {/* Team Lead Portal (Module 3: Protected + Role: TEAM_LEAD) */}
      <Route
        path="/team-lead"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.TEAM_LEAD]}>
              <TeamLeadLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<TeamLeadDashboardPage />} />
        <Route path="approvals" element={<TeamLeadApprovalsPage />} />
        <Route path="approval-history" element={<TeamLeadApprovalHistoryPage />} />
        <Route path="team-calendar" element={<TeamLeadTeamCalendarPage />} />

        {/* Inherited Employee Self-Service */}
        <Route path="apply-leave" element={<ApplyLeavePage />} />
        <Route path="leave-history" element={<LeaveHistoryPage />} />
        <Route path="holidays" element={<HolidayCalendarPage />} />
        <Route path="attendance-regularization" element={<AttendanceRegularizationPage />} />
        <Route path="comp-off" element={<CompOffPage />} />
        <Route path="weekend-allowance" element={<WeekendAllowancePage />} />
      </Route>

      {/* Manager Portal (Module 3: Protected + Role: MANAGER) */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={[ROLES.MANAGER]}>
              <ManagerLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerDashboardPage />} />
        <Route path="approvals" element={<ManagerApprovalsPage />} />
        <Route path="escalated" element={<ManagerEscalatedPage />} />
        <Route path="approval-history" element={<ManagerApprovalHistoryPage />} />
        <Route path="team-calendar" element={<ManagerTeamCalendarPage />} />

        {/* Inherited Employee Self-Service */}
        <Route path="apply-leave" element={<ApplyLeavePage />} />
        <Route path="leave-history" element={<LeaveHistoryPage />} />
        <Route path="holidays" element={<HolidayCalendarPage />} />
        <Route path="attendance-regularization" element={<AttendanceRegularizationPage />} />
        <Route path="comp-off" element={<CompOffPage />} />
        <Route path="weekend-allowance" element={<WeekendAllowancePage />} />
      </Route>

      {/* Global Notifications Page (All Authenticated Users) */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            {role === ROLES.ADMIN ? (
              <AdminLayout />
            ) : role === ROLES.MANAGER ? (
              <ManagerLayout />
            ) : role === ROLES.TEAM_LEAD ? (
              <TeamLeadLayout />
            ) : (
              <EmployeeLayout />
            )}
          </ProtectedRoute>
        }
      >
        <Route index element={<NotificationsPage />} />
      </Route>

      {/* Access Denied Page */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
