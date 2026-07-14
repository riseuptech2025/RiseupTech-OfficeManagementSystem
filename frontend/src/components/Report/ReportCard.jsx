import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaComment, 
  FaClock,
  FaExclamationTriangle,
  FaUser,
  FaUserSecret,
  FaCheck,
  FaTimes,
  FaEdit
} from 'react-icons/fa';

const ReportCard = ({ report, onStatusUpdate, onComment }) => {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [showResolution, setShowResolution] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      under_review: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      investigating: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      resolved: 'text-green-400 bg-green-400/10 border-green-400/20',
      dismissed: 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    };
    return colors[status] || colors.submitted;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      harassment: 'Harassment',
      discrimination: 'Discrimination',
      policy_violation: 'Policy Violation',
      workplace_issue: 'Workplace Issue',
      performance: 'Performance',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400'
    };
    return colors[urgency] || 'text-gray-400';
  };

  const canManage = report.assignedTo?._id === currentUser?._id || 
    ['super_admin', 'ceo', 'founder'].includes(currentUser?.role);

  const isReporter = report.reporter._id === currentUser?._id;

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
            {report.isAnonymous ? (
              <FaUserSecret className="w-5 h-5" />
            ) : report.reporter?.profilePicture ? (
              <img src={report.reporter.profilePicture} alt={report.reporterName} className="w-full h-full object-cover" />
            ) : (
              report.reporterName?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {report.isAnonymous ? 'Anonymous Report' : report.reporterName}
            </h3>
            <p className="text-xs text-gray-400">
              {report.isAnonymous ? 'Identity hidden' : report.reporterRole}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
            {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
          </span>
          <span className={`text-xs font-medium ${getUrgencyColor(report.urgency)}`}>
            {report.urgency.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Report Details */}
      <div className="space-y-2 mb-4">
        <h4 className="text-white font-medium">{report.subject}</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-gray-400">Category: {getCategoryLabel(report.category)}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">Created: {new Date(report.createdAt).toLocaleDateString()}</span>
          {report.assignedTo && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Assigned to: {report.assignedTo.name}</span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-300 bg-[#0A0A0F]/50 p-3 rounded-lg">
          {report.description}
        </p>
        {report.resolutionNotes && (
          <p className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <span className="font-medium">Resolution:</span> {report.resolutionNotes}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {canManage && report.status !== 'resolved' && report.status !== 'dismissed' && (
        <div className="flex flex-wrap gap-2 mb-3">
          <select
            onChange={(e) => {
              if (e.target.value === 'resolved') {
                setShowResolution(true);
              } else {
                onStatusUpdate(report._id, e.target.value);
              }
            }}
            className="px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            defaultValue=""
          >
            <option value="" disabled>Update Status</option>
            <option value="under_review">Under Review</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolution && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] rounded-xl p-6 max-w-md w-full border border-green-500/20">
            <h3 className="text-white font-semibold mb-3">Resolution Notes</h3>
            <p className="text-sm text-gray-400 mb-3">Please provide details on how this report was resolved.</p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Enter resolution details..."
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (resolutionNotes.trim()) {
                    onStatusUpdate(report._id, 'resolved', resolutionNotes);
                    setShowResolution(false);
                    setResolutionNotes('');
                  }
                }}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Resolve
              </button>
              <button
                onClick={() => {
                  setShowResolution(false);
                  setResolutionNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <button
        onClick={() => setShowComment(!showComment)}
        className="text-sm text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors flex items-center gap-1"
      >
        <FaComment className="w-3 h-3" />
        {report.comments?.length || 0} Comments
      </button>

      {showComment && (
        <div className="mt-3 space-y-2">
          {report.comments?.map((cmt, idx) => (
            <div key={idx} className="bg-[#0A0A0F] rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#00D4FF]">{cmt.userName}</span>
                  <span className="text-xs text-gray-500">({cmt.userRole})</span>
                  {cmt.isInternal && (
                    <span className="text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">Internal</span>
                  )}
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
                  onComment(report._id, comment);
                  setComment('');
                }
              }}
            />
            <button
              onClick={() => {
                if (comment.trim()) {
                  onComment(report._id, comment);
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

export default ReportCard;