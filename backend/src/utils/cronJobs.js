const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const moment = require('moment');

// Auto-mark absent for teachers who forgot to mark out-time
const markAbsentForForgottenOutTime = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all attendance records from yesterday that have inTime but no outTime
    const incompleteAttendances = await Attendance.find({
      date: {
        $gte: yesterday,
        $lt: today
      },
      inTime: { $ne: null },
      outTime: null,
      status: 'absent' // Still absent because out-time not marked
    }).populate('teacher', 'name email');
    
    for (const attendance of incompleteAttendances) {
      // Calculate if they worked at all
      const inDateTime = new Date(attendance.inTime.time);
      const now = new Date();
      
      // If they marked in-time but forgot out-time, mark as absent
      // Because we can't verify how long they worked
      attendance.status = 'absent';
      attendance.workReport = attendance.workReport 
        ? `${attendance.workReport} (Auto-marked absent - Out-time not marked)`
        : 'Auto-marked absent - Out-time not marked';
      
      await attendance.save();
      
      console.log(`Auto-marked absent for teacher: ${attendance.teacher?.email} on ${attendance.date.toDateString()} - Out-time not marked`);
    }
    
    console.log(`Auto-mark absent cron job completed. Processed ${incompleteAttendances.length} records.`);
  } catch (error) {
    console.error('Error in auto-mark absent cron job:', error);
  }
};

// Auto-mark absent for teachers who didn't mark attendance at all (no in-time)
const markAbsentForNoAttendance = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all active teachers
    const teachers = await User.find({ 
      role: 'teacher', 
      isActive: true,
      isVerified: true 
    }).select('_id name email');
    
    for (const teacher of teachers) {
      // Check if attendance record exists for yesterday
      const existingAttendance = await Attendance.findOne({
        teacher: teacher._id,
        date: {
          $gte: yesterday,
          $lt: today
        }
      });
      
      // If no attendance record exists, create one with absent status
      if (!existingAttendance) {
        await Attendance.create({
          teacher: teacher._id,
          date: yesterday,
          status: 'absent',
          workReport: 'Auto-marked absent - No attendance marked',
          isHoliday: false
        });
        console.log(`Auto-marked absent for teacher: ${teacher.email} on ${yesterday.toDateString()} - No attendance marked`);
      }
    }
    
    console.log(`Auto-mark absent for no-attendance cron job completed.`);
  } catch (error) {
    console.error('Error in auto-mark absent cron job:', error);
  }
};

// Initialize all cron jobs
const initializeCronJobs = () => {
  // Run at 1:00 AM every day to mark absent for previous day's incomplete records
  cron.schedule('0 1 * * *', () => {
    console.log('Running auto-mark absent cron job for forgotten out-time...');
    markAbsentForForgottenOutTime();
  });
  
  // Run at 2:00 AM every day to mark absent for teachers who didn't mark attendance at all
  cron.schedule('0 2 * * *', () => {
    console.log('Running auto-mark absent cron job for no attendance...');
    markAbsentForNoAttendance();
  });
  
  console.log('Cron jobs initialized for auto-marking absent');
};

module.exports = initializeCronJobs;