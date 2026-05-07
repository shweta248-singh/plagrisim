import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Topbar toggleSidebar={toggleSidebar} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#070B16] via-[#0B1020] to-[#140B2E] p-4 sm:p-6 lg:p-8">
          {/* Nested routes will render here */}
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
