// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middlewares/auth');
// const roleCheck = require('../middlewares/roleCheck');
// const {
//   markInTime,
//   markOutTime,
//   getTodayAttendance,
//   getMyMonthlyAttendance,
//   getAllTeachersForAttendance,
//   getTeacherMonthlyAttendance,
//   getAttendanceById,
//   updateAttendanceByAdmin,
//   createAttendanceByAdmin,
//   deleteAttendance,
//   requestAttendanceUpdate,
//   getPendingUpdateRequests,
//   getAllUpdateRequests,
//   approveUpdateRequest,
//   rejectUpdateRequest,
//   markHoliday
// } = require('../controllers/attendanceController');

// // Teacher routes
// router.use(protect);
// router.post('/in', roleCheck('teacher'), markInTime);
// router.post('/out', roleCheck('teacher'), markOutTime);
// router.get('/today', roleCheck('teacher'), getTodayAttendance);
// router.get('/my-monthly', roleCheck('teacher'), getMyMonthlyAttendance);
// router.post('/request-update', roleCheck('teacher'), requestAttendanceUpdate);

// // Admin routes
// router.get('/teachers', roleCheck('admin'), getAllTeachersForAttendance);
// router.get('/monthly/:teacherId', roleCheck('admin'), getTeacherMonthlyAttendance);
// router.get('/:attendanceId', roleCheck('admin'), getAttendanceById);
// router.put('/update/:attendanceId', roleCheck('admin'), updateAttendanceByAdmin);
// router.post('/create', roleCheck('admin'), createAttendanceByAdmin);
// router.delete('/:attendanceId', roleCheck('admin'), deleteAttendance);

// // Add these routes to attendanceRoutes.js
// // Admin routes for update requests
// router.get('/update-requests/pending', roleCheck('admin'), getPendingUpdateRequests);
// router.get('/update-requests/all', roleCheck('admin'), getAllUpdateRequests);
// router.put('/update-requests/:requestId/approve', roleCheck('admin'), approveUpdateRequest);
// router.put('/update-requests/:requestId/reject', roleCheck('admin'), rejectUpdateRequest);
// router.post('/mark-holiday', roleCheck('admin'), markHoliday);
// module.exports = router;

// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const {
  // Teacher routes
  markInTime,
  markOutTime,
  getTodayAttendance,
  getMyMonthlyAttendance,
  requestAttendanceUpdate,
  
  // Admin Holiday routes
  createHoliday,
  getAllHolidays,
  updateHoliday,
  deleteHoliday,
  
  // Admin Attendance routes
  getAllTeachersForAttendance,
  getTeacherMonthlyAttendance,
  getAttendanceById,
  updateAttendanceByAdmin,
  createAttendanceByAdmin,
  deleteAttendance,
  
  // Admin Update Request routes
  getPendingUpdateRequests,
  getAllUpdateRequests,
  approveUpdateRequest,
  rejectUpdateRequest,
  approveOrRejectLeave,
  downloadTeacherAttendanceExcel,
  downloadAllTeachersAttendanceExcel,
} = require('../controllers/attendanceController');

// ==================== TEACHER ROUTES ====================
router.use(protect);
router.post('/in', roleCheck('teacher'), markInTime);
router.post('/out', roleCheck('teacher'), markOutTime);
router.get('/today', roleCheck('teacher'), getTodayAttendance);
router.get('/my-monthly', roleCheck('teacher'), getMyMonthlyAttendance);
router.post('/request-update', roleCheck('teacher'), requestAttendanceUpdate);

// ==================== ADMIN ROUTES ====================

// Holiday Management
router.post('/holidays', roleCheck('admin'), createHoliday);
router.get('/holidays', roleCheck('admin'), getAllHolidays);
router.put('/holidays/:holidayId', roleCheck('admin'), updateHoliday);
router.delete('/holidays/:holidayId', roleCheck('admin'), deleteHoliday);

// Attendance Management
router.get('/teachers', roleCheck('admin'), getAllTeachersForAttendance);
router.get('/monthly/:teacherId', roleCheck('admin'), getTeacherMonthlyAttendance);
router.get('/:attendanceId', roleCheck('admin'), getAttendanceById);
router.put('/update/:attendanceId', roleCheck('admin'), updateAttendanceByAdmin);
router.post('/create', roleCheck('admin'), createAttendanceByAdmin);
router.delete('/:attendanceId', roleCheck('admin'), deleteAttendance);


// Update Request Management
router.get('/update-requests/pending', roleCheck('admin'), getPendingUpdateRequests);
router.get('/update-requests/all', roleCheck('admin'), getAllUpdateRequests);
router.put('/update-requests/:requestId/approve', roleCheck('admin'), approveUpdateRequest);
router.put('/update-requests/:requestId/reject', roleCheck('admin'), rejectUpdateRequest);

router.put('/leave/:leaveId', roleCheck('admin'), approveOrRejectLeave);


router.get('/export/teacher/:teacherId', roleCheck('admin'), downloadTeacherAttendanceExcel);
router.get('/export/all-teachers', roleCheck('admin'), downloadAllTeachersAttendanceExcel);
module.exports = router;