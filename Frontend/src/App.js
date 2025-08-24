import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import AdminDashboard from './pages/admin/Dashboard';
import HRDashboard from './pages/hr/Dashboard';
import HREmployees from './pages/hr/Employees';
import ManagerDashboard from './pages/manager/Dashboard';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProfile from './pages/employee/Profile';

// Component to handle auth events
const AuthEventHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleUnauthorized = (event) => {
      console.log('Unauthorized event received:', event.detail);
      logout();
      navigate('/login', { replace: true });
    };

    // Listen for auth events from API interceptor
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout, navigate]);

  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AuthEventHandler />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Welcome to WorkSphere</h1>
                    <p className="text-blue-100 text-lg">Employee Management System</p>
                  </div>
                </div>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* HR Routes */}
          <Route path="/hr" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <Layout>
                <HRDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/hr/employees" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <Layout>
                <HREmployees />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Manager Routes */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <Layout>
                <ManagerDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Employee Routes */}
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <Layout>
                <EmployeeDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/profile" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <Layout>
                <EmployeeProfile />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch all route - redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;