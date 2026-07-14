const Leave = require('../models/Leave');
const User = require('../models/User');

// Helper function to get approvers based on employee role
const getApprovers = async (employeeRole, employeeId) => {
  const approvers = [];
  
  // Get all users who can approve leaves
  const allUsers = await User.find({ isActive: true }).select('_id role name');
  
  if (employeeRole === 'staff' || employeeRole === 'hr_manager') {
    // For staff and HR Manager: Find HR Managers and Admins
    const hrManagers = allUsers.filter(u => u.role === 'hr_manager' && u._id.toString() !== employeeId.toString());
    const admins = allUsers.filter(u => ['super_admin', 'ceo', 'founder', 'admin', 'coo', 'accountant'].includes(u.role));
    approvers.push(...hrManagers.map(u => u._id));
    approvers.push(...admins.map(u => u._id));
  } else if (['admin', 'coo', 'accountant'].includes(employeeRole)) {
    // For Admins: Find Super Admins
    const superAdmins = allUsers.filter(u => ['super_admin', 'ceo', 'founder'].includes(u.role));
    approvers.push(...superAdmins.map(u => u._id));
  }
  
  return approvers;
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason, attachments } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Calculate days count
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (daysCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Get approvers
    const approvers = await getApprovers(req.user.role, req.user.id);

    const leave = await Leave.create({
      employee: req.user.id,
      employeeName: req.user.name,
      employeeEmail: req.user.email,
      employeeRole: req.user.role,
      type,
      startDate,
      endDate,
      reason,
      daysCount,
      approvers,
      attachments: attachments || [],
      status: approvers.length > 0 ? 'pending' : 'pending'
    });

    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all leaves (with filters)
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    const { status, type, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    // Filter by user role
    if (['staff', 'hr_manager'].includes(req.user.role)) {
      // Staff and HR Managers see their own leaves
      query.employee = req.user.id;
    } else if (['admin', 'coo', 'accountant'].includes(req.user.role)) {
      // Admins see all leaves except super admin leaves (they handle their own)
      query.$or = [
        { employee: req.user.id },
        { approvers: req.user.id }
      ];
    } else if (['super_admin', 'ceo', 'founder'].includes(req.user.role)) {
      // Super Admins see all leaves
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('employee', 'name email role profilePicture')
      .populate('approvedBy', 'name email role');

    const total = await Leave.countDocuments(query);

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: leaves
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
const getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'name email role profilePicture department')
      .populate('approvedBy', 'name email role')
      .populate('approvers', 'name email role')
      .populate('comments.user', 'name email role profilePicture');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    // Check authorization
    const isApprover = leave.approvers.some(approver => 
      approver._id.toString() === req.user.id
    );
    const isOwner = leave.employee._id.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isOwner && !isApprover && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this leave'
      });
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id/status
// @access  Private
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status || !['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    // Check if user is authorized to approve/reject
    const isApprover = leave.approvers.some(approverId => 
      approverId.toString() === req.user.id
    );
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);
    const isAdmin = ['admin', 'coo', 'accountant'].includes(req.user.role);

    // Staff can only cancel their own leaves
    if (status === 'cancelled') {
      if (leave.employee.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Only the employee can cancel their own leave'
        });
      }
    } else {
      // Only approvers can approve/reject
      if (!isApprover && !isSuperAdmin && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this leave status'
        });
      }
    }

    leave.status = status;
    
    if (status === 'approved') {
      leave.approvedBy = req.user.id;
      leave.approvedAt = new Date();
    } else if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    // Populate for response
    await leave.populate('employee', 'name email role');
    await leave.populate('approvedBy', 'name email role');

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add comment to leave
// @route   POST /api/leaves/:id/comments
// @access  Private
const addLeaveComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a comment'
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    // Check authorization
    const isApprover = leave.approvers.some(approverId => 
      approverId.toString() === req.user.id
    );
    const isOwner = leave.employee.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isOwner && !isApprover && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this leave'
      });
    }

    leave.comments.push({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      comment
    });

    await leave.save();
    await leave.populate('comments.user', 'name email role profilePicture');

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('Add leave comment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private
const getLeaveStats = async (req, res) => {
  try {
    const query = {};
    
    if (['staff', 'hr_manager'].includes(req.user.role)) {
      query.employee = req.user.id;
    }

    const totalLeaves = await Leave.countDocuments(query);
    const pendingLeaves = await Leave.countDocuments({ ...query, status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ ...query, status: 'approved' });
    const rejectedLeaves = await Leave.countDocuments({ ...query, status: 'rejected' });
    const cancelledLeaves = await Leave.countDocuments({ ...query, status: 'cancelled' });

    // Leaves by type
    const leavesByType = await Leave.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        cancelledLeaves,
        leavesByType
      }
    });
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  getLeave,
  updateLeaveStatus,
  addLeaveComment,
  getLeaveStats
};