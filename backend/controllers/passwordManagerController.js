// controllers/passwordManagerController.js
const PasswordManager = require('../models/PasswordManager');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// @desc    Create a new password entry
// @route   POST /api/passwords
// @access  Private
const createPassword = async (req, res) => {
  try {
    const {
      websiteName,
      websiteUrl,
      websiteCategory,
      username,
      email,
      password,
      notes,
      assignedTo,
      accessLevel,
      tags,
      requireApproval
    } = req.body;

    // Validate required fields
    if (!websiteName || !websiteUrl || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide website name, URL, username and password'
      });
    }

    // Check if user is authorized
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(req.user.role);

    const passwordData = {
      websiteName,
      websiteUrl,
      websiteCategory: websiteCategory || 'Other',
      username,
      email: email || '',
      password,
      notes: notes || '',
      createdBy: req.user.id,
      createdByName: req.user.name,
      createdByRole: req.user.role,
      tags: tags || [],
      requireApproval: requireApproval || false,
      accessLevel: accessLevel || 'Owner'
    };

    // If assigned to someone else
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        passwordData.assignedTo = assignedTo;
        passwordData.assignedToName = assignedUser.name;
      }
    }

    // If super admin or admin, auto-approve
    if (isAdmin) {
      passwordData.approvedBy = req.user.id;
      passwordData.approvedAt = new Date();
    }

    const passwordEntry = new PasswordManager(passwordData);
    await passwordEntry.save();

    // Calculate password strength
    passwordEntry.passwordStrength = passwordEntry.calculateStrength();
    await passwordEntry.save();

    // Add activity log
    passwordEntry.activityLog.push({
      action: 'Created',
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      details: `Created password entry for ${websiteName}`
    });
    await passwordEntry.save();

    // Send notification to assigned user
    if (assignedTo) {
      await notificationService.createNotification({
        recipient: assignedTo,
        sender: req.user.id,
        senderName: req.user.name,
        type: 'system_alert',
        title: `New Password Entry - ${websiteName}`,
        message: `A new password entry for ${websiteName} has been assigned to you`,
        data: { passwordId: passwordEntry._id },
        link: `/passwords/${passwordEntry._id}`,
        priority: 'high'
      });
    }

    res.status(201).json({
      success: true,
      data: passwordEntry
    });
  } catch (error) {
    console.error('Create password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all password entries (with access control)
// @route   GET /api/passwords
// @access  Private
const getPasswords = async (req, res) => {
  try {
    const { 
      search, 
      category,
      assignedTo,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = { isActive: true };
    
    // Users can see:
    // 1. Passwords they created
    // 2. Passwords assigned to them
    // 3. Passwords shared with them
    // 4. Super Admin/Admin sees all
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(req.user.role);
    
    if (!isAdmin) {
      query.$or = [
        { createdBy: req.user.id },
        { assignedTo: req.user.id },
        { 'sharedWith.user': req.user.id }
      ];
    }
    
    if (search) {
      query.$or = [
        ...(query.$or || []),
        { websiteName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { websiteUrl: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.websiteCategory = category;
    if (assignedTo) query.assignedTo = assignedTo;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const passwords = await PasswordManager.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('sharedWith.user', 'name email role');

    const total = await PasswordManager.countDocuments(query);

    res.status(200).json({
      success: true,
      count: passwords.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: passwords
    });
  } catch (error) {
    console.error('Get passwords error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single password entry
// @route   GET /api/passwords/:id
// @access  Private
const getPassword = async (req, res) => {
  try {
    const passwordEntry = await PasswordManager.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('sharedWith.user', 'name email role');

    if (!passwordEntry) {
      return res.status(404).json({
        success: false,
        message: 'Password entry not found'
      });
    }

    // Check access
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(req.user.role);
    const isOwner = passwordEntry.createdBy._id.toString() === req.user.id;
    const isAssigned = passwordEntry.assignedTo && passwordEntry.assignedTo._id.toString() === req.user.id;
    const isShared = passwordEntry.sharedWith.some(s => s.user._id.toString() === req.user.id);

    if (!isOwner && !isAssigned && !isShared && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this password entry'
      });
    }

    // Update view count
    passwordEntry.viewCount += 1;
    passwordEntry.lastViewed = new Date();
    await passwordEntry.save();

    // Add activity log
    passwordEntry.activityLog.push({
      action: 'Viewed',
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      details: `Viewed password entry for ${passwordEntry.websiteName}`
    });
    await passwordEntry.save();

    res.status(200).json({
      success: true,
      data: passwordEntry
    });
  } catch (error) {
    console.error('Get password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update password entry
// @route   PUT /api/passwords/:id
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const {
      websiteName,
      websiteUrl,
      websiteCategory,
      username,
      email,
      password,
      notes,
      assignedTo,
      tags,
      status
    } = req.body;

    const passwordEntry = await PasswordManager.findById(req.params.id);

    if (!passwordEntry) {
      return res.status(404).json({
        success: false,
        message: 'Password entry not found'
      });
    }

    // Check access
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(req.user.role);
    const isOwner = passwordEntry.createdBy.toString() === req.user.id;
    const isAssigned = passwordEntry.assignedTo && passwordEntry.assignedTo.toString() === req.user.id;
    const hasEditAccess = passwordEntry.sharedWith.some(s => 
      s.user.toString() === req.user.id && ['Admin', 'Editor'].includes(s.accessLevel)
    );

    if (!isOwner && !isAssigned && !hasEditAccess && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this password entry'
      });
    }

    // Store old values for audit
    const oldValues = {
      websiteName: passwordEntry.websiteName,
      username: passwordEntry.username,
      password: passwordEntry.password
    };

    // Update fields
    if (websiteName) passwordEntry.websiteName = websiteName;
    if (websiteUrl) passwordEntry.websiteUrl = websiteUrl;
    if (websiteCategory) passwordEntry.websiteCategory = websiteCategory;
    if (username) passwordEntry.username = username;
    if (email !== undefined) passwordEntry.email = email;
    if (password) {
      passwordEntry.password = password;
      passwordEntry.lastChanged = new Date();
      passwordEntry.passwordStrength = passwordEntry.calculateStrength();
    }
    if (notes !== undefined) passwordEntry.notes = notes;
    if (tags) passwordEntry.tags = tags;
    
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        passwordEntry.assignedTo = assignedTo;
        passwordEntry.assignedToName = assignedUser.name;
      }
    }

    if (status) passwordEntry.isActive = status === 'active';

    await passwordEntry.save();

    // Add activity log
    passwordEntry.activityLog.push({
      action: 'Updated',
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      details: `Updated password entry for ${passwordEntry.websiteName}`
    });
    await passwordEntry.save();

    res.status(200).json({
      success: true,
      data: passwordEntry
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password only
// @route   PUT /api/passwords/:id/change-password
// @access  Private
const changePasswordOnly = async (req, res) => {
  try {
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    const passwordEntry = await PasswordManager.findById(req.params.id);

    if (!passwordEntry) {
      return res.status(404).json({
        success: false,
        message: 'Password entry not found'
      });
    }

    // Check access
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(req.user.role);
    const isOwner = passwordEntry.createdBy.toString() === req.user.id;
    const isAssigned = passwordEntry.assignedTo && passwordEntry.assignedTo.toString() === req.user.id;

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change this password'
      });
    }

    // Update password
    passwordEntry.password = password;
    passwordEntry.lastChanged = new Date();
    passwordEntry.passwordStrength = passwordEntry.calculateStrength();
    await passwordEntry.save();

    // Add activity log
    passwordEntry.activityLog.push({
      action: 'Password Changed',
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      details: `Password changed for ${passwordEntry.websiteName}${reason ? ` - Reason: ${reason}` : ''}`
    });
    await passwordEntry.save();

    res.status(200).json({
      success: true,
      data: passwordEntry
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Share password with user
// @route   POST /api/passwords/:id/share
// @access  Private
const sharePassword = async (req, res) => {
  try {
    const { userId, accessLevel } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID'
      });
    }

    const passwordEntry = await PasswordManager.findById(req.params.id);

    if (!passwordEntry) {
      return res.status(404).json({
        success: false,
        message: 'Password entry not found'
      });
    }

    // Check if user has permission to share
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(req.user.role);
    const isOwner = passwordEntry.createdBy.toString() === req.user.id;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this password entry'
      });
    }

    const userToShare = await User.findById(userId);
    if (!userToShare) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already shared
    const existingShare = passwordEntry.sharedWith.find(s => s.user.toString() === userId);
    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: 'Password already shared with this user'
      });
    }

    passwordEntry.sharedWith.push({
      user: userId,
      userName: userToShare.name,
      userRole: userToShare.role,
      accessLevel: accessLevel || 'Viewer',
      sharedAt: new Date()
    });

    await passwordEntry.save();

    // Add activity log
    passwordEntry.activityLog.push({
      action: 'Shared',
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      details: `Shared password entry for ${passwordEntry.websiteName} with ${userToShare.name}`
    });
    await passwordEntry.save();

    // Send notification
    await notificationService.createNotification({
      recipient: userId,
      sender: req.user.id,
      senderName: req.user.name,
      type: 'system_alert',
      title: `Password Shared - ${passwordEntry.websiteName}`,
      message: `A password entry for ${passwordEntry.websiteName} has been shared with you`,
      data: { passwordId: passwordEntry._id },
      link: `/passwords/${passwordEntry._id}`,
      priority: 'high'
    });

    res.status(200).json({
      success: true,
      data: passwordEntry
    });
  } catch (error) {
    console.error('Share password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Revoke shared access
// @route   DELETE /api/passwords/:id/share/:userId
// @access  Private
const revokeAccess = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const passwordEntry = await PasswordManager.findById(id);

    if (!passwordEntry) {
      return res.status(404).json({
        success: false,
        message: 'Password entry not found'
      });
    }

    // Check if user has permission
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(req.user.role);
    const isOwner = passwordEntry.createdBy.toString() === req.user.id;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to revoke access'
      });
    }

    // Remove shared user
    passwordEntry.sharedWith = passwordEntry.sharedWith.filter(
      s => s.user.toString() !== userId
    );

    await passwordEntry.save();

    // Add activity log
    passwordEntry.activityLog.push({
      action: 'Revoked Access',
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      details: `Revoked access for ${passwordEntry.websiteName}`
    });
    await passwordEntry.save();

    res.status(200).json({
      success: true,
      data: passwordEntry
    });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete password entry
// @route   DELETE /api/passwords/:id
// @access  Private
const deletePassword = async (req, res) => {
  try {
    const passwordEntry = await PasswordManager.findById(req.params.id);

    if (!passwordEntry) {
      return res.status(404).json({
        success: false,
        message: 'Password entry not found'
      });
    }

    // Check if user has permission
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(req.user.role);
    const isOwner = passwordEntry.createdBy.toString() === req.user.id;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this password entry'
      });
    }

    // Soft delete
    passwordEntry.isActive = false;
    await passwordEntry.save();

    // Add activity log
    passwordEntry.activityLog.push({
      action: 'Deleted',
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      details: `Deleted password entry for ${passwordEntry.websiteName}`
    });
    await passwordEntry.save();

    res.status(200).json({
      success: true,
      message: 'Password entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get password statistics
// @route   GET /api/passwords/stats
// @access  Private
const getPasswordStats = async (req, res) => {
  try {
    const query = { isActive: true };
    
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(req.user.role);
    if (!isAdmin) {
      query.$or = [
        { createdBy: req.user.id },
        { assignedTo: req.user.id },
        { 'sharedWith.user': req.user.id }
      ];
    }

    const totalPasswords = await PasswordManager.countDocuments(query);
    const totalByCategory = await PasswordManager.aggregate([
      { $match: query },
      { $group: { _id: '$websiteCategory', count: { $sum: 1 } } }
    ]);
    const totalByStrength = await PasswordManager.aggregate([
      { $match: query },
      { $group: { _id: '$passwordStrength', count: { $sum: 1 } } }
    ]);
    const totalShared = await PasswordManager.countDocuments({
      ...query,
      'sharedWith.0': { $exists: true }
    });

    res.status(200).json({
      success: true,
      data: {
        totalPasswords,
        totalByCategory,
        totalByStrength,
        totalShared,
        totalCreated: await PasswordManager.countDocuments({ ...query, createdBy: req.user.id }),
        totalAssigned: await PasswordManager.countDocuments({ ...query, assignedTo: req.user.id })
      }
    });
  } catch (error) {
    console.error('Get password stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPassword,
  getPasswords,
  getPassword,
  updatePassword,
  changePasswordOnly,
  sharePassword,
  revokeAccess,
  deletePassword,
  getPasswordStats
};