import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Auth from '../pages/Auth';
import NotFound from '../pages/NotFound';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import Reports from "../pages/Reports";
import ReportDetails from "../pages/ReportDetails";



// Placeholder Pages
import Scan from '../pages/Scan';
import ScanProgress from '../pages/ScanProgress';
import History from '../pages/History';
import Settings from '../pages/Settings';
import Help from '../pages/Help';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reports" element={<Reports />} />

      
      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="scan" element={<Scan />} />
          <Route path="scan-progress" element={<ScanProgress />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetails />} />
          <Route path="history" element={<History />} />
          <Route path="favorites" element={<div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12"><h2 className="text-2xl font-semibold text-gray-700">Favorites page coming soon</h2></div>} />
          <Route path="team" element={<div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12"><h2 className="text-2xl font-semibold text-gray-700">Team page coming soon</h2></div>} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
