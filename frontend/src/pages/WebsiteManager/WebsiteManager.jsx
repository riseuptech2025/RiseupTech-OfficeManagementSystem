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
  FaShieldAlt,
  FaCookie,
  FaFileContract,
  FaInfoCircle,
  FaHandshake,
  FaUserShield,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
// Import managers
import BlogsManager from './BlogsManager';
import ServicesManager from './ServicesManager';
import TeamManager from './TeamManager';
import TestimonialsManager from './TestimonialsManager';
import SettingsManager from './SettingsManager';
import CareerManager from './CareerManager';
import ContactManager from './ContactManager';
// Import the new page managers
import AboutManager from './pages/AboutManager';
import TermsManager from './pages/TermsManager';
import PrivacyManager from './pages/PrivacyManager';
import CookiesManager from './pages/CookiesManager';

const WebsiteManager = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const tabsContainerRef = React.useRef(null);

  useEffect(() => {
    const currentUser = authService.getUser();
    console.log('Current user in WebsiteManager:', currentUser);
    
    if (!currentUser) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
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

  // ============================================
  // TABS CONFIGURATION - WITHOUT ICONS
  // ============================================
  const allTabs = [
    // Static Pages
    { 
      id: 'about', 
      label: 'About', 
      category: 'Pages',
      description: 'Manage About Us page content'
    },
    { 
      id: 'terms', 
      label: 'Terms', 
      category: 'Pages',
      description: 'Manage Terms & Conditions'
    },
    { 
      id: 'privacy', 
      label: 'Privacy', 
      category: 'Pages',
      description: 'Manage Privacy Policy'
    },
    { 
      id: 'cookies', 
      label: 'Cookies', 
      category: 'Pages',
      description: 'Manage Cookies Policy'
    },
    // Content Sections
    { id: 'blogs', label: 'Blogs', category: 'Content' },
    { id: 'services', label: 'Services', category: 'Content' },
    { id: 'team', label: 'Team', category: 'Content' },
    { id: 'testimonials', label: 'Testimonials', category: 'Content' },
    { id: 'careers', label: 'Careers', category: 'Content' },
    { id: 'contacts', label: 'Contacts', category: 'Content' },
    // Settings
    { id: 'settings', label: 'Settings', category: 'Settings' },
  ];

  // Scroll tabs horizontally
  const scrollTabs = (direction) => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 180;
      const newPosition = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  // ============================================
  // RENDER CONTENT
  // ============================================
  const renderContent = () => {
    switch(activeTab) {
      case 'about': return <AboutManager />;
      case 'terms': return <TermsManager />;
      case 'privacy': return <PrivacyManager />;
      case 'cookies': return <CookiesManager />;
      case 'blogs': return <BlogsManager />;
      case 'services': return <ServicesManager />;
      case 'team': return <TeamManager />;
      case 'testimonials': return <TestimonialsManager />;
      case 'careers': return <CareerManager />;
      case 'contacts': return <ContactManager />;
      case 'settings': return <SettingsManager />;
      default: return <AboutManager />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#0F0F1A] to-[#0A0A0F] flex overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'} flex flex-col h-screen overflow-hidden`}>
        <Navbar 
          user={user}
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Compact Header with Glass Effect */}
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#00D4FF]/5 via-[#00D4FF]/8 to-transparent border border-[#00D4FF]/10 p-6 backdrop-blur-xl shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00D4FF]/10 to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/5 to-[#00D4FF]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#00D4FF] to-[#0099CC] rounded-xl shadow-lg shadow-[#00D4FF]/30">
                  <FaGlobe className="text-[#0A0A0F] text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Website Manager
                  </h1>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <span>Manage your website content</span>
                    <span className="w-1 h-1 bg-[#00D4FF] rounded-full"></span>
                    <span className="text-[#00D4FF] font-medium">{allTabs.length} Sections</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00D4FF]/10 rounded-lg border border-[#00D4FF]/20">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300">Live</span>
                </div>
                <button
                  onClick={() => window.open(import.meta.env.VITE_WEBSITE_URL || 'https://riseuptech.com.np', '_blank')}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-[#0A0A0F] rounded-xl hover:shadow-xl hover:shadow-[#00D4FF]/30 transition-all duration-300 hover:scale-105 font-semibold text-sm"
                >
                  <FaGlobe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>View Site</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* TABS - COMPACT DESIGN WITHOUT ICONS */}
          {/* ============================================ */}
          <div className="relative mb-4">
            {/* Scroll Buttons - Compact */}
            <button
              onClick={() => scrollTabs('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-[#111118]/90 border border-[#00D4FF]/20 rounded-full text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-all duration-300 shadow-lg backdrop-blur-sm hover:scale-110"
            >
              <FaChevronLeft className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => scrollTabs('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-[#111118]/90 border border-[#00D4FF]/20 rounded-full text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-all duration-300 shadow-lg backdrop-blur-sm hover:scale-110"
            >
              <FaChevronRight className="w-3 h-3" />
            </button>

            {/* Tabs Container - Reduced Spacing */}
            <div 
              ref={tabsContainerRef}
              className="flex gap-1.5 overflow-x-auto scrollbar-hide px-10 py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {allTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl transition-all duration-300 relative font-medium text-xs ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-[#0A0A0F] shadow-lg shadow-[#00D4FF]/30'
                        : 'text-gray-400 hover:text-white hover:bg-[#111118]/80 border border-transparent hover:border-[#00D4FF]/20'
                    }`}
                  >
                    <span className="relative z-10 tracking-wide whitespace-nowrap">{tab.label}</span>
                    
                    {/* Active Tab Background Glow */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabGlow"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#0099CC]"
                        initial={false}
                        transition={{ type: "spring", duration: 0.4 }}
                      />
                    )}
                    
                    {/* Category Badge for Active Tab - Smaller */}
                    {isActive && tab.category && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-[#0A0A0F] text-[#00D4FF] text-[8px] font-bold rounded-full border border-[#00D4FF]/30">
                        {tab.category}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Gradient Overlays - Subtle */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A0A0F] to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0A0F] to-transparent pointer-events-none"></div>
          </div>

          {/* Active Tab Indicator - Compact */}
          <div className="mb-4 flex items-center gap-3 px-1">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-10 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] rounded-full"></div>
              <span className="text-sm font-semibold text-white">
                {allTabs.find(t => t.id === activeTab)?.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 bg-[#111118] rounded-full border border-[#00D4FF]/10">
                {allTabs.find(t => t.id === activeTab)?.category || 'General'}
              </span>
            </div>
          </div>

          {/* Content with Enhanced Animation - Full Height */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ 
                duration: 0.3,
                type: "spring",
                stiffness: 120,
                damping: 15
              }}
              className="bg-gradient-to-br from-[#111118]/90 via-[#0F0F1A]/90 to-[#111118]/90 backdrop-blur-2xl rounded-2xl border border-[#00D4FF]/10 p-6 shadow-2xl shadow-black/30 flex-1 min-h-[500px]"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WebsiteManager;