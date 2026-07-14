const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  deleteProfilePicture,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-picture', protect, upload.single('image'), uploadProfilePicture);
router.delete('/picture', protect, deleteProfilePicture);

module.exports = router;