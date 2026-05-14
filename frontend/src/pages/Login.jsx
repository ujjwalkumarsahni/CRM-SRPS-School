import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
import { assets } from '../assets/assets.js';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader } from 'lucide-react';
import authService from '../services/authService.js';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const colors = {
    primary: "#0B2248",
    secondary: "#E38A0A",
    accent: "#DB2112",
    light: "#F7F7F7"
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      position: 'center',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      backdrop: true,
      background: 'white',
      confirmButtonColor: colors.primary
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: message,
      position: 'center',
      confirmButtonColor: colors.primary,
      backdrop: true,
      background: 'white'
    });
  };

  const showWarningAlert = (message) => {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: message,
      position: 'center',
      confirmButtonColor: colors.secondary,
      backdrop: true,
      background: 'white'
    });
  };

  const showInfoAlert = (message) => {
    Swal.fire({
      icon: 'info',
      title: 'Information',
      text: message,
      position: 'center',
      confirmButtonColor: colors.primary,
      backdrop: true,
      background: 'white'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showWarningAlert('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await login(email, password);
      
      if (data.user.role === 'admin') {
        await showSuccessAlert('Welcome back, Admin!');
        navigate('/admin/dashboard');
      } else {
        if (!data.user.profileCompleted) {
          await showInfoAlert('Please complete your profile to continue');
          navigate('/teacher/complete-profile');
        } else if (!data.user.isVerified) {
          await showWarningAlert('Your account is pending verification. Please wait for admin approval.');
          navigate('/teacher/attendance');
        } else {
          await showSuccessAlert(`Welcome back, ${data.user.name}!`);
          navigate('/teacher/attendance');
        }
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Invalid email or password. Please try again.';
      
      showErrorAlert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      showWarningAlert('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      showWarningAlert('Please enter a valid email address');
      return;
    }

    setResetLoading(true);

    try {
      await authService.forgotPassword(resetEmail);
      
      await showSuccessAlert('Password reset link has been sent to your email!');
      setForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send reset link. Please try again.';
      showErrorAlert(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  // Loading state for initial page load
  if (loading && !forgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.light }}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
          <p style={{ color: colors.primary }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.secondary}10 100%)` }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: colors.secondary }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: colors.primary }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #1a3a5e 100%)` }}>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white">
                <img 
                  src={assets.logo} 
                  alt="School Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back!</h2>
            <p className="text-sm" style={{ color: colors.secondary }}>Sign in to continue to your account</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-6">
            {!forgotPassword ? (
              // Login Form
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.primary }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ focusRingColor: colors.primary }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder="teacher@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.primary }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ focusRingColor: colors.primary }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                      style={{ color: colors.primary }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-opacity-50"
                      style={{ accentColor: colors.primary }}
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: colors.primary }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Forgot Password Form
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.primary }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ focusRingColor: colors.primary }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}20`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder="teacher@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full text-white py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.primary }}
                >
                  {resetLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotPassword(false)}
                  className="w-full text-center text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: colors.primary }}
                >
                  ← Back to Login
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 Shree Ram Public School. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;