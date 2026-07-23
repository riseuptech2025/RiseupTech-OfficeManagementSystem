// pages/PasswordManager/PasswordManagerPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock,
  FaPlus,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTrash,
  FaShare,
  FaUsers,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaKey,
  FaGlobe,
  FaUser,
  FaEnvelope,
  FaTag,
  FaCopy,
  FaShieldAlt,
  FaChartPie,
  FaChartLine,
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaHistory,
  FaCog,
  FaReceipt,
  FaTasks,
  FaFileAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaBuilding
} from 'react-icons/fa';
import { authService, userService } from '../../services/api';
import { passwordManagerService } from '../../services/passwordManagerService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const PasswordManagerPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [shareUser, setShareUser] = useState('');
  const [shareAccessLevel, setShareAccessLevel] = useState('Viewer');

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchPasswords();
    fetchStats();
    fetchUsers();
  }, []);

  const fetchPasswords = async () => {
    try {
      const response = await passwordManagerService.getPasswords();
      setPasswords(response.data);
    } catch (error) {
      console.error('Failed to fetch passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await passwordManagerService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo'].includes(user?.role);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getStrengthColor = (strength) => {
    const colors = {
      'Very Strong': 'text-green-500 bg-green-500/10',
      'Strong': 'text-blue-500 bg-blue-500/10',
      'Medium': 'text-yellow-500 bg-yellow-500/10',
      'Weak': 'text-red-500 bg-red-500/10'
    };
    return colors[strength] || 'text-gray-500 bg-gray-500/10';
  };

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = p.websiteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.websiteUrl?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.websiteCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/home' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/users' },
    { id: 'leaves', label: 'Leaves', icon: FaCalendarAlt, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FaFileAlt, path: '/reports' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/tasks' },
    { id: 'passwords', label: 'Password Manager', icon: FaLock, path: '/passwords' },
    { id: 'account', label: 'Account', icon: FaReceipt, path: '/account' },
    { id: 'customers', label: 'Customers', icon: FaUsers, path: '/customers' },
    { id: 'finance', label: 'Finance', icon: FaMoneyBillWave, path: '/finance' },
    { id: 'policy', label: 'Policy Center', icon: FaFileAlt, path: '/policy' },
    { id: 'activity', label: 'Activity', icon: FaHistory, path: '/activity' },
    { id: 'management', label: 'Management', icon: FaCog, path: '/management' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <Navbar 
          user={user}
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        <div className="p-6">
          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
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
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
              >
                <FaExclamationTriangle className="w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FaLock className="text-[#00D4FF]" />
                Password Manager
              </h1>
              <p className="text-gray-400 mt-1">Manage passwords for websites created by Riseup-Tech</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all"
            >
              <FaPlus className="w-4 h-4" />
              Add Password
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#00D4FF]/10">
                <p className="text-sm text-gray-400">Total Passwords</p>
                <p className="text-2xl font-bold text-white">{stats.totalPasswords}</p>
              </div>
              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#06D6A0]/10">
                <p className="text-sm text-gray-400">Shared</p>
                <p className="text-2xl font-bold text-[#06D6A0]">{stats.totalShared}</p>
              </div>
              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#F59E0B]/10">
                <p className="text-sm text-gray-400">Created by You</p>
                <p className="text-2xl font-bold text-[#F59E0B]">{stats.totalCreated}</p>
              </div>
              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#7C3AED]/10">
                <p className="text-sm text-gray-400">Assigned to You</p>
                <p className="text-2xl font-bold text-[#7C3AED]">{stats.totalAssigned}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              <option value="all">All Categories</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Blog">Blog</option>
              <option value="Corporate">Corporate</option>
              <option value="Portfolio">Portfolio</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Social Media">Social Media</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Passwords Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
            </div>
          ) : filteredPasswords.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaLock className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No passwords found</p>
              <p className="text-sm">Add your first password entry</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPasswords.map((pwd) => (
                <motion.div
                  key={pwd._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 flex items-center justify-center">
                        <FaGlobe className="text-[#00D4FF] w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{pwd.websiteName}</h3>
                        <a 
                          href={pwd.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-[#00D4FF] hover:underline"
                        >
                          {pwd.websiteUrl}
                        </a>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStrengthColor(pwd.passwordStrength)}`}>
                      {pwd.passwordStrength}
                    </span>
                  </div>

                  {/* Credentials */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FaUser className="text-gray-400 w-4 h-4" />
                      <span className="text-gray-300">{pwd.username}</span>
                      <button
                        onClick={() => copyToClipboard(pwd.username)}
                        className="text-gray-500 hover:text-[#00D4FF] transition-colors ml-auto"
                        title="Copy username"
                      >
                        <FaCopy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FaKey className="text-gray-400 w-4 h-4" />
                      <span className="text-gray-300">
                        {showPassword[pwd._id] ? pwd.password : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(pwd._id)}
                        className="text-gray-500 hover:text-[#00D4FF] transition-colors ml-auto"
                      >
                        {showPassword[pwd._id] ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(pwd.password)}
                        className="text-gray-500 hover:text-[#00D4FF] transition-colors"
                        title="Copy password"
                      >
                        <FaCopy className="w-3 h-3" />
                      </button>
                    </div>
                    {pwd.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <FaEnvelope className="text-gray-400 w-4 h-4" />
                        <span className="text-gray-300">{pwd.email}</span>
                      </div>
                    )}
                    {pwd.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pwd.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-[#0A0A0F] text-[#00D4FF] px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-[#00D4FF]/10 pt-3">
                    <span>Last changed: {formatDate(pwd.lastChanged)}</span>
                    <div className="flex items-center gap-2">
                      {pwd.sharedWith?.length > 0 && (
                        <span className="text-[#06D6A0]" title={`Shared with ${pwd.sharedWith.length} users`}>
                          <FaUsers className="w-3 h-3 inline mr-1" />
                          {pwd.sharedWith.length}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPassword(pwd);
                          setShowViewModal(true);
                        }}
                        className="text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors"
                      >
                        <FaEye className="w-3 h-3" />
                      </button>
                      {(isAdmin || pwd.createdBy?._id === user?._id) && (
                        <button
                          onClick={() => {
                            setSelectedPassword(pwd);
                            setIsEditing(true);
                            setShowCreateModal(true);
                          }}
                          className="text-[#F59E0B] hover:text-[#F59E0B]/80 transition-colors"
                        >
                          <FaEdit className="w-3 h-3" />
                        </button>
                      )}
                      {(isAdmin || pwd.createdBy?._id === user?._id) && (
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this password entry?')) {
                              passwordManagerService.deletePassword(pwd._id);
                              fetchPasswords();
                              fetchStats();
                              setSuccess('Password deleted successfully!');
                              setTimeout(() => setSuccess(''), 3000);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal - Simplified for brevity */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111118] rounded-2xl p-8 max-w-lg w-full border border-[#00D4FF]/20 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit Password' : 'Add Password'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setIsEditing(false);
                    setSelectedPassword(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Website Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Riseup-Tech Blog"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Website URL *</label>
                  <input
                    type="url"
                    placeholder="https://blog.riseuptech.com"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Username *</label>
                  <input
                    type="text"
                    placeholder="admin"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Password *</label>
                  <input
                    type="text"
                    placeholder="Enter password"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all"
                  >
                    Save Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsEditing(false);
                      setSelectedPassword(null);
                    }}
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
    </div>
  );
};

export default PasswordManagerPage;