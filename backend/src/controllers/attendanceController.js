// controllers/attendanceController.js
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Holiday = require("../models/Holiday");
const LeaveRequest = require("../models/LeaveRequest");
const AttendanceUpdateRequest = require("../models/AttendanceUpdateRequest");
const { getAddressFromCoordinates } = require("../utils/locationHelper");
const { sendEmail } = require("../utils/emailTemplates");

// ==================== HELPER FUNCTIONS ====================
// Check if teacher is on leave for a given date
const isLeaveDate = async (teacherId, date) => {
  const leave = await LeaveRequest.findOne({
    teacher: teacherId,
    startDate: { $lte: date },
    endDate: { $gte: date },
    status: "approved",
  });
  return leave ? leave : false;
};

// Check if a date is a holiday
const isHoliday = async (date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const holiday = await Holiday.findOne({
    date: targetDate,
    isActive: true,
  });

  return holiday ? holiday : false;
};

// Get all holidays for a date range
const getHolidaysInRange = async (startDate, endDate) => {
  return await Holiday.find({
    date: { $gte: startDate, $lte: endDate },
    isActive: true,
  });
};

// Auto-mark holidays for all teachers on a specific date
const autoMarkHolidayForAllTeachers = async (date, holidayName) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const teachers = await User.find({
    role: "teacher",
    isActive: true,
    isVerified: true,
  });

  for (const teacher of teachers) {
    // Check existing attendance
    const existingAttendance = await Attendance.findOne({
      teacher: teacher._id,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // ❌ Don't overwrite approved leave
    if (existingAttendance && existingAttendance.status === "leave") {
      continue;
    }

    await Attendance.findOneAndUpdate(
      {
        teacher: teacher._id,
        date: {
          $gte: targetDate,
          $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      {
        teacher: teacher._id,
        date: targetDate,
        status: "holiday",
        isHoliday: true,
        holidayName: holidayName,
        workReport: `Holiday: ${holidayName}`,
      },
      {
        upsert: true,
        new: true,
      },
    );
  }
};

// ==================== TEACHER CONTROLLERS ====================

const markInTime = async (req, res) => {
  try {
    const { location, workReport, time } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!req.user.isVerified) {
      return res
        .status(403)
        .json({ error: "Account not verified. Cannot mark attendance." });
    }

    // Check if today is a holiday
    const holiday = await isHoliday(today);
    if (holiday) {
      return res.status(403).json({
        error: `Today is a holiday (${holiday.name}). Cannot mark attendance.`,
      });
    }

    // Check if on leave
    const activeLeave = await LeaveRequest.findOne({
      teacher: req.user._id,
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: "approved",
    });

    if (activeLeave) {
      return res.status(403).json({
        error: "You are on approved leave today. Cannot mark attendance.",
      });
    }

    let attendance = await Attendance.findOne({
      teacher: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const address = await getAddressFromCoordinates(location.lat, location.lng);
    const inDateTime = time ? new Date(time) : new Date();

    if (!attendance) {
      attendance = await Attendance.create({
        teacher: req.user._id,

        date: today,

        status: "absent",

        inTime: {
          time: inDateTime,

          location: {
            lat: location.lat,
            lng: location.lng,
            address,
          },
        },

        workReport: workReport || "",
      });
    } else if (!attendance.inTime) {
      attendance.inTime = {
        time: inDateTime,
        location: { lat: location.lat, lng: location.lng, address },
      };
      attendance.workReport = workReport || attendance.workReport;
      await attendance.save();
    } else {
      return res
        .status(400)
        .json({ error: "Already marked in-time for today" });
    }

    res.json({
      success: true,
      message: "In-time marked successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOutTime = async (req, res) => {
  try {
    const { location, workReport, time } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today is a holiday
    const holiday = await isHoliday(today);
    if (holiday) {
      return res.status(403).json({
        error: `Today is a holiday (${holiday.name}). Cannot mark attendance.`,
      });
    }

    // Check if on approved leave
    const activeLeave = await LeaveRequest.findOne({
      teacher: req.user._id,
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: "approved",
    });

    if (activeLeave) {
      return res.status(403).json({
        error: "You are on approved leave today. Cannot mark out-time.",
      });
    }

    if (!workReport || workReport.trim() === "") {
      return res
        .status(400)
        .json({ error: "Work report is required before submitting out-time" });
    }

    const attendance = await Attendance.findOne({
      teacher: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!attendance) {
      return res.status(404).json({
        error: "No attendance record found. Please mark in-time first.",
      });
    }

    if (!attendance.inTime) {
      return res.status(400).json({ error: "Please mark in-time first" });
    }

    if (attendance.outTime && attendance.outTime.time) {
      return res
        .status(400)
        .json({ error: "Out-time already marked for today" });
    }

    const inDateTime = new Date(attendance.inTime.time);
    const outDateTime = time ? new Date(time) : new Date();

    if (outDateTime <= inDateTime) {
      return res.status(400).json({ error: "Out-time must be after in-time" });
    }

    const address = await getAddressFromCoordinates(location.lat, location.lng);

    attendance.outTime = {
      time: outDateTime,
      location: { lat: location.lat, lng: location.lng, address },
    };
    attendance.workReport = workReport;

    const diffMs = outDateTime - inDateTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours >= 4) {
      attendance.status = "present";
    } else if (diffHours > 0 && diffHours < 4) {
      attendance.status = "half-day";
    } else {
      attendance.status = "absent";
    }

    await attendance.save();

    res.json({
      success: true,
      message: "Out-time marked successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const holiday = await isHoliday(today);

    const attendance = await Attendance.findOne({
      teacher: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: attendance || {
        status: "not_marked",
        message: "No attendance marked for today",
      },
      isHoliday: holiday
        ? { isHoliday: true, name: holiday.name }
        : { isHoliday: false },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyMonthlyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const [attendances, holidays] = await Promise.all([
      Attendance.find({
        teacher: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 }),
      getHolidaysInRange(startDate, endDate),
    ]);

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const calendarData = [];
    const holidayMap = new Map(holidays.map((h) => [h.date.toDateString(), h]));

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth - 1, i);
      const attendance = attendances.find(
        (a) => new Date(a.date).toDateString() === date.toDateString(),
      );
      const holiday = holidayMap.get(date.toDateString());
      const isSunday = date.getDay() === 0;

      calendarData.push({
        date,
        day: i,
        isSunday,
        isHoliday: !!holiday,
        holidayName: holiday?.name,
        attendance: attendance
          ? {
              _id: attendance._id,
              status: attendance.status,
              inTime: attendance.inTime,
              outTime: attendance.outTime,
              workReport: attendance.workReport,
            }
          : null,
      });
    }

    const workingDays = calendarData.filter(
      (d) => !d.isSunday && !d.isHoliday,
    ).length;
    const attendancesOnly = calendarData.filter(
      (d) => d.attendance && !d.isSunday && !d.isHoliday,
    );

    const stats = {
      presentCount: attendancesOnly.filter(
        (a) => a.attendance.status === "present",
      ).length,
      absentCount: attendancesOnly.filter(
        (a) => a.attendance.status === "absent",
      ).length,
      halfDayCount: attendancesOnly.filter(
        (a) => a.attendance.status === "half-day",
      ).length,
      leaveCount: attendancesOnly.filter((a) => a.attendance.status === "leave")
        .length,
      holidayCount: calendarData.filter((d) => d.isHoliday).length,
      sundayCount: calendarData.filter((d) => d.isSunday).length,
      totalDays: daysInMonth,
      workingDays,
      presentPercentage:
        workingDays > 0
          ? (
              ((attendancesOnly.filter((a) => a.attendance.status === "present")
                .length +
                attendancesOnly.filter(
                  (a) => a.attendance.status === "half-day",
                ).length *
                  0.5) /
                workingDays) *
              100
            ).toFixed(1)
          : 0,
    };

    res.json({
      success: true,
      data: { calendarData, stats, month: currentMonth, year: currentYear },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const requestAttendanceUpdate = async (req, res) => {
  try {
    const { attendanceId, reason, requestedChanges } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    if (attendance.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You can only request updates for your own attendance",
      });
    }

    // Check if date is holiday (can't request update for holiday)
    const holiday = await isHoliday(attendance.date);
    if (holiday) {
      return res
        .status(403)
        .json({ error: "Cannot request update for a holiday" });
    }

    // ❌ Cannot request update for leave attendance
    if (attendance.status === "leave") {
      return res.status(403).json({
        error: "Cannot update approved leave attendance",
      });
    }
    const existingRequest = await AttendanceUpdateRequest.findOne({
      attendance: attendanceId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        error: "You already have a pending request for this attendance",
      });
    }

    const formattedChanges = {};

    if (
      requestedChanges?.status &&
      requestedChanges.status !== attendance.status
    ) {
      formattedChanges.status = requestedChanges.status;
    }

    if (
      requestedChanges?.workReport &&
      requestedChanges.workReport !== attendance.workReport
    ) {
      formattedChanges.workReport = requestedChanges.workReport;
    }

    if (requestedChanges?.inTime) {
      const [hours, minutes] = requestedChanges.inTime.split(":");

      const inDateTime = new Date(attendance.date);

      inDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      formattedChanges.inTime = inDateTime;
    }

    if (requestedChanges?.outTime) {
      const [hours, minutes] = requestedChanges.outTime.split(":");

      const outDateTime = new Date(attendance.date);

      outDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      formattedChanges.outTime = outDateTime;
    }

    const updateRequest = await AttendanceUpdateRequest.create({
      teacher: req.user._id,
      attendance: attendanceId,
      requestedChanges: formattedChanges,
      reason,
    });

    const admins = await User.find({ role: "admin", isActive: true });
    for (const admin of admins) {
      await sendEmail(
        admin.email,
        "Attendance Update Request",
        `Teacher ${req.user.name} has requested an update for attendance on ${new Date(attendance.date).toLocaleDateString()}. Reason: ${reason}`,
      );
    }

    res.json({
      success: true,
      message: "Update request submitted successfully",
      data: updateRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== ADMIN HOLIDAY CONTROLLERS ====================

const createHoliday = async (req, res) => {
  try {
    const { date, name, description, isRecurring } = req.body;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Check if holiday already exists
    const existingHoliday = await Holiday.findOne({ date: targetDate });
    if (existingHoliday) {
      return res
        .status(400)
        .json({ error: "Holiday already exists on this date" });
    }

    const holiday = await Holiday.create({
      date: targetDate,
      name,
      description: description || "",
      isRecurring: isRecurring || false,
      createdBy: req.user._id,
    });

    // Auto-mark attendance as holiday for all teachers
    await autoMarkHolidayForAllTeachers(targetDate, name);

    res.json({
      success: true,
      message: "Holiday created successfully",
      data: holiday,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllHolidays = async (req, res) => {
  try {
    const { year, month } = req.query;
    let query = { isActive: true };

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.json({ success: true, data: holidays });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const { name, description, isRecurring } = req.body;

    const holiday = await Holiday.findById(holidayId);
    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    if (name) holiday.name = name;
    if (description !== undefined) holiday.description = description;
    if (isRecurring !== undefined) holiday.isRecurring = isRecurring;

    await holiday.save();

    // Re-mark attendance for this date with updated holiday name
    await autoMarkHolidayForAllTeachers(holiday.date, holiday.name);

    res.json({
      success: true,
      message: "Holiday updated successfully",
      data: holiday,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;

    const holiday = await Holiday.findById(holidayId);
    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    // Soft delete by marking inactive
    holiday.isActive = false;
    await holiday.save();

    // Remove holiday marking from attendance records for that date
    const targetDate = holiday.date;
    await Attendance.updateMany(
      {
        date: {
          $gte: targetDate,
          $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
        isHoliday: true,
      },
      {
        $set: { isHoliday: false, holidayName: null, status: "absent" },
      },
    );

    res.json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== ADMIN ATTENDANCE CONTROLLERS ====================

const getAllTeachersForAttendance = async (req, res) => {
  try {
    const teachers = await User.find({
      role: "teacher",
      isActive: true,
      isVerified: true,
    }).select("name email designation isVerified profileCompleted");

    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeacherMonthlyAttendance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const teacher = await User.findById(teacherId).select(
      "name email designation profileCompleted",
    );
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const [attendances, holidays] = await Promise.all([
      Attendance.find({
        teacher: teacherId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 }),
      getHolidaysInRange(startDate, endDate),
    ]);

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const calendarData = [];
    const holidayMap = new Map(holidays.map((h) => [h.date.toDateString(), h]));

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth - 1, i);
      const attendance = attendances.find(
        (a) => new Date(a.date).toDateString() === date.toDateString(),
      );
      const holiday = holidayMap.get(date.toDateString());
      const isSunday = date.getDay() === 0;

      calendarData.push({
        date,
        day: i,
        isSunday,
        isHoliday: !!holiday,
        holidayName: holiday?.name,
        attendance: attendance
          ? {
              _id: attendance._id,
              status: attendance.status,
              inTime: attendance.inTime,
              outTime: attendance.outTime,
              workReport: attendance.workReport,
              modifiedBy: attendance.modifiedBy,
              isHoliday: attendance.isHoliday,
              holidayName: attendance.holidayName,
            }
          : null,
      });
    }

    const workingDays = calendarData.filter(
      (d) => !d.isSunday && !d.isHoliday,
    ).length;
    const attendancesOnly = calendarData.filter(
      (d) => d.attendance && !d.isSunday && !d.isHoliday,
    );

    const stats = {
      presentCount: attendancesOnly.filter(
        (a) => a.attendance.status === "present",
      ).length,
      absentCount: attendancesOnly.filter(
        (a) => a.attendance.status === "absent",
      ).length,
      halfDayCount: attendancesOnly.filter(
        (a) => a.attendance.status === "half-day",
      ).length,
      leaveCount: attendancesOnly.filter((a) => a.attendance.status === "leave")
        .length,
      holidayCount: calendarData.filter((d) => d.isHoliday).length,
      sundayCount: calendarData.filter((d) => d.isSunday).length,
      totalDays: daysInMonth,
      workingDays,
      presentPercentage:
        workingDays > 0
          ? (
              ((attendancesOnly.filter((a) => a.attendance.status === "present")
                .length +
                attendancesOnly.filter(
                  (a) => a.attendance.status === "half-day",
                ).length *
                  0.5) /
                workingDays) *
              100
            ).toFixed(1)
          : 0,
    };

    res.json({
      success: true,
      data: {
        teacher,
        calendarData,
        stats,
        month: currentMonth,
        year: currentYear,
        daysInMonth,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendanceById = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const attendance = await Attendance.findById(attendanceId).populate(
      "teacher",
      "name email designation",
    );

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAttendanceByAdmin = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, workReport, inTime, outTime } = req.body;

    const attendance = await Attendance.findById(attendanceId).populate(
      "teacher",
      "name email",
    );
    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    // ❌ Cannot edit approved leave attendance
    if (attendance.status === "leave") {
      return res.status(403).json({
        error: "Cannot edit approved leave attendance",
      });
    }
    // Don't allow editing if it's a holiday
    if (attendance.isHoliday) {
      return res
        .status(403)
        .json({ error: "Cannot edit attendance on a holiday" });
    }

    const date = new Date(attendance.date);
    if (date.getDay() === 0) {
      return res
        .status(403)
        .json({ error: "Cannot edit attendance on Sunday" });
    }

    if (status) attendance.status = status;
    if (workReport !== undefined) attendance.workReport = workReport;

    if (inTime && inTime.time) {
      attendance.inTime = {
        ...attendance.inTime,
        time: new Date(inTime.time),
        location: inTime.location || attendance.inTime?.location,
      };
    }

    if (outTime && outTime.time) {
      attendance.outTime = {
        ...attendance.outTime,
        time: new Date(outTime.time),
        location: outTime.location || attendance.outTime?.location,
      };
    }

    attendance.modifiedBy = req.user._id;
    await attendance.save();

    // Send notification to teacher
    await sendEmail(
      attendance.teacher.email,
      "Attendance Updated by Admin",
      `Your attendance for ${date.toLocaleDateString()} has been updated by admin. New status: ${attendance.status}`,
    );

    res.json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAttendanceByAdmin = async (req, res) => {
  try {
    const { teacherId, date, status, workReport, inTime, outTime } = req.body;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Check if date is holiday
    const holiday = await isHoliday(targetDate);
    if (holiday) {
      return res
        .status(403)
        .json({ error: `Cannot add attendance on holiday: ${holiday.name}` });
    }

    // Check if Sunday
    if (targetDate.getDay() === 0) {
      return res.status(403).json({ error: "Cannot add attendance on Sunday" });
    }

    let attendance = await Attendance.findOne({
      teacher: teacherId,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (attendance) {
      return res
        .status(400)
        .json({ error: "Attendance already exists. Please use update." });
    }
    const leave = await LeaveRequest.findOne({
      teacher: teacherId,
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
      status: "approved",
    });

    if (leave) {
      return res.status(403).json({
        error: "Teacher is on approved leave for this date",
      });
    }

    attendance = await Attendance.create({
      teacher: teacherId,
      date: targetDate,
      status: status || "absent",
      workReport: workReport || "",
      inTime: inTime || null,
      outTime: outTime || null,
      modifiedBy: req.user._id,
    });

    res.json({
      success: true,
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    const date = new Date(attendance.date);
    if (date.getDay() === 0) {
      return res.status(403).json({ error: "Cannot delete Sunday attendance" });
    }
    // ❌ Cannot delete leave attendance
    if (attendance.status === "leave") {
      return res.status(403).json({
        error: "Cannot delete approved leave attendance",
      });
    }
    const holiday = await isHoliday(date);
    if (holiday) {
      return res
        .status(403)
        .json({ error: "Cannot delete holiday attendance" });
    }

    await attendance.deleteOne();

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== ADMIN UPDATE REQUEST CONTROLLERS ====================

const getPendingUpdateRequests = async (req, res) => {
  try {
    const requests = await AttendanceUpdateRequest.find({ status: "pending" })
      .populate("teacher", "name email designation")
      .populate("attendance")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUpdateRequests = async (req, res) => {
  try {
    const { status, teacherId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (teacherId) filter.teacher = teacherId;

    const requests = await AttendanceUpdateRequest.find(filter)
      .populate("teacher", "name email designation")
      .populate("attendance")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveUpdateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminRemarks } = req.body;

    const request = await AttendanceUpdateRequest.findById(requestId).populate(
      "teacher",
      "name email",
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    const attendance = await Attendance.findById(request.attendance);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    // ❌ Cannot update leave attendance
    if (attendance.status === "leave") {
      return res.status(403).json({
        error: "Cannot modify approved leave attendance",
      });
    }

    // Apply requested changes
    if (request.requestedChanges.status) {
      attendance.status = request.requestedChanges.status;
    }
    if (request.requestedChanges.workReport) {
      attendance.workReport = request.requestedChanges.workReport;
    }
    if (request.requestedChanges.inTime) {
      attendance.inTime.time = request.requestedChanges.inTime;
    }

    if (request.requestedChanges.outTime) {
      attendance.outTime.time = request.requestedChanges.outTime;
    }

    attendance.modifiedBy = req.user._id;
    await attendance.save();

    request.status = "approved";
    request.adminRemarks = adminRemarks;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    await sendEmail(
      request.teacher.email,
      "Attendance Update Request Approved",
      `
      Your attendance update request has been <strong>approved</strong>.<br/>
      <strong>Date:</strong> ${new Date(attendance.date).toLocaleDateString()}<br/>
      <strong>Updated Status:</strong> ${attendance.status}<br/>
      ${adminRemarks ? `<strong>Admin Remarks:</strong> ${adminRemarks}` : ""}
      `,
    );

    res.json({
      success: true,
      message: "Request approved and attendance updated",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectUpdateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminRemarks } = req.body;

    const request = await AttendanceUpdateRequest.findById(requestId).populate(
      "teacher",
      "name email",
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    request.status = "rejected";
    request.adminRemarks = adminRemarks;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    await sendEmail(
      request.teacher.email,
      "Attendance Update Request Rejected",
      `
      Your attendance update request has been <strong>rejected</strong>.<br/>
      <strong>Date:</strong> ${new Date(request.attendance.date).toLocaleDateString()}<br/>
      <strong>Reason:</strong> ${adminRemarks || "Please contact admin for more details"}
      `,
    );

    res.json({ success: true, message: "Request rejected", data: request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveOrRejectLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, remarks } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const leave = await LeaveRequest.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ error: "Already reviewed" });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.remarks = remarks;

    await leave.save();

    // ✅ APPROVED => Lock attendance
    if (status === "approved") {
      let current = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      while (current <= end) {
        const attendanceDate = new Date(current);
        attendanceDate.setHours(0, 0, 0, 0);

        await Attendance.findOneAndUpdate(
          {
            teacher: leave.teacher,
            date: {
              $gte: attendanceDate,
              $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          {
            teacher: leave.teacher,
            date: attendanceDate,
            status: "leave",
            workReport: "Approved Leave",
          },
          {
            upsert: true,
            new: true,
          },
        );

        current.setDate(current.getDate() + 1);
      }
    }

    res.json({
      success: true,
      message: `Leave ${status} successfully`,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Add at the top with other imports
const ExcelJS = require("exceljs");

// ==================== EXCEL EXPORT CONTROLLERS ====================

// Download attendance for a specific teacher
// Download attendance for a specific teacher
const downloadTeacherAttendanceExcel = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { month, year } = req.query;

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const teacher = await User.findById(teacherId).select(
      "name email designation",
    );
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const [attendances, holidays] = await Promise.all([
      Attendance.find({
        teacher: teacherId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 }),
      getHolidaysInRange(startDate, endDate),
    ]);

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const calendarData = [];
    const holidayMap = new Map(holidays.map((h) => [h.date.toDateString(), h]));

    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;
    let leaveCount = 0;
    let holidayCount = 0;
    let sundayCount = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth - 1, i);
      const attendance = attendances.find(
        (a) => new Date(a.date).toDateString() === date.toDateString(),
      );
      const holiday = holidayMap.get(date.toDateString());
      const isSunday = date.getDay() === 0;
      const isHoliday = !!holiday;

      let status = "";
      let inTime = "";
      let outTime = "";
      let inTimeLocation = "";
      let outTimeLocation = "";
      let workReport = "";

      if (isSunday) {
        status = "Sunday";
        sundayCount++;
      } else if (isHoliday) {
        status = `Holiday (${holiday.name})`;
        holidayCount++;
      } else if (attendance) {
        status =
          attendance.status.charAt(0).toUpperCase() +
          attendance.status.slice(1);
        inTime = attendance.inTime?.time
          ? new Date(attendance.inTime.time).toLocaleTimeString()
          : "-";
        outTime = attendance.outTime?.time
          ? new Date(attendance.outTime.time).toLocaleTimeString()
          : "-";

        // Extract location data
        inTimeLocation = attendance.inTime?.location
          ? `${attendance.inTime.location.address || ""} `
          : "-";
        outTimeLocation = attendance.outTime?.location
          ? `${attendance.outTime.location.address || ""} `
          : "-";

        workReport = attendance.workReport || "-";

        if (attendance.status === "present") presentCount++;
        else if (attendance.status === "absent") absentCount++;
        else if (attendance.status === "half-day") halfDayCount++;
        else if (attendance.status === "leave") leaveCount++;
      } else {
        status = "Not Marked";
        absentCount++;
      }

      calendarData.push({
        date: date.toLocaleDateString("en-IN"),
        day: i,
        weekday: date.toLocaleDateString("en-IN", { weekday: "long" }),
        status,
        inTime,
        outTime,
        inTimeLocation,
        outTimeLocation,
        workReport,
        isSunday,
        isHoliday,
      });
    }

    const workingDays = daysInMonth - sundayCount - holidayCount;
    const presentPercentage =
      workingDays > 0
        ? (((presentCount + halfDayCount * 0.5) / workingDays) * 100).toFixed(1)
        : 0;

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Attendance Management System";
    workbook.created = new Date();

    // Add styles
    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" }, size: 12 },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0D5166" },
      },
      alignment: { horizontal: "center", vertical: "middle", wrapText: true },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const titleStyle = {
      font: { bold: true, size: 14, color: { argb: "FF0D5166" } },
      alignment: { horizontal: "center" },
    };

    const dataStyle = {
      alignment: { horizontal: "center", vertical: "middle", wrapText: true },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Sheet 1: Monthly Attendance Report
    const sheet1 = workbook.addWorksheet("Monthly Attendance Report");

    // Title
    sheet1.mergeCells("A1:I1");
    sheet1.getCell("A1").value =
      `Attendance Report - ${teacher.name} (${months[currentMonth - 1]} ${currentYear})`;
    sheet1.getCell("A1").style = titleStyle;
    sheet1.getRow(1).height = 30;

    // Summary Section
    sheet1.mergeCells("A3:C3");
    sheet1.getCell("A3").value = "Summary Statistics";
    sheet1.getCell("A3").style = {
      font: { bold: true, size: 12 },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEADDCD" },
      },
    };

    const summaryData = [
      ["Total Working Days", workingDays],
      ["Present", presentCount],
      ["Absent", absentCount],
      ["Half Day", halfDayCount],
      ["Leave", leaveCount],
      ["Holidays", holidayCount],
      ["Sundays", sundayCount],
      ["Attendance Percentage", `${presentPercentage}%`],
    ];

    summaryData.forEach((row, index) => {
      const rowNum = 4 + index;
      sheet1.getCell(`A${rowNum}`).value = row[0];
      sheet1.getCell(`B${rowNum}`).value = row[1];
      sheet1.getCell(`A${rowNum}`).style = { font: { bold: true } };
      sheet1.getCell(`B${rowNum}`).style = dataStyle;
    });

    // Headers - Updated with Location columns
    const headers = [
      "Date",
      "Day",
      "Weekday",
      "Status",
      "In Time",
      "In Time Location",
      "Out Time",
      "Out Time Location",
      "Work Report",
    ];
    const headerRow = sheet1.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Add data rows
    calendarData.forEach((day) => {
      const row = sheet1.addRow([
        day.date,
        day.day,
        day.weekday,
        day.status,
        day.inTime,
        day.inTimeLocation,
        day.outTime,
        day.outTimeLocation,
        day.workReport,
      ]);
      row.eachCell((cell) => {
        cell.style = dataStyle;
        if (day.isSunday || day.isHoliday) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFDE68A" },
          };
        }
      });
    });

    // Set column widths
    sheet1.getColumn(1).width = 15; // Date
    sheet1.getColumn(2).width = 8; // Day
    sheet1.getColumn(3).width = 15; // Weekday
    sheet1.getColumn(4).width = 20; // Status
    sheet1.getColumn(5).width = 12; // In Time
    sheet1.getColumn(6).width = 45; // In Time Location
    sheet1.getColumn(7).width = 12; // Out Time
    sheet1.getColumn(8).width = 45; // Out Time Location
    sheet1.getColumn(9).width = 30; // Work Report

    // Sheet 2: Detailed Analysis
    const sheet2 = workbook.addWorksheet("Detailed Analysis");

    sheet2.mergeCells("A1:B1");
    sheet2.getCell("A1").value = `Attendance Analysis - ${teacher.name}`;
    sheet2.getCell("A1").style = titleStyle;

    const analysisData = [
      ["Metric", "Value"],
      ["Total Days in Month", daysInMonth],
      ["Working Days", workingDays],
      ["Present Days", presentCount],
      ["Present Percentage", `${presentPercentage}%`],
      ["Absent Days", absentCount],
      ["Half Days", halfDayCount],
      ["Leave Days", leaveCount],
      ["Holidays", holidayCount],
      ["Sundays", sundayCount],
    ];

    analysisData.forEach((row, index) => {
      const rowNum = 3 + index;
      sheet2.getCell(`A${rowNum}`).value = row[0];
      sheet2.getCell(`B${rowNum}`).value = row[1];
      if (index === 0) {
        sheet2.getRow(rowNum).eachCell((cell) => {
          cell.style = {
            font: { bold: true },
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFEADDCD" },
            },
          };
        });
      }
    });

    sheet2.getColumn(1).width = 25;
    sheet2.getColumn(2).width = 15;

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Attendance_${teacher.name}_${months[currentMonth - 1]}_${currentYear}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Download attendance for all teachers
const downloadAllTeachersAttendanceExcel = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const teachers = await User.find({
      role: "teacher",
      isActive: true,
      isVerified: true,
    }).select("name email designation");

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const [holidays] = await Promise.all([
      getHolidaysInRange(startDate, endDate),
    ]);

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const holidayMap = new Map(holidays.map((h) => [h.date.toDateString(), h]));

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Attendance Management System";
    workbook.created = new Date();

    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0D5166" },
      },
      alignment: { horizontal: "center", vertical: "middle", wrapText: true },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const titleStyle = {
      font: { bold: true, size: 14, color: { argb: "FF0D5166" } },
      alignment: { horizontal: "center" },
    };

    // Sheet 1: Summary Report (All Teachers)
    const summarySheet = workbook.addWorksheet("Summary Report");

    // Title
    summarySheet.mergeCells("A1:H1");
    summarySheet.getCell("A1").value =
      `Attendance Summary Report - ${months[currentMonth - 1]} ${currentYear}`;
    summarySheet.getCell("A1").style = titleStyle;
    summarySheet.getRow(1).height = 30;

    // Headers
    const summaryHeaders = [
      "S.No",
      "Teacher Name",
      "Email",
      "Present",
      "Absent",
      "Half Day",
      "Leave",
      "Attendance %",
    ];
    const headerRow = summarySheet.addRow(summaryHeaders);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Collect data for each teacher
    const teacherData = [];
    let serialNo = 1;

    for (const teacher of teachers) {
      const attendances = await Attendance.find({
        teacher: teacher._id,
        date: { $gte: startDate, $lte: endDate },
      });

      let presentCount = 0;
      let absentCount = 0;
      let halfDayCount = 0;
      let leaveCount = 0;
      let sundayCount = 0;

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentYear, currentMonth - 1, i);
        const attendance = attendances.find(
          (a) => new Date(a.date).toDateString() === date.toDateString(),
        );
        const holiday = holidayMap.get(date.toDateString());
        const isSunday = date.getDay() === 0;
        const isHoliday = !!holiday;

        if (isSunday || isHoliday) {
          if (isSunday) sundayCount++;
          continue;
        }

        if (attendance) {
          if (attendance.status === "present") presentCount++;
          else if (attendance.status === "absent") absentCount++;
          else if (attendance.status === "half-day") halfDayCount++;
          else if (attendance.status === "leave") leaveCount++;
        } else {
          absentCount++;
        }
      }

      const workingDays = daysInMonth - sundayCount - holidayMap.size;
      const attendancePercentage =
        workingDays > 0
          ? (((presentCount + halfDayCount * 0.5) / workingDays) * 100).toFixed(
              1,
            )
          : 0;

      teacherData.push({
        serialNo: serialNo++,
        name: teacher.name,
        email: teacher.email,
        present: presentCount,
        absent: absentCount,
        halfDay: halfDayCount,
        leave: leaveCount,
        attendancePercentage,
        workingDays,
      });
    }

    // Sort by attendance percentage descending
    teacherData.sort((a, b) => b.attendancePercentage - a.attendancePercentage);

    // Add data rows
    teacherData.forEach((teacher) => {
      const row = summarySheet.addRow([
        teacher.serialNo,
        teacher.name,
        teacher.email,
        teacher.present,
        teacher.absent,
        teacher.halfDay,
        teacher.leave,
        `${teacher.attendancePercentage}%`,
      ]);
      row.eachCell((cell) => {
        cell.style = {
          alignment: { horizontal: "center", vertical: "middle" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        };
      });
    });

    // Set column widths
    summarySheet.getColumn(1).width = 8;
    summarySheet.getColumn(2).width = 25;
    summarySheet.getColumn(3).width = 30;
    summarySheet.getColumn(4).width = 10;
    summarySheet.getColumn(5).width = 10;
    summarySheet.getColumn(6).width = 10;
    summarySheet.getColumn(7).width = 10;
    summarySheet.getColumn(8).width = 15;

    // Sheet 2: Detailed Teacher-wise Report
    const detailSheet = workbook.addWorksheet("Detailed Report");

    detailSheet.mergeCells("A1:I1");
    detailSheet.getCell("A1").value =
      `Detailed Attendance Report - ${months[currentMonth - 1]} ${currentYear}`;
    detailSheet.getCell("A1").style = titleStyle;
    detailSheet.getRow(1).height = 30;

    const detailHeaders = [
      "Teacher",
      "Date",
      "Day",
      "Status",
      "In Time",
      "Out Time",
      "Work Report",
      "Remarks",
      "Attendance %",
    ];
    const detailHeaderRow = detailSheet.addRow(detailHeaders);
    detailHeaderRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Add detailed data for each teacher
    for (const teacher of teachers) {
      const attendances = await Attendance.find({
        teacher: teacher._id,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      let teacherPresent = 0;
      let teacherHalfDay = 0;
      let teacherLeave = 0;
      let teacherAbsent = 0;

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentYear, currentMonth - 1, i);
        const attendance = attendances.find(
          (a) => new Date(a.date).toDateString() === date.toDateString(),
        );
        const holiday = holidayMap.get(date.toDateString());
        const isSunday = date.getDay() === 0;
        const isHoliday = !!holiday;

        let status = "";
        let inTime = "-";
        let outTime = "-";
        let workReport = "-";
        let remarks = "";

        if (isSunday) {
          status = "Sunday";
          remarks = "Weekly Off";
        } else if (isHoliday) {
          status = "Holiday";
          remarks = holiday.name;
        } else if (attendance) {
          status =
            attendance.status.charAt(0).toUpperCase() +
            attendance.status.slice(1);
          inTime = attendance.inTime?.time
            ? new Date(attendance.inTime.time).toLocaleTimeString()
            : "-";
          outTime = attendance.outTime?.time
            ? new Date(attendance.outTime.time).toLocaleTimeString()
            : "-";
          workReport = attendance.workReport || "-";

          if (attendance.status === "present") teacherPresent++;
          else if (attendance.status === "absent") teacherAbsent++;
          else if (attendance.status === "half-day") teacherHalfDay++;
          else if (attendance.status === "leave") teacherLeave++;
        } else {
          status = "Absent";
          teacherAbsent++;
        }

        const row = detailSheet.addRow([
          teacher.name,
          date.toLocaleDateString("en-IN"),
          date.toLocaleDateString("en-IN", { weekday: "long" }),
          status,
          inTime,
          outTime,
          workReport,
          remarks,
          "",
        ]);
        row.eachCell((cell) => {
          cell.style = {
            alignment: { horizontal: "center", vertical: "middle" },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
          };
          if (isSunday || isHoliday) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFDE68A" },
            };
          }
        });
      }

      // Add teacher summary row
      const workingDaysForTeacher = daysInMonth - holidayMap.size - 4; // Approximate Sundays
      const teacherPercentage =
        workingDaysForTeacher > 0
          ? (
              ((teacherPresent + teacherHalfDay * 0.5) /
                workingDaysForTeacher) *
              100
            ).toFixed(1)
          : 0;

      const lastRowIndex = detailSheet.rowCount;
      const summaryRow = detailSheet.getRow(lastRowIndex + 1);
      detailSheet.getCell(`A${lastRowIndex + 1}`).value =
        `Summary for ${teacher.name}:`;
      detailSheet.getCell(`H${lastRowIndex + 1}`).value =
        `P:${teacherPresent} | HD:${teacherHalfDay} | A:${teacherAbsent} | L:${teacherLeave}`;
      detailSheet.getCell(`I${lastRowIndex + 1}`).value =
        `${teacherPercentage}%`;
      detailSheet.getRow(lastRowIndex + 1).eachCell((cell) => {
        cell.style = {
          font: { bold: true },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFEADDCD" },
          },
        };
      });

      detailSheet.addRow([]); // Empty row for separation
    }

    // Set column widths for detail sheet
    detailSheet.getColumn(1).width = 25;
    detailSheet.getColumn(2).width = 15;
    detailSheet.getColumn(3).width = 15;
    detailSheet.getColumn(4).width = 12;
    detailSheet.getColumn(5).width = 12;
    detailSheet.getColumn(6).width = 12;
    detailSheet.getColumn(7).width = 30;
    detailSheet.getColumn(8).width = 20;
    detailSheet.getColumn(9).width = 15;

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=All_Teachers_Attendance_${months[currentMonth - 1]}_${currentYear}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Helper array for months
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

module.exports = {
  // Teacher controllers
  markInTime,
  markOutTime,
  getTodayAttendance,
  getMyMonthlyAttendance,
  requestAttendanceUpdate,

  // Admin Holiday controllers
  createHoliday,
  getAllHolidays,
  updateHoliday,
  deleteHoliday,

  // Admin Attendance controllers
  getAllTeachersForAttendance,
  getTeacherMonthlyAttendance,
  getAttendanceById,
  updateAttendanceByAdmin,
  createAttendanceByAdmin,
  deleteAttendance,

  // Admin Update Request controllers
  getPendingUpdateRequests,
  getAllUpdateRequests,
  approveUpdateRequest,
  rejectUpdateRequest,

  approveOrRejectLeave,

  downloadTeacherAttendanceExcel,
  downloadAllTeachersAttendanceExcel,
};
