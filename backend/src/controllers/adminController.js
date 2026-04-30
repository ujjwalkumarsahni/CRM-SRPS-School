const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const {
  sendEmail,
  accountCreatedEmail,
  accountVerifiedEmail,
  profileCompleteNotification,
  accountRejectedEmail,
  accountDeactivatedEmail,
} = require("../utils/emailTemplates");

const createTeacher = async (req, res) => {
  try {
    const { name, email, designation, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Teacher with this email already exists" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const teacher = await User.create({
      name,
      email,
      password,
      designation,
      role: "teacher",
      isVerified: false,
      isActive: true,
      profileCompleted: false,
      status: "pending",
    });

    const html = accountCreatedEmail(name, email, password);
    await sendEmail(email, "Teacher Account Created", html);

    res.status(201).json({
      success: true,
      message: "Teacher account created successfully",
      data: { id: teacher._id, name, email, designation },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findById(id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const profile = await TeacherProfile.findOne({ user: id });
    if (!profile) {
      return res
        .status(400)
        .json({ error: "Teacher profile not completed yet" });
    }

    teacher.isVerified = true;
    teacher.isActive = true;
    teacher.status = "active";
    await teacher.save();

    const html = accountVerifiedEmail(teacher.name);
    await sendEmail(teacher.email, "Account Verified", html);

    res.json({
      success: true,
      message: "Teacher account verified successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const teacher = await User.findById(id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    teacher.isActive = false;
    teacher.isVerified = false;
    teacher.status = "rejected";
    teacher.rejectionReason = rejectionReason;

    await teacher.save();

    const html = accountRejectedEmail(teacher.name, rejectionReason);
    await sendEmail(teacher.email, "Account Verification Rejected", html);

    res.json({
      success: true,
      message: "Teacher account rejected successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deactivateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const teacher = await User.findById(id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    teacher.isActive = false;
    teacher.isVerified = false;
    teacher.status = "deactivated";
    teacher.deactivationReason = reason;
    await teacher.save();

    const html = accountDeactivatedEmail(teacher.name, reason);
    await sendEmail(teacher.email, "Account Deactivated", html);

    res.json({
      success: true,
      message: "Teacher account deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const activateTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findById(id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    teacher.isActive = true;
    teacher.isVerified = true;
    teacher.status = "active";
    await teacher.save();
    res.json({
      success: true,
      message: "Teacher account activated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    // Get all users with role teacher
    const teachers = await User.find({ role: "teacher" }).select("-password");

    // Get profiles for teachers
    const result = await Promise.all(
      teachers.map(async (teacher) => {
        const profile = await TeacherProfile.findOne({ user: teacher._id });
        return {
          _id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          designation: teacher.designation,
          role: teacher.role,
          isVerified: teacher.isVerified,
          isActive: teacher.isActive,
          profileCompleted: teacher.profileCompleted,
          status: teacher.status,
          rejectionReason: teacher.rejectionReason,
          deactivationReason: teacher.deactivationReason,
          createdAt: teacher.createdAt,
          updatedAt: teacher.updatedAt,
          profile: profile
            ? {
                dob: profile.dob,
                bloodGroup: profile.bloodGroup,
                mobileNumber: profile.mobileNumber,
                address: profile.address,
                highestQualification: profile.highestQualification,
                photo: profile.photo,
                documents: profile.documents,
              }
            : null,
        };
      }),
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findById(id).select("-password");
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const profile = await TeacherProfile.findOne({ user: id });

    res.json({
      success: true,
      data: {
        ...teacher.toObject(),
        profile: profile || null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const modifyTeacherAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, inTime, outTime, workReport } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    attendance.status = status || attendance.status;
    attendance.workReport = workReport || attendance.workReport;
    attendance.modifiedBy = req.user._id;

    if (inTime) attendance.inTime = inTime;
    if (outTime) attendance.outTime = outTime;

    await attendance.save();

    res.json({
      success: true,
      message: "Attendance modified successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate("teacher", "name email isActive isVerified")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const leaveRequest = await LeaveRequest.findById(id).populate("teacher");
    if (!leaveRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    leaveRequest.status = status;
    leaveRequest.remarks = remarks;
    leaveRequest.reviewedBy = req.user._id;
    leaveRequest.reviewedAt = new Date();
    await leaveRequest.save();

    if (status === "approved") {
      const startDate = new Date(leaveRequest.startDate);
      const endDate = new Date(leaveRequest.endDate);

      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        await Attendance.findOneAndUpdate(
          {
            teacher: leaveRequest.teacher._id,
            date: new Date(d),
          },
          {
            status: "leave",
            workReport: `On leave: ${leaveRequest.reason}`,
          },
          { upsert: true },
        );
      }
    }

    const {
      leaveApprovedEmail,
      sendEmail,
    } = require("../utils/emailTemplates");
    const html = leaveApprovedEmail(
      leaveRequest.teacher.name,
      leaveRequest.startDate,
      leaveRequest.endDate,
      status,
    );
    await sendEmail(
      leaveRequest.teacher.email,
      `Leave Request ${status}`,
      html,
    );

    res.json({
      success: true,
      message: `Leave request ${status}`,
      data: leaveRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const AdminProfile = require("../models/AdminProfile");

const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('-password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    const adminProfile = await AdminProfile.findOne({ user: req.user._id });
    
    res.json({ 
      success: true, 
      data: { 
        user: admin, 
        adminProfile: adminProfile || null 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const { name, designation, phone, address } = req.body;
    
    // Update User model
    const updateUserData = {};
    if (name) updateUserData.name = name;
    if (designation) updateUserData.designation = designation;
    
    const admin = await User.findByIdAndUpdate(
      req.user._id,
      updateUserData,
      { new: true }
    ).select('-password');
    
    // Update or create AdminProfile
    let adminProfile = await AdminProfile.findOne({ user: req.user._id });
    
    const updateProfileData = {};
    if (phone) updateProfileData.phone = phone;
    if (address) updateProfileData.address = address;
    
    // Handle photo upload
    if (req.file) {
      if (adminProfile?.photo?.publicId) {
        await cloudinary.uploader.destroy(adminProfile.photo.publicId);
      }
      updateProfileData.photo = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }
    
    if (adminProfile) {
      adminProfile = await AdminProfile.findOneAndUpdate(
        { user: req.user._id },
        updateProfileData,
        { new: true }
      );
    } else {
      adminProfile = await AdminProfile.create({
        user: req.user._id,
        ...updateProfileData
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: admin, adminProfile }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    admin.password = newPassword;
    await admin.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTeacher,
  verifyTeacher,
  rejectTeacher,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  deactivateTeacher,
  activateTeacher,
  getAllTeachers,
  getTeacherById,
  modifyTeacherAttendance,
  getAllLeaveRequests,
  processLeaveRequest,
};
