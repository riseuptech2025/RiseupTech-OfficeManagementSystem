import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaBell, FaUserCircle } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ 
  user, 
  sidebarOpen, 
  toggleSidebar, 
  showNotifications, 
  setShowNotifications,
  unreadCount = 0 
}) => {
  const navigate = useNavigate();

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

  return (
    <nav className="bg-[#111118]/95 backdrop-blur-xl border-b border-[#00D4FF]/10 sticky top-0 z-40">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative group"
            >
              
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
               {/* Notification Dropdown */}
            <NotificationDropdown 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
            </button>
            
           
          </div>
          
          {/* User Profile Button */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden ring-2 ring-[#00D4FF]/20 group-hover:ring-[#00D4FF]/50 transition-all">
                {getUserAvatar(user)}
              </div>
              {/* Online status indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111118]"></span>
            </div>
            {sidebarOpen && (
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white group-hover:text-[#00D4FF] transition-colors">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;