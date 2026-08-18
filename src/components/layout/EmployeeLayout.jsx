import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { EmployeeSidebar } from './EmployeeSidebar.jsx';
import { TeamLeadSidebar } from './TeamLeadSidebar.jsx';
import { ManagerSidebar } from './ManagerSidebar.jsx';
import { Sidebar as AdminSidebar } from './Sidebar.jsx';
import { TopNavbar } from './TopNavbar.jsx';

export const EmployeeLayout = () => {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSidebar = () => {
    if (role === ROLES.TEAM_LEAD) {
      return <TeamLeadSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    }
    if (role === ROLES.MANAGER) {
      return <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    }
    if (role === ROLES.ADMIN) {
      return <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    }
    return <EmployeeSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
  };

  return (
    <div className="admin-layout-shell">
      {renderSidebar()}
      <div className="admin-main-wrapper">
        <TopNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
