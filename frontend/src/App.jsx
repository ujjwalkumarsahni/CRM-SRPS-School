import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import CompleteProfile from "./pages/teacher/CompleteProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import StaffManagement from "./pages/admin/StaffManagement/StaffManagement";
import AdminAttendanceManagement from "./pages/admin/AttendanceManagement/AttendanceManagement";
import AdminLeaveManagement from "./pages/admin/LeaveManagement";
import AdminProfile from "./pages/admin/Profile";

// Teacher Pages
import TeacherAttendanceManagement from "./pages/teacher/AttendanceManagement";
import TeacherLeaveManagement from "./pages/teacher/LeaveManagement";
import TeacherProfile from "./pages/teacher/Profile";

import NavigateToDashboard from "./components/NavigateToDashboard";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <NavigateToDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/teacher/complete-profile" element={<CompleteProfile />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="attendance" element={<AdminAttendanceManagement />} />
          <Route path="leaves" element={<AdminLeaveManagement />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="attendance" />} />
          <Route path="attendance" element={<TeacherAttendanceManagement />} />
          <Route path="leaves" element={<TeacherLeaveManagement />} />
          <Route path="profile" element={<TeacherProfile />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
