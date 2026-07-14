// pages/Notifications/NotificationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaTasks,
  FaHistory,
  FaCog,
  FaUserPlus,
  FaCalendarCheck,
  FaClipboardList,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';
import { authService } from '../services/api';
import { notificationService } from '../services/notificationService';
import CompanyLogo from '../components/CompanyLogo';

const NotificationPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchNotifications();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchNotifications = async (reset = true) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = reset ? 1 : page;
      const unreadOnly = filter === 'unread';
      
      const response = await notificationService.getNotifications({
        page: currentPage,
        limit: 20,
        unreadOnly
      });

      const newNotifications = response.notifications;
      
      if (reset) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      
      setHasMore(currentPage < response.totalPages);
      setPage(currentPage + 1);
      
      // Update stats
      setStats({
        total: response.total,
        unread: response.total - newNotifications.filter(n => n.isRead).length,
        read: newNotifications.filter(n => n.isRead).length
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1
      }));
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
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (!deleted?.isRead) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          unread: Math.max(0, prev.unread - 1)
        }));
      } else {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          read: Math.max(0, prev.read - 1)
        }));
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
      setStats({ total: 0, unread: 0, read: 0 });
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
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Helper functions
  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      ceo: 'bg-red-500/20 text-red-400 border-red-500/30',
      founder: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      coo: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      hr_manager: 'bg-green-500/20 text-green-400 border-green-500/30',
      accountant: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      staff: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[role] || colors.staff;
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'super_admin': return '👑';
      case 'ceo': return '💼';
      case 'founder': return '🚀';
      case 'admin': return '🛡️';
      case 'coo': return '📊';
      case 'hr_manager': return '👥';
      case 'accountant': return '💰';
      default: return '👤';
    }
  };

  const getUserInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserAvatar = (user) => {
    if (user?.profilePicture) {
      return (
        <img 
          src={user.profilePicture} 
          alt={user.name} 
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <span className="text-lg font-bold">
        {getUserInitials(user?.name)}
      </span>
    );
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'leave_request': return <FaCalendarAlt className="text-blue-400" />;
      case 'leave_approved': return <FaCheckCircle className="text-green-400" />;
      case 'leave_rejected': return <FaTimesCircle className="text-red-400" />;
      case 'leave_cancelled': return <FaTimes className="text-gray-400" />;
      case 'report_submitted': return <FaFileAlt className="text-purple-400" />;
      case 'report_updated': return <FaClipboardList className="text-purple-400" />;
      case 'report_resolved': return <FaCheckCircle className="text-green-400" />;
      case 'task_assigned': return <FaTasks className="text-cyan-400" />;
      case 'task_updated': return <FaTasks className="text-cyan-400" />;
      case 'task_completed': return <FaCheckCircle className="text-green-400" />;
      case 'user_created': return <FaUserPlus className="text-blue-400" />;
      case 'user_updated': return <FaUsers className="text-blue-400" />;
      case 'user_deleted': return <FaTrash className="text-red-400" />;
      case 'system_alert': return <FaExclamationTriangle className="text-red-400" />;
      case 'reminder': return <FaClock className="text-yellow-400" />;
      default: return <FaBell className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'border-l-4 border-red-500';
      case 'high': return 'border-l-4 border-orange-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      default: return 'border-l-4 border-gray-500';
    }
  };

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/home' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/users' },
    { id: 'leaves', label: 'Leaves', icon: FaCalendarAlt, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FaFileAlt, path: '/reports' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/tasks' },
    { id: 'activity', label: 'Activity', icon: FaHistory, path: '/activity' },
    { id: 'management', label: 'Management', icon: FaCog, path: '/management' },
  ];

  const techIcons = [
    { Icon: FaBell, color: '#00D4FF', delay: 0 },
    { Icon: FaCheckCircle, color: '#06D6A0', delay: 1.5 },
    { Icon: FaExclamationTriangle, color: '#FF6B6B', delay: 3 },
    { Icon: FaTasks, color: '#7C3AED', delay: 0.5 },
  ];

  const filteredNotifications = notifications;

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dashboard-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(0, 212, 255, 0.03)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="rgba(0, 212, 255, 0.05)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
        </svg>
      </div>

      {/* Floating tech particles */}
      {techIcons.map((tech, index) => (
        <motion.div
          key={index}
          className="absolute opacity-10 pointer-events-none"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
            color: tech.color,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, -20, 10, 0],
            rotate: [0, 180, 360],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            delay: tech.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <tech.Icon className="w-16 h-16" />
        </motion.div>
      ))}

      {/* Interactive glow */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none opacity-10 blur-3xl transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, rgba(124,58,237,0.1) 50%, transparent 100%)',
          left: mousePosition.x - 400,
          top: mousePosition.y - 400,
        }}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
        className={`fixed left-0 top-0 h-full bg-[#111118]/95 backdrop-blur-xl border-r border-[#00D4FF]/10 shadow-2xl shadow-[#00D4FF]/5 z-50 transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        <div className="p-4 border-b border-[#00D4FF]/10 flex-shrink-0">
          {sidebarOpen ? (
            <CompanyLogo size="medium" showText={true} textColor="text-[#00D4FF]" />
          ) : (
            <CompanyLogo size="small" showText={false} />
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white shadow-lg shadow-[#00D4FF]/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    } ${!sidebarOpen && 'justify-center'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {user && (
          <div className="border-t border-[#00D4FF]/10 flex-shrink-0">
            {sidebarOpen ? (
              <div className="p-4">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors relative"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                    {getUserAvatar(user)}
                  </div>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{user.employeeId}</p>
                  </div>
                  
                  <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 bg-[#0A0A0F] rounded-lg border border-[#00D4FF]/10 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 transition-colors text-gray-300 hover:text-white"
                      >
                        <FaUserCircle className="w-5 h-5" />
                        <span className="text-sm">My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300 border-t border-[#00D4FF]/5"
                      >
                        <FaSignOutAlt className="w-5 h-5" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-4">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden hover:ring-2 hover:ring-[#00D4FF]/50 transition-all mx-auto relative"
                >
                  {getUserAvatar(user)}
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-[#0A0A0F] rounded-lg border border-[#00D4FF]/10 overflow-hidden min-w-[180px] shadow-xl"
                    >
                      <div className="px-4 py-3 border-b border-[#00D4FF]/5">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 transition-colors text-gray-300 hover:text-white"
                      >
                        <FaUserCircle className="w-5 h-5" />
                        <span className="text-sm">My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300 border-t border-[#00D4FF]/5"
                      >
                        <FaSignOutAlt className="w-5 h-5" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Top Navigation Bar */}
        <nav className="bg-[#111118]/95 backdrop-blur-xl border-b border-[#00D4FF]/10 sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                {sidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Notifications</h1>
                <p className="text-sm text-gray-400">Stay updated with your activity</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden">
                  {getUserAvatar(user)}
                </div>
                {sidebarOpen && (
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.role}</p>
                  </div>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#00D4FF]/10">
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#06D6A0]/10">
              <p className="text-sm text-gray-400">Unread</p>
              <p className="text-2xl font-bold text-white">{stats.unread}</p>
            </div>
            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#7C3AED]/10">
              <p className="text-sm text-gray-400">Read</p>
              <p className="text-2xl font-bold text-white">{stats.read}</p>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilter('all');
                  fetchNotifications(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === 'all'
                    ? 'bg-[#00D4FF] text-white'
                    : 'bg-[#111118] text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setFilter('unread');
                  fetchNotifications(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === 'unread'
                    ? 'bg-[#00D4FF] text-white'
                    : 'bg-[#111118] text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => {
                  setFilter('read');
                  fetchNotifications(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === 'read'
                    ? 'bg-[#00D4FF] text-white'
                    : 'bg-[#111118] text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                }`}
              >
                Read
              </button>
            </div>
            <div className="flex gap-2">
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all text-sm flex items-center gap-2"
                >
                  <FaCheckDouble className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm flex items-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  Delete all
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 overflow-hidden">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaBell className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border-b border-[#00D4FF]/5 hover:bg-white/5 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-[#00D4FF]/5' : ''
                    } ${getPriorityColor(notification.priority)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-full bg-[#0A0A0F] flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-[#00D4FF] rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.createdAt)}
                                </span>
                                {notification.senderName && (
                                  <span className="text-xs text-gray-500">
                                    From: {notification.senderName}
                                  </span>
                                )}
                                {notification.priority && notification.priority !== 'low' && (
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    notification.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                    notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                  }`}>
                                    {notification.priority.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification._id);
                                  }}
                                  className="text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors px-2 py-1"
                                >
                                  <FaCheck className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification._id);
                                }}
                                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;