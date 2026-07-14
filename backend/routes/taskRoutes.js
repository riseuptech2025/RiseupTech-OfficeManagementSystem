const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateSubtask,
  addTaskComment,
  getTaskStats
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.get('/stats', protect, getTaskStats);
router.get('/:id', protect, getTask);
router.put('/:id', protect, updateTask);
router.put('/:id/subtasks/:subtaskIndex', protect, updateSubtask);
router.post('/:id/comments', protect, addTaskComment);

module.exports = router;