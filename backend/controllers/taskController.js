const Task = require('../models/Task');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Helper function to check if user can assign task to target role
const canAssignTask = (assignerRole, targetRole) => {
  const roleLevels = {
    'super_admin': 4,
    'ceo': 4,
    'founder': 4,
    'admin': 3,
    'coo': 3,
    'accountant': 3,
    'hr_manager': 2,
    'staff': 1
  };

  const assignerLevel = roleLevels[assignerRole] || 0;
  const targetLevel = roleLevels[targetRole] || 0;

  // Super Admin can assign to anyone except other Super Admins
  if (assignerLevel === 4) {
    return targetLevel < 4;
  }
  
  // Admin can assign to HR Manager and Staff
  if (assignerLevel === 3) {
    return targetLevel <= 2;
  }
  
  // HR Manager can assign to Staff only
  if (assignerLevel === 2) {
    return targetLevel === 1;
  }
  
  // Staff cannot assign tasks
  return false;
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      assignedTo, 
      priority, 
      dueDate, 
      category,
      attachments,
      tags,
      subtasks
    } = req.body;

    if (!title || !description || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, assignedTo, and dueDate'
      });
    }

    // Check if assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    // Check if user can assign to this role
    if (!canAssignTask(req.user.role, assignedUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to assign tasks to this role'
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedBy: req.user.id,
      assignedByName: req.user.name,
      assignedByRole: req.user.role,
      assignedTo: assignedUser._id,
      assignedToName: assignedUser.name,
      assignedToRole: assignedUser.role,
      priority: priority || 'medium',
      dueDate,
      category: category || 'other',
      attachments: attachments || [],
      tags: tags || [],
      subtasks: subtasks || [],
      status: 'pending'
    });

    // Add audit log
    task.auditLog.push({
      action: 'created',
      user: req.user.id,
      userName: req.user.name,
      details: `Task "${title}" assigned to ${assignedUser.name}`
    });
    await task.save();

    await notificationService.notifyTaskAssignment(task);

    await task.populate('assignedBy', 'name email role');
    await task.populate('assignedTo', 'name email role profilePicture');

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      category, 
      assignedTo,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = {};
    
    // Filter based on user role
    if (['staff', 'hr_manager'].includes(req.user.role)) {
      // Staff and HR Managers see tasks assigned to them
      query.assignedTo = req.user.id;
    } else if (['admin', 'coo', 'accountant'].includes(req.user.role)) {
      // Admins see tasks they assigned or tasks assigned to their team
      query.$or = [
        { assignedBy: req.user.id },
        { assignedTo: req.user.id }
      ];
    } else if (['super_admin', 'ceo', 'founder'].includes(req.user.role)) {
      // Super Admins see all tasks
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedBy', 'name email role profilePicture')
      .populate('assignedTo', 'name email role profilePicture')
      .populate('comments.user', 'name email role profilePicture');

    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedBy', 'name email role profilePicture department')
      .populate('assignedTo', 'name email role profilePicture department')
      .populate('comments.user', 'name email role profilePicture');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check authorization
    const isAssignedTo = task.assignedTo._id.toString() === req.user.id;
    const isAssignedBy = task.assignedBy._id.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isAssignedTo && !isAssignedBy && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      dueDate, 
      category,
      status,
      progress,
      tags,
      attachments
    } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check authorization
    const isAssignedTo = task.assignedTo.toString() === req.user.id;
    const isAssignedBy = task.assignedBy.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isAssignedTo && !isAssignedBy && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    const statusChanged = Boolean(status) && task.status !== status;

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (category) task.category = category;
    if (tags) task.tags = tags;
    if (attachments) task.attachments = attachments;
    
    if (status) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      }
    }
    
    if (progress !== undefined) {
      task.progress = Math.min(100, Math.max(0, progress));
    }

    await task.save();

    if (statusChanged) {
      await notificationService.notifyTaskUpdate(task, req.user.name, status);
    }

    // Add audit log
    task.auditLog.push({
      action: 'updated',
      user: req.user.id,
      userName: req.user.name,
      details: 'Task updated'
    });
    await task.save();

    await task.populate('assignedBy', 'name email role');
    await task.populate('assignedTo', 'name email role');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update subtask
// @route   PUT /api/tasks/:id/subtasks/:subtaskIndex
// @access  Private
const updateSubtask = async (req, res) => {
  try {
    const { subtaskIndex } = req.params;
    const { completed } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check authorization
    const isAssignedTo = task.assignedTo.toString() === req.user.id;
    const isAssignedBy = task.assignedBy.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isAssignedTo && !isAssignedBy && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    const index = parseInt(subtaskIndex);
    if (index < 0 || index >= task.subtasks.length) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    task.subtasks[index].completed = completed;
    if (completed) {
      task.subtasks[index].completedAt = new Date();
    }

    // Update progress based on subtasks
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    task.progress = Math.round((completedSubtasks / task.subtasks.length) * 100);

    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addTaskComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a comment'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check authorization
    const isAssignedTo = task.assignedTo.toString() === req.user.id;
    const isAssignedBy = task.assignedBy.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isAssignedTo && !isAssignedBy && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task'
      });
    }

    task.comments.push({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      comment
    });

    await task.save();
    await task.populate('comments.user', 'name email role profilePicture');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Add task comment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const query = {};
    
    if (['staff', 'hr_manager'].includes(req.user.role)) {
      query.assignedTo = req.user.id;
    }

    const totalTasks = await Task.countDocuments(query);
    const pendingTasks = await Task.countDocuments({ ...query, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ ...query, status: 'in_progress' });
    const completedTasks = await Task.countDocuments({ ...query, status: 'completed' });
    const overdueTasks = await Task.countDocuments({ 
      ...query, 
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] }
    });

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Tasks by category
    const tasksByCategory = await Task.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        tasksByPriority,
        tasksByCategory
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateSubtask,
  addTaskComment,
  getTaskStats
};