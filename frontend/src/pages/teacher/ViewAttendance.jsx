import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
  Edit,
  X,
  AlertCircle,
  Gift,
  Loader
} from "lucide-react";
import attendanceService from "../../services/attendanceService";
import Swal from "sweetalert2";

const ViewAttendance = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
    holiday: 0,
    sunday: 0,
    presentPercentage: 0
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    workReport: "",
    inTime: "",
    outTime: "",
    reason: ""
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getMyMonthlyAttendance(selectedMonth, selectedYear);
      const data = response.data;
      
      setCalendarData(data.calendarData || []);
      
      // Calculate stats from calendar data
      const workingDays = data.calendarData.filter(
        d => !d.isSunday && !d.isHoliday
      ).length;
      
      const presentCount = data.calendarData.filter(
        d => d.attendance?.status === "present" && !d.isSunday && !d.isHoliday
      ).length;
      
      const halfDayCount = data.calendarData.filter(
        d => d.attendance?.status === "half-day" && !d.isSunday && !d.isHoliday
      ).length;
      
      const absentCount = data.calendarData.filter(
        d => d.attendance?.status === "absent" && !d.isSunday && !d.isHoliday
      ).length;
      
      const leaveCount = data.calendarData.filter(
        d => d.attendance?.status === "leave" && !d.isSunday && !d.isHoliday
      ).length;
      
      const holidayCount = data.calendarData.filter(d => d.isHoliday).length;
      const sundayCount = data.calendarData.filter(d => d.isSunday && !d.isHoliday).length;
      
      // Calculate attendance percentage (present + half-day*0.5) / workingDays * 100
      const totalPresentValue = presentCount + (halfDayCount * 0.5);
      const presentPercentage = workingDays > 0 
        ? ((totalPresentValue / workingDays) * 100).toFixed(1)
        : 0;
      
      setStats({
        present: presentCount,
        absent: absentCount,
        halfDay: halfDayCount,
        leave: leaveCount,
        holiday: holidayCount,
        sunday: sundayCount,
        presentPercentage: parseFloat(presentPercentage)
      });
    } catch (error) {
      console.error("Error fetching attendance:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.error || "Failed to fetch attendance",
        confirmButtonColor: "#0D5166"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = (attendance, date, day, isHoliday, holidayName, isSunday) => {
    if (isHoliday) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Request Update",
        html: `
          <div class="text-center">
            <p class="mb-2">You cannot request an update for a holiday.</p>
            <p class="text-sm text-gray-500">${holidayName ? `Holiday: ${holidayName}` : 'This date is marked as a holiday'}</p>
          </div>
        `,
        confirmButtonColor: "#0D5166"
      });
      return;
    }

    if (isSunday) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Request Update",
        text: "You cannot request an update for Sunday as it's a non-working day.",
        confirmButtonColor: "#0D5166"
      });
      return;
    }

    if (attendance?.status === "leave") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Request Update",
        html: `
          <div class="text-center">
            <p class="mb-2">You cannot request an update for approved leave attendance.</p>
            <p class="text-sm text-gray-500">Please contact admin for any discrepancies.</p>
          </div>
        `,
        confirmButtonColor: "#0D5166"
      });
      return;
    }

    if (!attendance) {
      Swal.fire({
        icon: "warning",
        title: "No Attendance Record",
        text: "You cannot request an update for a date with no attendance record.",
        confirmButtonColor: "#0D5166"
      });
      return;
    }

    const formatExistingTime = (time) => {
      if (!time) return "";
      const dateObj = new Date(time);
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    setSelectedAttendance({ ...attendance, date, day });
    setEditForm({
      status: attendance?.status || "",
      workReport: attendance?.workReport || "",
      inTime: attendance?.inTime?.time ? formatExistingTime(attendance.inTime.time) : "",
      outTime: attendance?.outTime?.time ? formatExistingTime(attendance.outTime.time) : "",
      reason: ""
    });
    setShowEditModal(true);
  };

  const handleSubmitUpdateRequest = async () => {
    if (!editForm.reason || editForm.reason.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Reason Required",
        text: "Please provide a reason for this update request",
        confirmButtonColor: "#0D5166"
      });
      return;
    }

    Swal.fire({
      title: "Submitting Request...",
      text: "Please wait",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const updateData = {
  attendanceId: selectedAttendance._id,
  reason: editForm.reason,
  requestedChanges: {
    status: editForm.status,
    workReport: editForm.workReport
  }
};

      if (editForm.inTime) {
        updateData.requestedChanges.inTime = editForm.inTime;
      }
      if (editForm.outTime) {
        updateData.requestedChanges.outTime = editForm.outTime;
      }

      await attendanceService.requestAttendanceUpdate(updateData);
      
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Request Submitted!",
        html: `
          <div class="text-left">
            <p>Your update request has been sent to admin.</p>
            <p class="text-sm text-gray-500 mt-2">You will be notified once approved.</p>
          </div>
        `,
        confirmButtonColor: "#0D5166"
      });
      
      setShowEditModal(false);
      fetchMonthlyAttendance();
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: error.response?.data?.error || "Failed to submit request",
        confirmButtonColor: "#0D5166"
      });
    }
  };

  const getStatusStyle = (status, isHoliday, holidayName, isSunday) => {
    if (isHoliday) {
      return { 
        bg: "bg-[#EADDCD]", 
        text: "text-[#0D5166]", 
        icon: <Gift size={14} className="text-[#0D5166]" />,
        displayText: holidayName ||"Holiday"
      };
    }
    if (isSunday) {
      return { 
        bg: "bg-gray-100", 
        text: "text-gray-600", 
        icon: <Calendar size={14} className="text-gray-500" />,
        displayText: "Sunday"
      };
    }
    switch (status) {
      case "present":
        return { bg: "bg-[#E38A0A]", text: "text-[#F7F7F7]", icon: <CheckCircle size={14} className="text-[#F7F7F7]" />, displayText: "Present" };
      case "absent":
        return { bg: "bg-red-100", text: "text-[#F7F7F7]", icon: <XCircle size={14} className="text-[#F7F7F7]" />, displayText: "Absent" };
      case "half-day":
        return { bg: "bg-[#E38A0A]", text: "text-[#F7F7F7]", icon: <Clock size={14} className="bg-[#E38A0A]" />, displayText: "Half Day" };
      case "leave":
        return { bg: "bg-[#E38A0A]", text: "text-[#F7F7F7]", icon: <Calendar size={14} className="text-[#F7F7F7]" />, displayText: "Leave" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-500", icon: null, displayText: "No record" };
    }
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 2;
  const endYear = currentYear + 2;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const canRequestUpdate = (day) => {
    if (day.isHoliday) return false;
    if (day.isSunday) return false;
    if (day.attendance?.status === "leave") return false;
    if (!day.attendance) return false;
    return true;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-[#EADDCD] bg-gray-50">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={fetchMonthlyAttendance}
                className="px-3 py-2 bg-[#0B2248] text-white rounded-lg hover:bg-[#0a3d4fc2] transition-colors flex items-center gap-2"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 p-4 border-b border-[#EADDCD]">
          <div className="text-center p-3 bg-[#0B2248] rounded-lg">
            <div className="text-2xl font-bold text-[#F7F7F7]">{stats.present}</div>
            <div className="text-sm text-[#F7F7F7]">Present</div>
          </div>
          <div className="text-center p-3 bg-[#0B2248] rounded-lg">
            <div className="text-2xl font-bold text-[#F7F7F7]">{stats.absent}</div>
            <div className="text-sm text-[#F7F7F7]">Absent</div>
          </div>
          <div className="text-center p-3 bg-[#0B2248] rounded-lg">
            <div className="text-2xl font-bold text-[#F7F7F7]">{stats.halfDay}</div>
            <div className="text-sm text-[#F7F7F7]">Half Day</div>
          </div>
          <div className="text-center p-3 bg-[#0B2248] rounded-lg">
            <div className="text-2xl font-bold text-[#F7F7F7]">{stats.leave}</div>
            <div className="text-sm text-[#F7F7F7]">Leave</div>
          </div>
          <div className="text-center p-3 bg-[#0B2248] rounded-lg">
            <div className="text-2xl font-bold text-[#F7F7F7]">{stats.holiday}</div>
            <div className="text-sm text-[#F7F7F7]">Holidays</div>
          </div>
          <div className="text-center p-3 bg-[#0B2248] rounded-lg">
            <div className="text-2xl font-bold text-[#F7F7F7]">{stats.sunday}</div>
            <div className="text-sm text-[#F7F7F7]">Sundays</div>
          </div>
          <div className="text-center p-3 bg-[#0B2248] rounded-lg">
            <div className="text-2xl font-bold text-[#F7F7F7]">{stats.presentPercentage}%</div>
            <div className="text-sm text-[#F7F7F7]">Attendance %</div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-2">
        <div className="text-center">
          <Loader
            className="w-12 h-12 animate-spin mx-auto mb-4 text-[#0B2248]"
          />
        </div>
      </div>
        )}

        {/* Calendar View */}
        {!loading && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekdays.map((day) => (
                    <div key={day} className="text-center py-2 text-sm font-semibold bg-[#EADDCD] rounded-lg text-[#0D5166]">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px] rounded-lg"></div>
                  ))}
                  {calendarData.map((day, idx) => {
                    const statusStyle = getStatusStyle(
                      day.attendance?.status, 
                      day.isHoliday, 
                      day.holidayName,
                      day.isSunday
                    );
                    const hasAttendance = !!day.attendance;
                    const showEditButton = canRequestUpdate(day);
                    
                    return (
                      <div
                        key={idx}
                        className={`min-h-[100px] p-2 rounded-lg border transition-all `}
                      >
                        <div className={`text-sm font-medium ${day.isSunday && !day.isHoliday ? "text-red-500" : day.isHoliday ? "text-[#0D5166]" : "text-gray-700"}`}>
                          {day.day}
                          {day.isSunday && !day.isHoliday && <span className="ml-1 text-xs">(Sun)</span>}
                        </div>
                        
                        {(hasAttendance || day.isHoliday || day.isSunday) ? (
                          <div className="mt-2">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 text-xs font-medium">
                                <span className="capitalize text-xs">{statusStyle.displayText}</span>
                              </div>
                              {showEditButton && (
                                <button
                                  onClick={() => handleEditRequest(
                                    day.attendance, 
                                    day.date, 
                                    day.day,
                                    day.isHoliday,
                                    day.holidayName,
                                    day.isSunday
                                  )}
                                  className="p-1 text-[#0D5166] hover:bg-white rounded transition-colors"
                                  title="Request Update"
                                >
                                  <Edit size={12} />
                                </button>
                              )}
                            </div>
                            {day.attendance?.inTime && day.attendance?.inTime?.time && (
                              <div className="text-xs text-gray-500 mt-1">
                                In: {formatTime(day.attendance.inTime.time)}
                              </div>
                            )}
                            {day.attendance?.outTime && day.attendance?.outTime?.time && (
                              <div className="text-xs text-gray-500">
                                Out: {formatTime(day.attendance.outTime.time)}
                              </div>
                            )}
                            {day.attendance?.requestStatus === 'pending' && (
                              <div className="mt-1 text-xs text-orange-500 flex items-center gap-1">
                                <AlertCircle size={10} /> Update Pending
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-gray-400 text-center">
                            No record
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Request Modal */}
      {showEditModal && selectedAttendance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B2248] px-6 py-4 flex justify-between items-center sticky top-0">
              <h3 className="text-white font-semibold text-lg">Request Attendance Update</h3>
              <button onClick={() => setShowEditModal(false)} className="text-white hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[#EADDCD] p-3 rounded-lg">
                <p className="text-sm text-[#0D5166]">Date: <span className="font-semibold">{new Date(selectedAttendance.date).toLocaleDateString()}</span></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Status
                </label>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusStyle(selectedAttendance.status)?.bg} ${getStatusStyle(selectedAttendance.status)?.text}`}>
                  {getStatusStyle(selectedAttendance.status)?.icon}
                  <span className="capitalize">{selectedAttendance.status || "Not marked"}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Request New Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half-day">Half Day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Work Report
                </label>
                <textarea
                  value={editForm.workReport}
                  onChange={(e) => setEditForm({ ...editForm, workReport: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  placeholder="Update work report..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    In Time
                  </label>
                  <input
                    type="time"
                    value={editForm.inTime}
                    onChange={(e) => setEditForm({ ...editForm, inTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  />
                  {selectedAttendance.inTime?.time && (
                    <p className="text-xs text-gray-400 mt-1">Current: {formatTime(selectedAttendance.inTime.time)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Out Time
                  </label>
                  <input
                    type="time"
                    value={editForm.outTime}
                    onChange={(e) => setEditForm({ ...editForm, outTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  />
                  {selectedAttendance.outTime?.time && (
                    <p className="text-xs text-gray-400 mt-1">Current: {formatTime(selectedAttendance.outTime.time)}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Request <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  placeholder="Please provide a reason for this update request..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmitUpdateRequest}
                  className="flex-1 bg-[#0D5166] text-white py-2 rounded-lg hover:bg-[#0a3d4f] transition-colors flex items-center justify-center gap-2"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewAttendance;