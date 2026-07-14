const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaves,
  getLeave,
  updateLeaveStatus,
  addLeaveComment,
  getLeaveStats
} = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.route('/')
  .get(protect, getLeaves)
  .post(protect, applyLeave);

router.get('/stats', protect, getLeaveStats);
router.get('/:id', protect, getLeave);
router.put('/:id/status', protect, updateLeaveStatus);
router.post('/:id/comments', protect, addLeaveComment);

module.exports = router;