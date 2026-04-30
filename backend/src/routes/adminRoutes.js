// // adminRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middlewares/auth');
// const roleCheck = require('../middlewares/roleCheck');
// const {
//   createTeacher,
//   verifyTeacher,
//   getAllTeachers,
//   modifyTeacherAttendance,
//   getAllLeaveRequests,
//   processLeaveRequest
// } = require('../controllers/adminController');

// router.use(protect);
// router.use(roleCheck('admin'));

// router.post('/teachers', createTeacher);
// router.put('/teachers/:id/verify', verifyTeacher);
// router.get('/teachers', getAllTeachers);
// router.put('/attendance/:attendanceId', modifyTeacherAttendance);
// router.get('/leaves', getAllLeaveRequests);
// router.put('/leaves/:id', processLeaveRequest);

// module.exports = router;


// adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const {
  createTeacher,
  verifyTeacher,
  rejectTeacher,
  deactivateTeacher,
  activateTeacher,
  getAllTeachers,
  getTeacherById,
  modifyTeacherAttendance,
  getAllLeaveRequests,
  processLeaveRequest,
  getAdminProfile,
  updateAdminProfile,
  changePassword
} = require('../controllers/adminController');
const upload = require('../middlewares/upload');

router.use(protect);
router.use(roleCheck('admin'));

router.get('/profile', getAdminProfile);
router.put('/profile', upload.single('photo'), updateAdminProfile);
router.post('/change-password', changePassword);

router.post('/teachers', createTeacher);
router.put('/teachers/:id/verify', verifyTeacher);
router.put('/teachers/:id/reject', rejectTeacher);
router.put('/teachers/:id/deactivate', deactivateTeacher);
router.put('/teachers/:id/activate', activateTeacher);
router.get('/teachers', getAllTeachers);
router.get('/teachers/:id', getTeacherById);
router.put('/attendance/:attendanceId', modifyTeacherAttendance);
router.get('/leaves', getAllLeaveRequests);
router.put('/leaves/:id', processLeaveRequest);

module.exports = router;