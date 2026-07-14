// pages/Tasks/TaskPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaSpinner, 
  FaTasks,
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaHistory,
  FaClock
} from 'react-icons/fa';
import { taskService } from '../services/taskService';
import TaskCard from '../components/Task/TaskCard';
import TaskStats from '../components/Task/TaskStats';
import TaskForm from '../components/Task/TaskForm';
import { authService } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const TaskPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
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
    fetchTasks();
    fetchStats();
    fetchUnreadCount();

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [filter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      
      const response = await taskService.getTasks(params);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await taskService.getStats();
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
      setUnreadCount(2); // Example count
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleUpdateTask = async (id, data) => {
    try {
      await taskService.updateTask(id, data);
      await fetchTasks();
      await fetchStats();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleSubtaskUpdate = async (taskId, subtaskIndex, completed) => {
    try {
      await taskService.updateSubtask(taskId, subtaskIndex, completed);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const handleAddComment = async (id, comment) => {
    try {
      await taskService.addComment(id, comment);
      await fetchTasks();
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
    { Icon: FaTasks, color: '#7C3AED', delay: 1.5 },
    { Icon: FaClock, color: '#06D6A0', delay: 3 },
    { Icon: FaUsers, color: '#FF6B6B', delay: 0.5 },
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
              <h2 className="text-2xl font-bold text-white">Task Management</h2>
              <p className="text-gray-400">Create and manage tasks</p>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('Create Task button clicked');
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all cursor-pointer z-10 relative"
            >
              <FaPlus className="w-4 h-4" />
              Create Task
            </button>
          </div>

          {/* Stats */}
          {stats && <TaskStats stats={stats} />}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-[#111118] text-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-[#111118] text-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Task Cards */}
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaTasks className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No tasks found</p>
              <p className="text-sm">Create your first task</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onComment={handleAddComment}
                  onSubtaskUpdate={handleSubtaskUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TaskForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchTasks();
              fetchStats();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskPage;