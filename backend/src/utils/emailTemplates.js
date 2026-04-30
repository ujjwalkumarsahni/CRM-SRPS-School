const transporter = require('../configs/nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Attendance System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const accountCreatedEmail = (name, email, password) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Welcome to Attendance Management System</h2>
      <p>Dear ${name},</p>
      <p>Your teacher account has been created successfully. Here are your login credentials:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p><strong>Important:</strong> Please login and complete your profile to start using the system.</p>
      <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
      <p style="margin-top: 20px; color: #666;">Best regards,<br>Attendance Management Team</p>
    </div>
  `;
};

const accountVerifiedEmail = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Account Verified!</h2>
      <p>Dear ${name},</p>
      <p>Your account has been verified by the admin. You can now:</p>
      <ul>
        <li>Mark your daily attendance</li>
        <li>Apply for leaves</li>
        <li>View your attendance history</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
    </div>
  `;
};

const leaveCreatedEmail = (name, startDate, endDate, reason) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF9800;">Leave Request Submitted</h2>
      <p>Dear ${name},</p>
      <p>Your leave request has been submitted successfully. Details:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>From:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>To:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Status:</strong> Pending Approval</p>
      </div>
      <p>You will receive an email once the admin reviews your request.</p>
    </div>
  `;
};

const leaveApprovedEmail = (name, startDate, endDate, status) => {
  const color = status === 'approved' ? '#4CAF50' : '#F44336';
  const message = status === 'approved' ? 'Approved' : 'Rejected';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${color};">Leave Request ${message}</h2>
      <p>Dear ${name},</p>
      <p>Your leave request from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} has been <strong>${message}</strong>.</p>
      ${status === 'approved' ? '<p>The attendance for these dates has been automatically marked as "Leave".</p>' : ''}
    </div>
  `;
};

const profileCompleteNotification = (adminEmail, teacherName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">Profile Completion Request</h2>
      <p>Dear Admin,</p>
      <p>Teacher <strong>${teacherName}</strong> has completed their profile and is ready for verification.</p>
      <p>Please review their profile and verify the account to grant attendance marking access.</p>
      <a href="${process.env.FRONTEND_URL}/admin/teachers" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Profile</a>
    </div>
  `;
};

const monthlyAttendanceReport = (name, email, stats, month, year) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #9C27B0;">Monthly Attendance Report</h2>
      <p>Dear ${name},</p>
      <p>Here is your attendance summary for ${month} ${year}:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>✅ Present:</strong> ${stats.present} days</p>
        <p><strong>❌ Absent:</strong> ${stats.absent} days</p>
        <p><strong>🕒 Half Day:</strong> ${stats.halfDay} days</p>
        <p><strong>🌴 Leave:</strong> ${stats.leave} days</p>
        <p><strong>📊 Total Working Days:</strong> ${stats.totalWorkingDays} days</p>
        <p><strong>📈 Attendance Percentage:</strong> ${stats.percentage}%</p>
      </div>
      <p style="color: #666;">For any discrepancies, please contact the admin.</p>
    </div>
  `;
};

// Password Reset Email
const passwordResetEmail = (name, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0D5166;">Reset Your Password</h2>
      <p>Dear ${name},</p>
      <p>You requested to reset your password. Click the button below:</p>

      <a href="${resetUrl}" 
         style="background-color: #0D5166; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
        Reset Password
      </a>

      <p style="color:#666;">This link will expire in 30 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>

      <p style="margin-top:20px;">Regards,<br/>Attendance System</p>
    </div>
  `;
};


// ✅ Password Reset Success Email
const passwordResetSuccessEmail = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Password Reset Successful</h2>
      <p>Dear ${name},</p>
      <p>Your password has been successfully updated.</p>

      <p>If you did not perform this action, please contact admin immediately.</p>

      <a href="${process.env.FRONTEND_URL}/login"
         style="background-color: #0D5166; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Login Now
      </a>

      <p style="margin-top:20px;">Regards,<br/>Attendance System</p>
    </div>
  `;
};


const accountRejectedEmail = (name, reason) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Account Verification Rejected</h2>
      <p>Dear ${name},</p>
      <p>We regret to inform you that your account verification request has been rejected.</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Reason for rejection:</strong></p>
        <p>${reason || 'Incomplete or invalid documents provided. Please contact the admin for more details.'}</p>
      </div>
      <p>You can contact the school administration for further clarification.</p>
      <p style="margin-top: 20px; color: #666;">Best regards,<br>Attendance Management Team</p>
    </div>
  `;
};

const accountDeactivatedEmail = (name, reason) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Account Deactivated</h2>
      <p>Dear ${name},</p>
      <p>Your account has been deactivated by the administrator.</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Reason:</strong></p>
        <p>${reason || 'Please contact the administrator for more details.'}</p>
      </div>
      <p>If you believe this is a mistake, please contact the school administration.</p>
      <p style="margin-top: 20px; color: #666;">Best regards,<br>Attendance Management Team</p>
    </div>
  `;
};

module.exports = {
  sendEmail,
  accountCreatedEmail,
  accountVerifiedEmail,
  leaveCreatedEmail,
  leaveApprovedEmail,
  profileCompleteNotification,
  monthlyAttendanceReport,

  passwordResetEmail,
  passwordResetSuccessEmail,

  accountRejectedEmail,
  accountDeactivatedEmail 
};