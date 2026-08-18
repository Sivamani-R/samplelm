import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAME_MAP = {
  admin: 'Admin Console',
  employees: 'Employees',
  create: 'Create Employee',
  mappings: 'Employee Mapping',
  locations: 'Locations',
  'leave-categories': 'Leave Categories',
  'leave-policies': 'Leave Policies',
  'approval-workflows': 'Approval Workflows',
  audit: 'Audit Logs'
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="Breadcrumb" className="topbar-breadcrumb">
      <Link to="/admin" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
        <Home size={14} />
      </Link>

      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = ROUTE_NAME_MAP[segment] || segment;

        return (
          <React.Fragment key={routeTo}>
            <span className="breadcrumb-separator">/</span>
            {isLast ? (
              <span className="breadcrumb-current">{displayName}</span>
            ) : (
              <Link to={routeTo} style={{ color: 'var(--text-secondary)' }}>
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
