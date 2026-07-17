// routes/expenditureRoutes.js
const express = require('express');
const router = express.Router();
const {
  createExpenditure,
  getExpenditures,
  getExpenditure,
  updateExpenditure,
  deleteExpenditure,
  processPayment,
  getExpenditureStats
} = require('../controllers/expenditureController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All routes are protected and require admin access
router.route('/')
  .get(protect, getExpenditures)
  .post(protect, adminOnly, createExpenditure);

router.get('/stats', protect, getExpenditureStats);
router.put('/:id/pay', protect, adminOnly, processPayment);
router.get('/:id', protect, getExpenditure);
router.put('/:id', protect, adminOnly, updateExpenditure);
router.delete('/:id', protect, adminOnly, deleteExpenditure);

module.exports = router;