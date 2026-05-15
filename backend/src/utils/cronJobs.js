// const cron = require('node-cron');
// const Attendance = require('../models/Attendance');
// const User = require('../models/User');
// const moment = require('moment');

// // Auto-mark absent for teachers who forgot to mark out-time
// const markAbsentForForgottenOutTime = async () => {
//   try {
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     yesterday.setHours(0, 0, 0, 0);
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     // Find all attendance records from yesterday that have inTime but no outTime
//     const incompleteAttendances = await Attendance.find({
//       date: {
//         $gte: yesterday,
//         $lt: today
//       },
//       inTime: { $ne: null },
//       outTime: null,
//       status: 'absent' // Still absent because out-time not marked
//     }).populate('teacher', 'name email');
    
//     for (const attendance of incompleteAttendances) {
//       // Calculate if they worked at all
//       const inDateTime = new Date(attendance.inTime.time);
//       const now = new Date();
      
//       // If they marked in-time but forgot out-time, mark as absent
//       // Because we can't verify how long they worked
//       attendance.status = 'absent';
//       attendance.workReport = attendance.workReport 
//         ? `${attendance.workReport} (Auto-marked absent - Out-time not marked)`
//         : 'Auto-marked absent - Out-time not marked';
      
//       await attendance.save();
      
//       console.log(`Auto-marked absent for teacher: ${attendance.teacher?.email} on ${attendance.date.toDateString()} - Out-time not marked`);
//     }
    
//     console.log(`Auto-mark absent cron job completed. Processed ${incompleteAttendances.length} records.`);
//   } catch (error) {
//     console.error('Error in auto-mark absent cron job:', error);
//   }
// };

// // Auto-mark absent for teachers who didn't mark attendance at all (no in-time)
// const markAbsentForNoAttendance = async () => {
//   try {
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     yesterday.setHours(0, 0, 0, 0);
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     // Get all active teachers
//     const teachers = await User.find({ 
//       role: 'teacher', 
//       isActive: true,
//       isVerified: true 
//     }).select('_id name email');
    
//     for (const teacher of teachers) {
//       // Check if attendance record exists for yesterday
//       const existingAttendance = await Attendance.findOne({
//         teacher: teacher._id,
//         date: {
//           $gte: yesterday,
//           $lt: today
//         }
//       });
      
//       // If no attendance record exists, create one with absent status
//       if (!existingAttendance) {
//         await Attendance.create({
//           teacher: teacher._id,
//           date: yesterday,
//           status: 'absent',
//           workReport: 'Auto-marked absent - No attendance marked',
//           isHoliday: false
//         });
//         console.log(`Auto-marked absent for teacher: ${teacher.email} on ${yesterday.toDateString()} - No attendance marked`);
//       }
//     }
    
//     console.log(`Auto-mark absent for no-attendance cron job completed.`);
//   } catch (error) {
//     console.error('Error in auto-mark absent cron job:', error);
//   }
// };

// // Initialize all cron jobs
// const initializeCronJobs = () => {
//   // Run at 1:00 AM every day to mark absent for previous day's incomplete records
//   cron.schedule('0 1 * * *', () => {
//     console.log('Running auto-mark absent cron job for forgotten out-time...');
//     markAbsentForForgottenOutTime();
//   });
  
//   // Run at 2:00 AM every day to mark absent for teachers who didn't mark attendance at all
//   cron.schedule('0 2 * * *', () => {
//     console.log('Running auto-mark absent cron job for no attendance...');
//     markAbsentForNoAttendance();
//   });
  
//   console.log('Cron jobs initialized for auto-marking absent');
// };

// module.exports = initializeCronJobs;


// cronJobs/attendanceCron.js

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Holiday = require('../models/Holiday');

const transporter = require('../configs/nodemailer');

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// ========================================
// CREATE TEMP FOLDER
// ========================================

const tempDir = path.join(__dirname, '../temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ========================================
// SEND EMAIL
// ========================================

const sendEmail = async ({
  to,
  subject,
  html,
  attachments = [],
}) => {
  try {
    await transporter.sendMail({
      from: `"SRPS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });

    console.log(`Email sent successfully to ${to}`);

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);

    return false;
  }
};

// ========================================
// EMAIL TEMPLATE
// ========================================

const monthlyAttendanceAdminEmail = (
  adminName,
  month,
  year,
  totalTeachers,
) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">
        Monthly Attendance Report
      </h2>

      <p>Dear ${adminName},</p>

      <p>
        Monthly attendance report for
        <strong>${month} ${year}</strong>
        has been generated successfully.
      </p>

      <div style="background-color: #f4f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">

        <h3 style="margin-top: 0; color: #1e3a8a;">
          Report Details
        </h3>

        <p>
          <strong>Total Teachers:</strong> ${totalTeachers}
        </p>

        <p>
          <strong>Attached File:</strong>
          All Teachers Attendance Report
        </p>

      </div>

      <p>
        Please check the attached Excel report.
      </p>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Attendance System</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};

// ========================================
// GET HOLIDAYS
// ========================================

const getHolidaysInRange = async (
  startDate,
  endDate,
) => {
  return await Holiday.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });
};

// ========================================
// AUTO ABSENT IF OUTTIME NOT MARKED
// ========================================

const markAbsentForForgottenOutTime = async () => {
  try {
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const incompleteAttendances =
      await Attendance.find({
        date: {
          $gte: yesterday,
          $lt: today,
        },
        inTime: { $ne: null },
        outTime: null,
        status: 'absent',
      }).populate('teacher', 'name email');

    for (const attendance of incompleteAttendances) {
      attendance.status = 'absent';

      attendance.workReport = attendance.workReport
        ? `${attendance.workReport} (Auto-marked absent - Out-time not marked)`
        : 'Auto-marked absent - Out-time not marked';

      await attendance.save();

      console.log(
        `Auto absent marked for ${attendance.teacher?.email}`,
      );
    }

    console.log(
      'Forgotten out-time cron completed',
    );
  } catch (error) {
    console.error(
      'Error in forgotten out-time cron:',
      error,
    );
  }
};

// ========================================
// AUTO ABSENT IF NO ATTENDANCE
// ========================================

const markAbsentForNoAttendance = async () => {
  try {
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const teachers = await User.find({
      role: 'teacher',
      isActive: true,
      isVerified: true,
    }).select('_id name email');

    for (const teacher of teachers) {
      const existingAttendance =
        await Attendance.findOne({
          teacher: teacher._id,
          date: {
            $gte: yesterday,
            $lt: today,
          },
        });

      if (!existingAttendance) {
        await Attendance.create({
          teacher: teacher._id,
          date: yesterday,
          status: 'absent',
          workReport:
            'Auto-marked absent - No attendance marked',
          isHoliday: false,
        });

        console.log(
          `No attendance found. Marked absent for ${teacher.email}`,
        );
      }
    }

    console.log(
      'No attendance cron completed',
    );
  } catch (error) {
    console.error(
      'Error in no attendance cron:',
      error,
    );
  }
};

// ========================================
// CREATE ALL TEACHERS EXCEL
// ========================================

const createAllTeachersWorkbook = async (
  teachers,
  month,
  year,
) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'SRPS';

  const sheet =
    workbook.addWorksheet('Attendance Report');

  sheet.columns = [
    {
      header: 'Teacher Name',
      key: 'name',
      width: 30,
    },
    {
      header: 'Email',
      key: 'email',
      width: 35,
    },
    {
      header: 'Present',
      key: 'present',
      width: 15,
    },
    {
      header: 'Absent',
      key: 'absent',
      width: 15,
    },
    {
      header: 'Half Day',
      key: 'halfDay',
      width: 15,
    },
    {
      header: 'Leave',
      key: 'leave',
      width: 15,
    },
  ];

  // HEADER STYLE

  sheet.getRow(1).eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' },
    };

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
  });

  const startDate = new Date(
    year,
    month - 1,
    1,
  );

  const endDate = new Date(year, month, 0);

  for (const teacher of teachers) {
    const attendances = await Attendance.find({
      teacher: teacher._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;

    attendances.forEach((attendance) => {
      if (attendance.status === 'present')
        present++;

      else if (
        attendance.status === 'absent'
      )
        absent++;

      else if (
        attendance.status === 'half-day'
      )
        halfDay++;

      else if (
        attendance.status === 'leave'
      )
        leave++;
    });

    sheet.addRow({
      name: teacher.name,
      email: teacher.email,
      present,
      absent,
      halfDay,
      leave,
    });
  }

  return workbook;
};

// ========================================
// GENERATE & SEND MONTHLY REPORT
// ========================================

const generateMonthlyAttendanceReports =
  async () => {
    try {
      console.log(
        'Monthly attendance report cron started...',
      );

      const currentDate = new Date();

      // PREVIOUS MONTH

      const month =
        currentDate.getMonth();

      const year =
        month === 0
          ? currentDate.getFullYear() - 1
          : currentDate.getFullYear();

      const finalMonth =
        month === 0 ? 12 : month;

      const teachers = await User.find({
        role: 'teacher',
        isActive: true,
        isVerified: true,
      }).select('_id name email');

      const admin = await User.findOne({
        role: 'admin',
      });

      if (!admin) {
        console.log('Admin not found');

        return;
      }

      const attachments = [];

      // ========================================
      // CREATE EXCEL FILE
      // ========================================

      const workbook =
        await createAllTeachersWorkbook(
          teachers,
          finalMonth,
          year,
        );

      const fileName = `All_Teachers_Attendance_${months[finalMonth - 1]}_${year}.xlsx`;

      const filePath = path.join(
        tempDir,
        fileName,
      );

      await workbook.xlsx.writeFile(filePath);

      console.log(
        `Excel generated at ${filePath}`,
      );

      attachments.push({
        filename: fileName,
        path: filePath,
      });

      // ========================================
      // SEND EMAIL
      // ========================================

      const emailSent = await sendEmail({
        to: admin.email,
        subject: `Monthly Attendance Report - ${months[finalMonth - 1]} ${year}`,
        html: monthlyAttendanceAdminEmail(
          admin.name || 'Admin',
          months[finalMonth - 1],
          year,
          teachers.length,
        ),
        attachments,
      });

      if (emailSent) {
        console.log(
          'Monthly attendance report email sent successfully',
        );
      } else {
        console.log(
          'Monthly attendance report email failed',
        );
      }

      // ========================================
      // DELETE TEMP FILE
      // ========================================

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);

        console.log(
          'Temporary excel file deleted',
        );
      }
    } catch (error) {
      console.error(
        'Monthly attendance report cron error:',
        error,
      );
    }
  };

// ========================================
// INITIALIZE CRONS
// ========================================

const initializeCronJobs = () => {
  // DAILY 1 AM

  cron.schedule('0 1 * * *', () => {
    console.log(
      'Running forgotten out-time cron...',
    );

    markAbsentForForgottenOutTime();
  });

  // DAILY 2 AM

  cron.schedule('0 2 * * *', () => {
    console.log(
      'Running no attendance cron...',
    );

    markAbsentForNoAttendance();
  });

  // MONTHLY REPORT
  // EVERY MONTH 1ST DATE 8 AM

  cron.schedule('0 8 1 * *', () => {
    console.log(
      'Running monthly attendance report cron...',
    );

    generateMonthlyAttendanceReports();
  });

  console.log(
    'All attendance cron jobs initialized',
  );
};

module.exports = initializeCronJobs;