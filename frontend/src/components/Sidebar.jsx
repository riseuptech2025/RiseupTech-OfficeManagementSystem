import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, 
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaMoneyBillWave,
  FaTimes,
  FaReceipt,
  FaUserCircle,
  FaChevronDown,
  FaCalendarAlt,
  FaTasks,
  FaFileAlt,
  FaLock,
  FaHistory
} from 'react-icons/fa';
import CompanyLogo from './CompanyLogo';
import { authService } from '../services/api';

const Sidebar = ({ isOpen, toggleSidebar, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Helper functions
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

  // Sidebar menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/home' },
    { id: 'users', label: 'Users', icon: FaUsers, path: '/users' },
    { id: 'leaves', label: 'Leaves', icon: FaCalendarAlt, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FaFileAlt, path: '/reports' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/tasks' },
    { id: 'expenditure', label: 'Expenditure', icon: FaMoneyBillWave, path: '/expenditure' },
    { id: 'activity', label: 'Activity', icon: FaHistory, path: '/activity' },
    { id: 'passwords', label: 'Password Manager', icon: FaLock, path: '/passwords' },
     { id: 'account', label: 'Account', icon: FaReceipt, path: '/account' },
     { id: 'customers', label: 'Customers', icon: FaUsers, path: '/customers' }, 
     { id: 'policy', label: 'Policy Center', icon: FaFileAlt, path: '/policy' },
     { id: 'finance', label: 'Finance', icon: FaMoneyBillWave, path: '/finance' }, 
    { id: 'management', label: 'Management', icon: FaCog, path: '/management' },
  ];

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, type: 'spring', damping: 20 }}
      className={`fixed left-0 top-0 h-full bg-[#111118]/95 backdrop-blur-xl border-r border-[#00D4FF]/10 shadow-2xl shadow-[#00D4FF]/5 z-50 transition-all duration-300 flex flex-col ${
        isOpen ? 'w-72' : 'w-20'
      }`}
    >
      {/* Sidebar Header - Logo */}
      <div className="p-4 border-b border-[#00D4FF]/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          {isOpen ? (
            <CompanyLogo size="medium" showText={true} textColor="text-[#00D4FF]" />
          ) : (
            <CompanyLogo size="small" showText={false} />
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors lg:hidden"
          >
            {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white shadow-lg shadow-[#00D4FF]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } ${!isOpen && 'justify-center'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer - User Profile */}
      {user && (
        <div className="border-t border-[#00D4FF]/10 flex-shrink-0">
          {isOpen ? (
            <div className="p-4">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors relative"
              >
                {/* Profile Picture */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {getUserAvatar(user)}
                </div>
                
                {/* User Info */}
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

              {/* Dropdown Menu */}
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
                        onLogout();
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
                        onLogout();
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
  );
};

export default Sidebar;