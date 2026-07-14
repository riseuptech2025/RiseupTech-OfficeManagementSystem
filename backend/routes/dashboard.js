const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getRecentUsers,
  getActivityStats
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All dashboard routes are protected
router.get('/stats', protect, getDashboardStats);
router.get('/recent-users', protect, getRecentUsers);
router.get('/activity', protect, getActivityStats);

module.exports = router;