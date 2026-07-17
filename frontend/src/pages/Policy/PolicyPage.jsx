// pages/Policy/PolicyPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFileAlt,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBuilding,
  FaUsers,
  FaUserTie,
  FaUserShield,
  FaShieldAlt,
  FaUserCog,
  FaUser,
  FaHandshake,
  FaFilePdf,
  FaSignature,
  FaClock,
  FaTag,
  FaCalendarAlt,
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaChartLine,
  FaReceipt,
  FaTasks,
  FaHistory,
  FaCog,
  FaMoneyBillWave,
  FaCalendar
} from 'react-icons/fa';
import { authService } from '../../services/api';
import { policyService } from '../../services/policyService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import PolicyModal from '../../components/Policy/PolicyModal';
import PolicyViewModal from '../../components/Policy/PolicyViewModal';

const PolicyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await policyService.getPolicies();
      setPolicies(response.data);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isAdmin = ['super_admin', 'admin', 'ceo', 'founder'].includes(user?.role);
  const isSuperAdmin = ['super_admin'].includes(user?.role);

  const getRoleIcon = (role) => {
    switch(role) {
      case 'super_admin': return <FaUserShield className="text-purple-400" />;
      case 'admin': return <FaUserCog className="text-blue-400" />;
      case 'ceo': return <FaUserTie className="text-red-400" />;
      case 'founder': return <FaUserTie className="text-amber-400" />;
      case 'hr_manager': return <FaUsers className="text-green-400" />;
      default: return <FaUser className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Draft': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'Published': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Under Review': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Archived': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors['Draft'];
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'Low': 'text-green-400',
      'Medium': 'text-yellow-400',
      'High': 'text-orange-400',
      'Critical': 'text-red-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewPolicy = async (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  const handleDownloadPolicy = async (policyId) => {
    try {
      await policyService.downloadPolicy(policyId);
      setSuccess('Policy downloaded successfully!');
      await fetchPolicies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to download policy');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      await policyService.deletePolicy(policyId);
      setSuccess('Policy deleted successfully!');
      await fetchPolicies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete policy');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          policy.policyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          policy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || policy.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category) => {
    const icons = {
      'Employee Handbook': <FaFileAlt className="text-blue-400" />,
      'HR Policy': <FaUsers className="text-green-400" />,
      'CEO Policy': <FaUserTie className="text-red-400" />,
      'Staff Policy': <FaUser className="text-gray-400" />,
      'Customer Policy': <FaHandshake className="text-cyan-400" />,
      'Shareholder Policy': <FaBuilding className="text-purple-400" />,
      'IT Policy': <FaShieldAlt className="text-indigo-400" />,
      'Security Policy': <FaShieldAlt className="text-red-500" />,
      'Finance Policy': <FaMoneyBillWave className="text-yellow-400" />,
      'Operations Policy': <FaTasks className="text-orange-400" />,
      'Code of Conduct': <FaCheckCircle className="text-green-500" />,
      'Data Privacy': <FaShieldAlt className="text-blue-500" />
    };
    return icons[category] || <FaFileAlt className="text-gray-400" />;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/home' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/users' },
    { id: 'leaves', label: 'Leaves', icon: FaCalendar, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FaFileAlt, path: '/reports' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/tasks' },
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
                <FaFileAlt className="text-[#00D4FF]" />
                Policy Center
              </h1>
              <p className="text-gray-400 mt-1">Manage company policies and documentation</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedPolicy(null);
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all"
              >
                <FaPlus className="w-4 h-4" />
                Add Policy
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search policies..."
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
              <option value="Employee Handbook">Employee Handbook</option>
              <option value="HR Policy">HR Policy</option>
              <option value="CEO Policy">CEO Policy</option>
              <option value="Staff Policy">Staff Policy</option>
              <option value="Customer Policy">Customer Policy</option>
              <option value="Shareholder Policy">Shareholder Policy</option>
              <option value="IT Policy">IT Policy</option>
              <option value="Security Policy">Security Policy</option>
              <option value="Finance Policy">Finance Policy</option>
              <option value="Operations Policy">Operations Policy</option>
              <option value="Code of Conduct">Code of Conduct</option>
              <option value="Data Privacy">Data Privacy</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Under Review">Under Review</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Policies Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaFileAlt className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No policies found</p>
              <p className="text-sm">Create your first policy</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPolicies.map((policy) => (
                <motion.div
                  key={policy._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0A0A0F] flex items-center justify-center">
                        {getCategoryIcon(policy.category)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{policy.policyName}</h3>
                        <p className="text-xs text-gray-400">{policy.policyId}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(policy.status)}`}>
                      {policy.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-300 line-clamp-2">{policy.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-[#0A0A0F] text-gray-400 px-2 py-0.5 rounded">
                        {policy.category}
                      </span>
                    </div>
                    {/* ============================================ */}
                    {/* FIXED: appliesTo is now a string, not an array */}
                    {/* ============================================ */}
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs bg-[#0A0A0F] text-gray-400 px-2 py-0.5 rounded">
                        Applies To: {policy.appliesTo || 'All'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3" />
                        {formatDate(policy.effectiveDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye className="w-3 h-3" />
                        {policy.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaDownload className="w-3 h-3" />
                        {policy.downloadCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-[#00D4FF]/10">
                    <button
                      onClick={() => handleViewPolicy(policy)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all text-sm"
                    >
                      <FaEye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPolicy(policy._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#06D6A0]/10 text-[#06D6A0] rounded-lg hover:bg-[#06D6A0]/20 transition-all text-sm"
                    >
                      <FaDownload className="w-3 h-3" />
                      Download
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setSelectedPolicy(policy);
                          setShowCreateModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg hover:bg-[#F59E0B]/20 transition-all text-sm"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDeletePolicy(policy._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Policy Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <PolicyModal
            isEditing={isEditing}
            policy={selectedPolicy}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedPolicy(null);
              setIsEditing(false);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setSelectedPolicy(null);
              setIsEditing(false);
              fetchPolicies();
              setSuccess(isEditing ? 'Policy updated successfully!' : 'Policy created successfully!');
              setTimeout(() => setSuccess(''), 3000);
            }}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* View Policy Modal */}
      <AnimatePresence>
        {showViewModal && selectedPolicy && (
          <PolicyViewModal
            policy={selectedPolicy}
            user={user}
            onClose={() => {
              setShowViewModal(false);
              setSelectedPolicy(null);
            }}
            onDownload={() => handleDownloadPolicy(selectedPolicy._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PolicyPage;