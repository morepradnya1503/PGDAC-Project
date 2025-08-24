import React from 'react';
import { useAuth } from '../auth/AuthContext';

const SessionDebug = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const sessionData = {
    localStorage: {
      token: localStorage.getItem('token') ? 'Present' : 'Missing',
      user: localStorage.getItem('user') ? 'Present' : 'Missing',
      lastActivity: localStorage.getItem('lastActivity') ? new Date(parseInt(localStorage.getItem('lastActivity'))).toLocaleString() : 'Missing'
    },
    authContext: {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      hasToken: !!token,
      userRole: user?.role || 'None'
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔧 Session Debug</div>
      
      <div>
        <strong>Storage:</strong>
        <div>Token: {sessionData.localStorage.token}</div>
        <div>User: {sessionData.localStorage.user}</div>
        <div>Activity: {sessionData.localStorage.lastActivity}</div>
      </div>
      
      <div style={{ marginTop: '5px' }}>
        <strong>Context:</strong>
        <div>Auth: {sessionData.authContext.isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {sessionData.authContext.isLoading ? '🔄' : '✅'}</div>
        <div>User: {sessionData.authContext.hasUser ? '✅' : '❌'}</div>
        <div>Token: {sessionData.authContext.hasToken ? '✅' : '❌'}</div>
        <div>Role: {sessionData.authContext.userRole}</div>
      </div>
    </div>
  );
};

export default SessionDebug;
