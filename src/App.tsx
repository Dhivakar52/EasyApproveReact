import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationPage';
import SelfNominationPage from './pages/SelfNominationPage';
import NominationPage from './pages/NominationPage';
import AddNomination from './components/NominationContent/AddNomination';
import ApprovalComponent from './components/ManagerPage/ApprovalComponent';
import AdminInner from './components/AdminSetting/AdminInner';
import AwardCategories from './components/AdminSetting/AwardCategories';
import EntitiesDepartments from './components/AdminSetting/EntitiesDepartments';
import JuryEvaluationConfiguration from './components/AdminSetting/JuryEvaluationConfiguration';
import JuryRoleMapping from './components/AdminSetting/JuryRoleMapping';
import RoleAccessLevels from './components/AdminSetting/RoleAccessLevels';
import NominationCycleMaster from './components/AdminSetting/NominationCycleMaster';
import JuryPanelSetup from './components/AdminSetting/JuryPanelSetup';
import ProfileCardPage from './pages/ProfileCardPage';
import RequestDetailsPage from './pages/RequestDetailsPage';
import ModifyRequestPage from './pages/ModifyRequestPage';
import Login from './pages/auth/Login/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { type UserRole, normalizeRole } from './dataTypes/roles';
import { getAllowedRoles } from './config/menu.config';
import { adminSubPageRoles } from './routes/routes.config';

// -------------------------
// Main page components (Restricted to User and Admin)
// -------------------------
const pageComponents: Record<string, React.ComponentType> = {
  Home: HomePage,
  Notifications: NotificationsPage,
  'Self Nominations': SelfNominationPage,
  'My Nominations': NominationPage,
  Approvals: ApprovalComponent,
  'Admin Setting': AdminInner,
};

// -------------------------
// Admin sub-pages
// -------------------------
const adminSubPages: Record<string, React.ComponentType> = {
  'award-categories': AwardCategories,
  'entities-departments': EntitiesDepartments,
  'nomination-cycle': NominationCycleMaster,
  'jury-panel-setup': JuryPanelSetup,
  'jury-evaluation-settings': JuryEvaluationConfiguration,
  'jury-role-mapping': JuryRoleMapping,
  'role-list': RoleAccessLevels,
};

// -------------------------
// App Component
// -------------------------
const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null | undefined>(undefined);

  useEffect(() => {
    const rawRole = localStorage.getItem('userRole');
    const storedRole = rawRole ? normalizeRole(rawRole) : null;
    setUserRole(storedRole);
  }, []);

  if (userRole === undefined) return null; // wait for role initialization

  return (
    <ErrorBoundary>
      <Toaster />
      <Router>
        <Routes>
          {/* Public login route */}
          <Route path="/" element={<Login setUserRole={setUserRole} />} />

          {/* Protected routes wrapped in Layout */}
          <Route element={<Layout />}>
            {/* Main pages */}
            {Object.entries(pageComponents).map(([label, Component]) => {
              const path = '/' + label.toLowerCase().replace(/\s+/g, '-');
              const allowedRoles = getAllowedRoles(label);

              return (
                <Route
                  key={label}
                  path={path}
                  element={
                    <ProtectedRoute userRole={userRole} allowedRoles={allowedRoles}>
                      <Component />
                    </ProtectedRoute>
                  }
                />
              );
            })}

            {/* Prototype Route Aliases for seamless navigation */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={getAllowedRoles('Home')}>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={getAllowedRoles('Self Nominations')}>
                  <SelfNominationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={getAllowedRoles('My Nominations')}>
                  <NominationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile-card"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={getAllowedRoles('Profile Card')}>
                  <ProfileCardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={getAllowedRoles('Profile Card')}>
                  <ProfileCardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={adminSubPageRoles['role-list']}>
                  <RoleAccessLevels />
                </ProtectedRoute>
              }
            />

            {/* Inner Pages: Request Details & Modify */}
            <Route
              path="/request/:id"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={['user', 'approver', 'admin']}>
                  <RequestDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/:id"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={['user', 'approver', 'admin']}>
                  <RequestDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-nominations/:id"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={['user', 'approver', 'admin']}>
                  <RequestDetailsPage mode="my-requests" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approvals/:id"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={['user', 'approver', 'admin']}>
                  <RequestDetailsPage mode="approvals" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modify/:id"
              element={
                <ProtectedRoute userRole={userRole} allowedRoles={['user', 'approver', 'admin']}>
                  <ModifyRequestPage />
                </ProtectedRoute>
              }
            />

            {/* Obsolete Role Route Redirects */}
            <Route path="/business-jury" element={<Navigate to="/approvals" replace />} />
            <Route path="/president-unit" element={<Navigate to="/approvals" replace />} />
            <Route path="/president-level" element={<Navigate to="/approvals" replace />} />
            <Route path="/award-management" element={<Navigate to="/home" replace />} />

            {/* Admin sub-pages */}
            {Object.entries(adminSubPages).map(([slug, Component]) => (
              <Route
                key={slug}
                path={`/admin-setting/${slug}`}
                element={
                  <ProtectedRoute
                    userRole={userRole}
                    allowedRoles={adminSubPageRoles[slug]}
                  >
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Add Nomination nested route */}
            <Route
              path="/my-nominations/add-nomination"
              element={
                <ProtectedRoute
                  userRole={userRole}
                  allowedRoles={getAllowedRoles('Add Nomination')}
                >
                  <AddNomination />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
