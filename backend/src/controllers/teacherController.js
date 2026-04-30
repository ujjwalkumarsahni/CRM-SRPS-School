const TeacherProfile = require('../models/TeacherProfile');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { sendEmail, profileCompleteNotification } = require('../utils/emailTemplates');
const cloudinary = require('../configs/cloudinary');

const completeProfile = async (req, res) => {
  try {
    const {
      dob,
      bloodGroup,
      mobileNumber,
      address,
      highestQualification
    } = req.body;
    
    let profile = await TeacherProfile.findOne({ user: req.user._id });
    
    const profileData = {
      user: req.user._id,
      dob,
      bloodGroup,
      mobileNumber,
      address,
      highestQualification
    };
    
    if (req.files) {
      if (req.files.photo) {
        profileData.photo = {
          url: req.files.photo[0].path,
          publicId: req.files.photo[0].filename
        };
      }
      
      if (req.files.aadharCard) {
        profileData.documents = {
          ...profileData.documents,
          aadharCard: {
            url: req.files.aadharCard[0].path,
            publicId: req.files.aadharCard[0].filename
          }
        };
      }
      
      if (req.files.panCard) {
        profileData.documents = {
          ...profileData.documents,
          panCard: {
            url: req.files.panCard[0].path,
            publicId: req.files.panCard[0].filename
          }
        };
      }
      
      if (req.files.qualificationCertificate) {
        profileData.documents = {
          ...profileData.documents,
          qualificationCertificate: {
            url: req.files.qualificationCertificate[0].path,
            publicId: req.files.qualificationCertificate[0].filename
          }
        };
      }
    }
    
    if (profile) {
      profile = await TeacherProfile.findOneAndUpdate(
        { user: req.user._id },
        profileData,
        { new: true }
      );
    } else {
      profile = await TeacherProfile.create(profileData);
    }
    
    req.user.profileCompleted = true;
    await req.user.save();
    
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      const html = profileCompleteNotification(admin.email, req.user.name);
      await sendEmail(admin.email, 'Profile Ready for Verification', html);
    }
    
    res.json({
      success: true,
      message: 'Profile completed successfully. Waiting for admin verification.',
      data: profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ user: req.user._id });
    res.json({ success: true, data: { user: req.user, profile } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add to teacherController.js
const updateProfile = async (req, res) => {
  try {
    const {
      dob,
      bloodGroup,
      mobileNumber,
      address,
      highestQualification
    } = req.body;
    
    let profile = await TeacherProfile.findOne({ user: req.user._id });
    
    const updateData = {};
    if (dob) updateData.dob = dob;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (address) updateData.address = address;
    if (highestQualification) updateData.highestQualification = highestQualification;
    
    // Handle file uploads
    if (req.files) {
      if (req.files.photo) {
        // Delete old photo from cloudinary if exists
        if (profile?.photo?.publicId) {
          await cloudinary.uploader.destroy(profile.photo.publicId);
        }
        updateData.photo = {
          url: req.files.photo[0].path,
          publicId: req.files.photo[0].filename
        };
      }
      
      if (req.files.aadharCard) {
        if (profile?.documents?.aadharCard?.publicId) {
          await cloudinary.uploader.destroy(profile.documents.aadharCard.publicId);
        }
        updateData['documents.aadharCard'] = {
          url: req.files.aadharCard[0].path,
          publicId: req.files.aadharCard[0].filename
        };
      }
      
      if (req.files.panCard) {
        if (profile?.documents?.panCard?.publicId) {
          await cloudinary.uploader.destroy(profile.documents.panCard.publicId);
        }
        updateData['documents.panCard'] = {
          url: req.files.panCard[0].path,
          publicId: req.files.panCard[0].filename
        };
      }
      
      if (req.files.qualificationCertificate) {
        if (profile?.documents?.qualificationCertificate?.publicId) {
          await cloudinary.uploader.destroy(profile.documents.qualificationCertificate.publicId);
        }
        updateData['documents.qualificationCertificate'] = {
          url: req.files.qualificationCertificate[0].path,
          publicId: req.files.qualificationCertificate[0].filename
        };
      }
    }
    
    profile = await TeacherProfile.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, upsert: true }
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: req.user, profile }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { teacher: req.user._id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendances = await Attendance.find(query).sort({ date: -1 });
    
    const stats = {
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      halfDay: attendances.filter(a => a.status === 'half-day').length,
      leave: attendances.filter(a => a.status === 'leave').length,
      total: attendances.length
    };
    
    res.json({ success: true, data: { attendances, stats } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    
    if (!req.user.isVerified) {
      return res.status(403).json({ error: 'Account not verified. Cannot apply for leave.' });
    }
    
    const leaveRequest = await LeaveRequest.create({
      teacher: req.user._id,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });
    
    const { leaveCreatedEmail, sendEmail } = require('../utils/emailTemplates');
    const html = leaveCreatedEmail(req.user.name, startDate, endDate, reason);
    await sendEmail(req.user.email, 'Leave Request Submitted', html);
    
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      const adminHtml = `
        <h2>New Leave Request</h2>
        <p>Teacher: ${req.user.name}</p>
        <p>From: ${new Date(startDate).toLocaleDateString()}</p>
        <p>To: ${new Date(endDate).toLocaleDateString()}</p>
        <p>Reason: ${reason}</p>
        <a href="${process.env.FRONTEND_URL}/admin/leaves/${leaveRequest._id}">Review Request</a>
      `;
      await sendEmail(admin.email, 'New Leave Request Received', adminHtml);
    }
    
    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  completeProfile,
  getMyProfile,
  updateProfile,
  getMyAttendance,
  createLeaveRequest,
  getMyLeaves
};