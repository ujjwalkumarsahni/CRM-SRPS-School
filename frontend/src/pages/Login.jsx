import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Common/Toast.jsx';
import { assets } from '../assets/assets.js';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import authService from '../services/authService.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await login(email, password);
      
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        if (!data.user.profileCompleted) {
          navigate('/teacher/complete-profile');
        } else if (!data.user.isVerified) {
          setToast({ 
            message: 'Your account is pending verification. Please wait for admin approval.', 
            type: 'warning' 
          });
        } else {
          navigate('/teacher/attendance');
        }
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Login failed. Please check your credentials.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
  e.preventDefault();

  if (!resetEmail) {
    setToast({ message: 'Please enter your email', type: 'warning' });
    return;
  }

  setResetLoading(true);

  try {
    await authService.forgotPassword(resetEmail);

    setToast({
      message: 'Password reset link sent!',
      type: 'success',
    });

    setForgotPassword(false);
    setResetEmail('');
  } catch (error) {
    setToast({
      message: error.response?.data?.error || 'Failed to send reset link',
      type: 'error',
    });
  } finally {
    setResetLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0D5166]/5 to-[#F5C78B]/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F5C78B] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0D5166] rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-linear-to-r from-[#0D5166] to-[#1a6f8a] px-8 pt-8 pb-6 text-center">
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
            <p className="text-[#F5C78B] text-sm">Sign in to continue to your account</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-6">
            {!forgotPassword ? (
              // Login Form
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0D5166] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
                      placeholder="teacher@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0D5166] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0D5166] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-[#0D5166] focus:ring-[#0D5166]" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="text-sm text-[#0D5166] hover:text-[#F5C78B] transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0D5166] text-white py-2.5 rounded-lg font-semibold hover:bg-[#0a3d4f] transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <label className="block text-sm font-semibold text-[#0D5166] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
                      placeholder="teacher@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-[#0D5166] text-white py-2.5 rounded-lg font-semibold hover:bg-[#0a3d4f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full text-center text-sm text-[#0D5166] hover:text-[#F5C78B] transition-colors"
                >
                  ← Back to Login
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          &copy; 2026 Shree Ram Public School. All rights reserved.
        </p>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login;