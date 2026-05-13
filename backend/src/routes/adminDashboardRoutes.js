// routes/adminDashboardRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const {
  getDashboardData,
  getQuickStats,
  getAttendanceTrend,
  getTeacherPerformanceReport,
  exportDashboardData
} = require("../controllers/adminDashboardController");

// All dashboard routes require authentication and admin access
router.use(protect);
router.use(roleCheck('admin'));

// Main dashboard endpoints
router.get("/dashboard", getDashboardData);
router.get("/dashboard/quick-stats", getQuickStats);
router.get("/dashboard/attendance-trend", getAttendanceTrend);
router.get("/dashboard/teacher-performance", getTeacherPerformanceReport);
router.get("/dashboard/export", exportDashboardData);

module.exports = router;