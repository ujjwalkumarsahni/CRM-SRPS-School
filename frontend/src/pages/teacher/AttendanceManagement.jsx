import React, { useState } from "react";
import MarkAttendance from "./MarkAttendance";
import ViewAttendance from "./ViewAttendance";

const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState("mark");

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D5166]">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Track your daily attendance and view history</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-[#EADDCD]">
        <button
          onClick={() => setActiveTab("mark")}
          className={`px-4 md:px-6 py-2 rounded-t-lg transition-all duration-200 ${
            activeTab === "mark"
              ? "bg-[#0D5166] text-white shadow-lg"
              : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
          }`}
        >
          Mark Attendance
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`px-4 md:px-6 py-2 rounded-t-lg transition-all duration-200 ${
            activeTab === "view"
              ? "bg-[#0D5166] text-white shadow-lg"
              : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
          }`}
        >
          View Attendance
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "mark" && <MarkAttendance />}
      {activeTab === "view" && <ViewAttendance />}
    </div>
  );
};

export default AttendanceManagement;