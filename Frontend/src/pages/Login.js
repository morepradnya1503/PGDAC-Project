import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../auth/AuthContext';
import { Briefcase, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = yup.object({
  email: yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .matches(/@/, 'Email must contain @ symbol'),
  password: yup.string().required('Password is required'),
}).required();

const Login = () => {
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      
      // Add a small delay to ensure localStorage is updated
      setTimeout(() => {
        // Get the user from localStorage after login
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        console.log('Login successful, user role:', storedUser.role);
        console.log('Full user data:', storedUser);
        
        // Navigate based on user role (handle both with and without ROLE_ prefix)
        const userRole = storedUser.role;
        console.log('Processing role for navigation:', userRole);
        
        switch (userRole) {
          case 'ADMIN':
          case 'ROLE_ADMIN':
            console.log('Redirecting to admin dashboard');
            navigate('/admin');
            break;
          case 'HR':
          case 'ROLE_HR':
            console.log('Redirecting to HR dashboard');
            navigate('/hr');
            break;
          case 'MANAGER':
          case 'ROLE_MANAGER':
            console.log('Redirecting to manager dashboard');
            navigate('/manager');
            break;
          case 'EMPLOYEE':
          case 'ROLE_EMPLOYEE':
            console.log('Redirecting to employee dashboard');
            navigate('/employee');
            break;
          default:
            console.log('Unknown role, redirecting to home. Role found:', userRole);
            navigate('/');
        }
      }, 100); // 100ms delay to ensure localStorage is updated
      
    } catch (error) {
      console.error('Login error:', error);
      // Error handling is done in the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Welcome */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to WorkSphere</h2>
          <p className="text-blue-100 text-lg">Employee Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLoginSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  {...registerLogin('email')}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
              {loginErrors.email && (
                <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...registerLogin('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {loginErrors.password && (
                <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-100 text-sm">
            © 2024 WorkSphere. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;