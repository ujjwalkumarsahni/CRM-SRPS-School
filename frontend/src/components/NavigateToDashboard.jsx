import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavigateToDashboard = () => {
  const { user, loading } = useAuth();

    if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
    }

  if (!user) return <Navigate to="/login" />;

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" />;
  }

  if (user.role === "teacher") {
    return <Navigate to="/teacher/attendance" />;
  }

  return <Navigate to="/login" />;
};

export default NavigateToDashboard;