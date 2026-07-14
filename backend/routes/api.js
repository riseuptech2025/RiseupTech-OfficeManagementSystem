const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// User routes (protected - all authenticated users)
router.route('/users')
  .get(protect, getUsers);

router.route('/users/:id')
  .get(protect, getUser);

// Admin only routes
router.route('/users')
  .post(protect, adminOnly, createUser);

router.route('/users/:id')
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

// Health check (public)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

module.exports = router;