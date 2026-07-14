// pages/Management/ManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCog, 
  FaUsers, 
  FaBuilding, 
  FaChartLine,
  FaCalendarAlt,
  FaTasks,
  FaUserPlus,
  FaFileAlt,
  FaHistory,
  FaSpinner,
  FaIdCard,
  FaUserCog,
  FaShieldAlt,
  FaDatabase,
  FaServer,
  FaCloud,
  FaCode,
  FaNetworkWired,
  FaBrain,
  FaMicrochip
} from 'react-icons/fa';
import { authService, userService, dashboardService } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ManagementPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
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
    fetchManagementData();
    fetchUnreadCount();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchManagementData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        userService.getUsers(),
        dashboardService.getStats()
      ]);
      setUsers(usersResponse.data);
      setDashboardStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      // Replace with actual API call
      // const response = await notificationService.getUnreadCount();
      // setUnreadCount(response.data.count);
      setUnreadCount(1); // Example count
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
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

  const techIcons = [
    { Icon: FaCode, color: '#00D4FF', delay: 0 },
    { Icon: FaServer, color: '#7C3AED', delay: 1.5 },
    { Icon: FaCloud, color: '#06D6A0', delay: 3 },
    { Icon: FaMicrochip, color: '#FF6B6B', delay: 0.5 },
    { Icon: FaNetworkWired, color: '#F59E0B', delay: 2 },
    { Icon: FaBrain, color: '#EC4899', delay: 1 },
  ];

  // Calculate department stats
  const departmentStats = users.reduce((acc, user) => {
    const dept = user.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Calculate role stats
  const roleStats = users.reduce((acc, user) => {
    const role = user.role || 'unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

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
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* System Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Users</p>
                      <p className="text-3xl font-bold text-white mt-2">{dashboardStats?.totalUsers || users.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                      <FaUsers className="w-6 h-6 text-[#00D4FF]" />
                    </div>
                  </div>
                </div>

                <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#06D6A0]/10 hover:border-[#06D6A0]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Users</p>
                      <p className="text-3xl font-bold text-white mt-2">{dashboardStats?.activeUsers || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center">
                      <FaUserCog className="w-6 h-6 text-[#06D6A0]" />
                    </div>
                  </div>
                </div>

                <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#7C3AED]/10 hover:border-[#7C3AED]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">New Users (30d)</p>
                      <p className="text-3xl font-bold text-white mt-2">{dashboardStats?.newUsers || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
                      <FaUserPlus className="w-6 h-6 text-[#7C3AED]" />
                    </div>
                  </div>
                </div>

                <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#F59E0B]/10 hover:border-[#F59E0B]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Departments</p>
                      <p className="text-3xl font-bold text-white mt-2">{Object.keys(departmentStats).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
                      <FaBuilding className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Department Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6"
              >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <FaBuilding className="text-[#00D4FF]" />
                  Department Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(departmentStats).map(([dept, count]) => (
                    <div key={dept} className="bg-[#0A0A0F]/50 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-gray-300 text-sm">{dept}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Role Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6"
              >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <FaIdCard className="text-[#00D4FF]" />
                  Role Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(roleStats).map(([role, count]) => (
                    <div key={role} className="bg-[#0A0A0F]/50 rounded-lg p-3 flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{getRoleIcon(role)}</span>
                        <span className="text-gray-300 text-sm capitalize">{role}</span>
                      </span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* System Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6"
              >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <FaCog className="text-[#00D4FF]" />
                  System Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4 hover:bg-[#0A0A0F]/70 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center">
                        <FaShieldAlt className="w-5 h-5 text-[#00D4FF]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Security</p>
                        <p className="text-xs text-gray-400">Manage security settings</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4 hover:bg-[#0A0A0F]/70 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#06D6A0]/10 rounded-lg flex items-center justify-center">
                        <FaDatabase className="w-5 h-5 text-[#06D6A0]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Data Management</p>
                        <p className="text-xs text-gray-400">Manage system data</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4 hover:bg-[#0A0A0F]/70 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center">
                        <FaCloud className="w-5 h-5 text-[#7C3AED]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Cloud Services</p>
                        <p className="text-xs text-gray-400">Manage cloud integrations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* System Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6"
              >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <FaServer className="text-[#00D4FF]" />
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-3 flex justify-between">
                    <span className="text-gray-400">System Version</span>
                    <span className="text-white">v3.2.1</span>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-3 flex justify-between">
                    <span className="text-gray-400">Database Status</span>
                    <span className="text-green-400">● Online</span>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-3 flex justify-between">
                    <span className="text-gray-400">API Status</span>
                    <span className="text-green-400">● Online</span>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-3 flex justify-between">
                    <span className="text-gray-400">Last Backup</span>
                    <span className="text-white">Today, 02:00 AM</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;