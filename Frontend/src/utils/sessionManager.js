/**
 * Session Management Utility
 * Handles session timeout, activity tracking, and automatic logout
 */

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

class SessionManager {
  constructor() {
    this.timeoutId = null;
    this.warningTimeoutId = null;
    this.listeners = new Set();
    this.isActive = false;
  }

  // Start session monitoring
  startSession() {
    this.isActive = true;
    this.resetTimeout();
    this.addActivityListeners();
    console.log('Session monitoring started');
  }

  // Stop session monitoring
  stopSession() {
    this.isActive = false;
    this.clearTimeouts();
    this.removeActivityListeners();
    console.log('Session monitoring stopped');
  }

  // Reset session timeout
  resetTimeout() {
    if (!this.isActive) return;

    this.clearTimeouts();
    
    // Set warning timeout
    this.warningTimeoutId = setTimeout(() => {
      this.notifyListeners('session:warning', {
        timeLeft: WARNING_TIME,
        message: 'Your session will expire in 5 minutes. Please save your work.'
      });
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set actual timeout
    this.timeoutId = setTimeout(() => {
      this.notifyListeners('session:timeout', {
        message: 'Session expired due to inactivity'
      });
      this.stopSession();
    }, SESSION_TIMEOUT);

    // Update last activity timestamp
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  // Clear all timeouts
  clearTimeouts() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  // Add activity event listeners
  addActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  // Remove activity event listeners
  removeActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity);
    });
  }

  // Handle user activity
  handleActivity = () => {
    if (this.isActive) {
      this.resetTimeout();
    }
  }

  // Add event listener
  addEventListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(type, data) {
    this.listeners.forEach(callback => {
      try {
        callback({ type, data });
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }

  // Check if session is valid based on last activity
  isSessionValid() {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return false;

    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    return timeSinceActivity < SESSION_TIMEOUT;
  }

  // Get time remaining in session
  getTimeRemaining() {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return 0;

    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    return Math.max(0, SESSION_TIMEOUT - timeSinceActivity);
  }

  // Format time remaining for display
  formatTimeRemaining() {
    const timeLeft = this.getTimeRemaining();
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;

// Export utility functions
export const startSessionMonitoring = () => sessionManager.startSession();
export const stopSessionMonitoring = () => sessionManager.stopSession();
export const isSessionValid = () => sessionManager.isSessionValid();
export const addSessionListener = (callback) => sessionManager.addEventListener(callback);
export const getTimeRemaining = () => sessionManager.getTimeRemaining();
export const formatTimeRemaining = () => sessionManager.formatTimeRemaining();
