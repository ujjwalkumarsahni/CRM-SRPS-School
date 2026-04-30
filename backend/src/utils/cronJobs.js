const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const moment = require('moment');

const markAbsentForMissingAttendance = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const teachers = await User.find({ role: 'teacher', isActive: true });
    
    for (const teacher of teachers) {
      const existingAttendance = await Attendance.findOne({
        teacher: teacher._id,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      if (!existingAttendance) {
        await Attendance.create({
          teacher: teacher._id,
          date: today,
          status: 'absent',
          workReport: 'Auto-marked absent by system'
        });
        console.log(`Auto-marked absent for teacher: ${teacher.email} on ${today.toDateString()}`);
      }
    }
  } catch (error) {
    console.error('Error in auto-mark absent cron job:', error);
  }
};

const sendMonthlyAttendanceReport = async () => {
  try {
    const lastDayOfMonth = moment().endOf('month');
    if (moment().isSame(lastDayOfMonth, 'day')) {
      const teachers = await User.find({ role: 'teacher', isActive: true }).populate('profile');
      
      for (const teacher of teachers) {
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();
        
        const attendances = await Attendance.find({
          teacher: teacher._id,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        });
        
        const stats = {
          present: attendances.filter(a => a.status === 'present').length,
          absent: attendances.filter(a => a.status === 'absent').length,
          halfDay: attendances.filter(a => a.status === 'half-day').length,
          leave: attendances.filter(a => a.status === 'leave').length,
          totalWorkingDays: attendances.length,
          percentage: 0
        };
        
        stats.percentage = ((stats.present + stats.halfDay * 0.5) / stats.totalWorkingDays * 100).toFixed(2);
        
        const { sendEmail, monthlyAttendanceReport } = require('./emailTemplates');
        const html = monthlyAttendanceReport(
          teacher.name,
          teacher.email,
          stats,
          moment().format('MMMM'),
          moment().format('YYYY')
        );
        
        await sendEmail(teacher.email, 'Monthly Attendance Report', html);
      }
    }
  } catch (error) {
    console.error('Error sending monthly report:', error);
  }
};

const initializeCronJobs = () => {
  // Run at 11:59 PM every day
  cron.schedule('59 23 * * *', markAbsentForMissingAttendance);
  
  // Run on last day of month at 9:00 AM
  cron.schedule('0 9 * * *', sendMonthlyAttendanceReport);
  
  console.log('Cron jobs initialized');
};

module.exports = initializeCronJobs;