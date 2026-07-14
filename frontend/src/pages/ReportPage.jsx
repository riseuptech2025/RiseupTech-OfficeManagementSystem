// pages/Reports/ReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaSpinner, 
  FaFileAlt,
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaTasks,
  FaHistory,
  FaExclamationTriangle
} from 'react-icons/fa';
import { reportService } from '../services/reportService';
import ReportCard from '../components/Report/ReportCard';
import ReportStats from '../components/Report/ReportStats';
import ReportForm from '../components/Report/ReportForm';
import { authService } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ReportPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchReports();
    fetchStats();
    fetchUnreadCount();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [filter, categoryFilter]);

  const fetchReports = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      
      const response = await reportService.getReports(params);
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reportService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      // Replace with actual API call
      // const response = await notificationService.getUnreadCount();
      // setUnreadCount(response.data.count);
      setUnreadCount(3); // Example count
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleStatusUpdate = async (id, status, resolutionNotes) => {
    try {
      await reportService.updateReportStatus(id, { status, resolutionNotes });
      await fetchReports();
      await fetchStats();
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };

  const handleAddComment = async (id, comment, isInternal = false) => {
    try {
      await reportService.addComment(id, comment, isInternal);
      await fetchReports();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getUserInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const techIcons = [
    { Icon: FaChartLine, color: '#00D4FF', delay: 0 },
    { Icon: FaUsers, color: '#7C3AED', delay: 1.5 },
    { Icon: FaFileAlt, color: '#06D6A0', delay: 3 },
    { Icon: FaExclamationTriangle, color: '#FF6B6B', delay: 0.5 },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dashboard-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(0, 212, 255, 0.03)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="rgba(0, 212, 255, 0.05)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
        </svg>
      </div>

      {/* Floating tech particles */}
      {techIcons.map((tech, index) => (
        <motion.div
          key={index}
          className="absolute opacity-10 pointer-events-none"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
            color: tech.color,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, -20, 10, 0],
            rotate: [0, 180, 360],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            delay: tech.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <tech.Icon className="w-16 h-16" />
        </motion.div>
      ))}

      {/* Interactive glow */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none opacity-10 blur-3xl transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, rgba(124,58,237,0.1) 50%, transparent 100%)',
          left: mousePosition.x - 400,
          top: mousePosition.y - 400,
        }}
      />

      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Navbar Component */}
        <Navbar
          user={user}
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={unreadCount}
        />

        {/* Page Content */}
        <div className="p-6">
          {/* Header with Action Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Report Management</h2>
              <p className="text-gray-400">Submit and track reports</p>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('Submit Report button clicked');
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all cursor-pointer z-10 relative"
            >
              <FaPlus className="w-4 h-4" />
              Submit Report
            </button>
          </div>

          {/* Stats */}
          {stats && <ReportStats stats={stats} />}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-[#111118] text-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-[#111118] text-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
            >
              <option value="all">All Categories</option>
              <option value="harassment">Harassment</option>
              <option value="discrimination">Discrimination</option>
              <option value="policy_violation">Policy Violation</option>
              <option value="workplace_issue">Workplace Issue</option>
              <option value="performance">Performance</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Report Cards */}
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaFileAlt className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No reports found</p>
              <p className="text-sm">Submit your first report</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {reports.map((report) => (
                <ReportCard
                  key={report._id}
                  report={report}
                  onStatusUpdate={handleStatusUpdate}
                  onComment={handleAddComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ReportForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchReports();
              fetchStats();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportPage;