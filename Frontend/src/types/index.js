// Define user roles
export const UserRole = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE'
};

// User object structure
export const User = {
  // This is just a reference structure, not used in runtime
  id: '',
  name: '',
  email: '',
  role: null, // Will be one of UserRole values
  department: '',
  position: '',
  joinDate: '',
  status: '' // 'ACTIVE' or 'INACTIVE'
};

// Dashboard statistics structure
export const DashboardStats = {
  // This is just a reference structure, not used in runtime
  totalEmployees: 0,
  activeEmployees: 0,
  departments: 0,
  projects: 0,
  totalHRs: 0,
  totalManagers: 0,
  totalProjects: 0,
  activeProjects: 0
};

// Employee structure (extends User with additional properties)
export const Employee = {
  // This is just a reference structure, not used in runtime
  // Includes all User properties plus:
  firstName: '',
  lastName: '',
  employeeId: '',
  manager: '',
  skills: [],
  performanceRating: 0
};

// Project structure
export const Project = {
  // This is just a reference structure, not used in runtime
  id: '',
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: '', // 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', or 'ACTIVE'
  manager: '',
  team: [],
  progress: 0
};

// Department structure
export const Department = {
  // This is just a reference structure, not used in runtime
  id: '',
  name: '',
  head: '',
  employeeCount: 0
};

// Leave request structure
export const LeaveRequest = {
  // This is just a reference structure, not used in runtime
  id: '',
  employeeId: '',
  employeeName: '',
  type: '', // 'CASUAL', 'SICK', 'VACATION', or 'OTHER'
  startDate: '',
  endDate: '',
  reason: '',
  status: '', // 'PENDING', 'APPROVED', or 'REJECTED'
  approvedBy: ''
};

// Attendance structure
export const Attendance = {
  // This is just a reference structure, not used in runtime
  id: '',
  employeeId: '',
  date: '',
  checkIn: '',
  checkOut: '',
  status: '' // 'PRESENT', 'ABSENT', 'HALF_DAY', or 'LEAVE'
};