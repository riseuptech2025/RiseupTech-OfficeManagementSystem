import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaTasks, 
  FaClock, 
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaList
} from 'react-icons/fa';

const TaskStats = ({ stats }) => {
  const statItems = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: FaTasks, color: '#00D4FF' },
    { label: 'Pending', value: stats?.pendingTasks || 0, icon: FaClock, color: '#F59E0B' },
    { label: 'In Progress', value: stats?.inProgressTasks || 0, icon: FaSpinner, color: '#7C3AED' },
    { label: 'Completed', value: stats?.completedTasks || 0, icon: FaCheckCircle, color: '#06D6A0' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: FaExclamationTriangle, color: '#FF6B6B' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-2xl font-bold text-white">{item.value}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskStats;