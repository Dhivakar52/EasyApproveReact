import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../dataTypes/roles';

interface ProtectedRouteProps {
  userRole: UserRole | null;
  allowedRoles: UserRole[];
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ userRole, allowedRoles, children }) => {
  const location = useLocation();

  if (!userRole) {
    // Preserve intended destination path so login can return user directly to request
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  if (!allowedRoles.includes(userRole)) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
