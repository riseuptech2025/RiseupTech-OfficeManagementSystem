import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaUserPlus, 
  FaUserCheck, 
  FaUserCog,
  FaChartLine,
  FaCalendarAlt,
  FaTasks,
  FaFileAlt,
  FaClock,
  FaSpinner,
  FaCode,
  FaServer,
  FaCloud,
  FaMicrochip,
  FaNetworkWired,
  FaBrain
} from 'react-icons/fa';
import { authService, userService, dashboardService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showNotifications, setShowNotifications] = useState(false);
  
  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchDashboardData();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [usersResponse, statsResponse, activityResponse, recentResponse] = await Promise.all([
        userService.getUsers(),
        dashboardService.getStats(),
        dashboardService.getActivity(),
        dashboardService.getRecentUsers()
      ]);
      
      setUsers(usersResponse.data);
      setDashboardStats(statsResponse.data);
      setActivityStats(activityResponse.data);
      setRecentUsers(recentResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Role-based permission checks
  const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(user?.role);
  const isAdmin = ['super_admin', 'ceo', 'founder', 'coo', 'accountant', 'admin'].includes(user?.role);
  const isHRManager = user?.role === 'hr_manager';
  const canManageUsers = isSuperAdmin || isAdmin || isHRManager;

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

  // Stats calculation
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => ['super_admin', 'ceo', 'founder', 'admin', 'coo', 'accountant'].includes(u.role)).length;
  const staffUsers = users.filter(u => u.role === 'staff').length;

  // Tech icons for floating particles
  const techIcons = [
    { Icon: FaCode, color: '#00D4FF', delay: 0 },
    { Icon: FaServer, color: '#7C3AED', delay: 1.5 },
    { Icon: FaCloud, color: '#06D6A0', delay: 3 },
    { Icon: FaMicrochip, color: '#FF6B6B', delay: 0.5 },
    { Icon: FaNetworkWired, color: '#F59E0B', delay: 2 },
    { Icon: FaBrain, color: '#EC4899', delay: 1 },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex relative overflow-hidden">
      {/* ========== ANIMATED BACKGROUND ========== */}
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

      {/* Interactive glow follow mouse */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none opacity-10 blur-3xl transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, rgba(124,58,237,0.1) 50%, transparent 100%)',
          left: mousePosition.x - 400,
          top: mousePosition.y - 400,
        }}
      />

      {/* ========== SIDEBAR ========== */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />

      {/* ========== MAIN CONTENT ========== */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* ===== TOP NAVIGATION BAR ===== */}
        <Navbar 
          user={user}
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        {/* ===== PAGE CONTENT ===== */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
            </div>
          ) : (
            <>
              {/* ===== STATS GRID ===== */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Users</p>
                      <p className="text-3xl font-bold text-white mt-2">{dashboardStats?.totalUsers || totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                      <FaUsers className="w-6 h-6 text-[#00D4FF]" />
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
                      <p className="text-sm text-gray-400">Active Users</p>
                      <p className="text-3xl font-bold text-white mt-2">{dashboardStats?.activeUsers || activeUsers}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center">
                      <FaUserCheck className="w-6 h-6 text-[#06D6A0]" />
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
                      <p className="text-sm text-gray-400">Admin Users</p>
                      <p className="text-3xl font-bold text-white mt-2">{adminUsers}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
                      <FaUserCog className="w-6 h-6 text-[#7C3AED]" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#F59E0B]/10 hover:border-[#F59E0B]/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">New Users (30d)</p>
                      <p className="text-3xl font-bold text-white mt-2">{dashboardStats?.newUsers || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
                      <FaUserPlus className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ===== ACTIVITY STATS ROW ===== */}
              {activityStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                >
                  <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">New Users (7 Days)</p>
                        <p className="text-3xl font-bold text-white mt-2">{activityStats.weeklyUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                        <FaCalendarAlt className="w-6 h-6 text-[#00D4FF]" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#06D6A0]/10 hover:border-[#06D6A0]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">New Users (Today)</p>
                        <p className="text-3xl font-bold text-white mt-2">{activityStats.todayUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center">
                        <FaClock className="w-6 h-6 text-[#06D6A0]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== QUICK ACTIONS ===== */}
              {canManageUsers && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 mb-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => navigate('/users')}
                      className="flex items-center space-x-2 p-3 bg-[#00D4FF]/10 rounded-lg hover:bg-[#00D4FF]/20 transition-all border border-[#00D4FF]/20 hover:border-[#00D4FF]/40"
                    >
                      <FaUserPlus className="w-5 h-5 text-[#00D4FF]" />
                      <span className="text-sm text-white">Add User</span>
                    </button>
                    <button
                      onClick={() => navigate('/leaves')}
                      className="flex items-center space-x-2 p-3 bg-[#06D6A0]/10 rounded-lg hover:bg-[#06D6A0]/20 transition-all border border-[#06D6A0]/20 hover:border-[#06D6A0]/40"
                    >
                      <FaCalendarAlt className="w-5 h-5 text-[#06D6A0]" />
                      <span className="text-sm text-white">Leave Requests</span>
                    </button>
                    <button
                      onClick={() => navigate('/tasks')}
                      className="flex items-center space-x-2 p-3 bg-[#7C3AED]/10 rounded-lg hover:bg-[#7C3AED]/20 transition-all border border-[#7C3AED]/20 hover:border-[#7C3AED]/40"
                    >
                      <FaTasks className="w-5 h-5 text-[#7C3AED]" />
                      <span className="text-sm text-white">My Tasks</span>
                    </button>
                    <button
                      onClick={() => navigate('/reports')}
                      className="flex items-center space-x-2 p-3 bg-[#F59E0B]/10 rounded-lg hover:bg-[#F59E0B]/20 transition-all border border-[#F59E0B]/20 hover:border-[#F59E0B]/40"
                    >
                      <FaFileAlt className="w-5 h-5 text-[#F59E0B]" />
                      <span className="text-sm text-white">Reports</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ===== RECENT USERS ===== */}
              {recentUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 mb-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FaUserPlus className="text-[#00D4FF]" />
                      Recent Users
                    </h3>
                    <button
                      onClick={() => navigate('/users')}
                      className="text-sm text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentUsers.slice(0, 5).map((recentUser) => (
                      <div key={recentUser._id} className="flex items-center justify-between p-3 bg-[#0A0A0F]/50 rounded-lg hover:bg-[#0A0A0F]/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden">
                            {getUserAvatar(recentUser)}
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
                </motion.div>
              )}

              {/* ===== QUICK STATS SUMMARY ===== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Role Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">👑 Super Admin</span>
                      <span className="text-sm text-white">{users.filter(u => u.role === 'super_admin').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">👥 HR Manager</span>
                      <span className="text-sm text-white">{users.filter(u => u.role === 'hr_manager').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">👤 Staff</span>
                      <span className="text-sm text-white">{users.filter(u => u.role === 'staff').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#06D6A0]/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Department Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Technology</span>
                      <span className="text-sm text-white">{users.filter(u => u.department === 'Technology').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Human Resources</span>
                      <span className="text-sm text-white">{users.filter(u => u.department === 'Human Resources').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Finance</span>
                      <span className="text-sm text-white">{users.filter(u => u.department === 'Finance').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#7C3AED]/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Account Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">✅ Active</span>
                      <span className="text-sm text-green-400">{activeUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">❌ Inactive</span>
                      <span className="text-sm text-red-400">{totalUsers - activeUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">📊 Total</span>
                      <span className="text-sm text-white">{totalUsers}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;