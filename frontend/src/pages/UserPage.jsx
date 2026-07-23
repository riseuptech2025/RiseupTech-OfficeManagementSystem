// pages/Users/UserPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, 
  FaUserPlus, 
  FaUserCheck, 
  FaUserSlash,
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
  FaCalendarAlt,
  FaTasks,
  FaFileAlt,
  FaHistory,
  FaIdCard
} from 'react-icons/fa';
import { authService, userService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CompanyLogo from '../components/CompanyLogo';

const UserPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
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
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchUsers();

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
    
    if (userLevel === 4) {
      return newRoleLevel < 4;
    }
    if (userLevel === 3) {
      return newRoleLevel <= 2;
    }
    if (userLevel === 2) {
      return newRoleLevel === 1;
    }
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

      await userService.createUser(userData);
      
      setSuccess('User created successfully!');
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
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
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

      await userService.updateUser(selectedUser._id, userData);
      
      setSuccess('User updated successfully!');
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
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const userToDelete = users.find(u => u._id === id);
    if (!userToDelete) return;

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
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (id) => {
    const userToToggle = users.find(u => u._id === id);
    if (!userToToggle) return;

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
      setSuccess(`User ${userToToggle.isActive ? 'deactivated' : 'activated'} successfully!`);
      await fetchUsers();
    } catch (error) {
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
  const searchLower = searchTerm.toLowerCase();
  const matchesSearch = 
    (u.name?.toLowerCase() || '').includes(searchLower) ||
    (u.email?.toLowerCase() || '').includes(searchLower) ||
    (u.employeeId?.toLowerCase() || '').includes(searchLower);
  const matchesRole = filterRole === 'all' || u.role === filterRole;
  return matchesSearch && matchesRole;
});

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
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
        />

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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-2">{totalUsers}</p>
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
                  <p className="text-3xl font-bold text-white mt-2">{activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center">
                  <FaUserCheck className="w-6 h-6 text-[#06D6A0]" />
                </div>
              </div>
            </div>

            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#7C3AED]/10 hover:border-[#7C3AED]/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Admin Users</p>
                  <p className="text-3xl font-bold text-white mt-2">{adminUsers}</p>
                </div>
                <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
                  <FaUserCog className="w-6 h-6 text-[#7C3AED]" />
                </div>
              </div>
            </div>

            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#F59E0B]/10 hover:border-[#F59E0B]/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Staff Users</p>
                  <p className="text-3xl font-bold text-white mt-2">{staffUsers}</p>
                </div>
                <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
                  <FaUserCircle className="w-6 h-6 text-[#F59E0B]" />
                </div>
              </div>
            </div>
          </div>

          {/* Header with Action Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">User Directory</h2>
              <p className="text-sm text-gray-400">View and manage all users</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {canManageUsers && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all cursor-pointer z-10 relative"
                >
                  <FaUserPlus className="w-4 h-4" />
                  Add User
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                    {filteredUsers.map((userItem) => (
                      <motion.tr
                        key={userItem._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden">
                              {userItem.profilePicture ? (
                                <img src={userItem.profilePicture} alt={userItem.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold">{getUserInitials(userItem.name)}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{userItem.name}</p>
                              <p className="text-xs text-gray-400">{userItem.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                          {userItem.employeeId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{userItem.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{userItem.department || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(userItem.role)}`}>
                            {getRoleIcon(userItem.role)} {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userItem.isActive 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {userItem.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {canManageUsers && canCreateRole(user?.role, userItem.role) && (
                              <>
                                <button
                                  onClick={() => openEditModal(userItem)}
                                  className="p-1.5 bg-[#00D4FF]/10 text-[#00D4FF] rounded hover:bg-[#00D4FF]/20 transition-colors"
                                  title="Edit User"
                                >
                                  <FaEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(userItem._id)}
                                  className={`p-1.5 rounded transition-colors ${
                                    userItem.isActive 
                                      ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
                                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                  }`}
                                  title={userItem.isActive ? 'Deactivate User' : 'Activate User'}
                                >
                                  {userItem.isActive ? (
                                    <FaUserSlash className="w-4 h-4" />
                                  ) : (
                                    <FaUserCheck className="w-4 h-4" />
                                  )}
                                </button>
                                {(isSuperAdmin || userItem.role !== 'super_admin') && (
                                  <button
                                    onClick={() => handleDeleteUser(userItem._id)}
                                    className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                                    title="Delete User"
                                  >
                                    <FaTrash className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => openUserDetailsModal(userItem)}
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
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
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
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
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
          </div>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserDetailsModal && selectedUserDetails && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserPage;