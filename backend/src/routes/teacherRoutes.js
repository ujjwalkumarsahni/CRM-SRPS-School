// teacherRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');
const {
  completeProfile,
  getMyProfile,
  getMyAttendance,
  createLeaveRequest,
  getMyLeaves,
  updateProfile,
  cancelLeaveRequest,
} = require('../controllers/teacherController');

router.use(protect);
router.use(roleCheck('teacher'));

router.post('/profile/complete', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'qualificationCertificate', maxCount: 1 }
]), completeProfile);

// Add to teacherRoutes.js
router.put('/profile/update', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'qualificationCertificate', maxCount: 1 }
]), updateProfile);

router.get('/profile', getMyProfile);
router.get('/attendance', getMyAttendance);
router.post('/leaves', createLeaveRequest);
router.get('/leaves', getMyLeaves);
router.delete('/leaves/:leaveId', cancelLeaveRequest);
module.exports = router;