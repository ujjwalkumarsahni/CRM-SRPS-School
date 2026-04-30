import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Toast from "../components/Common/Toast";
import { Lock, Eye, EyeOff } from "lucide-react";
import authService from "../services/authService";
import { assets } from "../assets/assets";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }

    if (password.length < 6) {
      setToast({
        message: "Password must be at least 6 characters",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);

      setToast({
        message: "Password reset successful! Please login.",
        type: "success",
      });

      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setToast({
        message: error.response?.data?.error || "Failed to reset password",
        type: "error",
      });
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
          <p className="text-[#F5C78B] text-sm">Enter your new password</p>
        </div>

        <div className="px-8 py-6">
 <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#0D5166] mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0D5166]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0D5166] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0D5166]"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D5166] text-white py-2.5 rounded-lg font-semibold hover:bg-[#0a3d4f] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <Link
            to="/login"
            className="block text-center text-sm text-[#0D5166] hover:text-[#F5C78B] transition-colors"
          >
            ← Back to Login
          </Link>
        </form>
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

export default ResetPassword;
