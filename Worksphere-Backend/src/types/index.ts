export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  enabled: boolean;
}

export interface Role {
  id: number;
  name: 'ROLE_ADMIN' | 'ROLE_HR' | 'ROLE_MANAGER' | 'ROLE_EMPLOYEE';
}

export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  address?: string;
  city?: string;
  bloodGroup?: string;
  photoUrl?: string;
  skills?: string;
  experience?: number;
  education?: string;
  hobbies?: string;
  certifications?: string;
  achievements?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  managerId?: number;
  managerName?: string;
  projects?: string[];
  fullName: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  projectCode: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  startDate: string;
  endDate: string;
  managerId?: number;
  managerName?: string;
  employees?: Employee[];
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
}

export interface PerformanceFeedback {
  id: number;
  employeeId: number;
  employeeName: string;
  managerId: number;
  managerName: string;
  sprintNumber: number;
  score: number;
  comments: string;
  feedbackDate: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalProjects: number;
  totalHRs: number;
  totalManagers: number;
  activeProjects: number;
  pendingLeaves: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 