// components/CustomerDetailsModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTimes, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaCalendarAlt, 
  FaClipboardList,
  FaFlag,
  FaClock,
  FaUserCog,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaReceipt,
  FaMoneyBillWave,
  FaFileAlt
} from 'react-icons/fa';
import { customerService } from '../services/customerService';

const CustomerDetailsModal = ({ customer, onClose, onUpdate, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    company: customer.company || '',
    panNumber: customer.panNumber || '',
    requirements: customer.requirements || '',
    dueDate: customer.dueDate ? customer.dueDate.split('T')[0] : '',
    projectType: customer.projectType || 'Other',
    projectStatus: customer.projectStatus || 'New',
    priority: customer.priority || 'Medium',
    assignedTo: customer.assignedTo?._id || '',
    assignedToName: customer.assignedToName || '',
    followUpDate: customer.followUpDate ? customer.followUpDate.split('T')[0] : '',
    notes: customer.notes || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await customerService.createOrUpdateCustomer({
        ...formData,
        id: customer._id
      });
      setSuccess('Customer updated successfully!');
      setTimeout(() => {
        onUpdate();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-500/20 text-blue-400',
      'In Progress': 'bg-yellow-500/20 text-yellow-400',
      'On Hold': 'bg-orange-500/20 text-orange-400',
      'Completed': 'bg-green-500/20 text-green-400',
      'Cancelled': 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'text-green-400',
      'Medium': 'text-yellow-400',
      'High': 'text-orange-400',
      'Urgent': 'text-red-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#111118] rounded-2xl p-8 max-w-4xl w-full border border-[#00D4FF]/20 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <FaUser className="text-[#00D4FF] w-8 h-8" />
            <div>
              <h3 className="text-2xl font-bold text-white">Customer Details</h3>
              <p className="text-sm text-gray-400">View and manage customer information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all text-sm"
            >
              {editMode ? 'Cancel Edit' : 'Edit Customer'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <FaCheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Project & Requirements */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Project & Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  disabled={!editMode}
                  rows="3"
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                  placeholder="Project requirements and details..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Type</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                >
                  <option value="Website Development">Website Development</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Design">Design</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Status & Priority</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Status</label>
                <select
                  name="projectStatus"
                  value={formData.projectStatus}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Follow Up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Financial Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-[#0A0A0F] rounded-lg">
                <p className="text-xs text-gray-400">Total Purchases</p>
                <p className="text-xl font-bold text-white">{customer.totalPurchases || 0}</p>
              </div>
              <div className="text-center p-3 bg-[#0A0A0F] rounded-lg">
                <p className="text-xs text-gray-400">Total Spent</p>
                <p className="text-xl font-bold text-[#00D4FF]">{formatCurrency(customer.totalAmountSpent || 0)}</p>
              </div>
              <div className="text-center p-3 bg-[#0A0A0F] rounded-lg">
                <p className="text-xs text-gray-400">Last Purchase</p>
                <p className="text-sm font-medium text-white">
                  {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Additional Notes</h4>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={!editMode}
              rows="2"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] disabled:opacity-70"
              placeholder="Additional notes about this customer..."
            />
          </div>

          {editMode && (
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Customer Info Badges */}
          <div className="mt-4 pt-4 border-t border-[#00D4FF]/10">
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              <span>Created: {new Date(customer.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Last Updated: {new Date(customer.updatedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Created By: {customer.createdByName || 'N/A'}</span>
              {customer.assignedToName && (
                <>
                  <span>•</span>
                  <span>Assigned To: {customer.assignedToName}</span>
                </>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerDetailsModal;