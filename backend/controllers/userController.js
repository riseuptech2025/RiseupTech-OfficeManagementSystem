const User = require('../models/User');
const bcrypt = require('bcryptjs');
const notificationService = require('../services/notificationService');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, age, password, role, department, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      age: age || undefined,
      password: password,
      role: role || 'staff',
      department: department || 'Technology',
      phone: phone || '',
      isActive: true,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    await notificationService.notifyUserCreation(user, req.user.name);

    res.status(201).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create user',
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

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
    console.error('Get user error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, phone, age, password, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentUserLevel = getUserRoleLevel(req.user.role);
    const targetUserLevel = getUserRoleLevel(user.role);

    if (currentUserLevel < targetUserLevel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this user',
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (phone) user.phone = phone;
    if (age !== undefined && age !== '') user.age = parseInt(age, 10);
    if (isActive !== undefined) user.isActive = isActive;

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await notificationService.createNotification({
        recipient: user._id,
        sender: req.user.id,
        senderName: req.user.name,
        type: 'system_alert',
        title: '🔐 Password Updated by Admin',
        message: `Your password has been updated by ${req.user.name}. If you did not request this, please contact support immediately.`,
        priority: 'high',
        link: '/profile',
      });
    }

    await user.save();

    const updatedUser = await User.findById(id).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: password ? 'User updated and password changed successfully' : 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
};

const getUserRoleLevel = (role) => {
  const roleLevels = {
    super_admin: 4,
    ceo: 4,
    founder: 4,
    coo: 3,
    accountant: 3,
    admin: 3,
    hr_manager: 2,
    staff: 1,
  };
  return roleLevels[role] || 0;
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
};