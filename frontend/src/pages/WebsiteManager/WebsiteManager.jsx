// src/pages/WebsiteManager/WebsiteManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGlobe, 
  FaFileAlt, 
  FaBlog, 
  FaServicestack, 
  FaUsers, 
  FaComments, 
  FaCog, 
  FaBriefcase,
  FaEnvelope,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaImage,
  FaSearch
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import PagesManager from './PagesManager';
import BlogsManager from './BlogsManager';
import ServicesManager from './ServicesManager';
import TeamManager from './TeamManager';
import TestimonialsManager from './TestimonialsManager';
import SettingsManager from './SettingsManager';
import CareerManager from './CareerManager';
import ContactManager from './ContactManager';

const WebsiteManager = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pages');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getUser();
    console.log('Current user in WebsiteManager:', currentUser);
    
    if (!currentUser) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Check if user has admin or super_admin role
    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      console.log('User role not authorized:', currentUser.role);
      navigate('/home');
      return;
    }
    
    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'pages', label: 'Pages', icon: FaFileAlt },
    { id: 'blogs', label: 'Blogs', icon: FaBlog },
    { id: 'services', label: 'Services', icon: FaServicestack },
    { id: 'team', label: 'Team', icon: FaUsers },
    { id: 'testimonials', label: 'Testimonials', icon: FaComments },
    { id: 'careers', label: 'Careers', icon: FaBriefcase },
    { id: 'contacts', label: 'Contacts', icon: FaEnvelope },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'pages':
        return <PagesManager />;
      case 'blogs':
        return <BlogsManager />;
      case 'services':
        return <ServicesManager />;
      case 'team':
        return <TeamManager />;
      case 'testimonials':
        return <TestimonialsManager />;
      case 'careers':
        return <CareerManager />;
      case 'contacts':
        return <ContactManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <PagesManager />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                <FaGlobe className="text-[#00D4FF]" />
                Website Manager
              </h1>
              <p className="text-gray-400 mt-1">Manage your company website content</p>
            </div>
            <button
              onClick={() => window.open('http://localhost:5174', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all border border-[#00D4FF]/20"
            >
              <FaEye className="w-4 h-4" />
              View Website
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-[#00D4FF]/10 pb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#00D4FF] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#111118]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl border border-[#00D4FF]/10 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteManager;