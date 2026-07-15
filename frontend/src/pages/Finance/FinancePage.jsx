// pages/Finance/FinancePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMoneyBillWave,
  FaChartLine,
  FaUsers,
  FaHistory,
  FaCog,
  FaReceipt,
  FaTasks,
  FaCalendarAlt,
  FaFileInvoice,
  FaBars,
  FaTimes,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown
} from 'react-icons/fa';
import { authService, userService } from '../../services/api';
import { financeService } from '../../services/financeService';
import { salaryService } from '../../services/salaryService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import SharesOverview from '../../components/Finance/SharesOverview';
import EmployeeSalary from '../../components/Finance/EmployeeSalary';

const FinancePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [overview, setOverview] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchFinanceData();
    fetchEmployees();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [overviewRes, salariesRes] = await Promise.all([
        financeService.getOverview(),
        salaryService.getSalaries()
      ]);
      setOverview(overviewRes.data);
      setSalaries(salariesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await userService.getUsers();
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleRefresh = async () => {
    await fetchFinanceData();
    await fetchEmployees();
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/home' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/users' },
    { id: 'leaves', label: 'Leaves', icon: FaCalendarAlt, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FaFileInvoice, path: '/reports' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/tasks' },
    { id: 'account', label: 'Account', icon: FaReceipt, path: '/account' },
    { id: 'customers', label: 'Customers', icon: FaUsers, path: '/customers' },
    { id: 'finance', label: 'Finance', icon: FaMoneyBillWave, path: '/finance' },
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
                <FaMoneyBillWave className="text-[#00D4FF]" />
                Finance Management
              </h1>
              <p className="text-gray-400 mt-1">Track earnings, expenses, salaries, and shares</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-[#00D4FF]/10 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg transition-all text-sm ${
                activeTab === 'overview'
                  ? 'bg-[#00D4FF] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaChartLine className="inline mr-2" />
              Shares Overview
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-4 py-2 rounded-lg transition-all text-sm ${
                activeTab === 'employees'
                  ? 'bg-[#00D4FF] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaUsers className="inline mr-2" />
              Employee Salary
            </button>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <SharesOverview overview={overview} loading={loading} />
              )}
              {activeTab === 'employees' && (
                <EmployeeSalary 
                  employees={employees}
                  salaries={salaries}
                  onRefresh={handleRefresh}
                  formatCurrency={formatCurrency}
                  getRoleBadge={getRoleBadge}
                  getRoleIcon={getRoleIcon}
                  getUserInitials={getUserInitials}
                  getUserAvatar={getUserAvatar}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancePage;