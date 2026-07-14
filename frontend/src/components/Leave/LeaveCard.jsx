import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCheck, 
  FaTimes, 
  FaComment, 
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaPaperclip
} from 'react-icons/fa';

const LeaveCard = ({ leave, onStatusUpdate, onComment }) => {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'approved': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'cancelled': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      personal: 'Personal Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      other: 'Other Leave'
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      annual: 'text-blue-400',
      sick: 'text-red-400',
      personal: 'text-purple-400',
      maternity: 'text-pink-400',
      paternity: 'text-indigo-400',
      other: 'text-gray-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const canApprove = leave.approvers?.some(approver => 
    approver._id === currentUser?._id
  ) || ['super_admin', 'ceo', 'founder'].includes(currentUser?.role);

  const canCancel = leave.employee._id === currentUser?._id && leave.status === 'pending';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            {leave.employee?.profilePicture ? (
              <img src={leave.employee.profilePicture} alt={leave.employeeName} className="w-full h-full object-cover" />
            ) : (
              leave.employeeName?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">{leave.employeeName}</h3>
            <p className="text-xs text-gray-400">{leave.employeeRole}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
        </span>
      </div>

      {/* Leave Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FaCalendarAlt className={`${getTypeColor(leave.type)} w-4 h-4`} />
          <span className="text-gray-300">{getTypeLabel(leave.type)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <FaClock className="text-[#00D4FF] w-4 h-4" />
          <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
        </div>
        <div className="text-sm text-gray-300">
          <span className="text-[#00D4FF]">{leave.daysCount}</span> days
        </div>
        {leave.reason && (
          <p className="text-sm text-gray-400 mt-2 bg-[#0A0A0F]/50 p-3 rounded-lg">
            {leave.reason}
          </p>
        )}
        {leave.rejectionReason && leave.status === 'rejected' && (
          <p className="text-sm text-red-400 mt-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <span className="font-medium">Rejection Reason:</span> {leave.rejectionReason}
          </p>
        )}
      </div>

      {/* Approvers */}
      {leave.approvers && leave.approvers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-xs text-gray-500 mr-1">Approvers:</span>
          {leave.approvers.map((approver, idx) => (
            <span key={idx} className="text-xs text-gray-400 bg-[#0A0A0F]/50 px-2 py-0.5 rounded">
              {approver.name}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {canApprove && leave.status === 'pending' && (
          <>
            <button
              onClick={() => onStatusUpdate(leave._id, 'approved')}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
            >
              <FaCheck className="w-3 h-3" />
              Approve
            </button>
            <button
              onClick={() => setShowRejectReason(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
            >
              <FaTimes className="w-3 h-3" />
              Reject
            </button>
          </>
        )}
        {canCancel && (
          <button
            onClick={() => onStatusUpdate(leave._id, 'cancelled')}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20 transition-colors text-sm"
          >
            <FaTimes className="w-3 h-3" />
            Cancel
          </button>
        )}
      </div>

      {/* Comments */}
      <button
        onClick={() => setShowComment(!showComment)}
        className="text-sm text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors flex items-center gap-1"
      >
        <FaComment className="w-3 h-3" />
        {leave.comments?.length || 0} Comments
      </button>

      {showComment && (
        <div className="mt-3 space-y-2">
          {leave.comments?.map((cmt, idx) => (
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
                  onComment(leave._id, comment);
                  setComment('');
                }
              }}
            />
            <button
              onClick={() => {
                if (comment.trim()) {
                  onComment(leave._id, comment);
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

      {/* Reject Reason Modal */}
      {showRejectReason && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] rounded-xl p-6 max-w-md w-full border border-red-500/20">
            <h3 className="text-white font-semibold mb-3">Rejection Reason</h3>
            <p className="text-sm text-gray-400 mb-3">Please provide a reason for rejecting this leave request.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="4"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (rejectionReason.trim()) {
                    onStatusUpdate(leave._id, 'rejected', rejectionReason);
                    setShowRejectReason(false);
                    setRejectionReason('');
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectReason(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LeaveCard;