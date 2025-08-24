import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Briefcase, UserCheck, TrendingUp, Activity, Plus, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const HRDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    role: 'ROLE_EMPLOYEE',
    joinedDate: new Date().toISOString().split('T')[0] // Default to current date in YYYY-MM-DD format
  });
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ACTIVE',
    managerId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [projectFormErrors, setProjectFormErrors] = useState({});
  const [managers, setManagers] = useState([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchDepartments();
    
    // Check if we should open the Add Employee modal based on navigation state
    if (location.state?.openAddEmployeeModal) {
      setShowAddEmployeeModal(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Check if email already exists in the current employee list
  const isEmailAlreadyExists = (email) => {
    return employees.some(employee => employee.email.toLowerCase() === email.toLowerCase());
  };
  
  // Generate a suggested email based on first name, last name and a number if needed
  const suggestAlternativeEmail = () => {
    if (!newEmployee.firstName || !newEmployee.lastName) return '';
    
    const baseEmail = `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@worksphere.com`;
    
    // If base email doesn't exist, suggest it
    if (!isEmailAlreadyExists(baseEmail)) {
      return baseEmail;
    }
    
    // Otherwise, add a number suffix
    for (let i = 1; i <= 5; i++) {
      const alternativeEmail = `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}${i}@worksphere.com`;
      if (!isEmailAlreadyExists(alternativeEmail)) {
        return alternativeEmail;
      }
    }
    
    // If all alternatives exist, return the base with a random number
    return `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@worksphere.com`;
  };
  
  // Handle the suggest email button click
  const handleSuggestEmail = () => {
    const suggestion = suggestAlternativeEmail();
    if (suggestion) {
      setNewEmployee({
        ...newEmployee,
        email: suggestion
      });
      setFormErrors({
        ...formErrors,
        email: ''
      });
      toast.success('Alternative email suggested');
    }
  };

  // Handle input change for the new employee form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedEmployee = {
      ...newEmployee,
      [name]: value
    };
    
    setNewEmployee(updatedEmployee);
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Auto-generate email when first name and last name are filled
    if ((name === 'firstName' || name === 'lastName') && 
        updatedEmployee.firstName && 
        updatedEmployee.lastName && 
        (!updatedEmployee.email || updatedEmployee.email === '')) {
      const generatedEmail = `${updatedEmployee.firstName.toLowerCase()}.${updatedEmployee.lastName.toLowerCase()}@worksphere.com`;
      
      // Only set the generated email if it doesn't already exist
      if (!isEmailAlreadyExists(generatedEmail)) {
        setNewEmployee({
          ...updatedEmployee,
          email: generatedEmail
        });
      }
    }
    
    // Real-time validation for email field
    if (name === 'email' && value.trim() !== '') {
      // Basic format validation
      if (!value.includes('@')) {
        setFormErrors({
          ...formErrors,
          email: 'Invalid email format'
        });
      } 
      // Company domain validation
      else if (!value.endsWith('@worksphere.com')) {
        setFormErrors({
          ...formErrors,
          email: 'Email must use the company domain (@worksphere.com)'
        });
      }
      // Check for duplicate email
      else if (isEmailAlreadyExists(value)) {
        setFormErrors({
          ...formErrors,
          email: 'This email is already registered. Please use a different email.'
        });
      }
      // Valid email
      else {
        setFormErrors({
          ...formErrors,
          email: ''
        });
      }
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    if (!newEmployee.firstName.trim()) errors.firstName = 'First name is required';
    if (!newEmployee.lastName.trim()) errors.lastName = 'Last name is required';
    
    // Email validation
    if (!newEmployee.email.trim()) {
      errors.email = 'Email is required';
    } else if (!newEmployee.email.includes('@')) {
      errors.email = 'Invalid email format';
    } else if (!newEmployee.email.endsWith('@worksphere.com')) {
      errors.email = 'Email must use the company domain (@worksphere.com)';
    } else if (isEmailAlreadyExists(newEmployee.email)) {
      errors.email = 'This email is already registered. Please use a different email.';
    }
    
    if (!newEmployee.departmentId) errors.departmentId = 'Department is required';
    if (!newEmployee.role) errors.role = 'Role is required';
    if (!newEmployee.joinedDate) errors.joinedDate = 'Joined date is required';
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a copy of the employee data and map joinedDate to dateOfJoining
      const employeeData = {
        ...newEmployee,
        dateOfJoining: newEmployee.joinedDate
      };
      
      await apiService.createEmployee(employeeData);
      toast.success('Employee added successfully!');
      setShowAddEmployeeModal(false);
      // Reset form
      setNewEmployee({
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        role: 'ROLE_EMPLOYEE',
        joinedDate: new Date().toISOString().split('T')[0]
      });
      // Refresh employee list
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding employee:', error);
      
      // Check for duplicate email error
      if (error.response?.data?.message?.includes('Duplicate entry') || 
          error.message?.includes('Duplicate entry') ||
          error.toString().includes('SQLIntegrityConstraintViolationException')) {
        setFormErrors({
          ...formErrors,
          email: 'This email is already registered. Please use a different email.'
        });
        toast.error('Email already exists in the system');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add employee');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
      // Set default departments for demo
      setDepartments([
        { id: 1, name: 'Engineering', code: 'ENG' },
        { id: 2, name: 'Marketing', code: 'MKT' },
        { id: 3, name: 'Finance', code: 'FIN' },
        { id: 4, name: 'HR', code: 'HR' },
        { id: 5, name: 'Analytics', code: 'ANL' }
      ]);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await apiService.getEmployees();
      // Filter employees with ROLE_MANAGER or ROLE_HR
      const managerList = response.data.filter(emp => 
        emp.role === 'ROLE_MANAGER' || emp.role === 'ROLE_HR'
      );
      setManagers(managerList);
    } catch (error) {
      console.error('Error fetching managers:', error);
      // Set sample managers as fallback
      setManagers([
        { id: 1, firstName: 'John', lastName: 'Manager', email: 'john.manager@worksphere.com' },
        { id: 2, firstName: 'Jane', lastName: 'Lead', email: 'jane.lead@worksphere.com' }
      ]);
    }
  };

  // Handle project input changes
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({
      ...newProject,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (projectFormErrors[name]) {
      setProjectFormErrors({
        ...projectFormErrors,
        [name]: ''
      });
    }
  };

  // Validate project form
  const validateProjectForm = () => {
    const errors = {};
    if (!newProject.name.trim()) errors.name = 'Project name is required';
    if (!newProject.description.trim()) errors.description = 'Description is required';
    if (!newProject.startDate) errors.startDate = 'Start date is required';
    if (!newProject.endDate) errors.endDate = 'End date is required';
    
    // Validate end date is after start date
    if (newProject.startDate && newProject.endDate) {
      if (new Date(newProject.endDate) <= new Date(newProject.startDate)) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    if (!newProject.status) errors.status = 'Status is required';
    return errors;
  };

  // Handle project form submission
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateProjectForm();
    if (Object.keys(errors).length > 0) {
      setProjectFormErrors(errors);
      return;
    }
    
    try {
      setIsCreatingProject(true);
      
      // Create project data
      const projectData = {
        ...newProject,
        managerId: newProject.managerId || null
      };
      
      await apiService.createHRProject(projectData);
      toast.success('Project created successfully!');
      setShowCreateProjectModal(false);
      
      // Reset form
      setNewProject({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ACTIVE',
        managerId: ''
      });
      
      // Refresh project list
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Handle opening project creation modal
  const handleCreateProjectClick = () => {
    setShowCreateProjectModal(true);
    // Fetch managers when opening the modal
    fetchManagers();
  };

  // Handle closing project creation modal
  const handleCloseProjectModal = () => {
    setShowCreateProjectModal(false);
    setProjectFormErrors({});
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, employeesResponse, projectsResponse, pendingLeavesResponse] = await Promise.all([
        apiService.getHRDashboard(),
        apiService.getEmployees(),
        apiService.getProjects(),
        apiService.getHRPendingLeaves(),
      ]);
      setStats(statsResponse.data);
      
      // Sort employees in descending order by createdAt date
      const sortedEmployees = employeesResponse.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setEmployees(sortedEmployees);
      
      setProjects(projectsResponse.data);
      setPendingLeaves(pendingLeavesResponse.data);
      
      // Set recent employees from the main employee list
      if (employeesResponse.data && employeesResponse.data.length > 0) {
        console.log('📋 Total employees from API:', employeesResponse.data.length);
        console.log('Raw employee list:', employeesResponse.data.map(emp => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          employeeId: emp.employeeId,
          createdAt: emp.createdAt,
          dateOfJoining: emp.dateOfJoining
        })));
        
        // Get the last 2 employees from the list (most recently added employees)
        // Reverse the array to get the last employees first, then take the first 2
        const lastTwoEmployees = [...employeesResponse.data]
          .reverse() // Reverse to get last employees first
          .slice(0, 2); // Take first 2 (which are actually the last 2 from original list)
        
        console.log('🔄 Last 2 employees from the list (Recent Employees):', lastTwoEmployees.map(emp => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          employeeId: emp.employeeId,
          position: `Position in original list: ${employeesResponse.data.length - employeesResponse.data.indexOf(emp)}`,
          createdAt: emp.createdAt,
          dateOfJoining: emp.dateOfJoining
        })));
        
        setRecentEmployees(lastTwoEmployees);
      } else {
        // If no employees found, create sample data with proper dates for demonstration
        const sampleEmployees = [
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
        ];
        setRecentEmployees(sampleEmployees);
        console.log('📝 Recent employees set to sample data:', sampleEmployees);
      }
    } catch (error) {
      console.error('Error fetching HR dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set default stats for demo
      setStats({
        totalEmployees: 42,
        activeProjects: 12,
        pendingLeaves: 8,
      });
      setEmployees([
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', department: 'Engineering' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', department: 'Marketing' },
      ]);
      setProjects([
        { id: 1, name: 'E-commerce Platform', status: 'ACTIVE', description: 'Online shopping platform' },
        { id: 2, name: 'Mobile App', status: 'ACTIVE', description: 'iOS and Android app' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: Briefcase,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Pending Leaves',
      value: stats?.pendingLeaves || 0,
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading HR Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">HR Dashboard</h1>
          <p className="text-blue-100 text-lg">Manage employees and projects</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowAddEmployeeModal(true)}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <UserPlus className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Add Employee</span>
            </button>
            <button 
              onClick={handleCreateProjectClick}
              className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            >
              <Briefcase className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Create Project</span>
            </button>
            <button 
              className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
            >
              <Activity className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">View Pending Leaves</span>
            </button>
          </div>
        </div>

        {/* Recent Employees */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Employees</h2>
            <button 
              onClick={() => navigate('/hr/employees')}
              className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEmployees.map((employee) => {
                  // Helper function to get department name
                  const getDepartmentName = (emp) => {
                    // First try to get from employee.departmentName (if populated by backend)
                    if (emp.departmentName) {
                      return emp.departmentName;
                    }
                    
                    // If employee has a department object
                    if (emp.department && typeof emp.department === 'object') {
                      return emp.department.name || 'N/A';
                    }
                    
                    // If employee has a departmentId, find the department name
                    if (emp.departmentId && departments.length > 0) {
                      const dept = departments.find(d => d.id === emp.departmentId);
                      return dept ? dept.name : 'N/A';
                    }
                    
                    // If employee.department is just a string/ID, try to find it
                    if (emp.department && typeof emp.department !== 'object' && departments.length > 0) {
                      const dept = departments.find(d => d.id == emp.department || d.name === emp.department);
                      return dept ? dept.name : emp.department;
                    }
                    
                    return 'N/A';
                  };
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Joined {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : new Date(employee.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {employee.employeeId || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getDepartmentName(employee)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {employee.role ? employee.role.replace('ROLE_', '') : 'Employee'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Leave Requests</h2>
            <button 
              className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
          {pendingLeaves.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending leave requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingLeaves.slice(0, 5).map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{leave.employeeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{leave.leaveType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Active Projects */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
            <button 
              onClick={handleCreateProjectClick}
              className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
          
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects found. Create your first project!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Size
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.slice(0, 8).map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {project.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.description ? (project.description.length > 50 ? project.description.substring(0, 50) + '...' : project.description) : 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {project.projectCode || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.managerName || project.manager ? 
                          (project.managerName || `${project.manager.firstName} ${project.manager.lastName}`) : 
                          'No manager assigned'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.startDate && project.endDate ? 
                          `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}` :
                          'Not specified'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.employees ? project.employees.length : 'N/A'} members
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowAddEmployeeModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Employee</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={newEmployee.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
                </div>
                
                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={newEmployee.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>}
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newEmployee.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="firstname.lastname@worksphere.com"
                    />
                    {formErrors.email && formErrors.email.includes('already registered') && (
                      <button 
                        type="button"
                        onClick={handleSuggestEmail}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded hover:bg-blue-200 transition-colors"
                      >
                        Suggest Email
                      </button>
                    )}
                  </div>
                  {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                  {!formErrors.email && newEmployee.firstName && newEmployee.lastName && !newEmployee.email && (
                    <p className="mt-1 text-xs text-gray-500">
                      Suggested format: {newEmployee.firstName.toLowerCase()}.{newEmployee.lastName.toLowerCase()}@worksphere.com
                    </p>
                  )}
                </div>
                
                {/* Department */}
                <div>
                  <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    value={newEmployee.departmentId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.departmentId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {formErrors.departmentId && <p className="mt-1 text-sm text-red-600">{formErrors.departmentId}</p>}
                </div>
                
                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={newEmployee.role}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.role ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="ROLE_EMPLOYEE">Employee</option>
                    <option value="ROLE_MANAGER">Manager</option>
                  </select>
                  {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>}
                </div>
                
                {/* Joined Date */}
                <div>
                  <label htmlFor="joinedDate" className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                  <input
                    type="date"
                    id="joinedDate"
                    name="joinedDate"
                    value={newEmployee.joinedDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.joinedDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {formErrors.joinedDate && <p className="mt-1 text-sm text-red-600">{formErrors.joinedDate}</p>}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
              <button 
                onClick={handleCloseProjectModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProjectSubmit}>
              <div className="space-y-4">
                {/* Project Name */}
                <div>
                  <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="project-name"
                    name="name"
                    value={newProject.name}
                    onChange={handleProjectInputChange}
                    className={`w-full px-3 py-2 border ${
                      projectFormErrors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter project name"
                  />
                  {projectFormErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{projectFormErrors.name}</p>
                  )}
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="project-description"
                    name="description"
                    rows={4}
                    value={newProject.description}
                    onChange={handleProjectInputChange}
                    className={`w-full px-3 py-2 border ${
                      projectFormErrors.description ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter project description"
                  />
                  {projectFormErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{projectFormErrors.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label htmlFor="project-startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="project-startDate"
                      name="startDate"
                      value={newProject.startDate}
                      onChange={handleProjectInputChange}
                      className={`w-full px-3 py-2 border ${
                        projectFormErrors.startDate ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {projectFormErrors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{projectFormErrors.startDate}</p>
                    )}
                  </div>
                  
                  {/* End Date */}
                  <div>
                    <label htmlFor="project-endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="project-endDate"
                      name="endDate"
                      value={newProject.endDate}
                      onChange={handleProjectInputChange}
                      className={`w-full px-3 py-2 border ${
                        projectFormErrors.endDate ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {projectFormErrors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{projectFormErrors.endDate}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status */}
                  <div>
                    <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="project-status"
                      name="status"
                      value={newProject.status}
                      onChange={handleProjectInputChange}
                      className={`w-full px-3 py-2 border ${
                        projectFormErrors.status ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    {projectFormErrors.status && (
                      <p className="mt-1 text-sm text-red-600">{projectFormErrors.status}</p>
                    )}
                  </div>
                  
                  {/* Project Manager */}
                  <div>
                    <label htmlFor="project-manager" className="block text-sm font-medium text-gray-700 mb-1">
                      Project Manager
                    </label>
                    <select
                      id="project-manager"
                      name="managerId"
                      value={newProject.managerId}
                      onChange={handleProjectInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Manager (Optional)</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                          {manager.firstName} {manager.lastName} - {manager.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseProjectModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProject}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{isCreatingProject ? 'Creating...' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
