const transporter = require('../configs/nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"SRPS" <${process.env.EMAIL_USER}>`,
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
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #1e3a8a;">Welcome, ${name} 👋</h2>

      <p>
        Your teacher account has been successfully created by the administration team.
        You can now access the School Attendance System to manage attendance,
        student records, and academic activities.
      </p>

      <div style="background-color: #f4f7ff; padding: 10px; border-radius: 8px; margin: 10px 0;">
        <h3 style="margin-top: 0; color: #1e3a8a;">Login Credentials</h3>

        <p style="margin: 8px 0;">
          <strong>Email:</strong> ${email}
        </p>

        <p style="margin: 8px 0;">
          <strong>Password:</strong> ${password}
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${process.env.FRONTEND_URL}/login"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          Login to Your Account
        </a>
      </div>

      <p>
        For security purposes, we strongly recommend changing your password
        after your first login.
      </p>

      <p>
        If you face any issues while accessing your account, please contact
        the school administration or technical support team.
      </p>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Administration Team</strong>
      </p>
    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};

const accountVerifiedEmail = (name) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">Account Successfully Verified</h2>

      <p>Dear ${name},</p>

      <p>
        Your account has been successfully verified by the administration team.
        You can now access all features available in the School Attendance System.
      </p>

      <div style="background-color: #f4f7ff; padding: 10px; border-radius: 8px; margin: 10px 0;">
        <h3 style="margin-top: 0; color: #1e3a8a;">You Can Now:</h3>

        <ul style="padding-left: 20px; margin: 0;">
          <li>Mark your daily attendance</li>
          <li>Apply for leave requests</li>
          <li>View attendance history</li>
          <li>Manage academic activities</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${process.env.FRONTEND_URL}/dashboard"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          Go to Dashboard
        </a>
      </div>

      <p>
        If you face any issues while accessing your account,
        please contact the administration or technical support team.
      </p>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Administration Team</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};

const leaveCreatedEmail = (name, startDate, endDate, reason) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">Leave Request Submitted</h2>

      <p>Dear ${name},</p>

      <p>
        Your leave request has been submitted successfully and is currently
        under review by the administration team.
      </p>

      <div style="background-color: #f4f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">

        <h3 style="margin-top: 0; color: #1e3a8a;">Leave Details</h3>

        <p style="margin: 8px 0;">
          <strong>From:</strong> ${new Date(startDate).toLocaleDateString()}
        </p>

        <p style="margin: 8px 0;">
          <strong>To:</strong> ${new Date(endDate).toLocaleDateString()}
        </p>

        <p style="margin: 8px 0;">
          <strong>Reason:</strong> ${reason}
        </p>

        <p style="margin: 8px 0;">
          <strong>Status:</strong> Pending Approval
        </p>

      </div>

      <p>
        You will receive another notification once your leave request
        has been reviewed by the administration.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${process.env.FRONTEND_URL}/dashboard"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          View Dashboard
        </a>
      </div>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Administration Team</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};

const leaveApprovedEmail = (name, startDate, endDate, status) => {
  const isApproved = status === 'approved';

  const title = isApproved
    ? 'Leave Request Approved'
    : 'Leave Request Rejected';

  const statusText = isApproved ? 'Approved' : 'Rejected';

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">${title}</h2>

      <p>Dear ${name},</p>

      <p>
        Your leave request has been reviewed by the administration team.
      </p>

      <div style="background-color: #f4f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">

        <h3 style="margin-top: 0; color: #1e3a8a;">Leave Details</h3>

        <p style="margin: 8px 0;">
          <strong>From:</strong> ${new Date(startDate).toLocaleDateString()}
        </p>

        <p style="margin: 8px 0;">
          <strong>To:</strong> ${new Date(endDate).toLocaleDateString()}
        </p>

        <p style="margin: 8px 0;">
          <strong>Status:</strong> ${statusText}
        </p>

      </div>

      ${
        isApproved
          ? `
        <p>
          The attendance for the approved leave dates has been automatically
          marked as <strong>"Leave"</strong> in the system.
        </p>
      `
          : `
        <p>
          Unfortunately, your leave request could not be approved at this time.
          Please contact the administration for further clarification if needed.
        </p>
      `
      }

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${process.env.FRONTEND_URL}/dashboard"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          View Dashboard
        </a>
      </div>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Administration Team</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};

const profileCompleteNotification = (adminEmail, teacherName) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">Profile Verification Request</h2>

      <p>Dear Admin,</p>

      <p>
        Teacher <strong>${teacherName}</strong> has successfully completed
        their profile and is now ready for account verification.
      </p>

      <p>
        Please review the submitted profile details and verify the account
        to grant attendance marking access and other system permissions.
      </p>

      <div style="background-color: #f4f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">

        <h3 style="margin-top: 0; color: #1e3a8a;">Verification Required</h3>

        <p style="margin: 8px 0;">
          <strong>Teacher Name:</strong> ${teacherName}
        </p>

        <p style="margin: 8px 0;">
          <strong>Status:</strong> Pending Verification
        </p>

      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${process.env.FRONTEND_URL}/admin/teachers"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          Review Profile
        </a>
      </div>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS System Notification</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};

const monthlyAttendanceReport = (name, email, stats, month, year) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">Monthly Attendance Report</h2>

      <p>Dear ${name},</p>

      <p>
        Please find below your attendance summary for 
        <strong>${month} ${year}</strong>.
      </p>

      <div style="background-color: #f4f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">

        <h3 style="margin-top: 0; color: #1e3a8a;">Attendance Summary</h3>

        <p style="margin: 8px 0;">
          <strong>Present:</strong> ${stats.present} days
        </p>

        <p style="margin: 8px 0;">
          <strong>Absent:</strong> ${stats.absent} days
        </p>

        <p style="margin: 8px 0;">
          <strong>Half Day:</strong> ${stats.halfDay} days
        </p>

        <p style="margin: 8px 0;">
          <strong>Leave:</strong> ${stats.leave} days
        </p>

        <p style="margin: 8px 0;">
          <strong>Total Working Days:</strong> ${stats.totalWorkingDays} days
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />

        <p style="margin: 8px 0; font-size: 18px; color: #1e3a8a;">
          <strong>Attendance Percentage:</strong> ${stats.percentage}%
        </p>

      </div>

      <p style="color: #666;">
        If you notice any discrepancies in your attendance records,
        please contact the administration team for clarification.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${process.env.FRONTEND_URL}/dashboard"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          View Dashboard
        </a>
      </div>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Administration Team</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};

// Password Reset Email
const passwordResetEmail = (name, resetUrl) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">Reset Your Password</h2>

      <p>Dear ${name},</p>

      <p>
        We received a request to reset your account password.
        Click the button below to create a new password.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${resetUrl}"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          Reset Password
        </a>
      </div>

      <div style="background-color: #f4f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">

        <h3 style="margin-top: 0; color: #1e3a8a;">Important Information</h3>

        <p style="margin: 8px 0;">
          • This password reset link will expire in <strong>30 minutes</strong>.
        </p>

        <p style="margin: 8px 0;">
          • If you did not request a password reset, please ignore this email.
        </p>

        <p style="margin: 8px 0;">
          • For security reasons, do not share this link with anyone.
        </p>

      </div>

      <p>
        If you continue facing issues while accessing your account,
        please contact the administration or support team.
      </p>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Administration Team</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};

// Password Reset Success Email
const passwordResetSuccessEmail = (name) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">Password Reset Successful</h2>

      <p>Dear ${name},</p>

      <p>
        Your account password has been successfully updated.
        You can now log in using your new password.
      </p>

      <div style="background-color: #f4f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">

        <h3 style="margin-top: 0; color: #1e3a8a;">Security Notice</h3>

        <p style="margin: 8px 0;">
          • If you performed this action, no further steps are required.
        </p>

        <p style="margin: 8px 0;">
          • If you did not reset your password, please contact the administration team immediately.
        </p>

        <p style="margin: 8px 0;">
          • Keep your login credentials secure and do not share them with anyone.
        </p>

      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${process.env.FRONTEND_URL}/login"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          Login Now
        </a>
      </div>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Administration Team</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};


const accountRejectedEmail = (name, reason) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">Account Verification Rejected</h2>

      <p>Dear ${name},</p>

      <p>
        We regret to inform you that your account verification request
        could not be approved by the administration team.
      </p>

      <div style="background-color: #f4f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">

        <h3 style="margin-top: 0; color: #1e3a8a;">Reason for Rejection</h3>

        <p style="margin: 8px 0;">
          ${
            reason ||
            'Incomplete or invalid documents were provided. Please contact the administration team for further clarification.'
          }
        </p>

      </div>

      <p>
        You may contact the school administration for additional details
        or assistance regarding the verification process.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${process.env.FRONTEND_URL}/login"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          Contact Administration
        </a>
      </div>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Administration Team</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

  </div>
  `;
};


const accountDeactivatedEmail = (name, reason) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    
    <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">SRPS</h1>
    </div>

    <div style="padding: 30px;">

      <h2 style="color: #1e3a8a;">Account Deactivated</h2>

      <p>Dear ${name},</p>

      <p>
        Your account has been deactivated by the administration team.
        As a result, access to the School Attendance System has been restricted.
      </p>

      <div style="background-color: #f4f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">

        <h3 style="margin-top: 0; color: #1e3a8a;">Reason for Deactivation</h3>

        <p style="margin: 8px 0;">
          ${
            reason ||
            'Please contact the administration team for more details regarding this action.'
          }
        </p>

      </div>

      <p>
        If you believe this action was taken by mistake or require further clarification,
        please contact the school administration.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${process.env.FRONTEND_URL}/login"
          style="
            background-color: #1e3a8a;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
          "
        >
          Contact Administration
        </a>
      </div>

      <br />

      <p>
        Regards,<br />
        <strong>SRPS Administration Team</strong>
      </p>

    </div>

    <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      © ${new Date().getFullYear()} SRPS - Attendance System
    </div>

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