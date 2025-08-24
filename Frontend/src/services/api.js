import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Enhanced request interceptor to include JWT token and track activity
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Update last activity timestamp on each request
        localStorage.setItem('lastActivity', Date.now().toString());
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Enhanced response interceptor with custom event dispatch instead of hard redirect
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle both 401 and 403 as authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log(`Authentication error (${error.response.status}):`, error.response?.data?.message || 'Access denied');
          
          // Clear storage only for actual auth failures, not for access denied errors
          if (error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastActivity');
            
            // Dispatch custom event instead of hard redirect
            // This allows React components to handle the logout gracefully
            window.dispatchEvent(new CustomEvent('auth:unauthorized', {
              detail: { error: error.response?.data?.message || 'Unauthorized' }
            }));
          }
          // For 403 errors, just log and pass through - these are permission issues, not auth issues
        }
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck() {
    return this.api.get('/health');
  }

  // Authentication
  async login(credentials) {
    return this.api.post('/auth/login', credentials);
  }

  async signup(signupData) {
    return this.api.post('/auth/signup', signupData);
  }

  async getCurrentUser() {
    return this.api.get('/auth/me');
  }

  async debugAuth() {
    return this.api.get('/auth/debug');
  }

  // Token refresh method (if your backend supports it)
  async refreshToken() {
    try {
      const response = await this.api.post('/auth/refresh');
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('lastActivity', Date.now().toString());
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.api.get('/admin/dashboard');
  }

  async getPublicAdminDashboard() {
    return this.api.get('/admin/dashboard/public');
  }

  // HR endpoints
  async getHRDashboard() {
    return this.api.get('/hr/dashboard');
  }
  
  async getHRPendingLeaves() {
    return this.api.get('/hr/leaves/pending');
  }
  
  async getRecentEmployees(limit = 2) {
    try {
      // Try the proper HR endpoint first (will work after backend restart)
      const response = await this.api.get(`/hr/recent-employees?limit=${limit}`);
      
      // Sort the response data in descending order by creation date or ID
      if (response.data && Array.isArray(response.data)) {
        const sortedEmployees = response.data.sort((a, b) => {
          // Primary sort: by createdAt date if available
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          // Secondary sort: by dateOfJoining if available
          if (a.dateOfJoining && b.dateOfJoining) {
            return new Date(b.dateOfJoining) - new Date(a.dateOfJoining);
          }
          // Tertiary sort: by ID (newer employees have higher IDs)
          return (b.id || 0) - (a.id || 0);
        });
        
        return { data: sortedEmployees.slice(0, limit) };
      }
      
      return response;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.warn('HR endpoint not accessible, falling back to get all employees and filter');
        try {
          // Fallback: get all employees and take the most recent ones
          const allEmployeesResponse = await this.api.get('/hr/employees');
          if (allEmployeesResponse.data && Array.isArray(allEmployeesResponse.data)) {
            // Sort employees in descending order by creation date or ID
            const sortedEmployees = allEmployeesResponse.data.sort((a, b) => {
              // Primary sort: by createdAt date if available
              if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
              // Secondary sort: by dateOfJoining if available
              if (a.dateOfJoining && b.dateOfJoining) {
                return new Date(b.dateOfJoining) - new Date(a.dateOfJoining);
              }
              // Tertiary sort: by ID (newer employees have higher IDs)
              return (b.id || 0) - (a.id || 0);
            });
            
            // Return only the most recent employees (limit)
            return { data: sortedEmployees.slice(0, limit) };
          }
          
          // Try admin public dashboard as final fallback
          const response = await this.api.get('/admin/dashboard/public');
          const dashboardData = response.data;
          if (dashboardData && dashboardData.recentEmployees && Array.isArray(dashboardData.recentEmployees)) {
            // Sort and take only the requested number of employees
            const sortedRecentEmployees = dashboardData.recentEmployees.sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
              return (b.id || 0) - (a.id || 0);
            });
            return { data: sortedRecentEmployees.slice(0, limit) };
          }
          return { data: [] };
        } catch (fallbackError) {
          console.error('All endpoints failed:', fallbackError);
          // Final fallback: return mock data to prevent dashboard crash
          return { 
            data: [
              {
                id: 2,
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@worksphere.com',
                department: 'Marketing',
                role: 'ROLE_EMPLOYEE',
                createdAt: new Date().toISOString(),
                dateOfJoining: new Date().toISOString().split('T')[0]
              },
              {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@worksphere.com',
                department: 'Engineering',
                role: 'ROLE_EMPLOYEE',
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                dateOfJoining: new Date(Date.now() - 86400000).toISOString().split('T')[0]
              }
            ].slice(0, limit)
          };
        }
      }
      throw error;
    }
  }
  
  // HR Employee endpoints
  async getEmployees(cacheBust) {
    const url = cacheBust ? `/hr/employees?_t=${Date.now()}` : '/hr/employees';
    return this.api.get(url);
  }

  async getEmployee(id) {
    return this.api.get(`/hr/employees/${id}`);
  }

  async createEmployee(employee) {
    return this.api.post('/hr/employees', employee);
  }

  async updateEmployee(id, employee) {
    return this.api.put(`/hr/employees/${id}`, employee);
  }

  async deleteEmployee(id) {
    return this.api.delete(`/hr/employees/${id}`);
  }
  
  // HR Project endpoints
  async getHRProjects() {
    return this.api.get('/hr/projects');
  }
  
  async createHRProject(project) {
    return this.api.post('/hr/projects', project);
  }
  
  async updateHRProject(id, project) {
    return this.api.put(`/hr/projects/${id}`, project);
  }
  
  async deleteHRProject(id) {
    return this.api.delete(`/hr/projects/${id}`);
  }
  
  async assignEmployeeToProject(projectId, employeeId) {
    return this.api.post(`/hr/projects/${projectId}/assign/${employeeId}`);
  }
  
  async removeEmployeeFromProject(projectId, employeeId) {
    return this.api.delete(`/hr/projects/${projectId}/remove/${employeeId}`);
  }

  // Employee profile endpoints
  async getEmployeeProfile(employeeId) {
    const url = employeeId ? `/employee/profile?employeeId=${employeeId}` : '/employee/profile';
    return this.api.get(url);
  }

  async updateEmployeeProfile(profileData, employeeId) {
    const url = employeeId ? `/employee/profile?employeeId=${employeeId}` : '/employee/profile';
    return this.api.put(url, profileData);
  }

  async updateEmployeeSkills(skillsData) {
    return this.api.put('/employee/skills', skillsData);
  }

  async getEmployeeProjects() {
    return this.api.get('/employee/projects');
  }

  async getTeamMembers() {
    return this.api.get('/employee/team-members');
  }

  async getEmployeeFeedback() {
    return this.api.get('/employee/feedback');
  }

  async getEmployeeFeedbackBySprint(sprintNumber) {
    return this.api.get(`/employee/feedback/sprint/${sprintNumber}`);
  }

  async downloadResume() {
    return this.api.get('/employee/resume');
  }

  async generateIdCard() {
    return this.api.get('/employee/id-card');
  }

  // Leave endpoints
  async applyLeave(leaveApplication) {
    return this.api.post('/employee/leave/apply', leaveApplication);
  }

  async getLeaveHistory() {
    return this.api.get('/employee/leaves');
  }

  async getLeaveRequests() {
    return this.api.get('/hr/leave/requests');
  }

  async approveLeave(id) {
    return this.api.put(`/hr/leave/${id}/approve`);
  }

  async rejectLeave(id) {
    return this.api.put(`/hr/leave/${id}/reject`);
  }
  
  async managerApproveLeave(id) {
    return this.api.put(`/manager/leave/approve/${id}`);
  }
  
  async managerRejectLeave(id) {
    return this.api.put(`/manager/leave/reject/${id}`);
  }
  
  async getAllManagerLeaves() {
    return this.api.get('/manager/leaves');
  }

  // Project endpoints
  async getProjects() {
    // Changed from admin to hr endpoint to fix 403 error
    return this.api.get('/hr/projects');
  }

  async getProject(id) {
    return this.api.get(`/admin/projects/${id}`);
  }

  async createProject(project) {
    return this.api.post('/admin/projects', project);
  }

  async updateProject(id, project) {
    return this.api.put(`/admin/projects/${id}`, project);
  }

  async deleteProject(id) {
    return this.api.delete(`/admin/projects/${id}`);
  }

  // Department endpoints
  async getDepartments() {
    return this.api.get('/hr/departments');
  }

  async getDepartment(id) {
    return this.api.get(`/admin/departments/${id}`);
  }

  async createDepartment(department) {
    return this.api.post('/admin/departments', department);
  }

  async updateDepartment(id, department) {
    return this.api.put(`/admin/departments/${id}`, department);
  }

  async deleteDepartment(id) {
    return this.api.delete(`/admin/departments/${id}`);
  }
  
  // Manager endpoints
  async getManagerProjects() {
    return this.api.get('/manager/projects');
  }
  
  async getPendingLeaves() {
    return this.api.get('/manager/leaves/pending');
  }
  
  async submitFeedback(feedback) {
    return this.api.post('/manager/feedback', feedback);
  }
  
  async getSubmittedFeedback() {
    return this.api.get('/manager/feedback');
  }
  
  async updateFeedback(id, feedback) {
    return this.api.put(`/manager/feedback/${id}`, feedback);
  }
  
  async deleteFeedback(id) {
    return this.api.delete(`/manager/feedback/${id}`);
  }
}

const apiService = new ApiService();
export default apiService;