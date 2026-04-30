const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const {
  markInTime,
  markOutTime,
  getTodayAttendance,
  getMyMonthlyAttendance,
  getAllTeachersForAttendance,
  getTeacherMonthlyAttendance,
  getAttendanceById,
  updateAttendanceByAdmin,
  createAttendanceByAdmin,
  deleteAttendance
} = require('../controllers/attendanceController');

// Teacher routes
router.use(protect);
router.post('/in', roleCheck('teacher'), markInTime);
router.post('/out', roleCheck('teacher'), markOutTime);
router.get('/today', roleCheck('teacher'), getTodayAttendance);
router.get('/my-monthly', roleCheck('teacher'), getMyMonthlyAttendance);

// Admin routes
router.get('/teachers', roleCheck('admin'), getAllTeachersForAttendance);
router.get('/monthly/:teacherId', roleCheck('admin'), getTeacherMonthlyAttendance);
router.get('/:attendanceId', roleCheck('admin'), getAttendanceById);
router.put('/update/:attendanceId', roleCheck('admin'), updateAttendanceByAdmin);
router.post('/create', roleCheck('admin'), createAttendanceByAdmin);
router.delete('/:attendanceId', roleCheck('admin'), deleteAttendance);

module.exports = router;