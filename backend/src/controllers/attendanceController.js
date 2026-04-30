const Attendance = require('../models/Attendance');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const { getAddressFromCoordinates } = require('../utils/locationHelper');
const moment = require('moment');

// ==================== TEACHER CONTROLLERS ====================

// Teacher: Mark In-Time with Location
const markInTime = async (req, res) => {
  try {
    const { location, workReport } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!req.user.isVerified) {
      return res.status(403).json({ error: 'Account not verified. Cannot mark attendance.' });
    }
    
    // Check if already on leave
    const activeLeave = await LeaveRequest.findOne({
      teacher: req.user._id,
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: 'approved'
    });
    
    if (activeLeave) {
      return res.status(403).json({ error: 'You are on approved leave today. Cannot mark attendance.' });
    }
    
    let attendance = await Attendance.findOne({
      teacher: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    const address = await getAddressFromCoordinates(location.lat, location.lng);
    console.log("Fetched Address:", address);
    if (!attendance) {
      attendance = await Attendance.create({
        teacher: req.user._id,
        date: today,
        status: 'present',
        inTime: {
          time: new Date(),
          location: {
            lat: location.lat,
            lng: location.lng,
            address
          }
        },
        workReport
      });
    } else if (attendance.status === 'absent') {
      attendance.status = 'present';
      attendance.inTime = {
        time: new Date(),
        location: {
          lat: location.lat,
          lng: location.lng,
          address
        }
      };
      attendance.workReport = workReport;
      await attendance.save();
    } else if (!attendance.inTime) {
      attendance.inTime = {
        time: new Date(),
        location: {
          lat: location.lat,
          lng: location.lng,
          address
        }
      };
      attendance.workReport = workReport;
      await attendance.save();
    } else {
      return res.status(400).json({ error: 'Already marked in-time for today' });
    }
    
    res.json({
      success: true,
      message: 'In-time marked successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Mark Out-Time with Location
const markOutTime = async (req, res) => {
  try {
    const { location, workReport } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      teacher: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    if (!attendance) {
      return res.status(404).json({ error: 'No attendance record found for today. Please mark in-time first.' });
    }
    
    if (!attendance.inTime) {
      return res.status(400).json({ error: 'Please mark in-time first' });
    }
    
    if (attendance.outTime && attendance.outTime.time) {
      return res.status(400).json({ error: 'Out-time already marked for today' });
    }
    
    const address = await getAddressFromCoordinates(location.lat, location.lng);
    
    attendance.outTime = {
      time: new Date(),
      location: {
        lat: location.lat,
        lng: location.lng,
        address
      }
    };
    
    if (workReport) {
      attendance.workReport = workReport;
    }
    
    const inTimeHour = moment(attendance.inTime.time).hour();
    const outTimeHour = moment(attendance.outTime.time).hour();
    
    if (outTimeHour - inTimeHour < 4) {
      attendance.status = 'half-day';
    }
    
    await attendance.save();
    
    res.json({
      success: true,
      message: 'Out-time marked successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Get Today's Attendance
const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      teacher: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      success: true,
      data: attendance || { status: 'not_marked', message: 'No attendance marked for today' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Get Monthly Attendance with Stats
const getMyMonthlyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);
    
    const attendances = await Attendance.find({
      teacher: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Create complete calendar data
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const calendarData = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth - 1, i);
      const attendance = attendances.find(a => 
        new Date(a.date).toDateString() === date.toDateString()
      );
      
      calendarData.push({
        date,
        day: i,
        isSunday: date.getDay() === 0,
        attendance: attendance ? {
          _id: attendance._id,
          status: attendance.status,
          inTime: attendance.inTime,
          outTime: attendance.outTime,
          workReport: attendance.workReport
        } : null
      });
    }
    
    // Calculate stats
    const stats = {
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      halfDay: attendances.filter(a => a.status === 'half-day').length,
      leave: attendances.filter(a => a.status === 'leave').length,
      totalDays: daysInMonth,
      presentPercentage: ((attendances.filter(a => a.status === 'present').length + 
        attendances.filter(a => a.status === 'half-day').length * 0.5) / 
        (daysInMonth - calendarData.filter(d => d.isSunday).length) * 100).toFixed(1)
    };
    
    res.json({
      success: true,
      data: {
        calendarData,
        attendances,
        stats,
        month: currentMonth,
        year: currentYear,
        daysInMonth
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== ADMIN CONTROLLERS ====================

// Admin: Get All Verified Teachers List
const getAllTeachersForAttendance = async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher',
      isActive: true,
      isVerified: true
    }).select('name email designation isVerified profileCompleted');
    
    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get Any Teacher's Monthly Attendance with Details
const getTeacherMonthlyAttendance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    
    const teacher = await User.findById(teacherId).select('name email designation profileCompleted');
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);
    
    const attendances = await Attendance.find({
      teacher: teacherId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Create complete calendar data for all days of the month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const calendarData = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth - 1, i);
      const attendance = attendances.find(a => 
        new Date(a.date).toDateString() === date.toDateString()
      );
      
      calendarData.push({
        date,
        day: i,
        isSunday: date.getDay() === 0,
        attendance: attendance ? {
          _id: attendance._id,
          status: attendance.status,
          inTime: attendance.inTime,
          outTime: attendance.outTime,
          workReport: attendance.workReport,
          modifiedBy: attendance.modifiedBy
        } : null
      });
    }
    
    // Calculate detailed stats
    const stats = {
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      halfDay: attendances.filter(a => a.status === 'half-day').length,
      leave: attendances.filter(a => a.status === 'leave').length,
      totalDays: daysInMonth,
      workingDays: daysInMonth - calendarData.filter(d => d.isSunday).length,
      presentPercentage: ((attendances.filter(a => a.status === 'present').length + 
        attendances.filter(a => a.status === 'half-day').length * 0.5) / 
        (daysInMonth - calendarData.filter(d => d.isSunday).length) * 100).toFixed(1)
    };
    
    res.json({
      success: true,
      data: {
        teacher,
        calendarData,
        attendances,
        stats,
        month: currentMonth,
        year: currentYear,
        daysInMonth,
        monthName: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get Single Attendance Detail
const getAttendanceById = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    
    const attendance = await Attendance.findById(attendanceId).populate('teacher', 'name email designation');
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update Attendance Status, Time, Work Report
const updateAttendanceByAdmin = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, workReport, inTime, outTime } = req.body;
    
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    if (status) attendance.status = status;
    if (workReport !== undefined) attendance.workReport = workReport;
    
    if (inTime) {
      attendance.inTime = {
        ...attendance.inTime,
        time: inTime.time ? new Date(inTime.time) : attendance.inTime?.time,
        location: inTime.location || attendance.inTime?.location
      };
    }
    
    if (outTime) {
      attendance.outTime = {
        ...attendance.outTime,
        time: outTime.time ? new Date(outTime.time) : attendance.outTime?.time,
        location: outTime.location || attendance.outTime?.location
      };
    }
    
    attendance.modifiedBy = req.user._id;
    await attendance.save();
    
    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Create New Attendance Record
const createAttendanceByAdmin = async (req, res) => {
  try {
    const { teacherId, date, status, workReport, inTime, outTime } = req.body;
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    let attendance = await Attendance.findOne({
      teacher: teacherId,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (attendance) {
      return res.status(400).json({ error: 'Attendance already exists. Please use update.' });
    }
    
    attendance = await Attendance.create({
      teacher: teacherId,
      date: targetDate,
      status: status || 'absent',
      workReport: workReport || '',
      inTime: inTime || null,
      outTime: outTime || null,
      modifiedBy: req.user._id
    });
    
    res.json({
      success: true,
      message: 'Attendance created successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Delete Attendance Record
const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    
    const attendance = await Attendance.findByIdAndDelete(attendanceId);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  // Teacher controllers
  markInTime,
  markOutTime,
  getTodayAttendance,
  getMyMonthlyAttendance,
  
  // Admin controllers
  getAllTeachersForAttendance,
  getTeacherMonthlyAttendance,
  getAttendanceById,
  updateAttendanceByAdmin,
  createAttendanceByAdmin,
  deleteAttendance
};