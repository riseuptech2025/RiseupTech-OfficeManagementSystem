// routes/passwordManagerRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPassword,
  getPasswords,
  getPassword,
  updatePassword,
  changePasswordOnly,
  sharePassword,
  revokeAccess,
  deletePassword,
  getPasswordStats
} = require('../controllers/passwordManagerController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.route('/')
  .get(protect, getPasswords)
  .post(protect, createPassword);

router.get('/stats', protect, getPasswordStats);
router.put('/:id/change-password', protect, changePasswordOnly);
router.post('/:id/share', protect, sharePassword);
router.delete('/:id/share/:userId', protect, revokeAccess);
router.get('/:id', protect, getPassword);
router.put('/:id', protect, updatePassword);
router.delete('/:id', protect, deletePassword);

module.exports = router;