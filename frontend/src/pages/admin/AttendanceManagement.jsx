import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Edit,
  Save,
  X,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Plus,
  Lock,
} from "lucide-react";
import attendanceService from "../../services/attendanceService";
import Toast from "../../components/Common/Toast";

const AttendanceManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState([]);
  const [stats, setStats] = useState({});
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDateForCreation, setSelectedDateForCreation] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    workReport: "",
    inTime: "",
    outTime: "",
  });
  const [createForm, setCreateForm] = useState({
    status: "",
    workReport: "",
    inTime: "",
    outTime: "",
  });
  const [viewMode, setViewMode] = useState("calendar");
  const [hoveredCell, setHoveredCell] = useState(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchMonthlyAttendance();
    }
  }, [selectedTeacher, selectedMonth, selectedYear]);

  const fetchTeachers = async () => {
    try {
      const data = await attendanceService.getAllTeachersForAttendance();
      setTeachers(data.data || []);
      if (data.data && data.data.length > 0 && !selectedTeacher) {
        setSelectedTeacher(data.data[0]);
      }
    } catch (error) {
      setToast({ message: "Failed to fetch teachers", type: "error" });
    }
  };

  const fetchMonthlyAttendance = async () => {
    if (!selectedTeacher) return;
    setLoading(true);
    try {
      const data = await attendanceService.getTeacherMonthlyAttendance(
        selectedTeacher._id,
        selectedMonth,
        selectedYear,
      );
      setCalendarData([...(data.data?.calendarData || [])]);
setStats({ ...(data.data?.stats || {}) });
setTeacherInfo({ ...(data.data?.teacher || {}) });
    } catch (error) {
      setToast({ message: "Failed to fetch attendance", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (attendance) => {
  // Don't allow editing if it's a Sunday/Holiday
  const attendanceDate = new Date(attendance.date);
  if (attendanceDate.getDay() === 0) {
    setToast({
      message: "Cannot edit attendance on Sunday (Holiday)",
      type: "warning",
    });
    return;
  }

  const formatExistingTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    if (isNaN(date.getTime())) return "";
    
    // Format as HH:MM in local time
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  setSelectedAttendance(attendance);
  setEditForm({
    status: attendance.status || "",
    workReport: attendance.workReport || "",
    inTime: attendance.inTime?.time
      ? formatExistingTime(attendance.inTime.time)
      : "",
    outTime: attendance.outTime?.time
      ? formatExistingTime(attendance.outTime.time)
      : "",
  });
  setShowEditModal(true);
};

  const handleCreateClick = (date, dayData) => {
    // Don't allow creation on Sunday/Holiday
    const checkDate = new Date(date);
    if (checkDate.getDay() === 0) {
      setToast({
        message: "Cannot add attendance on Sunday (Holiday)",
        type: "warning",
      });
      return;
    }

    setSelectedDateForCreation({
      date: date,
      day: dayData.day,
      formattedDate: checkDate,
    });
    setCreateForm({
      status: "present",
      workReport: "",
      inTime: "",
      outTime: "",
    });
    setShowCreateModal(true);
  };

  const handleCreateAttendance = async () => {
    if (!createForm.status) {
      setToast({ message: "Please select attendance status", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const createData = {
        teacherId: selectedTeacher._id,
        date: selectedDateForCreation.date,
        status: createForm.status,
        workReport: createForm.workReport || "",
      };

      if (createForm.inTime) {
        const [hours, minutes] = createForm.inTime.split(":");
        const inDateTime = new Date(selectedDateForCreation.date);
        inDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
        createData.inTime = { time: inDateTime };
      }

      if (createForm.outTime) {
        const [hours, minutes] = createForm.outTime.split(":");
        const outDateTime = new Date(selectedDateForCreation.date);
        outDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
        createData.outTime = { time: outDateTime };
      }

      await attendanceService.createAttendanceByAdmin(createData);
      setToast({ message: "Attendance created successfully", type: "success" });
      setShowCreateModal(false);
      fetchMonthlyAttendance();
    } catch (error) {
      setToast({
        message: error.response?.data?.error || "Failed to create attendance",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

const handleUpdateAttendance = async () => {
  setLoading(true);
  try {
    const updateData = {
      status: editForm.status,
      workReport: editForm.workReport,
    };

    // ✅ Safe Date Builder Function
    const createDateTime = (date, time) => {
      if (!time) return null;

      const [h, m] = time.split(":");
      if (!h || !m) return null;

      const d = new Date(date);
      if (isNaN(d)) return null;

      d.setHours(Number(h), Number(m), 0, 0);
      return isNaN(d) ? null : d;
    };

    // ✅ In Time
    const inTime = createDateTime(
      selectedAttendance?.date,
      editForm.inTime
    );

    if (inTime) {
      updateData.inTime = {
        time: inTime,
        location: selectedAttendance.inTime?.location,
      };
    }

    // ✅ Out Time
    const outTime = createDateTime(
      selectedAttendance?.date,
      editForm.outTime
    );

    if (outTime) {
      updateData.outTime = {
        time: outTime,
        location: selectedAttendance.outTime?.location,
      };
    }

    console.log("FINAL UPDATE DATA 👉", updateData); // debug

    await attendanceService.updateAttendanceByAdmin(
      selectedAttendance._id,
      updateData
    );

    setToast({ message: "Attendance updated successfully", type: "success" });

    setShowEditModal(false);

    // ✅ Force refresh (important)
    await fetchMonthlyAttendance();

  } catch (error) {
    console.error("Update error:", error);
    setToast({ message: "Failed to update attendance", type: "error" });
  } finally {
    setLoading(false);
  }
};

  const getStatusStyle = (status, isSunday = false) => {
    // Sunday (fixed full style)
    if (isSunday) {
      return {
        bg: "bg-[#E22213]", // full dark blue
        text: "text-white",
        border: "border-[#E22213]",
        icon: <Lock size={14} className="text-white" />,
      };
    }

    switch (status) {
      case "present":
        return {
          bg: "bg-[#0D5166]",
          text: "text-white",
          border: "border-[#0D5166]",
          icon: <CheckCircle size={12} className="text-white" />,
        };

      case "absent":
        return {
          bg: "bg-[#E22213]",
          text: "text-white",
          border: "border-[#E22213]",
          icon: <XCircle size={12} className="text-white" />,
        };

      case "half-day":
        return {
          bg: "bg-[#EA8E0A]",
          text: "text-white",
          border: "border-[#EA8E0A]",
          icon: <Clock size={12} className="text-white" />,
        };

      case "leave":
        return {
          bg: "bg-green-900",
          text: "text-white",
          border: "border-green-900",
          icon: <Calendar size={12} className="text-white" />,
        };

      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          border: "border-gray-300",
          icon: null,
        };
    }
  };

  const formatLocation = (location) => {
    if (!location) return "No location";
    if (location.address) {
      const addressParts = location.address.split(",");
      if (addressParts.length >= 2) {
        return `${addressParts[0].trim()}, ${addressParts[1].trim()}`;
      }
      return location.address.length > 40
        ? location.address.substring(0, 40) + "..."
        : location.address;
    }
    return `${location.lat?.toFixed(6)}, ${location.lng?.toFixed(6)}`;
  };

  const getFullLocation = (location) => {
    if (!location) return "No location data";
    if (location.address) return location.address;
    return `Latitude: ${location.lat?.toFixed(6)}, Longitude: ${location.lng?.toFixed(6)}`;
  };

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);

  const formatDate = (date) => {
    const d = new Date(date);
    if (!date || isNaN(d)) return "-";
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate stats excluding Sundays
  const getWorkingDayStats = () => {
    const workingDays = calendarData.filter((day) => !day.isSunday);
    const presentCount = workingDays.filter(
      (day) => day.attendance?.status === "present",
    ).length;
    const absentCount = workingDays.filter(
      (day) => day.attendance?.status === "absent",
    ).length;
    const halfDayCount = workingDays.filter(
      (day) => day.attendance?.status === "half-day",
    ).length;
    const leaveCount = workingDays.filter(
      (day) => day.attendance?.status === "leave",
    ).length;
    const totalWorkingDays = workingDays.length;
    const presentPercentage =
      totalWorkingDays > 0
        ? (
            ((presentCount + halfDayCount * 0.5) / totalWorkingDays) *
            100
          ).toFixed(1)
        : 0;

    return {
      presentCount,
      absentCount,
      halfDayCount,
      leaveCount,
      totalWorkingDays,
      presentPercentage,
    };
  };

  const workingStats = getWorkingDayStats();

  const currentYear = new Date().getFullYear();
  const startYear = 2026; // ya jo bhi tumhara base ho
  const endYear = currentYear + 2; // future ke 2 saal dikhao

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  return (
    <div className="pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D5166]">
          Attendance Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor and manage staff attendance (Sundays are auto-marked as
          Holiday)
        </p>
      </div>

      {/* Teacher Selection Dropdown */}
      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="bg-[#0D5166] px-6 py-3">
          <h2 className="text-white font-semibold">Select Staff Member</h2>
        </div>
        <div className="p-4">
          <select
            value={selectedTeacher?._id || ""}
            onChange={(e) => {
              const teacher = teachers.find((t) => t._id === e.target.value);
              setSelectedTeacher(teacher);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
          >
            <option value="">Select a teacher...</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name} - {teacher.designation}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Section */}
      {selectedTeacher && teacherInfo && (
        <>
          {/* Stats Cards - Excluding Sundays */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {/* Present Card */}
            <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-[#0D5166]">
              <div className="text-2xl md:text-3xl font-bold text-[#0D5166]">
                {workingStats.presentCount || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#0D5166]"></div>
                Present Days
              </div>
            </div>

            {/* Absent Card */}
            <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-[#E22213]">
              <div className="text-2xl md:text-3xl font-bold text-[#E22213]">
                {workingStats.absentCount || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#E22213]"></div>
                Absent Days
              </div>
            </div>

            {/* Half Day Card */}
            <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-[#EA8E0A]">
              <div className="text-2xl md:text-3xl font-bold text-[#EA8E0A]">
                {workingStats.halfDayCount || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#EA8E0A]"></div>
                Half Days
              </div>
            </div>

            {/* Leave Card */}
            <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-green-900">
              <div className="text-2xl md:text-3xl font-bold text-green-900">
                {workingStats.leaveCount || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-900"></div>
                Leave Days
              </div>
            </div>

            {/* Attendance Percentage Card */}
            <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all duration-200 border-t-4 border-[#0D5166]">
              <div className="text-2xl md:text-3xl font-bold text-[#0D5166]">
                {workingStats.presentPercentage || 0}%
              </div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">
                Attendance Rate
              </div>
              {/* Mini progress bar */}
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-[#0D5166] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${workingStats.presentPercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    viewMode === "calendar"
                      ? "bg-[#0D5166] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    viewMode === "list"
                      ? "bg-[#0D5166] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={fetchMonthlyAttendance}
                  className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D5166]"></div>
            </div>
          )}

          {/* Calendar View */}
          {!loading && viewMode === "calendar" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-[#0D5166] px-4 py-2">
                <h2 className="text-white font-semibold text-center text-sm md:text-base">
                  {months[selectedMonth - 1]} {selectedYear}
                </h2>
              </div>
              <div className="overflow-x-auto p-2">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1">
                  {weekdays.map((day) => (
                    <div
                      key={day}
                      className="text-center py-1 text-[10px] md:text-xs font-semibold bg-gray-100 rounded-md text-[#0D5166]"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-15 md:min-h-20 bg-gray-50 rounded-md"
                    ></div>
                  ))}
                  {calendarData.map((day, idx) => {
                    const isSunday = day.isSunday;
                    const style = isSunday
                      ? getStatusStyle(null, true)
                      : day.attendance
                        ? getStatusStyle(day.attendance.status)
                        : null;
                    const isHovered = hoveredCell === idx;
                    const hasAttendance = !!day.attendance;
                    const isEditable = !isSunday;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredCell(idx)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => {
                          if (!isEditable) {
                            setToast({
                              message:
                                "Sunday is a holiday. Cannot modify attendance.",
                              type: "warning",
                            });
                            return;
                          }
                          if (hasAttendance) {
                            handleEditClick(day.attendance);
                          } else {
                            handleCreateClick(day.date, day);
                          }
                        }}
                        className={`min-h-15 md:min-h-20 p-1 md:p-1.5 rounded-md border transition-all ${
                          isSunday
                            ? `${style?.bg} ${style?.border} cursor-not-allowed`
                            : hasAttendance
                              ? "bg-white border-gray-200 cursor-pointer hover:bg-gray-50"
                              : "bg-white border-dashed border-gray-300 cursor-pointer hover:border-[#0D5166] hover:bg-blue-50"
                        } ${isHovered && !isSunday && hasAttendance ? "shadow-md scale-[1.01]" : ""}`}
                      >
                        {/* Date Number */}
                        <div
                          className={`text-xs md:text-sm font-medium flex justify-between items-center ${isSunday ? "text-white" : "text-gray-700"}`}
                        >
                          <span>{day.day}</span>
                          {isSunday && (
                            <Lock size={10} className="text-white" />
                          )}
                          {!isSunday && !hasAttendance && (
                            <Plus
                              size={10}
                              className="text-[#0D5166] opacity-50"
                            />
                          )}
                        </div>

                        {/* Content */}
                        {isSunday ? (
                          <div className="mt-1 text-center">
                            <div className="text-[9px] md:text-xs flex items-center justify-center gap-0.5">
                              <Lock size={8} className="md:hidden" />
                              <span className="hidden md:inline text-white">
                                Holiday
                              </span>
                            </div>
                          </div>
                        ) : hasAttendance ? (
                          <div className="mt-1">
                            {/* Status Badge - Only this has background color */}
                            <div
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${style?.bg} text-[9px] md:text-xs font-medium`}
                            >
                              <span className={style?.text}>
                                {day.attendance.status === "present" && "P"}
                                {day.attendance.status === "absent" && "A"}
                                {day.attendance.status === "half-day" && "HD"}
                                {day.attendance.status === "leave" && "L"}
                              </span>
                            </div>

                            {/* Time - Hide on very small screens */}
                            {day.attendance.inTime && (
                              <div className="text-[8px] md:text-xs text-gray-500 mt-1 hidden sm:block">
                                {new Date(
                                  day.attendance.inTime.time,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                            {/* Time - Hide on very small screens */}
                            {day.attendance.outTime && (
                              <div className="text-[8px] md:text-xs text-gray-500 mt-1 hidden sm:block">
                                {new Date(
                                  day.attendance.outTime.time,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-1 text-[9px] md:text-xs text-gray-400 text-center hidden sm:block">
                            Click to add
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {!loading && viewMode === "list" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#0D5166] text-white sticky top-0">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs md:text-sm font-semibold">
                        Date
                      </th>
                      <th className="py-2 px-3 text-left text-xs md:text-sm font-semibold">
                        Day
                      </th>
                      <th className="py-2 px-3 text-left text-xs md:text-sm font-semibold">
                        Status
                      </th>
                      <th className="py-2 px-3 text-left text-xs md:text-sm font-semibold hidden sm:table-cell">
                        In Time
                      </th>
                      <th className="py-2 px-3 text-left text-xs md:text-sm font-semibold hidden sm:table-cell">
                        Out Time
                      </th>
                      <th className="py-2 px-3 text-left text-xs md:text-sm font-semibold hidden lg:table-cell">
                        Location
                      </th>
                      <th className="py-2 px-3 text-left text-xs md:text-sm font-semibold hidden md:table-cell">
                        Work Report
                      </th>
                      <th className="py-2 px-3 text-center text-xs md:text-sm font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendarData.map((day, idx) => {
                      const isSunday = day.isSunday;
                      const style = isSunday
                        ? getStatusStyle(null, true)
                        : day.attendance
                          ? getStatusStyle(day.attendance.status)
                          : null;
                      const weekdaysList = [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ];
                      const weekdayName =
                        weekdaysList[
                          new Date(
                            selectedYear,
                            selectedMonth - 1,
                            day.day,
                          ).getDay()
                        ];

                      return (
                        <tr
                          key={idx}
                          className={`border-b transition-colors ${
                            isSunday
                              ? "bg-gray-50 hover:bg-gray-100"
                              : "hover:bg-[#EADDCD]/30"
                          }`}
                        >
                          {/* Date Column */}
                          <td className="py-2 px-3">
                            <div>
                              <span className="font-medium text-gray-800">
                                {day.day}
                              </span>
                              <span className="text-gray-400 text-xs ml-1 hidden sm:inline">
                                {months[selectedMonth - 1].substring(0, 3)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 sm:hidden">
                              {months[selectedMonth - 1]} {selectedYear}
                            </div>
                          </td>

                          {/* Day Column */}
                          <td className="py-2 px-3">
                            <span
                              className={`text-sm ${
                                isSunday
                                  ? "text-red-500 font-semibold"
                                  : "text-gray-600"
                              }`}
                            >
                              {weekdayName.substring(0, 3)}
                            </span>
                          </td>

                          {/* Status Column */}
                          <td className="py-2 px-3">
                            {isSunday ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-600">
                                <Lock size={12} /> Holiday
                              </span>
                            ) : day.attendance ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style?.bg} ${style?.text}`}
                              >
                                {style?.icon}
                                <span className="hidden sm:inline capitalize">
                                  {day.attendance.status}
                                </span>
                                <span className="sm:hidden">
                                  {day.attendance.status === "present" && "P"}
                                  {day.attendance.status === "absent" && "A"}
                                  {day.attendance.status === "half-day" && "HD"}
                                  {day.attendance.status === "leave" && "L"}
                                </span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCreateClick(day.date, day)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              >
                                <Plus size={12} />
                                <span className="hidden sm:inline">Add</span>
                              </button>
                            )}
                          </td>

                          {/* In Time Column - Hidden on mobile */}
                          <td className="py-2 px-3 hidden sm:table-cell">
                            {!isSunday && day.attendance?.inTime ? (
                              <div className="flex items-center gap-1">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-gray-700 text-sm">
                                  {new Date(
                                    day.attendance.inTime.time,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Out Time Column - Hidden on mobile */}
                          <td className="py-2 px-3 hidden sm:table-cell">
                            {!isSunday && day.attendance?.outTime ? (
                              <div className="flex items-center gap-1">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-gray-700 text-sm">
                                  {new Date(
                                    day.attendance.outTime.time,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Location Column - Hidden on tablet */}
                          <td className="py-2 px-3 hidden lg:table-cell">
                            {!isSunday && day.attendance?.inTime?.location ? (
                              <div
                                className="flex items-center gap-1 text-gray-500 text-xs cursor-help"
                                title={getFullLocation(
                                  day.attendance.inTime.location,
                                )}
                              >
                                <MapPin
                                  size={12}
                                  className="text-gray-400 flex-shrink-0"
                                />
                                <span className="truncate max-w-[150px]">
                                  {formatLocation(
                                    day.attendance.inTime.location,
                                  )}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Work Report Column - Hidden on tablet */}
                          <td className="py-2 px-3 hidden md:table-cell">
                            {!isSunday && day.attendance?.workReport ? (
                              <div
                                className="text-gray-600 text-xs truncate max-w-[150px] cursor-help"
                                title={day.attendance.workReport}
                              >
                                📝 {day.attendance.workReport.substring(0, 30)}
                                {day.attendance.workReport.length > 30 && "..."}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Action Column */}
                          <td className="py-2 px-3 text-center">
                            {!isSunday && day.attendance && (
                              <button
                                onClick={() => handleEditClick(day.attendance)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Attendance"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Empty State */}
                {calendarData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar
                      size={48}
                      className="mx-auto mb-2 text-gray-300"
                    />
                    <p>No attendance records found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAttendance && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0D5166] px-4 py-3 flex justify-between items-center sticky top-0">
              <h3 className="text-white font-semibold">Edit Attendance</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={formatDate(selectedAttendance.date)}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                >
                  <option value="">Select Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half-day">Half Day</option>
                  <option value="leave">Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Report
                </label>
                <textarea
                  value={editForm.workReport}
                  disabled
                  onChange={(e) =>
                    setEditForm({ ...editForm, workReport: e.target.value })
                  }
                  rows="3"
                  className="w-full bg-gray-200 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  placeholder="Enter work report..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    In Time
                  </label>
                  <input
                    type="time"
                    disabled
                    value={editForm.inTime}
                    onChange={(e) =>
                      setEditForm({ ...editForm, inTime: e.target.value })
                    }
                    className="w-full px-3 bg-gray-200 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  />
                  
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Out Time
                  </label>
                  <input
                    type="time"
                    disabled
                    value={editForm.outTime}
                    onChange={(e) =>
                      setEditForm({ ...editForm, outTime: e.target.value })
                    }
                    className="w-full bg-gray-200 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#85bbcc]"
                  />
                </div>
              </div>

              {selectedAttendance.inTime?.location && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-[#0D5166] mb-2 flex items-center gap-1">
                    Location
                  </p>
                  <p className="text-sm text-gray-700">
                    {selectedAttendance.inTime.location.address ||
                      "Location not available"}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateAttendance}
                  disabled={loading}
                  className="flex-1 bg-[#0D5166] text-white py-2 rounded-lg hover:bg-[#0a3d4f] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && (<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>)}
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Attendance Modal */}
      {showCreateModal && selectedDateForCreation && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0D5166] px-4 py-3 flex justify-between items-center sticky top-0">
              <h3 className="text-white font-semibold">Add Attendance</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={formatDate(selectedDateForCreation.date)}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half-day">Half Day</option>
                  <option value="leave">Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Report
                </label>
                <textarea
                  value={createForm.workReport}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, workReport: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  placeholder="Enter work report..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    In Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={createForm.inTime}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, inTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Out Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={createForm.outTime}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, outTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateAttendance}
                  disabled={loading}
                  className="flex-1 bg-[#0D5166] text-white py-2 rounded-lg hover:bg-[#0a3d4f] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Plus size={16} />
                  )}
                  Create Attendance
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default AttendanceManagement;
