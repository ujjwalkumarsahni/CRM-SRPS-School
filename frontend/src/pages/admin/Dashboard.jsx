// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  RefreshCw,
  ChevronRight,
  Bell,
  PieChart,
  BarChart3,
  Activity,
  Award,
  Leaf,
  UserMinus,
  UserPlus,
  Briefcase,
  GraduationCap,
  Sun,
  Moon,
  Loader
} from 'lucide-react';
import adminDashboardService from '../../services/adminDashboardService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const colors = {
    primary: "#0B2248",
    secondary: "#E38A0A",
    accent: "#DB2112",
    light: "#F7F7F7"
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardService.getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      const blob = await adminDashboardService.exportDashboardData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.accent }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: colors.primary }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { overview, todayAttendance, leaveAnalytics, pendingRequests, charts, recentActivities, upcomingHolidays, performance, quickStats } = dashboardData;

  return (
    <div className="min-h-screen p-2">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: colors.primary }} />
              <span style={{ color: colors.primary }}>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
              style={{ backgroundColor: colors.primary }}
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Teachers"
            value={overview.totalTeachers}
            icon={Users}
            color={colors.primary}
            trend={overview.activeTeachers}
            trendLabel="Active"
          />
          <StatCard
            title="Today's Attendance"
            value={`${todayAttendance.attendancePercentage}%`}
            icon={Calendar}
            color={colors.secondary}
            subValue={`${todayAttendance.present} present / ${todayAttendance.total} total`}
          />
          <StatCard
            title="Pending Requests"
            value={pendingRequests.total}
            icon={Bell}
            color={colors.accent}
            subValue={`${pendingRequests.leaveRequests} leaves · ${pendingRequests.attendanceUpdates} updates`}
          />
          <StatCard
            title="Monthly Leave Rate"
            value={`${quickStats.leaveRate}%`}
            icon={TrendingUp}
            color={colors.secondary}
            subValue={`${leaveAnalytics.approvedThisMonth} approved`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Attendance Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
              Today's Attendance
            </h2>
            <Activity className="w-5 h-5" style={{ color: colors.secondary }} />
          </div>
          <div className="space-y-3">
            <AttendanceBar
              label="Present"
              count={todayAttendance.present}
              total={todayAttendance.total}
              color={colors.primary}
              icon={UserCheck}
            />
            <AttendanceBar
              label="Absent"
              count={todayAttendance.absent}
              total={todayAttendance.total}
              color={colors.accent}
              icon={UserX}
            />
            <AttendanceBar
              label="Half Day"
              count={todayAttendance.halfDay}
              total={todayAttendance.total}
              color={colors.secondary}
              icon={Clock}
            />
            <AttendanceBar
              label="On Leave"
              count={todayAttendance.onLeave}
              total={todayAttendance.total}
              color={colors.secondary}
              icon={Leaf}
            />
            <AttendanceBar
              label="Not Marked"
              count={todayAttendance.notMarked}
              total={todayAttendance.total}
              color="gray"
              icon={AlertCircle}
            />
          </div>
        </div>

        {/* Teacher Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
              Teacher Status
            </h2>
            <PieChart className="w-5 h-5" style={{ color: colors.secondary }} />
          </div>
          <div className="space-y-3">
            <StatusCard
              label="Active Verified"
              count={overview.activeTeachers}
              total={overview.totalTeachers}
              color={colors.primary}
              icon={UserCheck}
            />
            <StatusCard
              label="Pending Verification"
              count={overview.pendingVerification}
              total={overview.totalTeachers}
              color={colors.secondary}
              icon={Clock}
            />
            <StatusCard
              label="Rejected"
              count={overview.rejectedTeachers}
              total={overview.totalTeachers}
              color={colors.accent}
              icon={XCircle}
            />
            <StatusCard
              label="Deactivated"
              count={overview.deactivatedTeachers}
              total={overview.totalTeachers}
              color="gray"
              icon={UserMinus}
            />
            <StatusCard
              label="Profile Incomplete"
              count={overview.profileIncomplete}
              total={overview.totalTeachers}
              color={colors.secondary}
              icon={UserPlus}
            />
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Profile Completion Rate:</span>
              <span className="font-semibold" style={{ color: colors.primary }}>
                {overview.profileCompletionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
              Top Performers This Month
            </h2>
            <Award className="w-5 h-5" style={{ color: colors.secondary }} />
          </div>
          <div className="space-y-4">
            {performance.topPerformers?.map((teacher, index) => (
              <div key={teacher._id} className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" 
                  style={{ backgroundColor: index === 0 ? colors.secondary : colors.primary }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{teacher.name}</p>
                  <p className="text-sm text-gray-500">{teacher.designation}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: colors.primary }}>
                    {teacher.attendancePercentage}%
                  </p>
                  <p className="text-xs text-gray-500">Attendance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Attendance Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
              Weekly Attendance Trend
            </h2>
            <div className="flex gap-2">
              {['week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedPeriod === period 
                      ? 'text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={selectedPeriod === period ? { backgroundColor: colors.primary } : {}}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                {charts.weeklyAttendanceTrend?.map(day => (
                  <div key={day.date} className="text-center flex-1">
                    {day.day}
                  </div>
                ))}
              </div>
              <div className="relative h-64">
                <CanvasChart data={charts.weeklyAttendanceTrend} colors={colors} />
              </div>
            </div>
          </div>
        </div>

        {/* Designation Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
              Designation Distribution
            </h2>
            <Briefcase className="w-5 h-5" style={{ color: colors.secondary }} />
          </div>
          <div className="space-y-3">
            {charts.designationDistribution?.map((item) => (
              <div key={item._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item._id || 'Not Specified'}</span>
                  <span className="font-semibold" style={{ color: colors.primary }}>
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.count / overview.totalTeachers) * 100}%`,
                      backgroundColor: colors.secondary
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
              Recent Leave Requests
            </h2>
            <FileText className="w-5 h-5" style={{ color: colors.secondary }} />
          </div>
          <div className="space-y-3">
            {recentActivities.leaveRequests?.map((leave) => (
              <div key={leave._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{leave.teacher?.name}</p>
                  <p className="text-sm text-gray-500">{leave.teacher?.designation}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    leave.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {leave.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(leave.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
              Upcoming Holidays
            </h2>
            <Sun className="w-5 h-5" style={{ color: colors.secondary }} />
          </div>
          <div className="space-y-3">
            {upcomingHolidays?.map((holiday) => (
              <div key={holiday._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{holiday.name}</p>
                  <p className="text-sm text-gray-500">{holiday.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: colors.primary }}>
                    {new Date(holiday.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500">{holiday.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
            Recent Teacher Registrations
          </h2>
          <GraduationCap className="w-5 h-5" style={{ color: colors.secondary }} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: colors.primary }}>Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: colors.primary }}>Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: colors.primary }}>Designation</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: colors.primary }}>Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: colors.primary }}>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.newTeachers?.map((teacher) => (
                <tr key={teacher._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{teacher.name}</td>
                  <td className="py-3 px-4 text-gray-600">{teacher.email}</td>
                  <td className="py-3 px-4 text-gray-600">{teacher.designation || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      teacher.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {teacher.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon: Icon, color, trend, trendLabel, subValue }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <Icon className="w-8 h-8" style={{ color }} />
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <TrendingUp className="w-3 h-3" style={{ color }} />
          <span>{trend}</span>
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
    <h3 className="text-2xl font-bold mb-1" style={{ color }}>{value}</h3>
    <p className="text-gray-600 text-sm">{title}</p>
    {subValue && <p className="text-xs text-gray-400 mt-2">{subValue}</p>}
  </div>
);

const AttendanceBar = ({ label, count, total, color, icon: Icon }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: color === 'gray' ? '#9CA3AF' : color }} />
          <span className="text-gray-700">{label}</span>
        </div>
        <span className="font-medium" style={{ color: color === 'gray' ? '#6B7280' : color }}>
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color === 'gray' ? '#9CA3AF' : color }}
        />
      </div>
    </div>
  );
};

const StatusCard = ({ label, count, total, color, icon: Icon }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: color === 'gray' ? '#9CA3AF' : color }} />
          <span className="text-gray-700">{label}</span>
        </div>
        <span className="font-medium" style={{ color: color === 'gray' ? '#6B7280' : color }}>
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color === 'gray' ? '#9CA3AF' : color }}
        />
      </div>
    </div>
  );
};

// Simple Canvas-based Chart Component
const CanvasChart = ({ data, colors }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !data) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    
    if (!data.length) return;
    
    const maxValue = Math.max(...data.map(d => d.present + d.halfDay * 0.5));
    const barWidth = (width - 40) / data.length - 4;
    
    data.forEach((day, index) => {
      const x = 20 + index * (barWidth + 4);
      const attendanceValue = day.present + day.halfDay * 0.5;
      const barHeight = (attendanceValue / maxValue) * (height - 60);
      
      // Draw bar
      ctx.fillStyle = colors.primary;
      ctx.fillRect(x, height - 30 - barHeight, barWidth, barHeight);
      
      // Draw value on top of bar
      ctx.fillStyle = colors.primary;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${day.attendanceRate}%`, x + barWidth / 2, height - 35 - barHeight);
    });
  }, [data, colors]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default Dashboard;