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
  FaExclamationTriangle,
  FaWallet,
  FaCreditCard,
  FaPercentage,
  FaLink,
  FaList,
  FaPrint
} from 'react-icons/fa';
import { authService } from '../../services/api';
import { receiptService } from '../../services/receiptService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import GenerateReceiptModal from '../../components/GenerateReceiptModal';
import ReceiptViewModal from '../../components/ReceiptViewModal';
import PartialPaymentModal from '../../components/PartialPaymentModal';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../services/api';

const AccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedReceiptForPayment, setSelectedReceiptForPayment] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [earningsData, setEarningsData] = useState(null);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchReceipts(),
        fetchStats(),
        fetchEarningsData()
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceipts = async () => {
    try {
      const response = await receiptService.getReceipts();
      setReceipts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
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

  const fetchEarningsData = async () => {
    try {
      // Try to fetch from finance API first
      const response = await api.get('/finance/earnings');
      setEarningsData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch earnings data:', error);
      // Fallback: Calculate from receipts
      if (receipts.length > 0) {
        calculateEarningsFromReceipts();
      }
    }
  };

  // Fallback: Calculate earnings from receipts
  const calculateEarningsFromReceipts = () => {
    if (!receipts.length) {
      setEarningsData({ totalEarned: 0, receipts: [] });
      return;
    }

    const paidReceipts = receipts.filter(r => r.paidAmount > 0 && r.status !== 'cancelled');
    const totalEarned = paidReceipts.reduce((sum, r) => sum + r.paidAmount, 0);
    
    setEarningsData({
      totalEarned,
      count: paidReceipts.length,
      fullPayments: paidReceipts.filter(r => r.paymentStatus === 'Paid').length,
      partialPayments: paidReceipts.filter(r => r.paymentStatus === 'Partial').length,
      receipts: paidReceipts.map(r => ({
        receiptNumber: r.receiptNumber,
        customerName: r.recipientName,
        totalAmount: r.totalAmount,
        paidAmount: r.paidAmount,
        dueAmount: r.dueAmount,
        paymentStatus: r.paymentStatus,
        date: r.createdAt
      }))
    });
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
    await fetchAllData();
  };

  const handleMarkAsPaid = async (receiptId) => {
    if (!window.confirm('Are you sure you want to mark this receipt as paid?')) return;
    
    try {
      await receiptService.markAsPaid(receiptId);
      setSuccess('Receipt marked as paid successfully!');
      await fetchAllData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to mark as paid');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancelReceipt = async (receipt) => {
    // Paid receipts cannot be cancelled
    if (receipt.status === 'paid') {
      setError('Paid receipts cannot be cancelled!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel receipt ${receipt.receiptNumber}?`)) return;
    
    try {
      await receiptService.deleteReceipt(receipt._id);
      setSuccess('Receipt cancelled successfully!');
      await fetchAllData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel receipt');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePartialPayment = (receipt) => {
    if (receipt.dueAmount <= 0) {
      setError('This receipt has no pending amount to pay');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setSelectedReceiptForPayment(receipt);
    setShowPartialPaymentModal(true);
  };

  const handleViewPaymentHistory = async (receipt) => {
    try {
      const response = await receiptService.getReceiptHistory(receipt._id);
      // Show payment history in a modal or alert
      const history = response.data;
      let message = `Payment History for ${receipt.receiptNumber}\n\n`;
      message += `Total Amount: ${formatCurrency(receipt.totalAmount)}\n`;
      message += `Paid: ${formatCurrency(history.totalPaid)}\n`;
      message += `Due: ${formatCurrency(history.totalDue)}\n\n`;
      message += `--- Payments ---\n`;
      
      if (history.partialPayments && history.partialPayments.length > 0) {
        history.partialPayments.forEach((payment, index) => {
          message += `${index + 1}. ${formatCurrency(payment.amount)} - ${new Date(payment.date).toLocaleDateString()}\n`;
          message += `   Receipt: ${payment.receiptNumber}\n`;
        });
      } else {
        message += 'No partial payments recorded\n';
      }
      
      alert(message);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setError('Failed to fetch payment history');
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

  const getPaymentStatusBadge = (status) => {
    const colors = {
      Paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      Partial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Refunded: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors.Pending;
  };

  const getPaymentStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return <FaCheckCircle className="text-green-400" />;
      case 'Partial': return <FaPercentage className="text-blue-400" />;
      case 'Pending': return <FaClock className="text-yellow-400" />;
      case 'Refunded': return <FaTimesCircle className="text-red-400" />;
      default: return <FaClock className="text-gray-400" />;
    }
  };

  // Calculate amounts
  const calculateTotalEarned = () => {
    if (!receipts.length) return 0;
    return receipts
      .filter(r => r.paidAmount > 0 && r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.paidAmount, 0);
  };

  const calculateTotalDue = () => {
    if (!receipts.length) return 0;
    return receipts
      .filter(r => r.dueAmount > 0 && r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.dueAmount, 0);
  };

  const calculateTotalReceiptsAmount = () => {
    if (!receipts.length) return 0;
    return receipts
      .filter(r => r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.totalAmount, 0);
  };

  const totalEarned = earningsData?.totalEarned || calculateTotalEarned();
  const totalDue = calculateTotalDue();
  const totalReceiptsAmount = calculateTotalReceiptsAmount();

  // Stats from backend
  const totalReceipts = stats?.totalReceipts || 0;
  const paidCount = stats?.paidReceipts || 0;
  const issuedCount = stats?.issuedReceipts || 0;
  const cancelledCount = stats?.cancelledReceipts || 0;

  const filteredReceipts = filter === 'all' 
    ? receipts 
    : receipts.filter(r => r.status === filter);

  // Sort receipts by date (newest first)
  const sortedReceipts = [...filteredReceipts].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Get receipt type label
  const getReceiptTypeLabel = (receipt) => {
    if (receipt.isPartialPayment) {
      return 'Partial Payment';
    }
    if (receipt.originalReceiptId) {
      return 'Payment';
    }
    return 'Original';
  };

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
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
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
            {/* Total Earned - Green (Includes partial payments) */}
            <div className="bg-gradient-to-br from-[#06D6A0]/10 to-[#06D6A0]/5 rounded-xl p-5 border border-[#06D6A0]/20 hover:border-[#06D6A0]/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#06D6A0]/20 rounded-xl flex items-center justify-center">
                  <FaWallet className="w-6 h-6 text-[#06D6A0]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Earned</p>
                  <p className="text-2xl font-bold text-[#06D6A0]">{formatCurrency(totalEarned)}</p>
                  <p className="text-xs text-gray-500">
                    {earningsData?.fullPayments || 0} full payments • {earningsData?.partialPayments || 0} partial payments
                  </p>
                </div>
              </div>
            </div>

            {/* Total Due - Red */}
            <div className="bg-gradient-to-br from-[#EF4444]/10 to-[#EF4444]/5 rounded-xl p-5 border border-[#EF4444]/20 hover:border-[#EF4444]/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#EF4444]/20 rounded-xl flex items-center justify-center">
                  <FaCreditCard className="w-6 h-6 text-[#EF4444]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Due</p>
                  <p className="text-2xl font-bold text-[#EF4444]">{formatCurrency(totalDue)}</p>
                  <p className="text-xs text-gray-500">Pending payments</p>
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
                  <p className="text-sm text-gray-400">Grand Total (All Receipts)</p>
                  <p className="text-2xl font-bold text-[#00D4FF]">{formatCurrency(totalReceiptsAmount)}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(totalEarned)} earned • {formatCurrency(totalDue)} due
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* Payment Summary Progress Bar */}
          {/* ============================================ */}
          {totalReceiptsAmount > 0 && (
            <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#00D4FF]/10 mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Payment Progress</span>
                <span>{((totalEarned / totalReceiptsAmount) * 100).toFixed(1)}% collected</span>
              </div>
              <div className="w-full bg-[#0A0A0F] rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00D4FF] to-[#06D6A0] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalEarned / totalReceiptsAmount) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Collected: {formatCurrency(totalEarned)}</span>
                <span>Due: {formatCurrency(totalDue)}</span>
              </div>
            </div>
          )}

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
          ) : sortedReceipts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaReceipt className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No receipts found</p>
              <p className="text-sm">Generate your first receipt</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sortedReceipts.map((receipt) => (
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
                        {/* Receipt Type Badge */}
                        {receipt.isPartialPayment && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            <FaLink className="inline mr-1 w-3 h-3" />
                            Partial
                          </span>
                        )}
                        {receipt.originalReceiptId && !receipt.isPartialPayment && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <FaLink className="inline mr-1 w-3 h-3" />
                            Payment
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(receipt.status)}`}>
                          {getStatusIcon(receipt.status)} {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                        </span>
                        {/* Payment Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusBadge(receipt.paymentStatus)}`}>
                          {getPaymentStatusIcon(receipt.paymentStatus)} {receipt.paymentStatus}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-300 font-medium">{receipt.recipientName}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            Total: <span className="font-medium text-white">{formatCurrency(receipt.totalAmount)}</span>
                          </span>
                          {receipt.paidAmount > 0 && (
                            <span className="text-gray-400">
                              Paid: <span className="font-medium text-[#06D6A0]">{formatCurrency(receipt.paidAmount)}</span>
                            </span>
                          )}
                          {receipt.dueAmount > 0 && (
                            <span className="text-gray-400">
                              Due: <span className="font-medium text-[#EF4444]">{formatCurrency(receipt.dueAmount)}</span>
                            </span>
                          )}
                          <span className="text-gray-400">
                            Date: {new Date(receipt.createdAt).toLocaleDateString()}
                          </span>
                          {receipt.paymentReference && (
                            <span className="text-gray-400 text-xs font-mono">
                              TXN: {receipt.paymentReference}
                            </span>
                          )}
                        </div>
                        {/* Show original receipt link for partial payments */}
                        {receipt.originalReceiptId && (
                          <p className="text-xs text-gray-500">
                            <FaLink className="inline mr-1 w-3 h-3" />
                            Linked to: {receipt.originalReceiptId?.receiptNumber || 'Original Receipt'}
                          </p>
                        )}
                        {/* Show number of partial payments */}
                        {receipt.partialPayments && receipt.partialPayments.length > 0 && (
                          <p className="text-xs text-blue-400">
                            <FaList className="inline mr-1 w-3 h-3" />
                            {receipt.partialPayments.length} partial payment(s) made
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
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
                      
                      {/* View Payment History */}
                      {receipt.partialPayments && receipt.partialPayments.length > 0 && (
                        <button
                          onClick={() => handleViewPaymentHistory(receipt)}
                          className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all"
                          title="View Payment History"
                        >
                          <FaHistory className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Make Partial Payment - Only for issued receipts with due amount */}
                      {receipt.status === 'issued' && receipt.dueAmount > 0 && (
                        <button
                          onClick={() => handlePartialPayment(receipt)}
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                          title="Make Partial Payment"
                        >
                          <FaMoneyBillWave className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Mark as Paid - Only for issued receipts */}
                      {receipt.status === 'issued' && (
                        <button
                          onClick={() => handleMarkAsPaid(receipt._id)}
                          className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all"
                          title="Mark as Paid"
                        >
                          <FaCheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Cancel Receipt - Paid receipts cannot be cancelled */}
                      {receipt.status !== 'cancelled' && receipt.status !== 'paid' && (
                        <button
                          onClick={() => handleCancelReceipt(receipt)}
                          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                          title="Cancel Receipt"
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
              fetchAllData();
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

      <AnimatePresence>
        {showPartialPaymentModal && selectedReceiptForPayment && (
          <PartialPaymentModal
            receipt={selectedReceiptForPayment}
            onClose={() => {
              setShowPartialPaymentModal(false);
              setSelectedReceiptForPayment(null);
            }}
            onSuccess={() => {
              setShowPartialPaymentModal(false);
              setSelectedReceiptForPayment(null);
              fetchAllData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountPage;