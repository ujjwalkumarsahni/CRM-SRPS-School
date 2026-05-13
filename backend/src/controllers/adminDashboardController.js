// controllers/adminDashboardController.js

const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const Holiday = require("../models/Holiday");
const AttendanceUpdateRequest = require("../models/AttendanceUpdateRequest");

/**
 * Get complete admin dashboard data
 * Includes: overview stats, recent activities, attendance trends,
 * teacher status distribution, leave analytics, and more
 */
const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Execute all queries in parallel for better performance
    const [
      // Teacher Statistics
      totalTeachers,
      activeTeachers,
      pendingVerification,
      rejectedTeachers,
      deactivatedTeachers,
      profileCompleted,
      profileIncomplete,
      
      // Today's Attendance
      todayPresent,
      todayAbsent,
      todayHalfDay,
      todayOnLeave,
      todayNotMarked,
      totalTeachersCount,
      
      // Leave Statistics
      pendingLeaves,
      approvedLeavesThisMonth,
      rejectedLeavesThisMonth,
      totalLeavesThisMonth,
      
      // Attendance Update Requests
      pendingUpdateRequests,
      
      // Monthly Attendance Stats
      monthlyAttendanceStats,
      
      // Recent Activities
      recentLeaves,
      recentUpdateRequests,
      recentTeacherRegistrations,
      
      // Upcoming Holidays
      upcomingHolidays,
      
      // Designation Distribution
      designationStats,
      
      // Weekly Attendance Trend
      weeklyAttendanceData,
      
      // Top performers (attendance percentage)
      topPerformers,
      
      // Teachers with most pending leaves
      teachersWithMostLeaves,
      
      // Current month holidays count
      holidaysThisMonth,
      
      // Average attendance percentage this month
      avgAttendancePercentage
    ] = await Promise.all([
      // Total teachers
      User.countDocuments({ role: "teacher" }),
      
      // Active teachers
      User.countDocuments({ role: "teacher", isActive: true, isVerified: true }),
      
      // Pending verification (profile completed but not verified)
      User.countDocuments({ 
        role: "teacher", 
        isVerified: false, 
        isActive: true,
        profileCompleted: true 
      }),
      
      // Rejected teachers
      User.countDocuments({ role: "teacher", status: "rejected" }),
      
      // Deactivated teachers
      User.countDocuments({ role: "teacher", status: "deactivated" }),
      
      // Profile completed
      User.countDocuments({ role: "teacher", profileCompleted: true }),
      
      // Profile incomplete
      User.countDocuments({ role: "teacher", profileCompleted: false }),
      
      // Today's attendance - Present
      Attendance.countDocuments({
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        status: "present"
      }),
      
      // Today's attendance - Absent
      Attendance.countDocuments({
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        status: "absent"
      }),
      
      // Today's attendance - Half Day
      Attendance.countDocuments({
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        status: "half-day"
      }),
      
      // Today's attendance - On Leave
      Attendance.countDocuments({
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        status: "leave"
      }),
      
      // Today's attendance - Not Marked (Total teachers - marked attendance)
      (async () => {
        const total = await User.countDocuments({ role: "teacher", isActive: true, isVerified: true });
        const marked = await Attendance.countDocuments({
          date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });
        return total - marked;
      })(),
      
      // Total active teachers count (for percentage calculations)
      User.countDocuments({ role: "teacher", isActive: true, isVerified: true }),
      
      // Pending leave requests
      LeaveRequest.countDocuments({ status: "pending" }),
      
      // Approved leaves this month
      LeaveRequest.countDocuments({
        status: "approved",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      
      // Rejected leaves this month
      LeaveRequest.countDocuments({
        status: "rejected",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      
      // Total leaves this month
      LeaveRequest.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      
      // Pending attendance update requests
      AttendanceUpdateRequest.countDocuments({ status: "pending" }),
      
      // Monthly attendance statistics by day
      Attendance.aggregate([
        {
          $match: {
            date: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $ne: "holiday" }
          }
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$date" },
              status: "$status"
            },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent leave requests
      LeaveRequest.find()
        .populate("teacher", "name email designation")
        .sort({ createdAt: -1 })
        .limit(5),
      
      // Recent attendance update requests
      AttendanceUpdateRequest.find()
        .populate("teacher", "name email designation")
        .populate("attendance")
        .sort({ createdAt: -1 })
        .limit(5),
      
      // Recent teacher registrations
      User.find({ role: "teacher" })
        .select("name email designation createdAt status isVerified")
        .sort({ createdAt: -1 })
        .limit(5),
      
      // Upcoming holidays (next 30 days)
      Holiday.find({
        date: { $gte: today, $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
        isActive: true
      }).sort({ date: 1 }).limit(5),
      
      // Teachers grouped by designation
      User.aggregate([
        { $match: { role: "teacher", isActive: true } },
        { $group: { _id: "$designation", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Weekly attendance trend (last 7 days)
      (async () => {
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const stats = await Attendance.aggregate([
            {
              $match: {
                date: { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }
              }
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ]);
          
          const present = stats.find(s => s._id === "present")?.count || 0;
          const absent = stats.find(s => s._id === "absent")?.count || 0;
          const halfDay = stats.find(s => s._id === "half-day")?.count || 0;
          const leave = stats.find(s => s._id === "leave")?.count || 0;
          const total = present + absent + halfDay + leave;
          
          weeklyData.push({
            date: date.toISOString().split('T')[0],
            day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
            present,
            absent,
            halfDay,
            leave,
            total,
            attendanceRate: total > 0 ? ((present + halfDay * 0.5) / total * 100).toFixed(1) : 0
          });
        }
        return weeklyData;
      })(),
      
      // Top 5 teachers with best attendance this month
      (async () => {
        const teachers = await User.find({ role: "teacher", isActive: true, isVerified: true })
          .select("_id name email designation");
        
        const performers = [];
        
        for (const teacher of teachers) {
          const attendances = await Attendance.find({
            teacher: teacher._id,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $nin: ["holiday"] }
          });
          
          const holidays = await Holiday.countDocuments({
            date: { $gte: startOfMonth, $lte: endOfMonth },
            isActive: true
          });
          
          const sundays = getSundaysCount(startOfMonth, endOfMonth);
          const workingDays = getDaysInMonth(today.getFullYear(), today.getMonth()) - holidays - sundays;
          
          const presentCount = attendances.filter(a => a.status === "present").length;
          const halfDayCount = attendances.filter(a => a.status === "half-day").length;
          
          const attendancePercentage = workingDays > 0 
            ? ((presentCount + halfDayCount * 0.5) / workingDays * 100).toFixed(1)
            : 0;
          
          performers.push({
            ...teacher.toObject(),
            attendancePercentage: parseFloat(attendancePercentage),
            presentCount,
            halfDayCount,
            workingDays
          });
        }
        
        return performers.sort((a, b) => b.attendancePercentage - a.attendancePercentage).slice(0, 5);
      })(),
      
      // Teachers with most pending leaves
      (async () => {
        const leaves = await LeaveRequest.aggregate([
          { $match: { status: "pending" } },
          { $group: { _id: "$teacher", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]);
        
        const teacherIds = leaves.map(l => l._id);
        const teachers = await User.find({ _id: { $in: teacherIds } })
          .select("name email designation");
        
        return leaves.map(leave => ({
          teacher: teachers.find(t => t._id.toString() === leave._id.toString()),
          pendingLeavesCount: leave.count
        }));
      })(),
      
      // Holidays this month count
      Holiday.countDocuments({
        date: { $gte: startOfMonth, $lte: endOfMonth },
        isActive: true
      }),
      
      // Average attendance percentage this month
      (async () => {
        const teachers = await User.find({ role: "teacher", isActive: true, isVerified: true })
          .select("_id");
        
        let totalPercentage = 0;
        let validTeachers = 0;
        
        const holidays = await Holiday.countDocuments({
          date: { $gte: startOfMonth, $lte: endOfMonth },
          isActive: true
        });
        
        const sundays = getSundaysCount(startOfMonth, endOfMonth);
        const workingDays = getDaysInMonth(today.getFullYear(), today.getMonth()) - holidays - sundays;
        
        for (const teacher of teachers) {
          const attendances = await Attendance.find({
            teacher: teacher._id,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $nin: ["holiday"] }
          });
          
          const presentCount = attendances.filter(a => a.status === "present").length;
          const halfDayCount = attendances.filter(a => a.status === "half-day").length;
          
          const percentage = workingDays > 0 
            ? (presentCount + halfDayCount * 0.5) / workingDays * 100
            : 0;
          
          totalPercentage += percentage;
          validTeachers++;
        }
        
        return validTeachers > 0 ? (totalPercentage / validTeachers).toFixed(1) : 0;
      })()
    ]);
    
    // Calculate attendance percentages for today
    const todayAttendancePercentage = totalTeachersCount > 0
      ? ((todayPresent + todayHalfDay * 0.5) / totalTeachersCount * 100).toFixed(1)
      : 0;
    
    // Process monthly attendance data for chart
    const monthlyAttendanceByDay = {};
    monthlyAttendanceStats.forEach(stat => {
      if (!monthlyAttendanceByDay[stat._id.day]) {
        monthlyAttendanceByDay[stat._id.day] = { present: 0, absent: 0, halfDay: 0, leave: 0 };
      }
      monthlyAttendanceByDay[stat._id.day][stat._id.status] = stat.count;
    });
    
    const monthlyChartData = Object.entries(monthlyAttendanceByDay).map(([day, data]) => ({
      day: parseInt(day),
      present: data.present || 0,
      absent: data.absent || 0,
      halfDay: data.halfDay || 0,
      leave: data.leave || 0
    })).sort((a, b) => a.day - b.day);
    
    // Prepare final dashboard response
    const dashboardData = {
      // Overview Statistics
      overview: {
        totalTeachers,
        activeTeachers,
        inactiveTeachers: totalTeachers - activeTeachers,
        pendingVerification,
        rejectedTeachers,
        deactivatedTeachers,
        profileCompletionRate: totalTeachers > 0 
          ? ((profileCompleted / totalTeachers) * 100).toFixed(1) 
          : 0,
        profileCompleted,
        profileIncomplete
      },
      
      // Today's Attendance
      todayAttendance: {
        present: todayPresent,
        absent: todayAbsent,
        halfDay: todayHalfDay,
        onLeave: todayOnLeave,
        notMarked: todayNotMarked,
        total: totalTeachersCount,
        attendancePercentage: todayAttendancePercentage,
        presentPercentage: totalTeachersCount > 0 ? ((todayPresent / totalTeachersCount) * 100).toFixed(1) : 0,
        absentPercentage: totalTeachersCount > 0 ? ((todayAbsent / totalTeachersCount) * 100).toFixed(1) : 0
      },
      
      // Leave Analytics
      leaveAnalytics: {
        pendingLeaves,
        approvedThisMonth: approvedLeavesThisMonth,
        rejectedThisMonth: rejectedLeavesThisMonth,
        totalThisMonth: totalLeavesThisMonth,
        approvalRate: totalLeavesThisMonth > 0 
          ? ((approvedLeavesThisMonth / totalLeavesThisMonth) * 100).toFixed(1)
          : 0
      },
      
      // Pending Requests
      pendingRequests: {
        attendanceUpdates: pendingUpdateRequests,
        leaveRequests: pendingLeaves,
        teacherVerifications: pendingVerification,
        total: pendingUpdateRequests + pendingLeaves + pendingVerification
      },
      
      // Charts Data
      charts: {
        weeklyAttendanceTrend: weeklyAttendanceData,
        monthlyAttendanceByDay: monthlyChartData,
        designationDistribution: designationStats,
        attendanceTrend: {
          labels: weeklyAttendanceData.map(w => w.day),
          present: weeklyAttendanceData.map(w => w.present),
          absent: weeklyAttendanceData.map(w => w.absent),
          halfDay: weeklyAttendanceData.map(w => w.halfDay),
          attendanceRate: weeklyAttendanceData.map(w => w.attendanceRate)
        }
      },
      
      // Recent Activities
      recentActivities: {
        leaveRequests: recentLeaves,
        attendanceUpdateRequests: recentUpdateRequests,
        newTeachers: recentTeacherRegistrations
      },
      
      // Upcoming Holidays
      upcomingHolidays,
      holidaysThisMonth,
      
      // Performance Metrics
      performance: {
        topPerformers,
        teachersWithMostPendingLeaves: teachersWithMostLeaves,
        averageAttendancePercentage: avgAttendancePercentage
      },
      
      // Quick Stats Cards
      quickStats: {
        attendanceRate: todayAttendancePercentage,
        leaveRate: totalLeavesThisMonth > 0 
          ? ((totalLeavesThisMonth / totalTeachersCount) * 100).toFixed(1)
          : 0,
        verificationRate: totalTeachers > 0 
          ? ((activeTeachers / totalTeachers) * 100).toFixed(1)
          : 0,
        pendingRate: totalTeachers > 0 
          ? ((pendingVerification / totalTeachers) * 100).toFixed(1)
          : 0
      },
      
      // Timestamps
      reportGeneratedAt: new Date(),
      dateRange: {
        startOfMonth: startOfMonth,
        endOfMonth: endOfMonth,
        startOfWeek: startOfWeek,
        today: today
      }
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Failed to fetch dashboard data"
    });
  }
};

/**
 * Get simplified dashboard data for quick loading (lightweight version)
 */
const getQuickStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalTeachers, activeTeachers, pendingLeaves, pendingVerification, todayAttendance] = await Promise.all([
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "teacher", isActive: true, isVerified: true }),
      LeaveRequest.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "teacher", isVerified: false, profileCompleted: true }),
      Attendance.countDocuments({
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        status: "present"
      })
    ]);
    
    res.json({
      success: true,
      data: {
        totalTeachers,
        activeTeachers,
        pendingLeaves,
        pendingVerification,
        todayPresent: todayAttendance,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get attendance trend data for charts
 */
const getAttendanceTrend = async (req, res) => {
  try {
    const { period = "month" } = req.query; // week, month, year
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate, dateFormat;
    
    switch(period) {
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        dateFormat = "%Y-%m-%d";
        break;
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1);
        dateFormat = "%Y-%m";
        break;
      default: // month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        dateFormat = "%Y-%m-%d";
    }
    
    const trendData = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: today },
          status: { $nin: ["holiday"] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$date" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          present: { $sum: { $cond: [{ $eq: ["$_id.status", "present"] }, "$count", 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$_id.status", "absent"] }, "$count", 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ["$_id.status", "half-day"] }, "$count", 0] } },
          leave: { $sum: { $cond: [{ $eq: ["$_id.status", "leave"] }, "$count", 0] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    res.json({
      success: true,
      data: trendData,
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get teacher performance report
 */
const getTeacherPerformanceReport = async (req, res) => {
  try {
    const { month, year, sortBy = "attendance" } = req.query;
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    
    const teachers = await User.find({ role: "teacher", isActive: true })
      .select("name email designation isVerified");
    
    const holidays = await Holiday.countDocuments({
      date: { $gte: startDate, $lte: endDate },
      isActive: true
    });
    
    const sundays = getSundaysCount(startDate, endDate);
    const totalDays = getDaysInMonth(targetYear, targetMonth - 1);
    const workingDays = totalDays - holidays - sundays;
    
    const performanceData = [];
    
    for (const teacher of teachers) {
      const attendances = await Attendance.find({
        teacher: teacher._id,
        date: { $gte: startDate, $lte: endDate }
      });
      
      const presentCount = attendances.filter(a => a.status === "present").length;
      const absentCount = attendances.filter(a => a.status === "absent").length;
      const halfDayCount = attendances.filter(a => a.status === "half-day").length;
      const leaveCount = attendances.filter(a => a.status === "leave").length;
      
      const attendancePercentage = workingDays > 0 
        ? ((presentCount + halfDayCount * 0.5) / workingDays * 100).toFixed(1)
        : 0;
      
      performanceData.push({
        teacherId: teacher._id,
        name: teacher.name,
        email: teacher.email,
        designation: teacher.designation,
        isVerified: teacher.isVerified,
        present: presentCount,
        absent: absentCount,
        halfDay: halfDayCount,
        leave: leaveCount,
        attendancePercentage: parseFloat(attendancePercentage),
        workingDays,
        totalDays
      });
    }
    
    // Sort based on parameter
    if (sortBy === "attendance") {
      performanceData.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
    } else if (sortBy === "name") {
      performanceData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "present") {
      performanceData.sort((a, b) => b.present - a.present);
    }
    
    res.json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        monthName: getMonthName(targetMonth - 1),
        totalTeachers: teachers.length,
        workingDays,
        holidays,
        sundays,
        performance: performanceData
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Export dashboard data as JSON
 */
const exportDashboardData = async (req, res) => {
  try {
    const dashboardData = await getDashboardDataInternal(req);
    
    res.json({
      success: true,
      data: dashboardData,
      exportedAt: new Date(),
      fileFormat: "json"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getSundaysCount(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    if (current.getDay() === 0) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function getMonthName(monthIndex) {
  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  return months[monthIndex];
}

async function getDashboardDataInternal(req) {
  // Internal function to get dashboard data for export
  // Similar to getDashboardData but returns data instead of sending response
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [totalTeachers, activeTeachers, pendingLeaves] = await Promise.all([
    User.countDocuments({ role: "teacher" }),
    User.countDocuments({ role: "teacher", isActive: true, isVerified: true }),
    LeaveRequest.countDocuments({ status: "pending" })
  ]);
  
  return {
    overview: { totalTeachers, activeTeachers, pendingLeaves },
    generatedAt: new Date()
  };
}

module.exports = {
  getDashboardData,
  getQuickStats,
  getAttendanceTrend,
  getTeacherPerformanceReport,
  exportDashboardData
};