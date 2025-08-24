import React, { useEffect, useState } from 'react';
import { Briefcase, Users, Clock, CheckCircle, XCircle, MessageSquare, Plus, TrendingUp } from 'lucide-react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [detailedProjects, setDetailedProjects] = useState([]);
  const [managerInfo, setManagerInfo] = useState(null);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      
      // Fetch manager profile information first
      let managerProfile = null;
      try {
        // Get manager info from localStorage or API
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          managerProfile = JSON.parse(storedUser);
          console.log('👤 Manager profile from localStorage:', managerProfile);
        } else {
          // Try to get current user info from API
          const userResponse = await apiService.getCurrentUser();
          managerProfile = userResponse.data;
          console.log('👤 Manager profile from API:', managerProfile);
        }
        setManagerInfo(managerProfile);
      } catch (error) {
        console.log('Could not fetch manager profile:', error);
        // Set default manager info for demo
        setManagerInfo({
          id: 1,
          firstName: 'Pradnya',
          lastName: 'More', 
          fullName: 'Pradnya More',
          email: 'pradnya@worksphere.com'
        });
      }

      console.log('🚀 Fetching manager dashboard data...');
      console.log('🔍 Manager ID to filter by:', managerProfile?.id);
      
      // Check if we have authentication token
      const token = localStorage.getItem('token');
      console.log('🔐 Auth token present:', !!token);
      
      const [projectsResponse, leavesResponse, employeesResponse] = await Promise.all([
        apiService.getManagerProjects().catch(err => {
          console.error('❌ Projects API failed:', err.response?.status, err.response?.data);
          console.error('❌ Full error:', err);
          throw err;
        }),
        apiService.getPendingLeaves().catch(err => {
          console.error('❌ Leaves API failed:', err.response?.status, err.response?.data);
          console.error('❌ Full error:', err);
          throw err;
        }),
        apiService.getEmployees().catch(err => {
          console.error('❌ Employees API failed:', err.response?.status, err.response?.data);
          console.error('❌ Full error:', err);
          throw err;
        }),
      ]);
      
      console.log('✅ Raw Projects data:', projectsResponse.data);
      console.log('✅ Raw Leaves data:', leavesResponse.data);
      console.log('✅ Raw Employees data:', employeesResponse.data);
      
      // Filter projects by manager ID (client-side filtering as backup)
      let filteredProjects = projectsResponse.data || [];
      if (managerProfile?.id && Array.isArray(filteredProjects)) {
        const originalCount = filteredProjects.length;
        filteredProjects = filteredProjects.filter(project => 
          project.managerId === managerProfile.id || 
          project.managerId === parseInt(managerProfile.id)
        );
        console.log(`🎯 Filtered projects: ${filteredProjects.length}/${originalCount} projects for manager ID ${managerProfile.id}`);
      }
      
      setProjects(filteredProjects);
      setPendingLeaves(leavesResponse.data || []);
      setEmployees(employeesResponse.data || []);
    } catch (error) {
      console.error('Error fetching manager dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set default data for demo
      setProjects([
        { id: 1, name: 'E-commerce Platform', status: 'ACTIVE', description: 'Online shopping platform development' },
        { id: 2, name: 'Mobile App', status: 'ACTIVE', description: 'iOS and Android mobile application' },
      ]);
      setPendingLeaves([
        { id: 1, employeeId: 1, startDate: '2024-01-15', endDate: '2024-01-17', leaveType: 'SICK', reason: 'Not feeling well', status: 'PENDING', appliedDate: '2024-01-10' },
        { id: 2, employeeId: 2, startDate: '2024-01-20', endDate: '2024-01-22', leaveType: 'CASUAL', reason: 'Personal work', status: 'PENDING', appliedDate: '2024-01-12' },
      ]);
      setEmployees([
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', department: 'Engineering' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', department: 'Design' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveApproval = async (leaveId, approved) => {
    try {
      await apiService.approveLeave(leaveId, approved);
      toast.success(`Leave ${approved ? 'approved' : 'rejected'} successfully`);
      fetchManagerData(); // Refresh data
    } catch (error) {
      toast.error('Failed to update leave status');
    }
  };

  const handleFeedbackSubmit = async (feedback) => {
    try {
      await apiService.submitFeedback(feedback);
      toast.success('Performance feedback submitted successfully');
      setShowFeedbackModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const handleViewProjects = async () => {
    try {
      console.log('🔍 Fetching detailed projects for manager ID:', managerInfo?.id);
      const response = await apiService.getManagerProjects();
      console.log('✅ Detailed projects response:', response.data);
      
      // Filter projects by manager ID
      let filteredProjects = response.data || [];
      if (managerInfo?.id && Array.isArray(filteredProjects)) {
        const originalCount = filteredProjects.length;
        filteredProjects = filteredProjects.filter(project => 
          project.managerId === managerInfo.id || 
          project.managerId === parseInt(managerInfo.id)
        );
        console.log(`🎯 Filtered detailed projects: ${filteredProjects.length}/${originalCount} projects for manager ID ${managerInfo.id}`);
        
        // TEMPORARY: If no projects found, show all projects for demo
        if (filteredProjects.length === 0) {
          console.log('⚠️ No projects assigned to this manager. Showing all projects for demo.');
          filteredProjects = response.data || [];
          toast.success('Demo Mode: Showing all projects (not filtered by manager)');
        }
      }
      
      setDetailedProjects(filteredProjects);
      setShowProjectsModal(true);
    } catch (error) {
      console.error('Error fetching detailed projects:', error);
      toast.error('Failed to load project details');
      // Fallback to current projects data
      setDetailedProjects(projects);
      setShowProjectsModal(true);
    }
  };

  const statCards = [
    {
      title: 'Active Projects',
      value: projects.length,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Team Members',
      value: employees.length,
      icon: Users,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Pending Leaves',
      value: pendingLeaves.length,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Completed Tasks',
      value: 45,
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Manager Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manager Dashboard</h1>
          {managerInfo && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-blue-100 mb-1">
                Welcome back, {managerInfo.firstName || managerInfo.fullName?.split(' ')[0] || 'Manager'}! 👋
              </h2>
              <p className="text-blue-200 text-sm">
                {managerInfo.fullName || `${managerInfo.firstName || ''} ${managerInfo.lastName || ''}`.trim() || managerInfo.email}
                {managerInfo.email && managerInfo.fullName && ` • ${managerInfo.email}`}
              </p>
            </div>
          )}
          <p className="text-blue-100 text-lg">Manage your team and projects</p>
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
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Submit Feedback</span>
            </button>
            <button 
              onClick={handleViewProjects}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Briefcase className="w-5 h-5" />
              <span>View Projects</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              <Users className="w-5 h-5" />
              <span>Team Overview</span>
            </button>
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Leave Requests</h2>
          {pendingLeaves.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending leave requests</p>
          ) : (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => {
                const employee = employees.find(emp => emp.id === leave.employeeId);
                return (
                  <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {employee?.firstName.charAt(0)}{employee?.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {employee?.firstName} {employee?.lastName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {leave.leaveType} • {leave.startDate} to {leave.endDate}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{leave.reason}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLeaveApproval(leave.id, true)}
                          className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleLeaveApproval(leave.id, false)}
                          className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {project.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Team: 5 members</span>
                  <span>Progress: 75%</span>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Performance Feedback</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const feedback = {
                sprintNumber: parseInt(formData.get('sprint')),
                employeeId: parseInt(formData.get('employee')),
                score: parseInt(formData.get('score')),
                comments: formData.get('comments'),
              };
              handleFeedbackSubmit(feedback);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Number</label>
                  <select name="sprint" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>Sprint {num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select name="employee" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score (1-10)</label>
                  <input type="number" name="score" min="1" max="10" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <textarea name="comments" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Your Assigned Projects</h3>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {detailedProjects.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No projects assigned to you yet.</p>
                <p className="text-gray-400 text-sm mt-2">Projects assigned by HR will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {detailedProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-gray-900">{project.name}</h4>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {project.projectCode && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Project Code:</span>
                          <span className="ml-2 text-sm text-gray-900 font-mono">{project.projectCode}</span>
                        </div>
                      )}
                      
                      {project.description && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Description:</span>
                          <p className="text-sm text-gray-900 mt-1">{project.description}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {project.startDate && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Start Date:</span>
                            <p className="text-sm text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        
                        {project.endDate && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">End Date:</span>
                            <p className="text-sm text-gray-900">{new Date(project.endDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                      
                      {project.employees && project.employees.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Team Members ({project.employees.length}):</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.employees.slice(0, 5).map((employee, index) => (
                              <div key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                                {employee.firstName} {employee.lastName}
                              </div>
                            ))}
                            {project.employees.length > 5 && (
                              <div className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full text-xs">
                                +{project.employees.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowProjectsModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;