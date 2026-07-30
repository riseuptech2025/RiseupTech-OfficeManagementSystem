// src/pages/WebsiteManager/ContactManager.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEnvelope, FaSpinner, FaSearch, FaReply, FaTrash,
  FaCheck, FaClock, FaUser, FaPhone, FaTag,
  FaCalendarAlt, FaEye, FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { authService } from '../../services/api';

const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/website/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = authService.getToken();
      await axios.put(`${import.meta.env.VITE_API_URL}/website/contacts/${id}/status`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact status:', error);
      alert('Error updating contact status');
    }
  };

  const handleReply = async (id) => {
    if (!replyContent.trim()) {
      alert('Please enter a reply');
      return;
    }
    
    try {
      const token = authService.getToken();
      await axios.put(`${import.meta.env.VITE_API_URL}/website/contacts/${id}/status`, {
        status: 'replied',
        reply: replyContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowReplyModal(false);
      setReplyContent('');
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const token = authService.getToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/website/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error deleting contact');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      read: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      replied: 'bg-green-500/20 text-green-400 border-green-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock className="text-yellow-400" />;
      case 'read': return <FaEye className="text-blue-400" />;
      case 'replied': return <FaReply className="text-green-400" />;
      case 'archived': return <FaTimes className="text-gray-400" />;
      default: return <FaClock className="text-yellow-400" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
          <p className="text-gray-400 text-sm">Manage contact form submissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Contacts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaEnvelope className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No messages found</p>
          <p className="text-sm">No contact form submissions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContacts.map((contact) => (
            <motion.div
              key={contact._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A0A0F] rounded-xl p-4 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{contact.subject}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(contact.status)}`}>
                      {getStatusIcon(contact.status)} {contact.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaUser className="w-3 h-3" />
                      <span>{contact.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaEnvelope className="w-3 h-3" />
                      <span>{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <FaPhone className="w-3 h-3" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mt-3">{contact.message}</p>
                  {contact.reply && (
                    <div className="mt-3 p-3 bg-[#00D4FF]/5 rounded-lg border border-[#00D4FF]/10">
                      <p className="text-xs text-gray-400 mb-1">Reply:</p>
                      <p className="text-gray-300">{contact.reply.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Replied: {new Date(contact.reply.repliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {contact.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(contact._id, 'read')}
                      className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                      title="Mark as Read"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                  )}
                  {contact.status !== 'archived' && (
                    <button
                      onClick={() => {
                        setSelectedContact(contact);
                        setReplyContent('');
                        setShowReplyModal(true);
                      }}
                      className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all"
                      title="Reply"
                    >
                      <FaReply className="w-4 h-4" />
                    </button>
                  )}
                  {contact.status !== 'archived' && (
                    <button
                      onClick={() => handleStatusUpdate(contact._id, 'archived')}
                      className="p-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20 transition-all"
                      title="Archive"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(contact._id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    title="Delete"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#111118] rounded-2xl p-8 max-w-2xl w-full border border-[#00D4FF]/20"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Reply to Message</h3>
                <p className="text-gray-400 text-sm">From: {selectedContact.name} ({selectedContact.email})</p>
              </div>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-[#0A0A0F] rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">Original Message:</p>
              <p className="text-white mt-1">{selectedContact.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Reply</label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows="6"
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                placeholder="Type your reply here..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => handleReply(selectedContact._id)}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all flex items-center justify-center gap-2"
              >
                <FaReply className="w-4 h-4" />
                Send Reply
              </button>
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;