import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const authData = localStorage.getItem("proofnexa_auth");
  const parsed = authData ? JSON.parse(authData) : null;
  const token = parsed?.accessToken || parsed?.token;

  if (!token) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
