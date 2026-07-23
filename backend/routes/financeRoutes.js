const express = require('express');
const router = express.Router();

const {
  getFinancialOverview,
  updateShares,
  addTransaction,
  getSalaryBreakdown,
  getExpenditureBreakdown,
  getFinancialSummary,
  getEarnings,
  getReceiptEarningsBreakdown
} = require('../controllers/financeController');

const { protect } = require('../middleware/auth');
const { adminOnly, superAdminOnly } = require('../middleware/admin');

// =============================
// Finance Routes
// =============================

// Financial Overview
router.get('/overview', protect, adminOnly, getFinancialOverview);

// Financial Summary
router.get('/summary', protect, adminOnly, getFinancialSummary);

// Earnings
router.get('/earnings', protect, adminOnly, getEarnings);

// Receipt Earnings Breakdown
router.get('/receipt-earnings', protect, adminOnly, getReceiptEarningsBreakdown);

// Salary Breakdown
router.get('/salaries/breakdown', protect, adminOnly, getSalaryBreakdown);

// Expenditure Breakdown
router.get('/expenditure-breakdown', protect, adminOnly, getExpenditureBreakdown);

// Add Transaction
router.post('/transactions', protect, adminOnly, addTransaction);

// Update Shares
router.put('/shares', protect, superAdminOnly, updateShares);

module.exports = router;