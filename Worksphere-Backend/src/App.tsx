import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import HRDashboard from './pages/hr/HRDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRouter />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

const DashboardRouter: React.FC = () => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (hasRole('ROLE_ADMIN')) {
    return <AdminDashboard />;
  } else if (hasRole('ROLE_HR')) {
    return <HRDashboard />;
  } else if (hasRole('ROLE_MANAGER')) {
    return <ManagerDashboard />;
  } else if (hasRole('ROLE_EMPLOYEE')) {
    return <EmployeeDashboard />;
  }

  return <Navigate to="/login" replace />;
};

export default App; 