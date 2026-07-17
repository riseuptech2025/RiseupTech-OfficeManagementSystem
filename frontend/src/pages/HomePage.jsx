// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaBrain,
  FaMoneyBillWave,
  FaBuilding,
  FaRocket,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBell,
  FaCalendarCheck,
  FaFileInvoice,
  FaHandshake,
  FaUserShield,
  FaUsersCog,
  FaChartPie,
  FaArrowRight,
  FaCrown,
  FaMedal,
  FaGem,
  FaLightbulb,
  FaSync,
  FaDownload,
  FaPrint,
  FaExpand,
  FaCompress,
  FaLongArrowAltUp,
  FaLongArrowAltDown
} from 'react-icons/fa';
import { authService, userService, dashboardService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { financeService } from '../services/financeService';
import { receiptService } from '../services/receiptService';
import { notificationService } from '../services/notificationService';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [financeOverview, setFinanceOverview] = useState(null);
  const [receiptStats, setReceiptStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showFullStats, setShowFullStats] = useState(false);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchDashboardData();
    fetchFinanceData();
    fetchReceiptStats();
    fetchUnreadCount();

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

  const fetchFinanceData = async () => {
    try {
      const response = await financeService.getOverview();
      setFinanceOverview(response.data);
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    }
  };

  const fetchReceiptStats = async () => {
    try {
      const response = await receiptService.getStats();
      setReceiptStats(response.data);
    } catch (error) {
      console.error('Failed to fetch receipt stats:', error);
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

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // ============================================
  // ROLE-BASED PERMISSION CHECKS
  // ============================================
  const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(user?.role);
  const isAdmin = ['super_admin', 'ceo', 'founder', 'coo', 'accountant', 'admin'].includes(user?.role);
  const isHRManager = user?.role === 'hr_manager';
  const canManageUsers = isSuperAdmin || isAdmin || isHRManager;
  const canViewFinance = isSuperAdmin || isAdmin;
  const canViewReceipts = isSuperAdmin || isAdmin || isHRManager;
  const isStaff = user?.role === 'staff';
  const canViewQuickActions = isSuperAdmin || isAdmin || isHRManager;

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  // Stats calculation
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => ['super_admin', 'ceo', 'founder', 'admin', 'coo', 'accountant'].includes(u.role)).length;
  const staffUsers = users.filter(u => u.role === 'staff').length;
  const hrUsers = users.filter(u => u.role === 'hr_manager').length;

  // Growth calculations
  const userGrowthRate = totalUsers > 0 ? ((dashboardStats?.newUsers || 0) / totalUsers * 100).toFixed(1) : 0;
  const activeRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(0) : 0;
  const sharePrice = financeOverview?.sharePrice || 15;
  const initialSharePrice = 15;
  const shareGrowth = ((sharePrice - initialSharePrice) / initialSharePrice * 100).toFixed(1);

  // Tech icons for floating particles
  const techIcons = [
    { Icon: FaCode, color: '#00D4FF', delay: 0 },
    { Icon: FaServer, color: '#7C3AED', delay: 1.5 },
    { Icon: FaCloud, color: '#06D6A0', delay: 3 },
    { Icon: FaMicrochip, color: '#FF6B6B', delay: 0.5 },
    { Icon: FaNetworkWired, color: '#F59E0B', delay: 2 },
    { Icon: FaBrain, color: '#EC4899', delay: 1 },
  ];

  // ============================================
  // STAFF-ONLY QUICK STATS (Limited view)
  // ============================================
  const staffQuickStats = [
    { 
      label: 'Active Users', 
      value: `${activeUsers}/${totalUsers}`, 
      icon: FaUsers, 
      color: '#06D6A0',
      change: `${activeRate}% Active`,
      trend: 'up'
    },
    { 
      label: 'Total Users', 
      value: formatNumber(totalUsers), 
      icon: FaUserCheck, 
      color: '#00D4FF',
      change: `+${dashboardStats?.newUsers || 0} this month`,
      trend: 'up'
    },
  ];

  // ============================================
  // ADMIN QUICK STATS (Full view)
  // ============================================
  const adminQuickStats = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(financeOverview?.totalEarnings || 0), 
      icon: FaMoneyBillWave, 
      color: '#00D4FF',
      change: '+12.5%',
      trend: 'up'
    },
    { 
      label: 'Company Value', 
      value: formatCurrency(financeOverview?.companyValue || 15000), 
      icon: FaBuilding, 
      color: '#7C3AED',
      change: shareGrowth + '%',
      trend: parseFloat(shareGrowth) >= 0 ? 'up' : 'down'
    },
    { 
      label: 'Active Users', 
      value: `${activeUsers}/${totalUsers}`, 
      icon: FaUsers, 
      color: '#06D6A0',
      change: `${activeRate}% Active`,
      trend: 'up'
    },
    { 
      label: 'Share Price', 
      value: `Rs. ${sharePrice.toFixed(2)}`, 
      icon: FaGem, 
      color: '#F59E0B',
      change: `${shareGrowth}%`,
      trend: parseFloat(shareGrowth) >= 0 ? 'up' : 'down'
    },
  ];

  // Determine which stats to show
  const quickStats = isStaff ? staffQuickStats : adminQuickStats;

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
            <linearGradient id="gradient-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06D6A0" stopOpacity="0.3" />
            </linearGradient>
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
          unreadCount={unreadCount}
        />

        {/* ===== PAGE CONTENT ===== */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
                <p className="text-gray-400">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ===== WELCOME BANNER ===== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#00D4FF]/10 via-[#7C3AED]/10 to-[#06D6A0]/10 rounded-2xl p-6 mb-6 border border-[#00D4FF]/20 backdrop-blur-sm"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">
                        Welcome back, {user?.name}! 👋
                      </h2>
                      <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3" />
                        Online
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                      <span className="text-[#00D4FF]">●</span>
                      System running smoothly • {activeUsers} active users
                      {!isStaff && ` • ${formatCurrency(financeOverview?.totalEarnings || 0)} total revenue`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canManageUsers && (
                      <button
                        onClick={() => navigate('/users')}
                        className="px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all flex items-center gap-2 text-sm"
                      >
                        <FaUserPlus className="w-4 h-4" />
                        Add User
                      </button>
                    )}
                    {canViewFinance && (
                      <button
                        onClick={() => navigate('/finance')}
                        className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#7C3AED]/20 transition-all flex items-center gap-2 text-sm"
                      >
                        <FaChartLine className="w-4 h-4" />
                        View Finance
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ===== COMPANY STATUS OVERVIEW ===== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
              >
                <div className="bg-gradient-to-br from-[#00D4FF]/10 to-[#00D4FF]/5 rounded-xl p-4 border border-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Company Status</p>
                      <p className="text-lg font-bold text-[#06D6A0] flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-[#06D6A0] rounded-full animate-pulse"></span>
                        Operational
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center">
                      <FaCheckCircle className="w-5 h-5 text-[#06D6A0]" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 rounded-xl p-4 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Growth Rate</p>
                      <p className="text-lg font-bold text-[#F59E0B] flex items-center gap-2 mt-1">
                        <FaArrowUp className="w-4 h-4" />
                        {userGrowthRate}% 
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
                      <FaArrowUp className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#7C3AED]/5 rounded-xl p-4 border border-[#7C3AED]/20 hover:border-[#7C3AED]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Share Price</p>
                      <p className="text-lg font-bold text-[#7C3AED] mt-1">Rs. {sharePrice.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
                      <FaGem className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#00D4FF]/10 to-[#00D4FF]/5 rounded-xl p-4 border border-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Active Rate</p>
                      <p className="text-lg font-bold text-[#00D4FF] mt-1">{activeRate}%</p>
                    </div>
                    <div className="w-10 h-10 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                      <FaUsers className="w-5 h-5 text-[#00D4FF]" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ===== QUICK STATS CARDS ===== */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                      className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-5 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
                          <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs ${stat.trend === 'up' ? 'text-[#06D6A0]' : 'text-[#EF4444]'} flex items-center gap-1`}>
                              {stat.trend === 'up' ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                              {stat.change}
                            </span>
                          </div>
                        </div>
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: stat.color }} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ===== MAIN DASHBOARD GRID ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ===== LEFT COLUMN: STATS & ACTIVITY ===== */}
                <div className="lg:col-span-2 space-y-6">
                  {/* ===== STATS GRID ===== */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-5 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-400">Total Users</p>
                        <div className="w-8 h-8 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center">
                          <FaUsers className="w-4 h-4 text-[#00D4FF]" />
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-white">{formatNumber(totalUsers)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="text-[#06D6A0]">+{dashboardStats?.newUsers || 0}</span> new this month
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Active:</span>
                            <span className="text-[#06D6A0] font-medium">{activeUsers}</span>
                          </div>
                          <div className="w-20 h-1.5 bg-[#0A0A0F] rounded-full mt-1">
                            <div 
                              className="h-1.5 bg-gradient-to-r from-[#06D6A0] to-[#00D4FF] rounded-full"
                              style={{ width: `${activeRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* ===== REVENUE CARD - Hidden for Staff ===== */}
                    {!isStaff && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-5 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-gray-400">Revenue</p>
                          <div className="w-8 h-8 bg-[#06D6A0]/10 rounded-lg flex items-center justify-center">
                            <FaMoneyBillWave className="w-4 h-4 text-[#06D6A0]" />
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-white">{formatCurrency(financeOverview?.totalEarnings || 0)}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span className="text-[#06D6A0]">+12.5%</span>
                            <span>from last month</span>
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                            <span>💳 {receiptStats?.totalReceipts || 0} receipts</span>
                            <span>💵 {formatCurrency(receiptStats?.totalAmount || 0)} total</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* ===== ACTIVITY STATS ===== */}
                  {activityStats && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-5 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <FaChartLine className="text-[#00D4FF]" />
                          Activity Overview
                        </h3>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedTimeframe('week')}
                            className={`px-2 py-1 rounded text-xs transition-all ${selectedTimeframe === 'week' ? 'bg-[#00D4FF] text-white' : 'text-gray-400 hover:text-white'}`}
                          >
                            Week
                          </button>
                          <button 
                            onClick={() => setSelectedTimeframe('month')}
                            className={`px-2 py-1 rounded text-xs transition-all ${selectedTimeframe === 'month' ? 'bg-[#00D4FF] text-white' : 'text-gray-400 hover:text-white'}`}
                          >
                            Month
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-400">Weekly Users</p>
                          <p className="text-xl font-bold text-white">{activityStats.weeklyUsers}</p>
                        </div>
                        <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-400">Today</p>
                          <p className="text-xl font-bold text-[#00D4FF]">{activityStats.todayUsers}</p>
                        </div>
                        <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-400">Avg Daily</p>
                          <p className="text-xl font-bold text-white">
                            {Math.round(activityStats.weeklyUsers / 7)}
                          </p>
                        </div>
                        <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-400">Growth</p>
                          <p className="text-xl font-bold text-[#06D6A0]">
                            {activityStats.weeklyUsers > 0 ? '+' : ''}
                            {Math.round((activityStats.todayUsers / (activityStats.weeklyUsers / 7) - 1) * 100)}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ===== QUICK ACTIONS - Hidden for Staff ===== */}
                  {canViewQuickActions && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-5 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                    >
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <FaRocket className="text-[#00D4FF]" />
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                          onClick={() => navigate('/users')}
                          className="flex items-center gap-2 p-3 bg-[#00D4FF]/10 rounded-lg hover:bg-[#00D4FF]/20 transition-all border border-[#00D4FF]/20 hover:border-[#00D4FF]/40 group"
                        >
                          <FaUserPlus className="w-4 h-4 text-[#00D4FF] group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-white">Add User</span>
                        </button>
                        <button
                          onClick={() => navigate('/leaves')}
                          className="flex items-center gap-2 p-3 bg-[#06D6A0]/10 rounded-lg hover:bg-[#06D6A0]/20 transition-all border border-[#06D6A0]/20 hover:border-[#06D6A0]/40 group"
                        >
                          <FaCalendarAlt className="w-4 h-4 text-[#06D6A0] group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-white">Leaves</span>
                        </button>
                        <button
                          onClick={() => navigate('/tasks')}
                          className="flex items-center gap-2 p-3 bg-[#7C3AED]/10 rounded-lg hover:bg-[#7C3AED]/20 transition-all border border-[#7C3AED]/20 hover:border-[#7C3AED]/40 group"
                        >
                          <FaTasks className="w-4 h-4 text-[#7C3AED] group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-white">Tasks</span>
                        </button>
                        <button
                          onClick={() => navigate('/reports')}
                          className="flex items-center gap-2 p-3 bg-[#F59E0B]/10 rounded-lg hover:bg-[#F59E0B]/20 transition-all border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 group"
                        >
                          <FaFileAlt className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-white">Reports</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* ===== RIGHT COLUMN: RECENT ACTIVITY & STATS ===== */}
                <div className="space-y-6">
                  {/* ===== RECENT USERS ===== */}
                  {recentUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-5 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <FaUsers className="text-[#00D4FF]" />
                          Recent Users
                        </h3>
                        <button
                          onClick={() => navigate('/users')}
                          className="text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors flex items-center gap-1"
                        >
                          View All <FaArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentUsers.slice(0, 4).map((recentUser) => (
                          <div key={recentUser._id} className="flex items-center justify-between p-2 bg-[#0A0A0F]/50 rounded-lg hover:bg-[#0A0A0F]/70 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                {getUserAvatar(recentUser)}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-white">{recentUser.name}</p>
                                <p className="text-xs text-gray-400">{recentUser.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadge(recentUser.role)}`}>
                                {getRoleIcon(recentUser.role)}
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
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-5 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all">
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Team Overview</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/30 rounded-lg">
                          <span className="text-sm text-gray-300 flex items-center gap-2">
                            <FaCrown className="text-amber-400" /> Leadership
                          </span>
                          <span className="text-sm text-white font-medium">
                            {users.filter(u => ['super_admin', 'ceo', 'founder', 'coo'].includes(u.role)).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/30 rounded-lg">
                          <span className="text-sm text-gray-300 flex items-center gap-2">
                            <FaUserShield className="text-blue-400" /> Admins
                          </span>
                          <span className="text-sm text-white font-medium">
                            {users.filter(u => ['admin', 'accountant'].includes(u.role)).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/30 rounded-lg">
                          <span className="text-sm text-gray-300 flex items-center gap-2">
                            <FaUsersCog className="text-green-400" /> HR Managers
                          </span>
                          <span className="text-sm text-white font-medium">{hrUsers}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/30 rounded-lg">
                          <span className="text-sm text-gray-300 flex items-center gap-2">
                            <FaUsers className="text-gray-400" /> Staff
                          </span>
                          <span className="text-sm text-white font-medium">{staffUsers}</span>
                        </div>
                      </div>
                    </div>

                    {/* ===== COMPANY VALUE - Hidden for Staff ===== */}
                    {!isStaff && (
                      <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#00D4FF]/10 rounded-xl p-5 border border-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all">
                        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Company Value</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(financeOverview?.companyValue || 15000)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Shares: {financeOverview?.totalShares || 1000} • Price: Rs. {sharePrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${parseFloat(shareGrowth) >= 0 ? 'text-[#06D6A0]' : 'text-[#EF4444]'}`}>
                              {parseFloat(shareGrowth) >= 0 ? '+' : ''}{shareGrowth}%
                            </span>
                            <p className="text-xs text-gray-400">Since inception</p>
                          </div>
                        </div>
                        <div className="mt-3 w-full bg-[#0A0A0F] rounded-full h-2">
                          <div 
                            className="h-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full"
                            style={{ 
                              width: `${Math.min((financeOverview?.companyValue || 15000) / 30000 * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* ===== FINANCIAL HEALTH BANNER - Hidden for Staff ===== */}
              {!isStaff && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 bg-gradient-to-r from-[#00D4FF]/5 via-[#7C3AED]/5 to-[#06D6A0]/5 rounded-2xl p-6 border border-[#00D4FF]/10"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                        <FaBuilding className="w-6 h-6 text-[#00D4FF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Financial Health</p>
                        <p className="text-xs text-gray-400">
                          {financeOverview?.netProfit >= 0 ? 'Profitable' : 'In Loss'} • 
                          Revenue: {formatCurrency(financeOverview?.totalEarnings || 0)} • 
                          Expenses: {formatCurrency(financeOverview?.totalExpenses || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="text-center px-4 py-2 bg-[#0A0A0F]/50 rounded-lg">
                        <p className="text-xs text-gray-400">Profit</p>
                        <p className={`text-sm font-bold ${financeOverview?.netProfit >= 0 ? 'text-[#06D6A0]' : 'text-[#EF4444]'}`}>
                          {formatCurrency(financeOverview?.netProfit || 0)}
                        </p>
                      </div>
                      <div className="text-center px-4 py-2 bg-[#0A0A0F]/50 rounded-lg">
                        <p className="text-xs text-gray-400">Shareholders</p>
                        <p className="text-sm font-bold text-white">{financeOverview?.shareholders?.length || 0}</p>
                      </div>
                      <div className="text-center px-4 py-2 bg-[#0A0A0F]/50 rounded-lg">
                        <p className="text-xs text-gray-400">Receipts</p>
                        <p className="text-sm font-bold text-white">{receiptStats?.totalReceipts || 0}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;