// pages/Expenditure/ExpenditurePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaBuilding,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileInvoice,
  FaCreditCard,
  FaWallet,
  FaHandHoldingUsd,
  FaDownload,
  FaPrint,
  FaChevronDown,
  FaChevronUp,
  FaChartPie,
  FaLightbulb,
  FaMicrochip,
  FaCode,
  FaRocket,
  FaCoffee,
  FaTools,
  FaShieldAlt,
  FaGraduationCap,
  FaEllipsisH,
  FaChartLine,
  FaArrowRight,
  FaClock,
  FaRupeeSign,
  FaUsers,
  FaTasks,
  FaFileAlt,
  FaHistory,
  FaCog,
  FaReceipt,
  FaCalendarCheck,
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine as FaChartLineIcon,
} from 'react-icons/fa';
import { authService } from '../../services/api';
import { expenditureService } from '../../services/expenditureService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import ExpenditureModal from '../../components/Expenditure/ExpenditureModal';
import ExpenditureViewModal from '../../components/Expenditure/ExpenditureViewModal';
import PaymentModal from '../../components/Expenditure/PaymentModal';

const ExpenditurePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [expenditures, setExpenditures] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedExpenditure, setSelectedExpenditure] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchExpenditures();
    fetchStats();
  }, []);

  const fetchExpenditures = async () => {
    try {
      const response = await expenditureService.getExpenditures();
      setExpenditures(response.data);
    } catch (error) {
      console.error('Failed to fetch expenditures:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await expenditureService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo', 'accountant'].includes(user?.role);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Draft': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'Submitted': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Approved': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Paid': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors['Draft'];
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      'Paid': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Partial': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Pending': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Cancelled': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status] || colors['Pending'];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Office Rent': <FaBuilding className="text-blue-400" />,
      'Utilities': <FaLightbulb className="text-yellow-400" />,
      'Salaries': <FaUsers className="text-green-400" />,
      'Equipment': <FaMicrochip className="text-purple-400" />,
      'Software Licenses': <FaCode className="text-cyan-400" />,
      'Marketing': <FaRocket className="text-pink-400" />,
      'Travel': <FaMapMarkerAlt className="text-orange-400" />,
      'Food & Beverage': <FaCoffee className="text-red-400" />,
      'Stationery': <FaFileAlt className="text-gray-400" />,
      'Maintenance': <FaTools className="text-gray-500" />,
      'Insurance': <FaShieldAlt className="text-blue-500" />,
      'Taxes': <FaFileInvoice className="text-red-500" />,
      'Training': <FaGraduationCap className="text-purple-500" />,
      'Miscellaneous': <FaEllipsisH className="text-gray-400" />
    };
    return icons[category] || <FaFileAlt className="text-gray-400" />;
  };

  const handleViewExpenditure = (expenditure) => {
    setSelectedExpenditure(expenditure);
    setShowViewModal(true);
  };

  const handleOpenPaymentModal = (expenditure) => {
    setSelectedPayment(expenditure);
    setShowPaymentModal(true);
  };

  const handleDeleteExpenditure = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expenditure?')) return;
    
    try {
      await expenditureService.deleteExpenditure(id);
      setSuccess('Expenditure deleted successfully!');
      fetchExpenditures();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete expenditure');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    fetchExpenditures();
    fetchStats();
    setSuccess('Payment processed successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const filteredExpenditures = expenditures.filter(exp => {
    const matchesSearch = exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || exp.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLineIcon, path: '/home' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/users' },
    { id: 'leaves', label: 'Leaves', icon: FaCalendarAlt, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FaFileAlt, path: '/reports' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/tasks' },
    { id: 'expenditure', label: 'Expenditure', icon: FaMoneyBillWave, path: '/expenditure' },
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
                <FaMoneyBillWave className="text-[#00D4FF]" />
                Expenditure Management
              </h1>
              <p className="text-gray-400 mt-1">Track and manage company expenses</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedExpenditure(null);
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all"
              >
                <FaPlus className="w-4 h-4" />
                Add Expenditure
              </button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#00D4FF]/10">
                <p className="text-sm text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.total?.totalAmount)}</p>
                <p className="text-xs text-gray-500">{stats.total?.count} transactions</p>
              </div>
              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#06D6A0]/10">
                <p className="text-sm text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold text-[#06D6A0]">{formatCurrency(stats.total?.totalPaid)}</p>
              </div>
              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#EF4444]/10">
                <p className="text-sm text-gray-400">Total Due</p>
                <p className="text-2xl font-bold text-[#EF4444]">{formatCurrency(stats.total?.totalDue)}</p>
              </div>
              <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#F59E0B]/10">
                <p className="text-sm text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-[#F59E0B]">{formatCurrency(stats.monthly?.totalAmount)}</p>
                <p className="text-xs text-gray-500">{stats.monthly?.count} transactions</p>
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
                  placeholder="Search expenditures..."
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
              <option value="Office Rent">Office Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Salaries">Salaries</option>
              <option value="Equipment">Equipment</option>
              <option value="Software Licenses">Software Licenses</option>
              <option value="Marketing">Marketing</option>
              <option value="Travel">Travel</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Stationery">Stationery</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Insurance">Insurance</option>
              <option value="Taxes">Taxes</option>
              <option value="Training">Training</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Expenditures List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
            </div>
          ) : filteredExpenditures.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaMoneyBillWave className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No expenditures found</p>
              <p className="text-sm">Create your first expenditure record</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenditures.map((exp) => (
                <motion.div
                  key={exp._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 rounded-full bg-[#0A0A0F] flex items-center justify-center">
                          {getCategoryIcon(exp.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{exp.description}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400">{exp.receiptNumber}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-sm text-gray-400">{exp.vendorName}</span>
                            <span className="text-gray-500">•</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(exp.status)}`}>
                              {exp.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusBadge(exp.paymentStatus)}`}>
                              {exp.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-400">
                          Category: <span className="text-white">{exp.category}</span>
                        </span>
                        <span className="text-gray-400">
                          Amount: <span className="text-white font-medium">{formatCurrency(exp.amount)}</span>
                        </span>
                        {exp.paidAmount > 0 && (
                          <span className="text-gray-400">
                            Paid: <span className="text-[#06D6A0] font-medium">{formatCurrency(exp.paidAmount)}</span>
                          </span>
                        )}
                        {exp.dueAmount > 0 && (
                          <span className="text-gray-400">
                            Due: <span className="text-[#EF4444] font-medium">{formatCurrency(exp.dueAmount)}</span>
                          </span>
                        )}
                        <span className="text-gray-400">
                          Date: <span className="text-white">{new Date(exp.transactionDate).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewExpenditure(exp)}
                        className="p-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      {isAdmin && exp.status !== 'Paid' && exp.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleOpenPaymentModal(exp)}
                          className="p-2 bg-[#06D6A0]/10 text-[#06D6A0] rounded-lg hover:bg-[#06D6A0]/20 transition-all"
                          title="Make Payment"
                        >
                          <FaHandHoldingUsd className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setSelectedExpenditure(exp);
                              setShowCreateModal(true);
                            }}
                            className="p-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg hover:bg-[#F59E0B]/20 transition-all"
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpenditure(exp._id)}
                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <ExpenditureModal
            isEditing={isEditing}
            expenditure={selectedExpenditure}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedExpenditure(null);
              setIsEditing(false);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setSelectedExpenditure(null);
              setIsEditing(false);
              fetchExpenditures();
              fetchStats();
              setSuccess(isEditing ? 'Expenditure updated successfully!' : 'Expenditure created successfully!');
              setTimeout(() => setSuccess(''), 3000);
            }}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedExpenditure && (
          <ExpenditureViewModal
            expenditure={selectedExpenditure}
            user={user}
            onClose={() => {
              setShowViewModal(false);
              setSelectedExpenditure(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPayment && (
          <PaymentModal
            expenditure={selectedPayment}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPayment(null);
            }}
            onSuccess={handlePaymentSuccess}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpenditurePage;