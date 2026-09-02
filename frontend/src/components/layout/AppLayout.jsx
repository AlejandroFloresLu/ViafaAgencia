import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

export default function AppLayout({ children, activePage, setActivePage, userRole, setUserRole }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activePage={activePage} setActivePage={setActivePage} />
      <div className="main-wrapper">
        <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userRole={userRole} setUserRole={setUserRole} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
