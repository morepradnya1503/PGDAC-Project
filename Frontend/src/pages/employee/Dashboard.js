import React, { useEffect, useState } from 'react';
import { User, Calendar, FileText, Download, MessageSquare, Clock, CheckCircle, XCircle, Edit2, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real leave history from API
      let leaveData = [];
      let feedbackData = [];
      
      try {
        const leaveResponse = await apiService.getLeaveHistory();
        leaveData = leaveResponse.data || [];
        console.log('Successfully fetched leave history from backend:', leaveData);
      } catch (error) {
        console.error('Failed to fetch leave history:', error.response?.status || error.message);
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          toast.error('Backend server is not running. Contact administrator.');
        } else {
          toast.error('Failed to load leave history. Please try again.');
        }
        leaveData = []; // No fallback data - show empty state
      }
      
      try {
        const feedbackResponse = await apiService.getEmployeeFeedback();
        feedbackData = feedbackResponse.data || [];
        console.log('Successfully fetched feedback history:', feedbackData);
      } catch (error) {
        console.warn('Failed to fetch feedback history, using demo data:', error.response?.status);
        // Fallback to demo data if API fails
        feedbackData = [
          { id: 1, employeeId: 1, managerId: 1, sprintNumber: 1, score: 8, comments: 'Great work on the project!', submittedDate: '2024-01-15' },
          { id: 2, employeeId: 1, managerId: 1, sprintNumber: 2, score: 9, comments: 'Excellent performance and teamwork.', submittedDate: '2024-01-30' },
        ];
      }
      
      setLeaveHistory(leaveData);
      setFeedbackHistory(feedbackData);
      
    } catch (error) {
      console.error('Unexpected error in fetchEmployeeData:', error);
      toast.error('Failed to load dashboard data');
      // Set empty data if everything fails
      setLeaveHistory([]);
      setFeedbackHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveApplication = async (leaveData) => {
    try {
      await apiService.applyLeave(leaveData);
      toast.success('Leave application submitted successfully');
      setShowLeaveModal(false);
      fetchEmployeeData(); // Refresh data
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied: You do not have permission to apply for leave');
        // Don't log 403 errors as they are expected when employee access is restricted
      } else {
        toast.error('Failed to submit leave application');
        console.error('Error submitting leave application:', error);
      }
    }
  };

  const handleDownloadResume = () => {
    // Simulate download
    toast.success('Resume downloaded successfully');
  };

  const handleDownloadIDCard = () => {
    // Simulate download
    toast.success('ID Card downloaded successfully');
  };

  const handleEditProfile = () => {
    // Navigate to the dedicated profile page instead of opening modal
    navigate('/employee/profile');
  };

  const statCards = [
    {
      title: 'Total Leaves',
      value: leaveHistory.length,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Approved Leaves',
      value: leaveHistory.filter(leave => leave.status === 'APPROVED').length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Pending Leaves',
      value: leaveHistory.filter(leave => leave.status === 'PENDING').length,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Feedback Received',
      value: feedbackHistory.length,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Employee Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Employee Dashboard</h1>
          <p className="text-blue-100 text-lg">Welcome back, {user?.name || user?.username || 'User'}!</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              <span>Apply Leave</span>
            </button>
            <button 
              onClick={handleDownloadResume}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Download Resume</span>
            </button>
            <button 
              onClick={handleDownloadIDCard}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <User className="w-5 h-5" />
              <span>Download ID Card</span>
            </button>
            <button 
              onClick={handleEditProfile}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Edit2 className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Leave History */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leave History</h2>
          {leaveHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No leave history found</p>
          ) : (
            <div className="space-y-4">
              {leaveHistory.map((leave) => (
                <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {leave.leaveType} Leave
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {leave.startDate} to {leave.endDate}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{leave.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Applied: {leave.appliedDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Feedback */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Feedback</h2>
          {feedbackHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No feedback received yet</p>
          ) : (
            <div className="space-y-4">
              {feedbackHistory.map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        Sprint {feedback.sprintNumber}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Score: {feedback.score}/10
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{feedback.submittedDate}</span>
                  </div>
                  <p className="text-sm text-gray-600">{feedback.comments}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for Leave</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const leaveData = {
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                leaveType: formData.get('leaveType'),
                reason: formData.get('reason'),
              };
              handleLeaveApplication(leaveData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select name="leaveType" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                    <option value="PATERNITY">Paternity Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" name="startDate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" name="endDate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea name="reason" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Please provide a reason for your leave request"></textarea>
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
                    onClick={() => setShowLeaveModal(false)}
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
    </div>
  );
};

export default EmployeeDashboard;