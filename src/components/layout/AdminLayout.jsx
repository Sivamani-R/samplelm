import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { TopNavbar } from './TopNavbar.jsx';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main-wrapper">
        <TopNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
