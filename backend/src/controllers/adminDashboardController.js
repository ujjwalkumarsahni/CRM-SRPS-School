// controllers/dashboardController.js
const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");

/**
 * Get simplified dashboard data
 * Returns: Total verified teachers, Today's present/absent/leave counts with lists
 * Only fetches: photo, name, email, status from User and TeacherProfile models
 */
const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all verified teachers (isVerified = true)
    const verifiedTeachers = await User.find({ 
      role: "teacher", 
      isVerified: true 
    }).select("_id name email");

    const verifiedTeacherIds = verifiedTeachers.map(t => t._id);
    const totalVerifiedTeachers = verifiedTeachers.length;

    // Get teacher profiles with photos
    const teacherProfiles = await TeacherProfile.find({
      user: { $in: verifiedTeacherIds }
    }).select("user photo");

    // Create a map of userId -> photo URL
    const photoMap = new Map();
    teacherProfiles.forEach(profile => {
      if (profile.photo && profile.photo.url) {
        photoMap.set(profile.user.toString(), profile.photo.url);
      }
    });

    // Get today's attendance records for verified teachers
    const todayAttendances = await Attendance.find({
      teacher: { $in: verifiedTeacherIds },
      date: { $gte: today, $lt: tomorrow }
    });

    // Separate attendance by status
    const presentRecords = todayAttendances.filter(a => a.status === "present");
    const absentRecords = todayAttendances.filter(a => a.status === "absent");
    const leaveRecords = todayAttendances.filter(a => a.status === "leave");
    const halfDayRecords = todayAttendances.filter(a => a.status === "half-day");

    // Get teacher details for present teachers
    const presentTeachers = presentRecords.map((record) => {
      const teacher = verifiedTeachers.find(t => t._id.toString() === record.teacher.toString());
      const teacherId = teacher?._id?.toString();
      return {
        id: teacher?._id,
        name: teacher?.name || "N/A",
        email: teacher?.email || "N/A",
        photo: photoMap.get(teacherId) || null,
        status: "present",
        checkInTime: record.inTime?.time || record.checkInTime,
        checkOutTime: record.outTime?.time || record.checkOutTime
      };
    }).filter(t => t.id);

    // Get teacher details for absent teachers
    const absentTeachers = absentRecords.map((record) => {
      const teacher = verifiedTeachers.find(t => t._id.toString() === record.teacher.toString());
      const teacherId = teacher?._id?.toString();
      return {
        id: teacher?._id,
        name: teacher?.name || "N/A",
        email: teacher?.email || "N/A",
        photo: photoMap.get(teacherId) || null,
        status: "absent",
        remarks: record.remarks || "No remarks"
      };
    }).filter(t => t.id);

    // Get teacher details for leave teachers
    const leaveTeachers = await Promise.all(
      leaveRecords.map(async (record) => {
        const teacher = verifiedTeachers.find(t => t._id.toString() === record.teacher.toString());
        const teacherId = teacher?._id?.toString();
        
        // Get leave request details if available
        const leaveRequest = await LeaveRequest.findOne({
          teacher: record.teacher,
          status: "approved",
          startDate: { $lte: today },
          endDate: { $gte: today }
        });
        
        return {
          id: teacher?._id,
          name: teacher?.name || "N/A",
          email: teacher?.email || "N/A",
          photo: photoMap.get(teacherId) || null,
          status: "leave",
          leaveType: leaveRequest?.leaveType || "Casual Leave",
          leaveReason: leaveRequest?.reason || "Not specified"
        };
      })
    );

    // Get half-day teachers
    const halfDayTeachers = halfDayRecords.map((record) => {
      const teacher = verifiedTeachers.find(t => t._id.toString() === record.teacher.toString());
      const teacherId = teacher?._id?.toString();
      return {
        id: teacher?._id,
        name: teacher?.name || "N/A",
        email: teacher?.email || "N/A",
        photo: photoMap.get(teacherId) || null,
        status: "half-day",
        checkInTime: record.inTime?.time || record.checkInTime,
        checkOutTime: record.outTime?.time || record.checkOutTime
      };
    }).filter(t => t.id);

    // Find teachers with no attendance record today (not marked)
    const markedTeacherIds = todayAttendances.map(a => a.teacher.toString());
    const notMarkedTeachers = verifiedTeachers
      .filter(t => !markedTeacherIds.includes(t._id.toString()))
      .map(teacher => {
        const teacherId = teacher._id.toString();
        return {
          id: teacher._id,
          name: teacher.name || "N/A",
          email: teacher.email || "N/A",
          photo: photoMap.get(teacherId) || null,
          status: "not-marked"
        };
      });

    // Calculate counts
    const todayPresentCount = presentRecords.length;
    const todayAbsentCount = absentRecords.length;
    const todayLeaveCount = leaveRecords.length;
    const todayHalfDayCount = halfDayRecords.length;
    const todayNotMarkedCount = notMarkedTeachers.length;

    // Prepare response
    const dashboardData = {
      success: true,
      data: {
        // Statistics
        totalVerifiedTeachers,
        todayPresentCount,
        todayAbsentCount,
        todayLeaveCount,
        todayHalfDayCount,
        todayNotMarkedCount,
        totalPresented: todayPresentCount + todayHalfDayCount,
        
        // Lists for display - only containing photo, name, email, status
        presentTeachersList: presentTeachers,
        absentTeachersList: absentTeachers,
        leaveTeachersList: leaveTeachers,
        halfDayTeachersList: halfDayTeachers,
        notMarkedTeachersList: notMarkedTeachers,
        
        // Today's date
        currentDate: today,
        
        // Last updated timestamp
        lastUpdated: new Date()
      }
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message
    });
  }
};

/**
 * Get today's attendance summary only (lightweight)
 */
const getTodaySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all verified teachers
    const totalVerifiedTeachers = await User.countDocuments({
      role: "teacher",
      isVerified: true
    });

    // Get today's attendance counts
    const todayAttendances = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const presentCount = todayAttendances.filter(a => a.status === "present").length;
    const absentCount = todayAttendances.filter(a => a.status === "absent").length;
    const leaveCount = todayAttendances.filter(a => a.status === "leave").length;
    const halfDayCount = todayAttendances.filter(a => a.status === "half-day").length;

    res.status(200).json({
      success: true,
      data: {
        totalVerifiedTeachers,
        presentCount,
        absentCount,
        leaveCount,
        halfDayCount,
        date: today
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboardData,
  getTodaySummary
};