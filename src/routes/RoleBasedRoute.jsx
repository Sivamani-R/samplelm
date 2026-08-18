import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { UnauthorizedPage } from '../pages/errors/UnauthorizedPage.jsx';

/**
 * Route guard that requires user to have one of the specified roles.
 * Renders UnauthorizedPage (403) if role doesn't match.
 */
export const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const { user, role } = useAuth();

  if (!user || !role || !allowedRoles.includes(role)) {
    return <UnauthorizedPage requiredRoles={allowedRoles} currentRole={role} />;
  }

  return children;
};
