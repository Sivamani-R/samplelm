import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ManagerSidebar } from './ManagerSidebar.jsx';
import { TopNavbar } from './TopNavbar.jsx';

export const ManagerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout-shell">
      <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main-wrapper">
        <TopNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
