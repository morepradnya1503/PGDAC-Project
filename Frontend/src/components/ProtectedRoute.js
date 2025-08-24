import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types';

const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute: Initializing for path:', location.pathname);
    console.log('🛡️ ProtectedRoute: Current auth state:', {
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      isLoading
    });
    
    // Add a delay to ensure auth context is fully initialized
    const timer = setTimeout(() => {
      console.log('🛡️ ProtectedRoute: Session check complete');
      setSessionChecked(true);
    }, 200); // Reduced delay since auth is now synchronous

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, isLoading, location.pathname]);

  // Show loading spinner while checking authentication
  if (isLoading || !sessionChecked) {
    console.log('🛡️ ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🚨 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && user) {
    const userRole = user.role;
    
    // Check if user role matches any allowed role (handle both formats: 'MANAGER' and 'ROLE_MANAGER')
    const hasAccess = allowedRoles.some(allowedRole => {
      // Direct match
      if (userRole === allowedRole) return true;
      // Check ROLE_ prefixed version
      if (userRole === `ROLE_${allowedRole}`) return true;
      // Check non-prefixed version  
      if (userRole.startsWith('ROLE_') && userRole.substring(5) === allowedRole) return true;
      return false;
    });
    
    if (!hasAccess) {
      console.log('🚨 ProtectedRoute: Role mismatch, redirecting. Required:', allowedRoles, 'User role:', userRole);
      
      // Redirect to appropriate dashboard based on user role (handle both formats)
      const normalizedRole = userRole.startsWith('ROLE_') ? userRole.substring(5) : userRole;
      const roleRedirects = {
        'ADMIN': '/admin',
        'HR': '/hr', 
        'MANAGER': '/manager',
        'EMPLOYEE': '/employee',
      };
      
      const redirectPath = roleRedirects[normalizedRole] || '/';
      console.log('🔄 ProtectedRoute: Redirecting to', redirectPath, 'for role', normalizedRole);
      return <Navigate to={redirectPath} replace />;
    }
  }

  console.log('✅ ProtectedRoute: Access granted for', location.pathname);
  return <>{children}</>
};

export default ProtectedRoute;