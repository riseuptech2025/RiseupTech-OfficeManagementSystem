// pages/Activity/ActivityPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHistory, 
  FaUsers, 
  FaCalendarAlt, 
  FaTasks,
  FaFileAlt,
  FaChartLine,
  FaCog,
  FaSpinner,
  FaClock,
  FaUserPlus
} from 'react-icons/fa';
import { authService, dashboardService } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ActivityPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchActivityData();
    fetchUnreadCount();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchActivityData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        dashboardService.getActivity(),
        dashboardService.getRecentUsers()
      ]);
      setActivityStats(statsResponse.data);
      setRecentUsers(usersResponse.data);
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      // Replace with actual API call
      // const response = await notificationService.getUnreadCount();
      // setUnreadCount(response.data.count);
      setUnreadCount(3); // Example count
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

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
    return null; // Let the components handle the initials
  };

  const getUserInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const techIcons = [
    { Icon: FaHistory, color: '#00D4FF', delay: 0 },
    { Icon: FaClock, color: '#7C3AED', delay: 1.5 },
    { Icon: FaUsers, color: '#06D6A0', delay: 3 },
    { Icon: FaChartLine, color: '#FF6B6B', delay: 0.5 },
  ];

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

      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Navbar Component */}
        <Navbar
          user={user}
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={unreadCount}
        />

        {/* Page Content */}
        <div className="p-6">
          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Weekly New Users</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {loading ? <FaSpinner className="w-6 h-6 animate-spin" /> : activityStats?.weeklyUsers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                  <FaCalendarAlt className="w-6 h-6 text-[#00D4FF]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#06D6A0]/10 hover:border-[#06D6A0]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Today's New Users</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {loading ? <FaSpinner className="w-6 h-6 animate-spin" /> : activityStats?.todayUsers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center">
                  <FaClock className="w-6 h-6 text-[#06D6A0]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#7C3AED]/10 hover:border-[#7C3AED]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {loading ? <FaSpinner className="w-6 h-6 animate-spin" /> : '-'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
                  <FaUsers className="w-6 h-6 text-[#7C3AED]" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Users Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaUserPlus className="text-[#00D4FF]" />
              Recent User Activity
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaHistory className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((recentUser) => (
                  <div key={recentUser._id} className="flex items-center justify-between p-3 bg-[#0A0A0F]/50 rounded-lg hover:bg-[#0A0A0F]/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden">
                        {recentUser.profilePicture ? (
                          <img 
                            src={recentUser.profilePicture} 
                            alt={recentUser.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            {getUserInitials(recentUser.name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{recentUser.name}</p>
                        <p className="text-xs text-gray-400">{recentUser.employeeId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(recentUser.role)}`}>
                        {getRoleIcon(recentUser.role)} {recentUser.role}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(recentUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaHistory className="text-[#00D4FF]" />
              System Activity Log
            </h3>
            <div className="text-center py-8 text-gray-400">
              <FaClock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg">Activity logs will be available in the next version</p>
              <p className="text-sm">We're working on tracking all system activities</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;