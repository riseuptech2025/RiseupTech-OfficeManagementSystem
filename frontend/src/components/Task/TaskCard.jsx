import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaComment, 
  FaClock,
  FaUser,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaList,
  FaPlus
} from 'react-icons/fa';

const TaskCard = ({ task, onUpdate, onComment, onSubtaskUpdate }) => {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      review: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      completed: 'text-green-400 bg-green-400/10 border-green-400/20',
      cancelled: 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      development: 'Development',
      design: 'Design',
      marketing: 'Marketing',
      hr: 'HR',
      finance: 'Finance',
      operations: 'Operations',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const canManage = task.assignedBy._id === currentUser?._id || 
    ['super_admin', 'ceo', 'founder'].includes(currentUser?.role);

  const isAssigned = task.assignedTo._id === currentUser?._id;

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'cancelled';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const updatedSubtasks = [...task.subtasks, { title: newSubtask.trim(), completed: false }];
      onUpdate(task._id, { subtasks: updatedSubtasks });
      setNewSubtask('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111118] rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold overflow-hidden">
            {task.assignedTo?.profilePicture ? (
              <img src={task.assignedTo.profilePicture} alt={task.assignedToName} className="w-full h-full object-cover" />
            ) : (
              task.assignedToName?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">{task.title}</h3>
            <p className="text-xs text-gray-400">
              Assigned to: {task.assignedToName} ({task.assignedToRole})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
          </span>
          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Task Details */}
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-300 bg-[#0A0A0F]/50 p-3 rounded-lg">
          {task.description}
        </p>
        
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="text-gray-400">Category: {getCategoryLabel(task.category)}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">Created by: {task.assignedByName}</span>
          <span className="text-gray-500">•</span>
          <span className={`${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
            Due: {formatDate(task.dueDate)} {isOverdue && '⚠️ Overdue'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0A0A0F] rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full h-2 transition-all duration-300"
            style={{ width: `${task.progress || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Progress</span>
          <span>{task.progress || 0}%</span>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="text-xs text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <FaList className="w-3 h-3" />
            Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
          </button>
          {showDetails && (
            <div className="mt-2 space-y-1">
              {task.subtasks.map((subtask, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#0A0A0F]/50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => onSubtaskUpdate(task._id, idx, !subtask.completed)}
                    className="w-4 h-4 accent-[#00D4FF]"
                    disabled={!isAssigned && !canManage}
                  />
                  <span className={`text-sm ${subtask.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
              {(isAssigned || canManage) && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add subtask..."
                    className="flex-1 px-3 py-1 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="px-3 py-1 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00D4FF]/80 transition-colors text-sm"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(isAssigned || canManage) && task.status !== 'completed' && task.status !== 'cancelled' && (
        <div className="flex flex-wrap gap-2 mb-3">
          {isAssigned && (
            <>
              <button
                onClick={() => onUpdate(task._id, { status: 'in_progress' })}
                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
              >
                Start Progress
              </button>
              <button
                onClick={() => onUpdate(task._id, { status: 'review' })}
                className="px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors text-sm"
              >
                Submit for Review
              </button>
            </>
          )}
          {canManage && (
            <>
              <button
                onClick={() => onUpdate(task._id, { status: 'completed' })}
                className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
              >
                <FaCheck className="inline w-3 h-3 mr-1" />
                Complete
              </button>
              <button
                onClick={() => onUpdate(task._id, { status: 'cancelled' })}
                className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
              >
                <FaTimes className="inline w-3 h-3 mr-1" />
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* Comments */}
      <button
        onClick={() => setShowComment(!showComment)}
        className="text-sm text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors flex items-center gap-1"
      >
        <FaComment className="w-3 h-3" />
        {task.comments?.length || 0} Comments
      </button>

      {showComment && (
        <div className="mt-3 space-y-2">
          {task.comments?.map((cmt, idx) => (
            <div key={idx} className="bg-[#0A0A0F] rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#00D4FF]">{cmt.userName}</span>
                  <span className="text-xs text-gray-500">({cmt.userRole})</span>
                </div>
                <span className="text-xs text-gray-500">{new Date(cmt.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-300 mt-1">{cmt.comment}</p>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && comment.trim()) {
                  onComment(task._id, comment);
                  setComment('');
                }
              }}
            />
            <button
              onClick={() => {
                if (comment.trim()) {
                  onComment(task._id, comment);
                  setComment('');
                }
              }}
              className="px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00D4FF]/80 transition-colors text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;