// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Loader,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  User,
} from "lucide-react";
import adminDashboardService from "../../services/adminDashboardService";

// CSS Variables from root
const colors = {
  primary: "#0B2248",
  secondary: "#E38A0A",
  accent: "#DB2112",
  light: "#F7F7F7",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Carousel states for each section
  const [presentIndex, setPresentIndex] = useState(0);
  const [absentIndex, setAbsentIndex] = useState(0);
  const [leaveIndex, setLeaveIndex] = useState(0);
  const [halfDayIndex, setHalfDayIndex] = useState(0);

  // Auto-scroll states
  const [isAutoScrolling, setIsAutoScrolling] = useState({
    present: true,
    absent: true,
    leave: true,
    halfDay: true,
  });

  const itemsPerPage = 10;

  // Refs for interval timers
  const intervalRefs = useRef({
    present: null,
    absent: null,
    leave: null,
    halfDay: null,
  });

  useEffect(() => {
    fetchDashboardData();

    return () => {
      Object.keys(intervalRefs.current).forEach((key) => {
        if (intervalRefs.current[key]) {
          clearInterval(intervalRefs.current[key]);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (dashboardData) {
      setupAutoScroll(
        "present",
        dashboardData.presentTeachersList?.length || 0,
      );
      setupAutoScroll("absent", dashboardData.absentTeachersList?.length || 0);
      setupAutoScroll("leave", dashboardData.leaveTeachersList?.length || 0);
      setupAutoScroll(
        "halfDay",
        dashboardData.halfDayTeachersList?.length || 0,
      );
    }

    return () => {
      Object.keys(intervalRefs.current).forEach((key) => {
        if (intervalRefs.current[key]) {
          clearInterval(intervalRefs.current[key]);
        }
      });
    };
  }, [dashboardData]);

  const setupAutoScroll = useCallback(
    (type, totalItems) => {
      if (intervalRefs.current[type]) {
        clearInterval(intervalRefs.current[type]);
      }

      if (isAutoScrolling[type] && totalItems > itemsPerPage) {
        intervalRefs.current[type] = setInterval(() => {
          scrollNext(type, totalItems);
        }, 4000);
      }
    },
    [isAutoScrolling],
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardService.getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
        setPresentIndex(0);
        setAbsentIndex(0);
        setLeaveIndex(0);
        setHalfDayIndex(0);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const scrollNext = useCallback((type, totalItems) => {
    const maxIndex = Math.max(0, Math.ceil(totalItems / itemsPerPage) - 1);
    switch (type) {
      case "present":
        setPresentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        break;
      case "absent":
        setAbsentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        break;
      case "leave":
        setLeaveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        break;
      case "halfDay":
        setHalfDayIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        break;
      default:
        break;
    }
  }, []);

  const scrollPrev = useCallback((type, totalItems) => {
    const maxIndex = Math.max(0, Math.ceil(totalItems / itemsPerPage) - 1);
    switch (type) {
      case "present":
        setPresentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
        break;
      case "absent":
        setAbsentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
        break;
      case "leave":
        setLeaveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
        break;
      case "halfDay":
        setHalfDayIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
        break;
      default:
        break;
    }
  }, []);

  const toggleAutoScroll = useCallback((type) => {
    setIsAutoScrolling((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));

    if (intervalRefs.current[type]) {
      clearInterval(intervalRefs.current[type]);
      intervalRefs.current[type] = null;
    }
  }, []);

  const handlePageChange = useCallback((type, pageNum) => {
    switch (type) {
      case "present":
        setPresentIndex(pageNum);
        break;
      case "absent":
        setAbsentIndex(pageNum);
        break;
      case "leave":
        setLeaveIndex(pageNum);
        break;
      case "halfDay":
        setHalfDayIndex(pageNum);
        break;
      default:
        break;
    }
  }, []);

  const getPaginatedItems = (items, index) => {
    if (!items) return [];
    const start = index * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader
            className="w-12 h-12 animate-spin mx-auto mb-4"
            style={{ color: colors.primary }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md text-center">
          <AlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: colors.accent }}
          />
          <h2
            className="text-xl md:text-2xl font-bold mb-2"
            style={{ color: colors.primary }}
          >
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 rounded-lg text-white transition-colors w-full md:w-auto"
            style={{ backgroundColor: colors.primary }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const {
    totalVerifiedTeachers,
    todayPresentCount,
    todayAbsentCount,
    todayLeaveCount,
    todayHalfDayCount,
    presentTeachersList,
    absentTeachersList,
    leaveTeachersList,
    halfDayTeachersList,
    currentDate,
  } = dashboardData;

  const presentPages = Math.ceil(
    (presentTeachersList?.length || 0) / itemsPerPage,
  );
  const absentPages = Math.ceil(
    (absentTeachersList?.length || 0) / itemsPerPage,
  );
  const leavePages = Math.ceil((leaveTeachersList?.length || 0) / itemsPerPage);
  const halfDayPages = Math.ceil(
    (halfDayTeachersList?.length || 0) / itemsPerPage,
  );

  const currentPresentItems = getPaginatedItems(
    presentTeachersList,
    presentIndex,
  );
  const currentAbsentItems = getPaginatedItems(absentTeachersList, absentIndex);
  const currentLeaveItems = getPaginatedItems(leaveTeachersList, leaveIndex);
  const currentHalfDayItems = getPaginatedItems(
    halfDayTeachersList,
    halfDayIndex,
  );

  return (
    <div
      className="min-h-screen p-3 md:p-6"
      style={{ backgroundColor: colors.light }}
    >
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: colors.primary }}
            >
              Teacher Attendance Dashboard
            </h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              {new Date(currentDate).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ backgroundColor: colors.primary }}
            className="px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 text-white disabled:opacity-50 w-full md:w-auto justify-center"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="Total Verified"
            value={totalVerifiedTeachers}
            icon={Users}
            color={colors.primary}
          />
          <StatCard
            title="Present"
            value={todayPresentCount}
            icon={UserCheck}
            color={colors.primary}
          />
          <StatCard
            title="Absent"
            value={todayAbsentCount}
            icon={UserX}
            color={colors.primary}
          />
          <StatCard
            title="On Leave"
            value={todayLeaveCount}
            icon={Calendar}
            color={colors.primary}
          />
          <StatCard
            title="Half Day"
            value={todayHalfDayCount || 0}
            icon={Clock}
            color={colors.primary}
          />
        </div>
      </div>

      {/* Four Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Present Teachers Section */}
        <Section
          title="Present Teachers"
          icon={UserCheck}
          color={colors.primary}
          items={currentPresentItems}
          totalCount={presentTeachersList?.length || 0}
          currentPage={presentIndex + 1}
          totalPages={presentPages}
          onNext={() => scrollNext("present", presentTeachersList?.length || 0)}
          onPrev={() => scrollPrev("present", presentTeachersList?.length || 0)}
          onPageChange={(page) => handlePageChange("present", page)}
          isAutoScrolling={isAutoScrolling.present}
          onToggleAutoScroll={() => toggleAutoScroll("present")}
          type="present"
          colors={colors}
        />

        {/* Absent Teachers Section */}
        <Section
          title="Absent Teachers"
          icon={UserX}
          color={colors.accent}
          items={currentAbsentItems}
          totalCount={absentTeachersList?.length || 0}
          currentPage={absentIndex + 1}
          totalPages={absentPages}
          onNext={() => scrollNext("absent", absentTeachersList?.length || 0)}
          onPrev={() => scrollPrev("absent", absentTeachersList?.length || 0)}
          onPageChange={(page) => handlePageChange("absent", page)}
          isAutoScrolling={isAutoScrolling.absent}
          onToggleAutoScroll={() => toggleAutoScroll("absent")}
          type="absent"
          colors={colors}
        />

        {/* Leave Teachers Section */}
        <Section
          title="On Leave"
          icon={Calendar}
          color={colors.secondary}
          items={currentLeaveItems}
          totalCount={leaveTeachersList?.length || 0}
          currentPage={leaveIndex + 1}
          totalPages={leavePages}
          onNext={() => scrollNext("leave", leaveTeachersList?.length || 0)}
          onPrev={() => scrollPrev("leave", leaveTeachersList?.length || 0)}
          onPageChange={(page) => handlePageChange("leave", page)}
          isAutoScrolling={isAutoScrolling.leave}
          onToggleAutoScroll={() => toggleAutoScroll("leave")}
          type="leave"
          colors={colors}
        />

        {/* Half Day Teachers Section */}
        <Section
          title="Half Day"
          icon={Clock}
          color={colors.primary}
          items={currentHalfDayItems}
          totalCount={halfDayTeachersList?.length || 0}
          currentPage={halfDayIndex + 1}
          totalPages={halfDayPages}
          onNext={() => scrollNext("halfDay", halfDayTeachersList?.length || 0)}
          onPrev={() => scrollPrev("halfDay", halfDayTeachersList?.length || 0)}
          onPageChange={(page) => handlePageChange("halfDay", page)}
          isAutoScrolling={isAutoScrolling.halfDay}
          onToggleAutoScroll={() => toggleAutoScroll("halfDay")}
          type="halfDay"
          colors={colors}
        />
      </div>
    </div>
  );
};

// Section Component - Simplified with only Photo, Name+Email, Status
const Section = ({
  title,
  icon: Icon,
  color,
  items,
  totalCount,
  currentPage,
  totalPages,
  onNext,
  onPrev,
  onPageChange,
  isAutoScrolling,
  onToggleAutoScroll,
  type,
  colors,
}) => {
  const getStatusBadge = () => {
    switch (type) {
      case "present":
        return {
          bg: colors.primary,
          text: colors.light,
          label: "Present",
        };

      case "absent":
        return {
          bg: colors.accent,
          text: colors.primary,
          label: "Absent",
        };

      case "leave":
        return {
          bg: colors.secondary,
          text: colors.primary,
          label: "On Leave",
        };

      case "halfDay":
        return {
          bg: colors.primary,
          text: colors.light,
          label: "Half Day",
        };

      default:
        return {
          bg: "#f3f4f6",
          text: "#1f2937",
          label: "Unknown",
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Section Header */}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: `${color}`, borderColor: color }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.light }}
              >
                {title}
              </h2>
              <p className="text-sm " style={{ color: colors.light }}>
                Total: {totalCount} teachers
              </p>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleAutoScroll}
                className={`p-2 rounded-lg transition-colors ${isAutoScrolling ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}
                title={
                  isAutoScrolling ? "Stop Auto-Scroll" : "Start Auto-Scroll"
                }
              >
                {isAutoScrolling ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onPrev}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={onNext}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table - Only Photo, Name+Email, Status - No Headers */}
      <div className="overflow-x-auto">
        {items.length > 0 ? (
          <table className="w-full">
            <tbody>
              {items.map((teacher, idx) => (
                <tr
                  key={teacher.id || idx}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {/* Photo Column */}
                  <td className="py-1 px-1 w-16">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {teacher.photo ? (
                        <img
                          src={teacher.photo}
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </td>

                  {/* Name + Email Column */}
                  <td className="">
                    <p className="font-medium text-gray-800">{teacher.name}</p>
                    <p className="text-xs text-gray-500">{teacher.email}</p>
                  </td>

                  {/* Status Column */}
                  <td className="py-3 px-4 w-28">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}
                      style={{ backgroundColor: status.bg, color: status.text }}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No {title.toLowerCase()} for today</p>
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="p-3 border-t bg-gray-50 flex justify-center gap-1 overflow-x-auto">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum - 1)}
                className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                  currentPage === pageNum
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={
                  currentPage === pageNum ? { backgroundColor: color } : {}
                }
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-3 md:p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2 md:mb-3">
      <div
        className="p-1.5 md:p-2 rounded-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-4 h-4 md:w-6 md:h-6" style={{ color }} />
      </div>
    </div>
    <h3
      className="text-xl md:text-2xl font-bold mb-0.5 md:mb-1"
      style={{ color }}
    >
      {value}
    </h3>
    <p className="text-gray-600 text-xs md:text-sm">{title}</p>
  </div>
);

export default Dashboard;
