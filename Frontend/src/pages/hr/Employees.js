import React, { useEffect, useState } from 'react';
import { Users, Search, ArrowLeft, Edit, Trash2, Plus, X, Save, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const HREmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    role: 'ROLE_EMPLOYEE',
    dateOfJoining: ''
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Delete confirmation states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async (forceRefresh = false) => {
    if (forceRefresh) {
      console.log('🔄 Force refreshing employee data...');
    }
    setLoading(true);
    try {
      // Add cache-busting parameter when force refreshing
      const response = await apiService.getEmployees(forceRefresh);
      
      console.log('📋 Fetched employees:', response.data?.length || 0, 'employees');
      
      // Sort employees in descending order by createdAt date
      const sortedEmployees = response.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setEmployees(sortedEmployees);
      
      if (forceRefresh) {
        console.log('✅ Employee data refreshed successfully');
      }
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      toast.error('Failed to load employees');
      // Set fallback data to prevent crashes
      setEmployees([]);
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
      // Set default departments as fallback
      setDepartments([
        { id: 1, name: 'Engineering', code: 'ENG' },
        { id: 2, name: 'Marketing', code: 'MKT' },
        { id: 3, name: 'Finance', code: 'FIN' },
        { id: 4, name: 'HR', code: 'HR' },
        { id: 5, name: 'Analytics', code: 'ANL' }
      ]);
    }
  };
  
  // Helper function to get department name by ID
  const getDepartmentName = (employee) => {
    // First try to get from employee.departmentName (if populated by backend)
    if (employee.departmentName) {
      return employee.departmentName;
    }
    
    // If employee has a department object
    if (employee.department && typeof employee.department === 'object') {
      return employee.department.name || 'N/A';
    }
    
    // If employee has a departmentId, find the department name
    if (employee.departmentId && departments.length > 0) {
      const dept = departments.find(d => d.id === employee.departmentId);
      return dept ? dept.name : 'N/A';
    }
    
    // If employee.department is just a string/ID, try to find it
    if (employee.department && typeof employee.department !== 'object' && departments.length > 0) {
      const dept = departments.find(d => d.id == employee.department || d.name === employee.department);
      return dept ? dept.name : employee.department;
    }
    
    return 'N/A';
  };

  // Handle edit employee
  const handleEditEmployee = (employee) => {
    console.log('=== EDIT EMPLOYEE DEBUG ===');
    console.log('Original employee data:', JSON.stringify(employee, null, 2));
    
    setEditingEmployee(employee);
    
    // Handle department ID extraction - ensure it's always a string for form display
    let departmentId = '';
    if (employee.departmentId) {
      departmentId = employee.departmentId.toString();
      console.log('Using employee.departmentId:', departmentId);
    } else if (employee.department) {
      if (typeof employee.department === 'object' && employee.department.id) {
        departmentId = employee.department.id.toString();
        console.log('Using employee.department.id:', departmentId);
      } else if (typeof employee.department === 'string' || typeof employee.department === 'number') {
        departmentId = employee.department.toString();
        console.log('Using employee.department as string/number:', departmentId);
      }
    }
    console.log('Final departmentId for form:', departmentId);
    
    // Handle date formatting
    let formattedDate = '';
    console.log('Original dateOfJoining:', employee.dateOfJoining);
    console.log('Original createdAt:', employee.createdAt);
    
    if (employee.dateOfJoining) {
      if (typeof employee.dateOfJoining === 'string') {
        formattedDate = employee.dateOfJoining.includes('T') 
          ? employee.dateOfJoining.split('T')[0] 
          : employee.dateOfJoining;
      } else {
        formattedDate = employee.dateOfJoining.toString().split('T')[0];
      }
      console.log('Using employee.dateOfJoining, formatted:', formattedDate);
    } else if (employee.createdAt) {
      formattedDate = employee.createdAt.split('T')[0];
      console.log('Using employee.createdAt, formatted:', formattedDate);
    }
    console.log('Final formattedDate:', formattedDate);
    
    const formData = {
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      departmentId: departmentId,
      role: employee.role || 'ROLE_EMPLOYEE',
      dateOfJoining: formattedDate
    };
    
    console.log('Final form data for editing:', JSON.stringify(formData, null, 2));
    console.log('=== EDIT EMPLOYEE DEBUG COMPLETE ===');
    
    setEditFormData(formData);
    setEditFormErrors({});
    setShowEditModal(true);
  };

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.firstName.trim()) errors.firstName = 'First name is required';
    if (!editFormData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!editFormData.email.trim()) errors.email = 'Email is required';
    else if (!editFormData.email.includes('@')) errors.email = 'Invalid email format';
    if (!editFormData.departmentId) errors.departmentId = 'Department is required';
    if (!editFormData.role) errors.role = 'Role is required';
    if (!editFormData.dateOfJoining) errors.dateOfJoining = 'Joined date is required';
    return errors;
  };

  // Handle update employee
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    setIsUpdating(true);
    try {
      console.log('=== UPDATE EMPLOYEE DEBUG ===');
      console.log('Employee ID:', editingEmployee.id);
      console.log('Raw form data:', JSON.stringify(editFormData, null, 2));
      
      // Prepare the update payload with proper type conversions
      const updatePayload = {
        ...editFormData,
        // Ensure departmentId is sent as a number, not string
        departmentId: editFormData.departmentId ? parseInt(editFormData.departmentId, 10) : null,
        // Ensure date is in correct format
        dateOfJoining: editFormData.dateOfJoining || null
      };
      
      console.log('Processed update payload:', JSON.stringify(updatePayload, null, 2));
      console.log('Department ID type:', typeof updatePayload.departmentId);
      console.log('Date of joining type:', typeof updatePayload.dateOfJoining);
      
      const response = await apiService.updateEmployee(editingEmployee.id, updatePayload);
      
      console.log('=== UPDATE RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      toast.success('Employee updated successfully!');
      
      // Immediately update the local state with the response data
      const updatedEmployeeData = response.data;
      console.log('🔄 Updating local state with updated employee data:', updatedEmployeeData);
      
      setEmployees(prevEmployees => {
        const updatedEmployees = prevEmployees.map(emp => {
          if (emp.id === editingEmployee.id) {
            console.log('📝 Replacing employee in local state:', emp.id);
            console.log('📝 Old data:', { dept: emp.departmentName, date: emp.dateOfJoining });
            console.log('📝 New data:', { dept: updatedEmployeeData.departmentName, date: updatedEmployeeData.dateOfJoining });
            return updatedEmployeeData;
          }
          return emp;
        });
        return updatedEmployees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
      
      setShowEditModal(false);
      setEditingEmployee(null);
      
      console.log('Refreshing employee list from server...');
      // Also fetch fresh data from server with aggressive cache busting
      setTimeout(async () => {
        console.log('🚀 Force refreshing with cache busting...');
        await fetchEmployees(true);
        console.log('✅ Server refresh completed');
      }, 100); // Reduced delay to 100ms
      
    } catch (error) {
      console.error('=== UPDATE ERROR ===');
      console.error('Full error object:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      if (error.code === 'ERR_NETWORK') {
        toast.error('Backend server is not running. Please start the server.');
      } else if (error.response?.status === 404) {
        toast.error('Employee not found. Please refresh the page.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid data provided: ' + (error.response?.data?.message || 'Please check your input'));
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to update employee');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  // Handle actual delete
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiService.deleteEmployee(employeeToDelete.id);
      toast.success('Employee deleted successfully');
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      await fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingEmployee(null);
    setEditFormErrors({});
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const email = employee.email.toLowerCase();
    const department = employee.department ? 
      (typeof employee.department === 'object' ? employee.department.name : employee.department).toLowerCase() : '';
    const role = employee.role ? employee.role.toLowerCase() : '';
    
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || 
           email.includes(search) || 
           department.includes(search) || 
           role.includes(search);
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate('/hr')} 
            className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">All Employees</h1>
            <p className="text-blue-100 text-lg">Manage your organization's employees</p>
          </div>
        </div>

        {/* Search and Add Employee */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="relative w-full md:w-96 mb-4 md:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => navigate('/hr', { state: { openAddEmployeeModal: true } })}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Employee</span>
            </button>
          </div>

          {/* Employees Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-800">
                              {getInitials(employee.firstName, employee.lastName)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {employee.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {employee.employeeId || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDepartmentName(employee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {employee.role ? employee.role.replace('ROLE_', '') : 'Employee'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : new Date(employee.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded hover:bg-indigo-50"
                          onClick={() => handleEditEmployee(employee)}
                          title="Edit Employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          onClick={() => handleDeleteClick(employee)}
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No employees found matching your search.' : 'No employees found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Employee Modal */}
        {showEditModal && editingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit Employee</h2>
                <button 
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateEmployee}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* First Name */}
                  <div>
                    <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-firstName"
                      name="firstName"
                      value={editFormData.firstName}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border ${
                        editFormErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {editFormErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{editFormErrors.firstName}</p>
                    )}
                  </div>
                  
                  {/* Last Name */}
                  <div>
                    <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-lastName"
                      name="lastName"
                      value={editFormData.lastName}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border ${
                        editFormErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {editFormErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{editFormErrors.lastName}</p>
                    )}
                  </div>
                </div>
                
                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border ${
                      editFormErrors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {editFormErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.email}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Department */}
                  <div>
                    <label htmlFor="edit-departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-departmentId"
                      name="departmentId"
                      value={editFormData.departmentId}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border ${
                        editFormErrors.departmentId ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {editFormErrors.departmentId && (
                      <p className="mt-1 text-sm text-red-600">{editFormErrors.departmentId}</p>
                    )}
                  </div>
                  
                  {/* Role */}
                  <div>
                    <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-role"
                      name="role"
                      value={editFormData.role}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 border ${
                        editFormErrors.role ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="ROLE_EMPLOYEE">Employee</option>
                      <option value="ROLE_HR">HR</option>
                      <option value="ROLE_MANAGER">Manager</option>
                    </select>
                    {editFormErrors.role && (
                      <p className="mt-1 text-sm text-red-600">{editFormErrors.role}</p>
                    )}
                  </div>
                </div>
                
                {/* Joined Date */}
                <div className="mb-6">
                  <label htmlFor="edit-dateOfJoining" className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="edit-dateOfJoining"
                    name="dateOfJoining"
                    value={editFormData.dateOfJoining}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border ${
                      editFormErrors.dateOfJoining ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {editFormErrors.dateOfJoining && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.dateOfJoining}</p>
                  )}
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdating ? 'Updating...' : 'Update Employee'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && employeeToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Employee
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">
                    {employeeToDelete.firstName} {employeeToDelete.lastName}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HREmployees;
