// components/NotificationDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaTimes, 
  FaCheck, 
  FaCheckDouble,
  FaTrash,
  FaSpinner,
  FaUserPlus,
  FaCalendarAlt,
  FaFileAlt,
  FaTasks,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';
import { notificationService } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const fetchNotifications = async (reset = true) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = reset ? 1 : page;
      const response = await notificationService.getNotifications({
        page: currentPage,
        limit: 20
      });

      if (reset) {
        setNotifications(response.notifications);
        setHasMore(response.notifications.length < response.total);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
        setHasMore(response.notifications.length < response.total);
      }
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (!notifications.find(n => n._id === id)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all notifications?')) return;
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'leave_request':
      case 'leave_approved':
      case 'leave_rejected':
      case 'leave_cancelled':
        return <FaCalendarAlt className="text-blue-400" />;
      case 'report_submitted':
      case 'report_updated':
      case 'report_resolved':
        return <FaFileAlt className="text-purple-400" />;
      case 'task_assigned':
      case 'task_updated':
      case 'task_completed':
        return <FaTasks className="text-green-400" />;
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
        return <FaUserPlus className="text-cyan-400" />;
      case 'system_alert':
        return <FaExclamationTriangle className="text-red-400" />;
      default:
        return <FaBell className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'border-red-500/50';
      case 'high': return 'border-orange-500/50';
      case 'medium': return 'border-yellow-500/50';
      default: return 'border-gray-500/50';
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Button with Badge */}
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 max-h-[500px] bg-[#111118] rounded-xl border border-[#00D4FF]/10 shadow-2xl shadow-[#00D4FF]/5 overflow-hidden z-[9999]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#00D4FF]/10">
              <div>
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <p className="text-xs text-gray-400">
                  {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors flex items-center gap-1"
                  >
                    <FaCheckDouble className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <FaTrash className="w-3 h-3" />
                    Delete all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[400px]">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="w-6 h-6 text-[#00D4FF] animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <FaBell className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-lg">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border-b border-[#00D4FF]/5 hover:bg-white/5 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-[#00D4FF]/5' : ''
                      } ${getPriorityColor(notification.priority)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-full bg-[#0A0A0F] flex items-center justify-center flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-white truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {notification.timeAgo || new Date(notification.createdAt).toLocaleDateString()}
                                  </span>
                                  {notification.priority && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      notification.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                      notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                      notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {notification.priority}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-[#00D4FF] rounded-full"></span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification._id);
                                  }}
                                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                >
                                  <FaTimes className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification._id);
                                }}
                                className="text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors mt-1"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {hasMore && (
                    <button
                      onClick={() => fetchNotifications(false)}
                      className="w-full py-3 text-sm text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors border-t border-[#00D4FF]/10"
                    >
                      {loading ? (
                        <FaSpinner className="w-4 h-4 mx-auto animate-spin" />
                      ) : (
                        'Load more'
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;