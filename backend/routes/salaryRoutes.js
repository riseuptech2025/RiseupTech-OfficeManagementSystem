// routes/salaryRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSalary,
  requestAdvanceSalary,
  processSalaryPayment,
  autoGenerateSalaries,
  getSalaries,
  getSalaryStats
} = require('../controllers/salaryController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All routes are protected
router.route('/')
  .get(protect, getSalaries)
  .post(protect, adminOnly, createSalary);

router.get('/stats', protect, getSalaryStats);
router.post('/auto-generate', protect, adminOnly, autoGenerateSalaries);
router.put('/:id/pay', protect, adminOnly, processSalaryPayment);
router.post('/:id/advance', protect, requestAdvanceSalary);

module.exports = router;