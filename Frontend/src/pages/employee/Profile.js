import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, User, Edit2, Save, X, Calendar, MapPin, Mail, Phone, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Simplified initialization - just call this once on mount
  const initializeProfile = useCallback(async () => {
    // Get employee ID from URL params
    const employeeIdFromUrl = searchParams.get('employeeId');
    
    // Load available employees first (for admin/manager use)
    await loadAvailableEmployees();
    
    // Set selected employee ID
    if (employeeIdFromUrl) {
      setSelectedEmployeeId(parseInt(employeeIdFromUrl));
      await fetchProfile(parseInt(employeeIdFromUrl));
    } else {
      // Default to current logged-in user's profile
      console.log('🏠 Loading current user profile...', user);
      console.log('🏠 User employeeId:', user?.employeeId);
      console.log('🏠 User database id:', user?.id);
      console.log('🏠 User email:', user?.email);
      
      // For current user, don't pass any ID - let backend determine from JWT token
      // This ensures we get the correct profile for the authenticated user
      await fetchProfile(); // No parameter = get current user's profile
      
      // Set selectedEmployeeId to the user's database ID for UI consistency
      if (user?.id) {
        setSelectedEmployeeId(parseInt(user.id));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user]);

  useEffect(() => {
    initializeProfile();
  }, [initializeProfile]);

  // Handle audio/video errors to prevent console spam
  useEffect(() => {
    const handleMediaError = (event) => {
      if (event.target.tagName === 'AUDIO' || event.target.tagName === 'VIDEO') {
        event.preventDefault();
        console.log('Media playback interrupted - this is normal behavior');
      }
    };

    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.name === 'AbortError' && 
          event.reason.message && event.reason.message.includes('play()')) {
        event.preventDefault();
        console.log('Audio play() request was interrupted - this is normal');
      }
    };

    // Add global error handlers
    document.addEventListener('error', handleMediaError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      document.removeEventListener('error', handleMediaError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const loadAvailableEmployees = async () => {
    try {
      const response = await apiService.getEmployees();
      if (response.data && Array.isArray(response.data)) {
        setAvailableEmployees(response.data);
        console.log('📋 Available employees loaded:', response.data.length);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load employee list:', error.message);
      // No fallback data - empty list if API fails
      setAvailableEmployees([]);
    }
  };

  const fetchProfile = async (employeeId = null) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching employee profile...');
      console.log('Employee ID:', employeeId);
      console.log('Current user context:', user);
      console.log('Auth token exists:', !!localStorage.getItem('token'));
      
      // Enhanced debugging
      console.log('🐞 DEBUG INFO:');
      console.log('- User ID from auth context:', user?.id);
      console.log('- User email from auth context:', user?.email);
      console.log('- User role from auth context:', user?.role);
      console.log('- Selected Employee ID:', selectedEmployeeId);
      console.log('- Employee ID parameter:', employeeId);
      console.log('- API call will be made to:', employeeId ? `/employee/profile?employeeId=${employeeId}` : '/employee/profile');
      
      // First try to get the current user auth info
      try {
        const authResponse = await apiService.getCurrentUser();
        console.log('🔐 Auth info:', authResponse.data);
      } catch (authError) {
        console.warn('⚠️ Auth check failed:', authError.message);
      }
      
      const response = await apiService.getEmployeeProfile(employeeId);
      console.log('✅ Profile API response:', response.data);
      
      if (response.data) {
        setProfileData(response.data);
        setEditFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          contact: response.data.contact || '',
          address: response.data.address || '',
          city: response.data.city || '',
          bloodGroup: response.data.bloodGroup || '',
          skills: response.data.skills || '',
          experience: response.data.experience || 0,
          education: response.data.education || '',
          hobbies: response.data.hobbies || '',
          certifications: response.data.certifications || '',
          achievements: response.data.achievements || '',
          dateOfBirth: response.data.dateOfBirth || '',
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
      
      if (error.response?.status === 401) {
        console.log('🚫 Authentication required - user not logged in properly');
        toast.error('Please log in to view your profile');
        navigate('/login');
        return;
      } else if (error.response?.status === 404 || error.response?.status === 500) {
        console.log('📝 API error, using fallback profile data...');
        // Create fallback profile data from user info
        const fallbackProfile = {
          id: user?.id || 1,
          firstName: user?.name?.split(' ')[0] || user?.username || 'Employee',
          lastName: user?.name?.split(' ').slice(1).join(' ') || 'User',
          email: user?.email || 'user@company.com',
          employeeId: user?.employeeId || 'EMP001',
          role: user?.role || 'ROLE_EMPLOYEE',
          departmentName: user?.department || 'Not Assigned',
          dateOfJoining: user?.dateOfJoining || new Date().toISOString().split('T')[0],
          contact: '',
          address: '',
          city: '',
          bloodGroup: '',
          skills: '',
          experience: 0,
          education: '',
          hobbies: '',
          certifications: '',
          achievements: '',
          dateOfBirth: '',
          managerId: user?.managerId || null,
          departmentId: user?.departmentId || null
        };
        setProfileData(fallbackProfile);
        setEditFormData({
          firstName: fallbackProfile.firstName,
          lastName: fallbackProfile.lastName,
          email: fallbackProfile.email,
          contact: fallbackProfile.contact,
          address: fallbackProfile.address,
          city: fallbackProfile.city,
          bloodGroup: fallbackProfile.bloodGroup,
          skills: fallbackProfile.skills,
          experience: fallbackProfile.experience,
          education: fallbackProfile.education,
          hobbies: fallbackProfile.hobbies,
          certifications: fallbackProfile.certifications,
          achievements: fallbackProfile.achievements,
          dateOfBirth: fallbackProfile.dateOfBirth,
        });
        toast.success('Backend server issue - using demo profile data. You can edit and save changes.');
      } else {
        toast.error('Failed to load profile data: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data if canceling edit
      setEditFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        contact: profileData.contact || '',
        address: profileData.address || '',
        city: profileData.city || '',
        bloodGroup: profileData.bloodGroup || '',
        skills: profileData.skills || '',
        experience: profileData.experience || 0,
        education: profileData.education || '',
        hobbies: profileData.hobbies || '',
        certifications: profileData.certifications || '',
        achievements: profileData.achievements || '',
        dateOfBirth: profileData.dateOfBirth || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'experience' ? parseInt(value) || 0 : value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      console.log('💾 Saving profile data:', editFormData);
      console.log('💾 Selected Employee ID:', selectedEmployeeId);
      
      // Validate required fields
      if (!editFormData.firstName || !editFormData.lastName || !editFormData.email) {
        toast.error('Please fill in all required fields (First Name, Last Name, Email)');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      // For current user profile, don't pass ID to ensure backend uses JWT token
      const profileEmployeeId = (selectedEmployeeId === user?.id) ? null : selectedEmployeeId;
      console.log('💾 Profile Employee ID for update:', profileEmployeeId);
      console.log('💾 Is current user:', selectedEmployeeId === user?.id);
      
      const response = await apiService.updateEmployeeProfile(editFormData, profileEmployeeId);
      
      if (response && response.data) {
        // Update the profile data with the response
        setProfileData(response.data);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        console.log('✅ Profile updated successfully:', response.data);
      } else {
        // If response doesn't have data but request was successful
        setProfileData(prev => ({ ...prev, ...editFormData }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        console.log('✅ Profile updated locally');
      }
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        console.log('📝 Profile update endpoint not found, updating locally...');
        // Update local state as fallback
        setProfileData(prev => ({ ...prev, ...editFormData }));
        setIsEditing(false);
        toast.success('Profile updated locally! (Backend endpoint not available)');
      } else if (error.response?.status === 500) {
        console.log('📝 Server error, updating locally...');
        // Update local state as fallback
        setProfileData(prev => ({ ...prev, ...editFormData }));
        setIsEditing(false);
        toast.success('Profile updated locally! (Server error - changes may not be persisted)');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to update this profile.');
      } else {
        // For any other error, still update locally for better UX
        setProfileData(prev => ({ ...prev, ...editFormData }));
        setIsEditing(false);
        toast.success('Profile updated locally! (API error - changes may not be persisted)');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmployeeSelect = async (employeeId) => {
    if (employeeId === selectedEmployeeId) return;
    
    setSelectedEmployeeId(employeeId);
    setIsEditing(false); // Cancel any ongoing edits
    
    // Update URL params
    setSearchParams({ employeeId: employeeId.toString() });
    
    // Fetch the new employee profile
    await fetchProfile(employeeId);
    
    toast.success('Switched to employee profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Failed to load profile data</p>
          <button 
            onClick={() => navigate('/employee')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/employee')} 
              className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {selectedEmployeeId === user?.id ? 'My Profile' : 'Employee Profile'}
              </h1>
              <p className="text-blue-100 text-lg">
                {selectedEmployeeId === user?.id ? 'Manage your personal information' : 'View and manage employee information'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>


        {/* Employee Selector - Only show for admin/manager roles */}
        {availableEmployees.length > 0 && (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER') && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-white" />
              <label className="text-white font-medium">Select Employee:</label>
              <select
                value={selectedEmployeeId || ''}
                onChange={(e) => handleEmployeeSelect(parseInt(e.target.value))}
                className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-64"
                style={{ color: 'white' }}
              >
                <option value="" disabled>Choose an employee...</option>
                {availableEmployees.map((employee) => (
                  <option 
                    key={employee.id} 
                    value={employee.id}
                    style={{ color: 'black' }}
                  >
                    {employee.firstName} {employee.lastName} ({employee.email})
                  </option>
                ))}
              </select>
              {selectedEmployeeId && (
                <span className="text-blue-100 text-sm">
                  Currently viewing: ID {selectedEmployeeId}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="firstName"
                        value={editFormData.firstName}
                        onChange={handleInputChange}
                        className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-md px-3 py-1 w-32"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={editFormData.lastName}
                        onChange={handleInputChange}
                        className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-md px-3 py-1 w-32"
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    `${profileData.firstName} ${profileData.lastName}`
                  )}
                </h2>
                <p className="text-blue-100">
                  {profileData.employeeId} • {profileData.role?.replace('ROLE_', '')}
                </p>
                <p className="text-blue-100">{profileData.departmentName}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-600">{profileData.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="contact"
                        value={editFormData.contact}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Phone number"
                      />
                    ) : (
                      <p className="text-gray-600">{profileData.contact || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={editFormData.address}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Full address"
                      />
                    ) : (
                      <p className="text-gray-600">{profileData.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={editFormData.city}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City"
                      />
                    ) : (
                      <p className="text-gray-600">{profileData.city || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editFormData.dateOfBirth}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-600">
                        {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="bloodGroup"
                        value={editFormData.bloodGroup}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., O+, A-, B+"
                      />
                    ) : (
                      <p className="text-gray-600">{profileData.bloodGroup || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                    <p className="text-gray-600">
                      {profileData.dateOfJoining ? new Date(profileData.dateOfJoining).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skills</label>
                    {isEditing ? (
                      <textarea
                        name="skills"
                        value={editFormData.skills}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="List your skills (e.g., Java, React, Python)"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profileData.skills || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="experience"
                        value={editFormData.experience}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profileData.experience || 0} years</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education</label>
                    {isEditing ? (
                      <textarea
                        name="education"
                        value={editFormData.education}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Educational background"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profileData.education || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Certifications</label>
                    {isEditing ? (
                      <textarea
                        name="certifications"
                        value={editFormData.certifications}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Professional certifications"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profileData.certifications || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Achievements</label>
                    {isEditing ? (
                      <textarea
                        name="achievements"
                        value={editFormData.achievements}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Notable achievements"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profileData.achievements || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hobbies</label>
                    {isEditing ? (
                      <textarea
                        name="hobbies"
                        value={editFormData.hobbies}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Personal interests and hobbies"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profileData.hobbies || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
