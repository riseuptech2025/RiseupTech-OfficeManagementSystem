// services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Create a notification
  async createNotification(data) {
    try {
      const notification = await Notification.create({
        recipient: data.recipient,
        sender: data.sender || null,
        senderName: data.senderName || null,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        link: data.link || null,
        priority: data.priority || 'medium'
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create notifications for multiple recipients
  async createBulkNotifications(recipients, data) {
    try {
      const notifications = recipients.map(recipient => ({
        recipient,
        sender: data.sender || null,
        senderName: data.senderName || null,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        link: data.link || null,
        priority: data.priority || 'medium'
      }));

      const created = await Notification.insertMany(notifications);
      return created;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Get user's notifications with pagination
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    try {
      const query = {
        recipient: userId,
        isDeleted: false
      };

      if (unreadOnly) {
        query.isRead = false;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('sender', 'name email profilePicture role'),
        Notification.countDocuments(query)
      ]);

      return {
        notifications,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      };
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
        isDeleted: false
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipient: userId
        },
        {
          isRead: true,
          readAt: new Date()
        },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        {
          recipient: userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );
      return result;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipient: userId
        },
        { isDeleted: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Delete all notifications
  async deleteAllNotifications(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId },
        { isDeleted: true }
      );
      return result;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  // Create notification for leave request
  async notifyLeaveRequest(leave, approvers) {
    const title = `Leave Request - ${leave.employeeName}`;
    const message = `${leave.employeeName} has requested ${leave.type} leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`;
    const data = { leaveId: leave._id };
    const link = `/leaves/${leave._id}`;
    const type = 'leave_request';

    // Notify all approvers
    if (approvers && approvers.length > 0) {
      await this.createBulkNotifications(approvers, {
        sender: leave.employee,
        senderName: leave.employeeName,
        type,
        title,
        message,
        data,
        link,
        priority: 'high'
      });
    }
  }

  // Create notification for leave status update
  async notifyLeaveStatusUpdate(leave, status, approverName) {
    const statusLabels = {
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    };

    const title = `Leave ${statusLabels[status]}`;
    const message = `Your leave request (${leave.type}) has been ${statusLabels[status]} by ${approverName}`;
    const data = { leaveId: leave._id };
    const link = `/leaves/${leave._id}`;
    const type = status === 'approved' ? 'leave_approved' : 
                  status === 'rejected' ? 'leave_rejected' : 'leave_cancelled';

    await this.createNotification({
      recipient: leave.employee,
      sender: leave.approvedBy || null,
      senderName: approverName,
      type,
      title,
      message,
      data,
      link,
      priority: status === 'rejected' ? 'high' : 'medium'
    });
  }

  // Create notification for report
  async notifyReportSubmission(report, assignedTo) {
    const title = `New Report - ${report.subject}`;
    const message = `${report.reporterName} has submitted a new report (${report.category})`;
    const data = { reportId: report._id };
    const link = `/reports/${report._id}`;
    const type = 'report_submitted';

    if (assignedTo) {
      await this.createNotification({
        recipient: assignedTo,
        sender: report.reporter,
        senderName: report.reporterName,
        type,
        title,
        message,
        data,
        link,
        priority: report.urgency === 'critical' ? 'critical' : 'high'
      });
    }
  }

  // Create notification for report update
  async notifyReportUpdate(report, updaterName, status) {
    const title = `Report Updated - ${report.subject}`;
    const message = `Report status updated to ${status} by ${updaterName}`;
    const data = { reportId: report._id };
    const link = `/reports/${report._id}`;
    const type = 'report_updated';

    await this.createNotification({
      recipient: report.reporter,
      sender: report.resolvedBy || null,
      senderName: updaterName,
      type,
      title,
      message,
      data,
      link,
      priority: 'medium'
    });
  }

  // Create notification for task assignment
  async notifyTaskAssignment(task) {
    const title = `New Task - ${task.title}`;
    const message = `You have been assigned a new task: ${task.title}`;
    const data = { taskId: task._id };
    const link = `/tasks/${task._id}`;
    const type = 'task_assigned';

    await this.createNotification({
      recipient: task.assignedTo,
      sender: task.assignedBy,
      senderName: task.assignedByName,
      type,
      title,
      message,
      data,
      link,
      priority: task.priority === 'critical' ? 'critical' : 
                task.priority === 'high' ? 'high' : 'medium'
    });
  }

  // Create notification for task update
  async notifyTaskUpdate(task, updaterName, status) {
    const title = `Task Updated - ${task.title}`;
    const message = `Task status updated to ${status} by ${updaterName}`;
    const data = { taskId: task._id };
    const link = `/tasks/${task._id}`;
    const type = 'task_updated';

    // Notify both assigner and assignee
    const recipients = [
      task.assignedTo,
      task.assignedBy
    ].filter(id => id.toString() !== updaterName);

    if (recipients.length > 0) {
      await this.createBulkNotifications(recipients, {
        sender: null,
        senderName: updaterName,
        type,
        title,
        message,
        data,
        link,
        priority: 'medium'
      });
    }
  }

  // Create notification for user creation
  async notifyUserCreation(newUser, adminName) {
    const title = `🌟 Welcome to RiseUp-Tech!`;
    const message = ` Congratulations on becoming a part of **Riseup-Tech Software Company**. This is the beginning of an exciting journey filled with opportunities to learn, grow, and make a meaningful impact. We believe in your potential and look forward to celebrating your achievements together.Welcome aboard, and we wish you every success in your career with Riseup-Tech!`;
    const type = 'user_created';

    await this.createNotification({
      recipient: newUser._id,
      sender: null,
      senderName: adminName,
      type,
      title,
      message,
      priority: 'high'
    });
  }

  // Create notification for system alerts
  async notifySystemAlert(recipients, title, message, priority = 'medium') {
    await this.createBulkNotifications(recipients, {
      type: 'system_alert',
      title,
      message,
      priority
    });
  }
}

module.exports = new NotificationService();