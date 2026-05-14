// routes/adminDashboardRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const {
  getDashboardData,
  getTodaySummary
} = require("../controllers/adminDashboardController");

// All dashboard routes require authentication and admin access
router.use(protect);
router.use(roleCheck('admin'));

// Main dashboard endpoints
router.get('/dashboard', getDashboardData);

// Get today's summary only (lightweight)
router.get('/dashboard/summary', getTodaySummary);

module.exports = router;