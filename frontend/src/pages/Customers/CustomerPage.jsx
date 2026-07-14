// pages/Customers/CustomerPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaSearch,
  FaSpinner,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaReceipt,
  FaCalendarAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaPlus,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaChartLine,
  FaCalendarAlt as FaCalendar,
  FaFileAlt,
  FaTasks,
  FaHistory,
  FaCog,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaCheckCircle
} from 'react-icons/fa';
import { authService } from '../../services/api';
import { customerService } from '../../services/customerService';
import { receiptService } from '../../services/receiptService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import CompanyLogo from '../../components/CompanyLogo';

const CustomerPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerReceipts, setCustomerReceipts] = useState([]);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const viewCustomerReceipts = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const response = await receiptService.getReceipts();
      const customerReceiptsData = response.data.filter(
        r => r.customerId?._id === customer._id || r.recipientPhone === customer.phone
      );
      setCustomerReceipts(customerReceiptsData);
      setShowReceiptsModal(true);
    } catch (error) {
      console.error('Failed to fetch customer receipts:', error);
    }
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.phone?.includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.address?.toLowerCase().includes(search)
    );
  });

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
      minimumFractionDigits: 2
    }).format(amount);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/home' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/users' },
    { id: 'leaves', label: 'Leaves', icon: FaCalendar, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FaFileAlt, path: '/reports' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/tasks' },
    { id: 'account', label: 'Account', icon: FaReceipt, path: '/account' },
    { id: 'customers', label: 'Customers', icon: FaUsers, path: '/customers' },
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
                <FaUsers className="text-[#00D4FF]" />
                Customer Management
              </h1>
              <p className="text-gray-400 mt-1">View and manage all customers</p>
            </div>
            <button
              onClick={() => navigate('/account')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all"
            >
              <FaReceipt className="w-4 h-4" />
              Generate Receipt
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Customers Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaUsers className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No customers found</p>
              <p className="text-sm">Customers will appear here when you generate receipts with "Save Customer" enabled</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                >
                  {/* Customer Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {customer.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{customer.name}</h3>
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400 w-3 h-3" />
                          <span className="text-sm text-gray-400">{customer.phone}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-2 mb-4">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <FaEnvelope className="text-[#00D4FF] w-4 h-4" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <FaMapMarkerAlt className="text-[#00D4FF] w-4 h-4" />
                        <span>{customer.address}</span>
                      </div>
                    )}
                    {customer.company && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <FaBuilding className="text-[#00D4FF] w-4 h-4" />
                        <span>{customer.company}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#00D4FF]/10">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Purchases</p>
                      <p className="text-lg font-bold text-white">{customer.totalPurchases || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Total Spent</p>
                      <p className="text-lg font-bold text-[#00D4FF]">
                        {formatCurrency(customer.totalAmountSpent || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Last Purchase</p>
                      <p className="text-sm font-medium text-white">
                        {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-[#00D4FF]/10">
                    <button
                      onClick={() => viewCustomerReceipts(customer)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all text-sm"
                    >
                      <FaReceipt className="w-4 h-4" />
                      View Receipts
                    </button>
                    <button
                      onClick={() => {
                        navigate('/account');
                        // Pre-fill customer details in generate modal
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg hover:bg-[#7C3AED]/20 transition-all text-sm"
                    >
                      <FaPlus className="w-4 h-4" />
                      New Receipt
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Receipts Modal */}
      {showReceiptsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#111118] rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#00D4FF]/20">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaUser className="text-[#00D4FF]" />
                  {selectedCustomer.name}'s Receipts
                </h3>
                <p className="text-sm text-gray-400">{selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setShowReceiptsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {customerReceipts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaReceipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No receipts found for this customer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerReceipts.map((receipt) => (
                  <div key={receipt._id} className="bg-[#0A0A0F]/50 rounded-lg p-4 border border-[#00D4FF]/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{receipt.receiptNumber}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(receipt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#00D4FF] font-bold">{formatCurrency(receipt.totalAmount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          receipt.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          receipt.status === 'issued' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {receipt.status}
                        </span>
                      </div>
                    </div>
                    {receipt.paymentStatus && (
                      <div className="mt-1 text-xs text-gray-500">
                        Payment: {receipt.paymentStatus} • Method: {receipt.paymentMethod}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;