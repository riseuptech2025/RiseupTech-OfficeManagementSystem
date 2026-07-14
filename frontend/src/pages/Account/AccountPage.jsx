// pages/Account/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaReceipt,
  FaPlus,
  FaSpinner,
  FaFileInvoice,
  FaMoneyBillWave,
  FaChartPie,
  FaBars,
  FaTimes,
  FaBell,
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
  FaEye,
  FaDownload,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEdit,
  FaSave,
  FaExclamationTriangle
} from 'react-icons/fa';
import { authService } from '../../services/api';
import { receiptService } from '../../services/receiptService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import GenerateReceiptModal from '../../components/GenerateReceiptModal';
import ReceiptViewModal from '../../components/ReceiptViewModal';
import { formatCurrency } from '../../utils/formatCurrency';

const AccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchReceipts();
    fetchStats();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await receiptService.getReceipts();
      setReceipts(response.data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await receiptService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setShowViewModal(true);
  };

  const handleDownloadReceipt = async (receiptId) => {
    try {
      await receiptService.downloadReceipt(receiptId);
      await fetchReceipts();
    } catch (error) {
      console.error('Failed to download receipt:', error);
    }
  };

  const handleEditReceipt = async () => {
    await fetchReceipts();
    await fetchStats();
  };

  const handleMarkAsPaid = async (receiptId) => {
    if (!window.confirm('Are you sure you want to mark this receipt as paid?')) return;
    
    try {
      await receiptService.markAsPaid(receiptId);
      setSuccess('Receipt marked as paid successfully!');
      await fetchReceipts();
      await fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to mark as paid');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancelReceipt = async (receipt) => {
    // ============================================
    // FIX: Paid receipts cannot be cancelled
    // ============================================
    if (receipt.status === 'paid') {
      setError('Paid receipts cannot be cancelled!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel receipt ${receipt.receiptNumber}?`)) return;
    
    try {
      await receiptService.deleteReceipt(receipt._id);
      setSuccess('Receipt cancelled successfully!');
      await fetchReceipts();
      await fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel receipt');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      issued: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'issued': return <FaClock className="text-yellow-400" />;
      case 'paid': return <FaCheckCircle className="text-green-400" />;
      case 'cancelled': return <FaTimesCircle className="text-red-400" />;
      default: return <FaClock className="text-gray-400" />;
    }
  };

  // ============================================
  // FIX: Calculate different amounts
  // ============================================
  const calculateEarnedAmount = () => {
    if (!receipts.length) return 0;
    return receipts
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.totalAmount, 0);
  };

  const calculateIssuedAmount = () => {
    if (!receipts.length) return 0;
    return receipts
      .filter(r => r.status === 'issued')
      .reduce((sum, r) => sum + r.totalAmount, 0);
  };

  const calculateTotalAmount = () => {
    if (!receipts.length) return 0;
    return receipts
      .filter(r => r.status === 'paid' || r.status === 'issued')
      .reduce((sum, r) => sum + r.totalAmount, 0);
  };

  const earnedAmount = calculateEarnedAmount();
  const issuedAmount = calculateIssuedAmount();
  const totalAmount = calculateTotalAmount();

  // Stats from backend
  const totalReceipts = stats?.totalReceipts || 0;
  const paidCount = stats?.paidReceipts || 0;
  const issuedCount = stats?.issuedReceipts || 0;
  const cancelledCount = stats?.cancelledReceipts || 0;

  const filteredReceipts = filter === 'all' 
    ? receipts 
    : receipts.filter(r => r.status === filter);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/home' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/users' },
    { id: 'leaves', label: 'Leaves', icon: FaCalendarAlt, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FaFileAlt, path: '/reports' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/tasks' },
    { id: 'account', label: 'Account', icon: FaReceipt, path: '/account' },
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
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FaReceipt className="text-[#00D4FF]" />
                Account & Receipts
              </h1>
              <p className="text-gray-400 mt-1">Manage your receipts and financial records</p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all"
            >
              <FaPlus className="w-4 h-4" />
              Generate Receipt
            </button>
          </div>

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

          {/* ============================================ */}
          {/* Stats Cards with Financial Breakdown */}
          {/* ============================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Receipts */}
            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Receipts</p>
                  <p className="text-2xl font-bold text-white">{totalReceipts}</p>
                </div>
                <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
                  <FaReceipt className="w-6 h-6 text-[#00D4FF]" />
                </div>
              </div>
            </div>

            {/* Paid Receipts - Green */}
            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#06D6A0]/10 hover:border-[#06D6A0]/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Paid Receipts</p>
                  <p className="text-2xl font-bold text-white">{paidCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="w-6 h-6 text-[#06D6A0]" />
                </div>
              </div>
            </div>

            {/* Issued Receipts - Yellow */}
            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#F59E0B]/10 hover:border-[#F59E0B]/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Issued Receipts</p>
                  <p className="text-2xl font-bold text-white">{issuedCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
                  <FaClock className="w-6 h-6 text-[#F59E0B]" />
                </div>
              </div>
            </div>

            {/* Cancelled Receipts - Red */}
            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#EF4444]/10 hover:border-[#EF4444]/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Cancelled</p>
                  <p className="text-2xl font-bold text-white">{cancelledCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#EF4444]/10 rounded-xl flex items-center justify-center">
                  <FaTimesCircle className="w-6 h-6 text-[#EF4444]" />
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* Financial Summary - Amount Breakdown */}
          {/* ============================================ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Earned - Green */}
            <div className="bg-gradient-to-br from-[#06D6A0]/10 to-[#06D6A0]/5 rounded-xl p-5 border border-[#06D6A0]/20 hover:border-[#06D6A0]/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#06D6A0]/20 rounded-xl flex items-center justify-center">
                  <FaMoneyBillWave className="w-6 h-6 text-[#06D6A0]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Earned (Paid)</p>
                  <p className="text-2xl font-bold text-[#06D6A0]">{formatCurrency(earnedAmount)}</p>
                </div>
              </div>
            </div>

            {/* Total Issued - Yellow */}
            <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 rounded-xl p-5 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-xl flex items-center justify-center">
                  <FaFileInvoice className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Issued</p>
                  <p className="text-2xl font-bold text-[#F59E0B]">{formatCurrency(issuedAmount)}</p>
                </div>
              </div>
            </div>

            {/* Grand Total - Blue */}
            <div className="bg-gradient-to-br from-[#00D4FF]/10 to-[#7C3AED]/10 rounded-xl p-5 border border-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#00D4FF]/20 rounded-xl flex items-center justify-center">
                  <FaChartPie className="w-6 h-6 text-[#00D4FF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Grand Total</p>
                  <p className="text-2xl font-bold text-[#00D4FF]">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'issued', 'paid', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === status
                    ? 'bg-[#00D4FF] text-white'
                    : 'bg-[#111118] text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10">
                    {status === 'paid' ? paidCount : status === 'issued' ? issuedCount : cancelledCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Receipts List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaReceipt className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No receipts found</p>
              <p className="text-sm">Generate your first receipt</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReceipts.map((receipt) => (
                <motion.div
                  key={receipt._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border transition-all ${
                    receipt.status === 'paid' 
                      ? 'border-[#06D6A0]/20 hover:border-[#06D6A0]/40' 
                      : receipt.status === 'cancelled'
                      ? 'border-[#EF4444]/20 hover:border-[#EF4444]/40 opacity-60'
                      : 'border-[#F59E0B]/20 hover:border-[#F59E0B]/40'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left: Receipt Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <FaFileInvoice className={`w-5 h-5 ${
                          receipt.status === 'paid' ? 'text-[#06D6A0]' : 
                          receipt.status === 'cancelled' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                        }`} />
                        <h3 className="text-lg font-semibold text-white">
                          {receipt.receiptNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(receipt.status)}`}>
                          {getStatusIcon(receipt.status)} {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                        </span>
                        {receipt.paymentStatus === 'Paid' && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                            ✓ Paid
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-300 font-medium">{receipt.recipientName}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            Amount: <span className={`font-medium ${
                              receipt.status === 'paid' ? 'text-[#06D6A0]' : 
                              receipt.status === 'cancelled' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                            }`}>
                              {formatCurrency(receipt.totalAmount)}
                            </span>
                          </span>
                          <span className="text-gray-400">
                            Date: {new Date(receipt.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-gray-400">
                            Payment: <span className={
                              receipt.paymentStatus === 'Paid' ? 'text-green-400' :
                              receipt.paymentStatus === 'Pending' ? 'text-yellow-400' :
                              'text-red-400'
                            }>
                              {receipt.paymentStatus}
                            </span>
                          </span>
                          {receipt.paymentReference && (
                            <span className="text-gray-400 text-xs font-mono">
                              TXN: {receipt.paymentReference}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewReceipt(receipt)}
                        className="p-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all"
                        title="View Receipt"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(receipt._id)}
                        className="p-2 bg-[#06D6A0]/10 text-[#06D6A0] rounded-lg hover:bg-[#06D6A0]/20 transition-all"
                        title="Download Receipt"
                      >
                        <FaDownload className="w-4 h-4" />
                      </button>
                      
                      {/* ============================================ */}
                      {/* Mark as Paid - Only for issued receipts */}
                      {/* ============================================ */}
                      {receipt.status === 'issued' && (
                        <button
                          onClick={() => handleMarkAsPaid(receipt._id)}
                          className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all"
                          title="Mark as Paid"
                        >
                          <FaCheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* ============================================ */}
                      {/* Cancel Receipt - Paid receipts cannot be cancelled */}
                      {/* ============================================ */}
                      {receipt.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelReceipt(receipt)}
                          className={`p-2 rounded-lg transition-all ${
                            receipt.status === 'paid'
                              ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed opacity-50'
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          }`}
                          title={receipt.status === 'paid' ? 'Paid receipts cannot be cancelled' : 'Cancel Receipt'}
                          disabled={receipt.status === 'paid'}
                        >
                          <FaTrash className="w-4 h-4" />
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

      {/* Modals */}
      <AnimatePresence>
        {showGenerateModal && (
          <GenerateReceiptModal
            onClose={() => setShowGenerateModal(false)}
            onSuccess={() => {
              setShowGenerateModal(false);
              fetchReceipts();
              fetchStats();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showViewModal && selectedReceipt && (
          <ReceiptViewModal
            receipt={selectedReceipt}
            onClose={() => {
              setShowViewModal(false);
              setSelectedReceipt(null);
            }}
            onDownload={() => handleDownloadReceipt(selectedReceipt._id)}
            onEdit={handleEditReceipt}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountPage;