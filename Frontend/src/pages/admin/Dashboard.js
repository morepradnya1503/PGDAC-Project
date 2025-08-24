import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserCog, Briefcase, Activity, Edit, Trash2, X } from 'lucide-react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmployees, setShowEmployees] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    role: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
      // Set default stats for demo
      setStats({
        totalEmployees: 150,
        totalHRs: 8,
        totalManagers: 12,
        totalProjects: 25,
        activeProjects: 18,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageEmployees = async () => {
    try {
      const response = await apiService.getEmployees();
      // Sort employees in descending order by createdAt date
      const sortedEmployees = response.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setEmployees(sortedEmployees);
      setShowEmployees(true);
      setShowProjects(false);
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const handleViewProjects = async () => {
    try {
      // If projects are already showing, just toggle off
      if (showProjects) {
        setShowProjects(false);
        return;
      }
      
      // Otherwise fetch projects and show them
      setProjectsLoading(true);
      setShowProjects(true); // Show the section immediately with loading state
      setShowEmployees(false); // Hide employees section when showing projects
      
      const response = await apiService.getProjects();
      console.log('Projects fetched:', response.data);
      if (response.data && Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        console.error('Invalid projects data format:', response.data);
        toast.error('Received invalid project data format');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await apiService.deleteEmployee(id);
      toast.success('Employee deleted successfully');
      // Refresh employees list
      const response = await apiService.getEmployees();
      // Sort employees in descending order by createdAt date
      const sortedEmployees = response.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setEmployees(sortedEmployees);
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const handleUpdateEmployee = (employee) => {
    setSelectedEmployee(employee);
    setUpdateForm({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      employeeId: employee.employeeId || '',
      role: employee.role || ''
    });
    setShowUpdateModal(true);
  };

  const validateUpdateForm = () => {
    const errors = {};
    if (!updateForm.firstName.trim()) errors.firstName = 'First name is required';
    if (!updateForm.lastName.trim()) errors.lastName = 'Last name is required';
    if (!updateForm.email.trim()) errors.email = 'Email is required';
    if (!updateForm.role.trim()) errors.role = 'Role is required';
    if (!updateForm.employeeId.trim()) errors.employeeId = 'Employee ID is required';
    return errors;
  };

  const handleUpdateSubmit = async () => {
    const errors = validateUpdateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!selectedEmployee) return;
    try {
      await apiService.updateEmployee(selectedEmployee.id, updateForm);
      toast.success('Employee updated successfully');
      setShowUpdateModal(false);
      // Refresh employees list
      const response = await apiService.getEmployees();
      // Sort employees in descending order by createdAt date
      const sortedEmployees = response.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setEmployees(sortedEmployees);
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'HR Personnel',
      value: stats?.totalHRs || 0,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Managers',
      value: stats?.totalManagers || 0,
      icon: UserCog,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: Briefcase,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: Activity,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-blue-100 text-lg">Overview of your organization</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleManageEmployees}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Users className="w-5 h-5" />
              <span>Manage Employees</span>
            </button>
            <button 
              onClick={handleViewProjects}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Briefcase className="w-5 h-5" />
              <span>View Projects</span>
            </button>
          </div>
          
          {/* Quick Project List */}
          {showProjects && (
            <div className="mt-6 pt-6 border-t border-gray-200 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Project List</h3>
              {projectsLoading ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-500">No projects found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
                  {projects.map((project) => (
                      <div key={project.id} className="bg-white rounded-lg p-5 hover:shadow-lg transition-shadow duration-200 border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                          <button className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors duration-200">Details</button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Employees List */}
        {showEmployees && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Employees List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.employeeId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.role ? employee.role.replace('ROLE_', '') : 'Employee'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUpdateEmployee(employee)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Projects List section removed as it's now integrated into Quick Actions */}

        {/* Update Employee Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Update Employee</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateSubmit(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={updateForm.employeeId}
                    onChange={(e) => setUpdateForm({...updateForm, employeeId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {formErrors.employeeId && <p className="text-red-500 text-xs mt-1">{formErrors.employeeId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={updateForm.firstName}
                    onChange={(e) => setUpdateForm({...updateForm, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={updateForm.lastName}
                    onChange={(e) => setUpdateForm({...updateForm, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={updateForm.role}
                    onChange={(e) => setUpdateForm({...updateForm, role: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select role</option>
                    <option value="ROLE_HR">HR</option>
                    <option value="ROLE_MANAGER">Manager</option>
                    <option value="ROLE_EMPLOYEE">Employee</option>
                  </select>
                  {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Update Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New employee John Doe joined the team</span>
              <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Project "E-commerce Platform" status updated</span>
              <span className="text-xs text-gray-400 ml-auto">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Leave request approved for Sarah Wilson</span>
              <span className="text-xs text-gray-400 ml-auto">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;