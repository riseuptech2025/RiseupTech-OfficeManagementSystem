// routes/financeRoutes.js
const express = require('express');
const router = express.Router();
const {
  getFinancialOverview,
  updateShares,
  addTransaction,
  getSalaryBreakdown
} = require('../controllers/financeController');
const { protect } = require('../middleware/auth');
const { adminOnly, superAdminOnly } = require('../middleware/admin');

// All routes are protected
router.get('/overview', protect, adminOnly, getFinancialOverview);
router.get('/salaries/breakdown', protect, adminOnly, getSalaryBreakdown);
router.post('/transactions', protect, adminOnly, addTransaction);
router.put('/shares', protect, superAdminOnly, updateShares);

module.exports = router;