import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import { UserRole } from '../types';
import sessionManager, { startSessionMonitoring, stopSessionMonitoring, addSessionListener } from '../utils/sessionManager';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  // Validate token with backend
  const validateToken = useCallback(async (storedToken) => {
    try {
      setIsValidating(true);
      const response = await apiService.getCurrentUser();
      return { valid: true, user: response.data };
    } catch (error) {
      console.log('Token validation failed:', error);
      return { valid: false, user: null };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    setToken(null);
    setUser(null);
  }, []);

  // Enhanced initialization with immediate session restoration
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🔄 Initializing auth context...');
      
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const lastActivity = localStorage.getItem('lastActivity');

      console.log('📂 Storage check:', {
        hasToken: !!storedToken,
        hasUser: !!storedUser,
        hasActivity: !!lastActivity,
        activityTime: lastActivity ? new Date(parseInt(lastActivity)).toLocaleString() : 'None'
      });

      if (storedToken && storedUser) {
        try {
          // Parse stored user data
          const userData = JSON.parse(storedUser);
          console.log('👤 Parsed user data:', userData);
          
          // Check if session has expired based on last activity (extended to 2 hours for testing)
          const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours for more lenient testing
          const isSessionExpired = lastActivity && 
            (Date.now() - parseInt(lastActivity)) > SESSION_TIMEOUT;
          
          if (isSessionExpired) {
            console.log('⏰ Session expired based on last activity, clearing session');
            clearSession();
            setIsLoading(false);
            return;
          }
          
          // IMMEDIATELY restore session (synchronous)
          console.log('✅ Restoring session immediately');
          setToken(storedToken);
          setUser(userData);
          
          // Update last activity to current time
          localStorage.setItem('lastActivity', Date.now().toString());
          
          console.log('🎉 Session restored successfully:', {
            user: userData.name || userData.email,
            role: userData.role,
            authenticated: true
          });
          
        } catch (error) {
          console.error('❌ Error parsing stored session data:', error);
          clearSession();
        }
      } else {
        console.log('📭 No stored session found');
      }
      
      // Set loading to false immediately after checking
      console.log('✅ Auth initialization complete');
      setIsLoading(false);
    };

    // Run initialization immediately (synchronously)
    initializeAuth();
  }, [clearSession]);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', credentials.email);
      
      const response = await apiService.login(credentials);
      console.log('Login response:', response.data);
      
      const { token: newToken, userType, username, email, fullName, userId, employeeId, role, firstName, lastName, name } = response.data;

      // Construct user object from backend response (handle both old and new response formats)
      const newUser = {
        id: userId || '0',
        name: fullName || name || username || 'Unknown User',
        firstName: firstName || fullName?.split(' ')[0] || 'User',
        lastName: lastName || fullName?.split(' ')[1] || '',
        fullName: fullName || name || `${firstName || ''} ${lastName || ''}`.trim() || username,
        email: email || credentials.email || credentials.username,
        role: role || userType, // This should be 'ADMIN', 'HR', 'MANAGER', or 'EMPLOYEE'
        employeeId: employeeId, // Store the actual employee ID (EMP003, EMP005, etc.)
      };
      
      console.log('Constructed user object:', newUser);

      // Store in localStorage with activity timestamp
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('lastActivity', Date.now().toString());
      console.log('Stored user in localStorage:', localStorage.getItem('user'));

      // Update state
      setToken(newToken);
      setUser(newUser);

      toast.success(`Welcome back, ${newUser.name}!`);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearSession();
    toast.success('Logged out successfully');
  }, [clearSession]);

  // Session monitoring and token validation
  useEffect(() => {
    if (!token || !user) {
      stopSessionMonitoring();
      return;
    }

    // Start session monitoring
    startSessionMonitoring();

    // Listen to session events
    const removeSessionListener = addSessionListener((event) => {
      if (event.type === 'session:timeout') {
        console.log('Session timeout, logging out');
        toast.error('Session expired due to inactivity');
        logout();
      } else if (event.type === 'session:warning') {
        toast('Session expiring soon. Please save your work.', {
          duration: 5000,
          icon: '⚠️',
        });
      }
    });

    // Periodic token validation
    const validatePeriodically = setInterval(async () => {
      const validation = await validateToken(token);
      if (!validation.valid) {
        console.log('Token expired during session, logging out');
        logout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(validatePeriodically);
      removeSessionListener();
      stopSessionMonitoring();
    };
  }, [token, user, validateToken, logout]);

  const isAuthenticated = !!token && !!user && !isLoading;

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading: isLoading || isValidating,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};