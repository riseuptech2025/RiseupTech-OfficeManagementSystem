import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, 
  FaUserPlus, 
  FaUserCheck, 
  FaBuilding,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaDownload,
  FaUpload,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCode,
  FaServer,
  FaCloud,
  FaMicrochip,
  FaNetworkWired,
  FaBrain,
  FaUserCog,
  FaChevronDown,
  FaHistory,
  FaUserSlash,
  FaUserCheck as FaUserActivate,
  FaCalendarAlt,
  FaClock,
  FaIdCard,
  FaFileAlt,
  FaTasks
} from 'react-icons/fa';
import { authService, userService, dashboardService, profileService } from '../services/api';
import CompanyLogo from '../components/CompanyLogo';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    department: 'Technology',
    phone: '',
    age: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // New state for dashboard features
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchUsers();
    fetchDashboardStats();
    fetchActivityStats();
    fetchRecentUsers();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardService.getStats();
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const response = await dashboardService.getActivity();
      setActivityStats(response.data);
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await dashboardService.getRecentUsers();
      setRecentUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch recent users:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Role-based permission checks
  const getUserRoleLevel = (role) => {
    const roleLevels = {
      'super_admin': 4,
      'ceo': 4,
      'founder': 4,
      'coo': 3,
      'accountant': 3,
      'admin': 3,
      'hr_manager': 2,
      'staff': 1
    };
    return roleLevels[role] || 0;
  };

  const canCreateRole = (currentUserRole, newRole) => {
    const userLevel = getUserRoleLevel(currentUserRole);
    const newRoleLevel = getUserRoleLevel(newRole);
    
    // Super admin, CEO, Founder can create anyone except themselves (level 4)
    if (userLevel === 4) {
      return newRoleLevel < 4; // Can't create super_admin/ceo/founder
    }
    
    // Admin, COO, Accountant can create HR Manager and Staff (level 3)
    if (userLevel === 3) {
      return newRoleLevel <= 2; // Can create hr_manager and staff
    }
    
    // HR Manager can only create staff (level 2)
    if (userLevel === 2) {
      return newRoleLevel === 1; // Can only create staff
    }
    
    // Staff cannot create anyone
    return false;
  };

  const getAvailableRoles = () => {
    const userLevel = getUserRoleLevel(user?.role);
    const roles = [];
    
    if (userLevel === 4) {
      roles.push({ value: 'admin', label: 'Admin' });
      roles.push({ value: 'hr_manager', label: 'HR Manager' });
      roles.push({ value: 'staff', label: 'Staff' });
    } else if (userLevel === 3) {
      roles.push({ value: 'hr_manager', label: 'HR Manager' });
      roles.push({ value: 'staff', label: 'Staff' });
    } else if (userLevel === 2) {
      roles.push({ value: 'staff', label: 'Staff' });
    }
    
    return roles;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields (Name, Email, Password)');
        setLoading(false);
        return;
      }

      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // Check if user can create this role
      if (!canCreateRole(user?.role, formData.role)) {
        setError('You do not have permission to create this role');
        setLoading(false);
        return;
      }

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role || 'staff',
        department: formData.department || 'Technology',
        phone: formData.phone || '',
        age: formData.age ? parseInt(formData.age) : undefined,
      };

      const response = await userService.createUser(userData);
      
      setSuccess(`User ${response.data.name} created successfully!`);
      setShowCreateModal(false);
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'staff', 
        department: 'Technology', 
        phone: '', 
        age: '' 
      });
      await fetchUsers();
      await fetchDashboardStats();
      await fetchActivityStats();
    } catch (error) {
      console.error('Create user error:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Failed to create user');
      } else if (error.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Check if user can edit this role
      if (!canCreateRole(user?.role, selectedUser?.role)) {
        setError('You do not have permission to edit this user');
        setLoading(false);
        return;
      }

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role || 'staff',
        department: formData.department || 'Technology',
        phone: formData.phone || '',
        age: formData.age ? parseInt(formData.age) : undefined,
      };

      if (formData.password) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        userData.password = formData.password;
      }

      const response = await userService.updateUser(selectedUser._id, userData);
      
      setSuccess(`User ${response.data.name} updated successfully!`);
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'staff', 
        department: 'Technology', 
        phone: '', 
        age: '' 
      });
      await fetchUsers();
      await fetchDashboardStats();
    } catch (error) {
      console.error('Update user error:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Failed to update user');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const userToDelete = users.find(u => u._id === id);
    if (!userToDelete) return;

    // Check if user can delete this role
    if (!canCreateRole(user?.role, userToDelete.role)) {
      setError('You do not have permission to delete this user');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await userService.deleteUser(id);
      setSuccess('User deleted successfully!');
      await fetchUsers();
      await fetchDashboardStats();
      await fetchActivityStats();
    } catch (error) {
      console.error('Delete user error:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (id) => {
    const userToToggle = users.find(u => u._id === id);
    if (!userToToggle) return;

    // Check if user can toggle this role
    if (!canCreateRole(user?.role, userToToggle.role)) {
      setError('You do not have permission to modify this user');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = {
        ...userToToggle,
        isActive: !userToToggle.isActive
      };
      await userService.updateUser(id, updatedUser);
      setSuccess(`User ${userToToggle.name} ${userToToggle.isActive ? 'deactivated' : 'activated'} successfully!`);
      await fetchUsers();
      await fetchDashboardStats();
    } catch (error) {
      console.error('Toggle user status error:', error);
      setError(error.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || 'Technology',
      phone: user.phone || '',
      age: user.age || '',
    });
    setShowEditModal(true);
  };

  const openUserDetailsModal = (user) => {
    setSelectedUserDetails(user);
    setShowUserDetailsModal(true);
  };

  const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(user?.role);
  const isAdmin = ['super_admin', 'ceo', 'founder', 'coo', 'accountant', 'admin'].includes(user?.role);
  const isHRManager = user?.role === 'hr_manager';
  const canManageUsers = isSuperAdmin || isAdmin || isHRManager;

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
  const hrManagers = users.filter(u => u.role === 'hr_manager').length;
  const staffUsers = users.filter(u => u.role === 'staff').length;

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Tech icons for floating particles
  const techIcons = [
    { Icon: FaCode, color: '#00D4FF', delay: 0 },
    { Icon: FaServer, color: '#7C3AED', delay: 1.5 },
    { Icon: FaCloud, color: '#06D6A0', delay: 3 },
    { Icon: FaMicrochip, color: '#FF6B6B', delay: 0.5 },
    { Icon: FaNetworkWired, color: '#F59E0B', delay: 2 },
    { Icon: FaBrain, color: '#EC4899', delay: 1 },
  ];

  // Sidebar menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'leaves', label: 'Leaves', icon: FaCalendarAlt, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FaFileAlt, path: '/reports' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/tasks' },
    { id: 'activity', label: 'Activity', icon: FaHistory },
  ];

  if (canManageUsers) {
    menuItems.push({ id: 'management', label: 'Management', icon: FaCog });
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
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
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#00D4FF]/10 flex-shrink-0">
          {sidebarOpen ? (
            <CompanyLogo size="medium" showText={true} textColor="text-[#00D4FF]" />
          ) : (
            <CompanyLogo size="small" showText={false} />
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white shadow-lg shadow-[#00D4FF]/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    } ${!sidebarOpen && 'justify-center'}`}
                  >
                    <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : ''}`} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section - Bottom of Sidebar */}
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
                <h1 className="text-xl font-bold text-white">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative">
                <FaBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
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
          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
              >
                <FaCheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
              >
                <FaExclamationTriangle className="w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <p className="text-3xl font-bold text-white mt-2">{dashboardStats?.roleStats?.find(r => ['super_admin', 'ceo', 'founder', 'admin', 'coo', 'accountant'].includes(r._id))?.count || adminUsers}</p>
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

              {/* Activity Stats Row */}
              {activityStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
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

              {/* Recent Users */}
              {recentUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaUserPlus className="text-[#00D4FF]" />
                    Recent Users
                  </h3>
                  <div className="space-y-3">
                    {recentUsers.map((recentUser) => (
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

              {/* Quick Actions */}
              {canManageUsers && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center space-x-2 p-3 bg-[#00D4FF]/10 rounded-lg hover:bg-[#00D4FF]/20 transition-all border border-[#00D4FF]/20 hover:border-[#00D4FF]/40"
                    >
                      <FaUserPlus className="w-5 h-5 text-[#00D4FF]" />
                      <span className="text-sm text-white">Add User</span>
                    </button>
                    <button className="flex items-center space-x-2 p-3 bg-[#06D6A0]/10 rounded-lg hover:bg-[#06D6A0]/20 transition-all border border-[#06D6A0]/20 hover:border-[#06D6A0]/40">
                      <FaDownload className="w-5 h-5 text-[#06D6A0]" />
                      <span className="text-sm text-white">Export Data</span>
                    </button>
                    <button className="flex items-center space-x-2 p-3 bg-[#7C3AED]/10 rounded-lg hover:bg-[#7C3AED]/20 transition-all border border-[#7C3AED]/20 hover:border-[#7C3AED]/40">
                      <FaUpload className="w-5 h-5 text-[#7C3AED]" />
                      <span className="text-sm text-white">Import Data</span>
                    </button>
                    <button className="flex items-center space-x-2 p-3 bg-[#F59E0B]/10 rounded-lg hover:bg-[#F59E0B]/20 transition-all border border-[#F59E0B]/20 hover:border-[#F59E0B]/40">
                      <FaFilter className="w-5 h-5 text-[#F59E0B]" />
                      <span className="text-sm text-white">Filter Users</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">User Management</h2>
                  <p className="text-sm text-gray-400">Manage all users in the system</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {canManageUsers && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all"
                    >
                      <FaUserPlus className="w-4 h-4" />
                      <span>Add User</span>
                    </button>
                  )}
                  {!canManageUsers && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <FaUserCog className="w-4 h-4" />
                      <span>View only mode</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="ceo">CEO</option>
                  <option value="founder">Founder</option>
                  <option value="admin">Admin</option>
                  <option value="coo">COO</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="accountant">Accountant</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <FaUsers className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg">No users found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                    {canManageUsers && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all"
                      >
                        <FaUserPlus className="inline w-4 h-4 mr-2" />
                        Create your first user
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#0A0A0F]/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employee ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#00D4FF]/5">
                        {filteredUsers.map((user) => (
                          <motion.tr
                            key={user._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden">
                                  {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-sm font-bold">{getUserInitials(user.name)}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">{user.name}</p>
                                  <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              <span className="font-mono">{user.employeeId || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-300">{user.department || '-'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                                {getRoleIcon(user.role)} {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.isActive 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                {canManageUsers && canCreateRole(user?.role, user.role) && (
                                  <>
                                    <button
                                      onClick={() => openEditModal(user)}
                                      className="p-1.5 bg-[#00D4FF]/10 text-[#00D4FF] rounded hover:bg-[#00D4FF]/20 transition-colors"
                                      title="Edit User"
                                    >
                                      <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleUserStatus(user._id)}
                                      className={`p-1.5 rounded transition-colors ${
                                        user.isActive 
                                          ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
                                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                      }`}
                                      title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                    >
                                      {user.isActive ? (
                                        <FaUserSlash className="w-4 h-4" />
                                      ) : (
                                        <FaUserActivate className="w-4 h-4" />
                                      )}
                                    </button>
                                    {(isSuperAdmin || user.role !== 'super_admin') && (
                                      <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                                        title="Delete User"
                                      >
                                        <FaTrash className="w-4 h-4" />
                                      </button>
                                    )}
                                  </>
                                )}
                                <button
                                  onClick={() => openUserDetailsModal(user)}
                                  className="p-1.5 bg-gray-500/10 text-gray-400 rounded hover:bg-gray-500/20 transition-colors"
                                  title="View Details"
                                >
                                  <FaEye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Activity Log</h2>
                <p className="text-sm text-gray-400">View system activity and user actions</p>
              </div>

              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaHistory className="text-[#00D4FF]" />
                    User Activity Statistics
                  </h3>
                </div>

                {activityStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0A0A0F]/50 rounded-lg p-4 border border-[#00D4FF]/10">
                      <p className="text-sm text-gray-400">Weekly New Users</p>
                      <p className="text-2xl font-bold text-white mt-2">{activityStats.weeklyUsers}</p>
                    </div>
                    <div className="bg-[#0A0A0F]/50 rounded-lg p-4 border border-[#06D6A0]/10">
                      <p className="text-sm text-gray-400">Today's New Users</p>
                      <p className="text-2xl font-bold text-white mt-2">{activityStats.todayUsers}</p>
                    </div>
                    <div className="bg-[#0A0A0F]/50 rounded-lg p-4 border border-[#7C3AED]/10">
                      <p className="text-sm text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-white mt-2">{totalUsers}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-[#00D4FF]/10">
                  <p className="text-sm text-gray-400 text-center">
                    Activity logs will be available in the next version
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Management Tab */}
          {activeTab === 'management' && canManageUsers && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">System Management</h2>
                <p className="text-sm text-gray-400">Manage system settings and configurations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaBuilding className="text-[#00D4FF]" />
                    Department Overview
                  </h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/50 rounded">
                      <span className="text-gray-300">Executive</span>
                      <span className="text-white font-medium">{users.filter(u => u.department === 'Executive').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/50 rounded">
                      <span className="text-gray-300">Human Resources</span>
                      <span className="text-white font-medium">{users.filter(u => u.department === 'Human Resources').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/50 rounded">
                      <span className="text-gray-300">Finance</span>
                      <span className="text-white font-medium">{users.filter(u => u.department === 'Finance').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/50 rounded">
                      <span className="text-gray-300">Operations</span>
                      <span className="text-white font-medium">{users.filter(u => u.department === 'Operations').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/50 rounded">
                      <span className="text-gray-300">Technology</span>
                      <span className="text-white font-medium">{users.filter(u => u.department === 'Technology').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/50 rounded">
                      <span className="text-gray-300">Marketing</span>
                      <span className="text-white font-medium">{users.filter(u => u.department === 'Marketing').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/50 rounded">
                      <span className="text-gray-300">Sales</span>
                      <span className="text-white font-medium">{users.filter(u => u.department === 'Sales').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaIdCard className="text-[#00D4FF]" />
                    Role Distribution
                  </h3>
                  <div className="mt-4 space-y-2">
                    {dashboardStats?.roleStats?.map((stat) => (
                      <div key={stat._id} className="flex justify-between items-center p-2 bg-[#0A0A0F]/50 rounded">
                        <span className="flex items-center gap-2">
                          {getRoleIcon(stat._id)}
                          <span className="text-gray-300 capitalize">{stat._id}</span>
                        </span>
                        <span className="text-white font-medium">{stat.count}</span>
                      </div>
                    ))}
                    {!dashboardStats?.roleStats && (
                      <div className="flex justify-between items-center p-2 bg-[#0A0A0F]/50 rounded">
                        <span className="text-gray-300">Loading...</span>
                        <span className="text-white font-medium">-</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111118] rounded-2xl p-8 max-w-2xl w-full border border-[#00D4FF]/20 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Create New User</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="employee@riseup.tech"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Password *</label>
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="temp123456 (min 6 chars)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    >
                      {getAvailableRoles().map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    >
                      <option value="Executive">Executive</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Technology">Technology</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create User'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111118] rounded-2xl p-8 max-w-2xl w-full border border-[#00D4FF]/20 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="employee@riseup.tech"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">New Password (Optional)</label>
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    >
                      {getAvailableRoles().map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    >
                      <option value="Executive">Executive</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Technology">Technology</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      'Update User'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserDetailsModal && selectedUserDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111118] rounded-2xl p-8 max-w-3xl w-full border border-[#00D4FF]/20 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">User Details</h3>
                <button
                  onClick={() => setShowUserDetailsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {selectedUserDetails.profilePicture ? (
                      <img src={selectedUserDetails.profilePicture} alt={selectedUserDetails.name} className="w-full h-full object-cover" />
                    ) : (
                      getUserInitials(selectedUserDetails.name)
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{selectedUserDetails.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(selectedUserDetails.role)}`}>
                        {getRoleIcon(selectedUserDetails.role)} {selectedUserDetails.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUserDetails.isActive 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {selectedUserDetails.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400">Employee ID</p>
                    <p className="text-sm text-white font-mono">{selectedUserDetails.employeeId || 'N/A'}</p>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-white">{selectedUserDetails.email}</p>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm text-white">{selectedUserDetails.phone || 'Not specified'}</p>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400">Department</p>
                    <p className="text-sm text-white">{selectedUserDetails.department || 'Not specified'}</p>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400">Age</p>
                    <p className="text-sm text-white">{selectedUserDetails.age || 'Not specified'}</p>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400">Last Login</p>
                    <p className="text-sm text-white">{selectedUserDetails.lastLogin ? new Date(selectedUserDetails.lastLogin).toLocaleString() : 'Never'}</p>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400">Joined</p>
                    <p className="text-sm text-white">{new Date(selectedUserDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-[#0A0A0F]/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400">About</p>
                    <p className="text-sm text-white">{selectedUserDetails.about || 'No about information'}</p>
                  </div>
                </div>

                {/* Skills */}
                {selectedUserDetails.skills && selectedUserDetails.skills.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedUserDetails.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] rounded-full border border-[#00D4FF]/20 text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hobbies */}
                {selectedUserDetails.hobbies && selectedUserDetails.hobbies.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Hobbies</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedUserDetails.hobbies.map((hobby, index) => (
                        <span key={index} className="px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full border border-[#7C3AED]/20 text-sm">
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {selectedUserDetails.education && selectedUserDetails.education.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Education</h5>
                    <div className="space-y-2">
                      {selectedUserDetails.education.map((edu, index) => (
                        <div key={index} className="bg-[#0A0A0F]/50 rounded-lg p-3">
                          <p className="text-sm text-white font-medium">{edu.degree}</p>
                          <p className="text-xs text-gray-400">{edu.institution} - {edu.year}</p>
                          {edu.description && <p className="text-xs text-gray-500 mt-1">{edu.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selectedUserDetails.experience && selectedUserDetails.experience.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Experience</h5>
                    <div className="space-y-2">
                      {selectedUserDetails.experience.map((exp, index) => (
                        <div key={index} className="bg-[#0A0A0F]/50 rounded-lg p-3">
                          <p className="text-sm text-white font-medium">{exp.position}</p>
                          <p className="text-xs text-gray-400">{exp.company} - {exp.startDate} to {exp.endDate || 'Present'}</p>
                          {exp.description && <p className="text-xs text-gray-500 mt-1">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;