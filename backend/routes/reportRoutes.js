const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReport,
  updateReportStatus,
  addReportComment,
  getReportStats
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.route('/')
  .get(protect, getReports)
  .post(protect, createReport);

router.get('/stats', protect, getReportStats);
router.get('/:id', protect, getReport);
router.put('/:id/status', protect, updateReportStatus);
router.post('/:id/comments', protect, addReportComment);

module.exports = router;