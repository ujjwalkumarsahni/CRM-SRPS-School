import React, { useState, useEffect } from "react";
import teacherService from "../../services/teacherService";
import Swal from "sweetalert2";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Trash2,
  Filter,
  X,
} from "lucide-react";

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Generate years dynamically (current year - 3 to current year + 2)
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchMyLeaves();
    }
  }, [activeTab]);

  useEffect(() => {
    if (leaves.length > 0) {
      applyFilter();
    } else {
      setFilteredLeaves([]);
    }
  }, [leaves, filterMonth, filterYear]);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getMyLeaves();
      setLeaves(data.data || []);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Failed to fetch leaves",
        icon: "error",
        confirmButtonColor: "#0D5166",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!filterMonth || !filterYear) {
      setFilteredLeaves(leaves);
      return;
    }

    const filtered = leaves.filter((leave) => {
      const leaveDate = new Date(leave.startDate);
      return (
        leaveDate.getMonth() + 1 === filterMonth &&
        leaveDate.getFullYear() === filterYear
      );
    });

    setFilteredLeaves(filtered);
  };

  const clearFilter = () => {
    setFilterMonth(new Date().getMonth() + 1);
    setFilterYear(new Date().getFullYear());
    setShowFilter(false);
  };

  const handleCreateLeave = async (e) => {
    e.preventDefault();

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      Swal.fire({
        title: "Invalid Date",
        text: "Cannot apply for leave on past dates",
        icon: "error",
        confirmButtonColor: "#0D5166",
      });
      return;
    }

    if (end < start) {
      Swal.fire({
        title: "Invalid Date Range",
        text: "End date cannot be before start date",
        icon: "error",
        confirmButtonColor: "#0D5166",
      });
      return;
    }

    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (duration > 30) {
      Swal.fire({
        title: "Duration Limit Exceeded",
        text: "Maximum 30 consecutive leaves allowed",
        icon: "warning",
        confirmButtonColor: "#0D5166",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Submit Leave Request?",
      html: `
        <div class="text-left" style="font-family: system-ui;">
          <div style="background: #EADDCD; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
            <p style="margin: 4px 0;"><strong>From:</strong> ${start.toLocaleDateString("en-IN")}</p>
            <p style="margin: 4px 0;"><strong>To:</strong> ${end.toLocaleDateString("en-IN")}</p>
            <p style="margin: 4px 0;"><strong>Duration:</strong> ${duration} day${duration > 1 ? "s" : ""}</p>
          </div>
          <p style="margin: 8px 0 0 0;"><strong>Reason:</strong></p>
          <p style="margin: 4px 0 0 0; color: #4B5563;">${formData.reason}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D5166",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      buttonsStyling: true,
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);
    try {
      await teacherService.createLeaveRequest(formData);
      Swal.fire({
        title: "Success!",
        text: "Leave request submitted successfully!",
        icon: "success",
        confirmButtonColor: "#0D5166",
        timer: 2000,
        showConfirmButton: false,
      });
      setFormData({ startDate: "", endDate: "", reason: "" });
      setActiveTab("view");
      fetchMyLeaves();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Failed to submit leave request",
        icon: "error",
        confirmButtonColor: "#0D5166",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = async (leave) => {
    if (leave.status !== "pending") {
      Swal.fire({
        title: "Cannot Cancel",
        text: `Only pending leave requests can be cancelled. This request is already ${leave.status}.`,
        icon: "warning",
        confirmButtonColor: "#0D5166",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(leave.startDate);

    if (startDate < today) {
      Swal.fire({
        title: "Cannot Cancel",
        text: "Cannot cancel leave request for past or ongoing dates",
        icon: "warning",
        confirmButtonColor: "#0D5166",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Cancel Leave Request?",
      html: `
        <div class="text-left">
          <p><strong>From:</strong> ${new Date(leave.startDate).toLocaleDateString()}</p>
          <p><strong>To:</strong> ${new Date(leave.endDate).toLocaleDateString()}</p>
          <p><strong>Duration:</strong> ${Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)</p>
          <p><strong>Reason:</strong> ${leave.reason}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No, Keep",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await teacherService.cancelLeaveRequest(leave._id);
        Swal.fire({
          title: "Cancelled!",
          text: "Your leave request has been cancelled successfully.",
          icon: "success",
          confirmButtonColor: "#0D5166",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchMyLeaves();
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.error || "Failed to cancel leave request",
          icon: "error",
          confirmButtonColor: "#0D5166",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: {
        icon: <Clock size={14} className="text-yellow-600" />,
        bg: "bg-yellow-100",
        text: "Pending",
        color: "text-yellow-800",
      },
      approved: {
        icon: <CheckCircle size={14} className="text-green-600" />,
        bg: "bg-green-100",
        text: "Approved",
        color: "text-green-800",
      },
      rejected: {
        icon: <XCircle size={14} className="text-red-600" />,
        bg: "bg-red-100",
        text: "Rejected",
        color: "text-red-800",
      },
    };
    return configs[status] || configs.pending;
  };

  const getLeaveStatistics = () => {
    const total = filteredLeaves.length;
    const approved = filteredLeaves.filter(
      (l) => l.status === "approved",
    ).length;
    const pending = filteredLeaves.filter((l) => l.status === "pending").length;
    const rejected = filteredLeaves.filter(
      (l) => l.status === "rejected",
    ).length;
    return { total, approved, pending, rejected };
  };

  const stats = getLeaveStatistics();

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = getYears();

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D5166]">Leave Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Apply for leave and track your requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-[#EADDCD]">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 md:px-6 py-2 rounded-t-lg transition-all duration-200 ${
            activeTab === "create"
              ? "bg-[#0D5166] text-white shadow-lg"
              : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
          }`}
        >
          <div className="flex items-center gap-2">
            Apply Leave
          </div>
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`px-4 md:px-6 py-2 rounded-t-lg transition-all duration-200 ${
            activeTab === "view"
              ? "bg-[#0D5166] text-white shadow-lg"
              : "text-gray-600 hover:bg-[#EADDCD] hover:text-[#0D5166]"
          }`}
        >
          <div className="flex items-center gap-2">
            Leave History
          </div>
        </button>
      </div>

      {activeTab === "create" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
              <p className="text-xs text-gray-500 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-[#0D5166]">
                {leaves.length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
              <p className="text-xs text-gray-500 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {leaves.filter((l) => l.status === "approved").length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {leaves.filter((l) => l.status === "pending").length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
              <p className="text-xs text-gray-500 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {leaves.filter((l) => l.status === "rejected").length}
              </p>
            </div>
          </div>

          {/* Leave Form */}
          <div className="bg-white rounded-xl shadow-sm border border-[#EADDCD] overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-[#0D5166] mb-4">
                Apply for Leave
              </h2>
              <form onSubmit={handleCreateLeave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Leave <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5166] focus:border-transparent transition-all resize-none"
                    placeholder="Personal reason, medical emergency, family function, etc..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      Minimum 10 characters
                    </span>
                    <span className="text-xs text-gray-400">
                      {formData.reason.length}/500
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0D5166] text-white py-2.5 rounded-lg font-medium hover:bg-[#0a3d4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Leave Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {activeTab === "view" && (
        <div>
          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-[#EADDCD] mb-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#0D5166]">
                  Filter Leaves
                </h2>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#EADDCD] text-[#0D5166] rounded-lg hover:bg-[#d5c4b0] transition-colors"
                >
                  <Filter size={16} />
                  {showFilter ? "Hide Filter" : "Show Filter"}
                </button>
              </div>

              {showFilter && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#EADDCD]">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5166] focus:border-transparent"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={clearFilter}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X size={16} />
                      Clear Filter
                    </button>
                  </div>
                </div>
              )}

              {/* Filter Info */}
              {!showFilter && (
                <div className="flex items-center justify-between pt-3">
                  <p className="text-sm text-gray-600">
                    Showing:{" "}
                    {months.find((m) => m.value === filterMonth)?.label}{" "}
                    {filterYear}
                  </p>
                  <button
                    onClick={clearFilter}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards for Filtered Data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-[#0D5166]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
              <p className="text-xs text-gray-500 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#EADDCD]">
              <p className="text-xs text-gray-500 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
          </div>

          {/* Leave History Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#0D5166] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Loading leaves...</p>
              </div>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#EADDCD] p-8 text-center">
              <div className="w-16 h-16 bg-[#EADDCD] rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={28} className="text-[#0D5166]" />
              </div>
              <h3 className="text-base font-medium text-[#0D5166] mb-1">
                No leave requests found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {leaves.length === 0
                  ? "You haven't applied for any leave yet"
                  : `No leave requests found for ${months.find((m) => m.value === filterMonth)?.label} ${filterYear}`}
              </p>
              {leaves.length === 0 && (
                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-[#0D5166] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0a3d4f] transition-colors"
                >
                  Apply for Leave
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[#EADDCD] overflow-hidden overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0D5166]">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">
                      Start Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">
                      End Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">
                      Duration
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">
                      Reason
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#EADDCD]">
                      Submitted On
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-[#EADDCD]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeaves.map((leave) => {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    const duration =
                      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    const statusConfig = getStatusBadge(leave.status);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const leaveStartDate = new Date(leave.startDate);
                    leaveStartDate.setHours(0, 0, 0, 0);

                    const canCancel =
                      leave.status === "pending" && leaveStartDate >= today;

                    return (
                      <tr
                        key={leave._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {start.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {end.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {duration} day{duration > 1 ? "s" : ""}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 max-w-xs">
                          <div className="truncate" title={leave.reason}>
                            {leave.reason.length > 40
                              ? leave.reason.substring(0, 40) + "..."
                              : leave.reason}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.text}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(leave.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {canCancel && (
                            <button
                              onClick={() => handleCancelLeave(leave)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Leave"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {!canCancel && leave.status === "pending" && (
                            <span className="text-xs text-gray-400">
                              Cannot cancel
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
