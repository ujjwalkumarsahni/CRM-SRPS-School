import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  MapPin,
  Navigation,
  CheckCircle,
  AlertCircle,
  Save,
  XCircle,
} from "lucide-react";
import attendanceService from "../../services/attendanceService";
import Swal from "sweetalert2";

const MarkAttendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [workReport, setWorkReport] = useState("");
  const [duration, setDuration] = useState(null);
  const [isSubmittingInTime, setIsSubmittingInTime] = useState(false);
  const [isSubmittingOutTime, setIsSubmittingOutTime] = useState(false);
  const [inTimeLocation, setInTimeLocation] = useState(null);
  const [outTimeLocation, setOutTimeLocation] = useState(null);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  useEffect(() => {
    if (todayAttendance?.inTime?.time && todayAttendance?.outTime?.time) {
      calculateDuration(
        todayAttendance.inTime.time,
        todayAttendance.outTime.time,
      );
      setInTime(formatTimeForInput(todayAttendance.inTime.time));
      setOutTime(formatTimeForInput(todayAttendance.outTime.time));
      if (todayAttendance.inTime.location) {
        setInTimeLocation(todayAttendance.inTime.location);
      }
      if (todayAttendance.outTime.location) {
        setOutTimeLocation(todayAttendance.outTime.location);
      }
    } else if (todayAttendance?.inTime?.time) {
      setInTime(formatTimeForInput(todayAttendance.inTime.time));
      if (todayAttendance.inTime.location) {
        setInTimeLocation(todayAttendance.inTime.location);
      }
    }
    if (todayAttendance?.workReport) {
      setWorkReport(todayAttendance.workReport);
    }
  }, [todayAttendance]);

  const fetchTodayAttendance = async () => {
    try {
      const data = await attendanceService.getTodayAttendance();
      setTodayAttendance(data.data);
    } catch (error) {
      console.error("Error fetching today attendance:", error);
    }
  };

  const calculateDuration = (inTime, outTime) => {
    const inDate = new Date(inTime);
    const outDate = new Date(outTime);
    const diffMs = outDate - inDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    setDuration({ hours: diffHours, minutes: diffMinutes });
  };

  const formatTimeForInput = (time) => {
    if (!time) return "";
    const date = new Date(time);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatTime = (time) => {
    if (!time) return "Not marked";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const showAlert = (icon, title, message) => {
    Swal.fire({
      icon: icon,
      title: title,
      text: message,
      confirmButtonColor: "#0D5166",
      timer: icon === "success" ? 2000 : undefined,
      timerProgressBar: icon === "success",
    });
  };

  const showConfirmDialog = async (
    title,
    text,
    confirmText,
    cancelText,
    confirmColor,
  ) => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: confirmColor,
      cancelButtonColor: "#6c757d",
    });
    return result.isConfirmed;
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      Swal.fire({
        title: "Getting Location...",
        text: "Please allow location access",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          Swal.close();
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          Swal.close();
          reject(new Error("Unable to get location. Please enable GPS."));
        },
      );
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleMarkInTimeClick = () => {
    const currentTime = getCurrentTime();
    setInTime(currentTime);
  };

  const handleMarkOutTimeClick = () => {
    const currentTime = getCurrentTime();
    setOutTime(currentTime);
  };

  const handleMarkInTime = async () => {
    if (!inTime) {
      showAlert(
        "warning",
        "Missing Information",
        "Please get current time first",
      );
      return;
    }

    setIsSubmittingInTime(true);

    try {
      Swal.fire({
        title: "Processing...",
        text: "Capturing location and submitting check-in",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const location = await getCurrentLocation();

      const [hours, minutes] = inTime.split(":");
      const inDateTime = new Date();
      inDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await attendanceService.markInTime({
        location,
        workReport,
        time: inDateTime,
      });

      Swal.close();

      const address =
        response.data?.inTime?.location?.address || "Location captured";
      Swal.fire({
        icon: "success",
        title: "Check-In Successful!",
        html: `
          <div class="text-left">
            <p><strong>Time:</strong> ${formatTime(inDateTime)}</p>
            <p><strong>Location:</strong> ${address}</p>
          </div>
        `,
        confirmButtonColor: "#0D5166",
      });

      fetchTodayAttendance();
    } catch (error) {
      Swal.close();
      showAlert(
        "error",
        "Check-In Failed",
        error.message ||
          error.response?.data?.error ||
          "Failed to mark in-time",
      );
    } finally {
      setIsSubmittingInTime(false);
    }
  };

  const handleMarkOutTime = async () => {
    if (!outTime) {
      showAlert(
        "warning",
        "Missing Information",
        "Please get current time first",
      );
      return;
    }

    if (!workReport || workReport.trim() === "") {
      showAlert(
        "warning",
        "Missing Work Report",
        "Please enter work report before submitting out-time",
      );
      return;
    }

    if (todayAttendance?.inTime?.time) {
      const inDateTime = new Date(todayAttendance.inTime.time);
      const [hours, minutes] = outTime.split(":");
      const outDateTime = new Date();
      outDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (outDateTime <= inDateTime) {
        showAlert("warning", "Invalid Time", "Out-time must be after in-time");
        return;
      }
    }

    const confirmed = await showConfirmDialog(
      "Submit Check-Out?",
      "Are you sure you want to submit check-out? This will finalize your attendance for today.",
      "Yes, Submit",
      "Cancel",
      "#ea8e0a",
    );

    if (!confirmed) return;

    setIsSubmittingOutTime(true);

    try {
      Swal.fire({
        title: "Processing...",
        text: "Capturing location and submitting check-out",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const location = await getCurrentLocation();

      const [hours, minutes] = outTime.split(":");
      const outDateTime = new Date();
      outDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await attendanceService.markOutTime({
        location,
        workReport,
        time: outDateTime,
      });

      Swal.close();

      const inTimeDate = new Date(todayAttendance.inTime.time);
      const diffMs = outDateTime - inTimeDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const status =
        response.data?.status === "present"
          ? "Full Day Present"
          : "Half Day Present";

      Swal.fire({
        icon: "success",
        title: "Check-Out Successful!",
        html: `
          <div class="text-left">
            <p><strong>Check-In:</strong> ${formatTime(todayAttendance.inTime.time)}</p>
            <p><strong>Check-Out:</strong> ${formatTime(outDateTime)}</p>
            <p><strong>Total Duration:</strong> ${diffHours}h ${diffMinutes}m</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Location:</strong> ${response.data?.outTime?.location?.address || "Location captured"}</p>
          </div>
        `,
        confirmButtonColor: "#0D5166",
      });

      fetchTodayAttendance();
    } catch (error) {
      Swal.close();
      showAlert(
        "error",
        "Check-Out Failed",
        error.message ||
          error.response?.data?.error ||
          "Failed to mark out-time",
      );
    } finally {
      setIsSubmittingOutTime(false);
    }
  };

  const getStatusText = () => {
    if (!todayAttendance) return "Not started";
    if (todayAttendance.outTime?.time) {
      if (todayAttendance.status === "present") return "Present - Full Day";
      if (todayAttendance.status === "half-day") return "Present - Half Day";
      return "Completed";
    }
    if (todayAttendance.inTime?.time)
      return "Checked In - Waiting for Check-out";
    return "Not Started";
  };

  const getStatusColor = () => {
    if (!todayAttendance) return "bg-gray-100 text-gray-600";
    if (todayAttendance.outTime?.time) {
      if (todayAttendance.status === "present")
        return "bg-green-100 text-green-700";
      if (todayAttendance.status === "half-day")
        return "bg-orange-100 text-orange-700";
      return "bg-blue-100 text-blue-700";
    }
    if (todayAttendance.inTime?.time) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  const isSunday = () => {
    const today = new Date();
    return today.getDay() === 0;
  };

  const isAutoMarkedAbsent = () => {
    return (
      todayAttendance?.status === "absent" &&
      todayAttendance?.workReport?.includes("Auto-marked")
    );
  };

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-linear-to-r from-[#0B2248] to-[#1a708aec] px-6 py-4">
          <h2 className="text-white font-semibold text-lg">
            Mark Today's Attendance
          </h2>
          <p className="text-[#F5C78B] text-sm">{formatDate(new Date())}</p>
        </div>

        <div className="p-6">
          {isSunday() ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-purple-500 mb-3" />
              <p className="text-gray-600">
                Sunday is a holiday. No need to mark attendance.
              </p>
            </div>
          ) : todayAttendance?.status === "leave" ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-purple-500 mb-3" />
              <p className="text-gray-600">
                You are on approved leave today. No need to mark attendance.
              </p>
            </div>
          ) : isAutoMarkedAbsent() ? (
            <div className="text-center py-8">
              <XCircle size={48} className="mx-auto text-red-500 mb-3" />
              <p className="text-gray-600">
                You forgot to mark attendance. Auto-marked as absent.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Please contact admin if this is a mistake.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`${getStatusColor()} rounded-lg p-3 text-center`}>
                <p className="font-semibold">Status: {getStatusText()}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Work Report <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={workReport}
                  onChange={(e) => setWorkReport(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5166]"
                  rows="3"
                  placeholder="Describe your work for today..."
                  disabled={todayAttendance?.outTime?.time}
                />
              </div>

              <div className="border rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#0D5166] flex items-center gap-2">
                    <Clock size={18} /> Check In
                  </h3>
                  {todayAttendance?.inTime?.time && (
                    <span className="text-sm text-[#0B2248] flex items-center gap-1">
                      <CheckCircle size={14} />{" "}
                      {formatTime(todayAttendance.inTime.time)}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Check-In Time
                    </label>
                    <input
                      type="time"
                      value={inTime}
                      readOnly
                      disabled={todayAttendance?.inTime?.time}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100 cursor-not-allowed"
                      placeholder="Click 'Get Current Time' to auto-fill"
                    />
                  </div>

                  {!todayAttendance?.inTime?.time && (
                    <button
                      onClick={handleMarkInTimeClick}
                      className="w-full bg-[#0B2248] text-white py-2 rounded-lg hover:bg-[#0b2248d3] transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock size={16} /> Get Current Time
                    </button>
                  )}

                  {inTimeLocation?.address && todayAttendance?.inTime?.time && (
                    <div className="bg-[#E38A0A]/20 p-2 rounded-lg">
                      <p className="text-xs text-[#0B2248] flex items-center gap-1">
                        <MapPin size={12} />
                        {inTimeLocation.address}
                      </p>
                    </div>
                  )}

                  {!todayAttendance?.inTime?.time && (
                    <button
                      onClick={handleMarkInTime}
                      disabled={isSubmittingInTime || !inTime}
                      className="w-full bg-[#E38A0A] text-[#0B2248] py-2 rounded-lg hover:bg-[#E38A0A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmittingInTime ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Navigation size={16} /> Submit Check-In
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#0D5166] flex items-center gap-2">
                    <Clock size={18} /> Check Out
                  </h3>
                  {todayAttendance?.outTime?.time && (
                    <span className="text-sm text-[#0B2248] flex items-center gap-1">
                      <CheckCircle size={14} />{" "}
                      {formatTime(todayAttendance.outTime.time)}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Check-Out Time
                    </label>
                    <input
                      type="time"
                      value={outTime}
                      readOnly
                      disabled={
                        !todayAttendance?.inTime?.time ||
                        todayAttendance?.outTime?.time
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100 cursor-not-allowed"
                      placeholder="Click 'Get Current Time' to auto-fill"
                    />
                  </div>

                  {!todayAttendance?.outTime?.time &&
                    todayAttendance?.inTime?.time && (
                      <button
                        onClick={handleMarkOutTimeClick}
                        className="w-full bg-[#0B2248] text-white py-2 rounded-lg hover:bg-[#0b2248d3] transition-colors flex items-center justify-center gap-2"
                      >
                        <Clock size={16} /> Get Current Time
                      </button>
                    )}

                  {outTimeLocation?.address &&
                    todayAttendance?.outTime?.time && (
                      <div className="bg-[#E38A0A]/20 p-2 rounded-lg">
                        <p className="text-xs text-[#0B2248] flex items-center gap-1">
                          <MapPin size={12} />
                          {outTimeLocation.address}
                        </p>
                      </div>
                    )}

                  {!todayAttendance?.outTime?.time &&
                    todayAttendance?.inTime?.time && (
                      <button
                        onClick={handleMarkOutTime}
                        disabled={
                          isSubmittingOutTime || !outTime || !workReport
                        }
                        className="w-full bg-[#E38A0A] text-[#0B2248] py-2 rounded-lg hover:bg-[#E38A0A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmittingOutTime ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Navigation size={16} /> Submit Check-Out
                          </>
                        )}
                      </button>
                    )}
                </div>
              </div>

              {todayAttendance?.inTime?.time &&
                todayAttendance?.outTime?.time && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Working Duration
                        </p>
                        <p className="text-2xl font-bold text-[#0D5166]">
                          {duration?.hours}h {duration?.minutes}m
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          In: {formatTime(todayAttendance.inTime.time)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Out: {formatTime(todayAttendance.outTime.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
