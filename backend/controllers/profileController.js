const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// FIXED: Update user profile
// ============================================
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      phone,
      department,
      about,
      education,
      experience,
      socialMedia,
      hobbies,
      skills,
      address,
      dateOfBirth,
      gender,
      maritalStatus,
      nationality,
      emergencyContact,
    } = req.body;

    // Find user first
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields - using direct assignment to avoid triggering pre-save hooks unnecessarily
    if (name !== undefined) user.name = name;
    if (age !== undefined && age !== '') user.age = parseInt(age);
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (about !== undefined) user.about = about;
    
    // Parse JSON strings if they come as strings
    try {
      if (education) {
        user.education = typeof education === 'string' ? JSON.parse(education) : education;
      }
      if (experience) {
        user.experience = typeof experience === 'string' ? JSON.parse(experience) : experience;
      }
      if (socialMedia) {
        user.socialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia;
      }
      if (hobbies) {
        user.hobbies = typeof hobbies === 'string' ? JSON.parse(hobbies) : hobbies;
      }
      if (skills) {
        user.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
      }
      if (address) {
        user.address = typeof address === 'string' ? JSON.parse(address) : address;
      }
      if (emergencyContact) {
        user.emergencyContact = typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact;
      }
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
      // Continue with the update even if parsing fails
    }
    
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (maritalStatus) user.maritalStatus = maritalStatus;
    if (nationality !== undefined) user.nationality = nationality;

    // Save the user - this will trigger pre-save hooks
    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/profile/upload-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    const imageUrl = req.file.path;

    // Update user with new profile picture URL - using findByIdAndUpdate to skip pre-save hooks
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { 
        new: true,
        runValidators: false // Skip validators to avoid issues
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload profile picture',
    });
  }
};

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/profile/picture
// @access  Private
const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete',
      });
    }

    // Extract public ID from URL
    const publicId = user.profilePicture.split('/').pop().split('.')[0];
    
    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(`riseup-tech/profiles/${publicId}`);
    } catch (cloudinaryError) {
      console.log('Cloudinary delete error:', cloudinaryError);
    }

    // Remove profile picture from user - using findByIdAndUpdate to skip pre-save hooks
    await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: '' },
      { 
        new: true,
        runValidators: false
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  deleteProfilePicture,
};