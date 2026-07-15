// components/AddCustomerModal.jsx
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
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
  FaUserPlus
} from 'react-icons/fa';
import { customerService } from '../services/customerService';

const AddCustomerModal = ({ onClose, onSuccess, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    company: '',
    panNumber: '',
    requirements: '',
    dueDate: '',
    projectType: 'Other',
    projectStatus: 'New',
    priority: 'Medium',
    assignedTo: '',
    assignedToName: '',
    followUpDate: '',
    notes: ''
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

    try {
      // Validate required fields
      if (!formData.name || !formData.phone) {
        setError('Please provide customer name and phone number');
        setLoading(false);
        return;
      }

      await customerService.createOrUpdateCustomer({
        ...formData,
        createdBy: currentUser?._id,
        createdByName: currentUser?.name
      });
      
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#111118] rounded-2xl p-8 max-w-2xl w-full border border-[#00D4FF]/20 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <FaUserPlus className="text-[#00D4FF] w-8 h-8" />
            <div>
              <h3 className="text-2xl font-bold text-white">Add New Customer</h3>
              <p className="text-sm text-gray-400">Create a new customer record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="9827399860"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="Company Name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="Kathmandu, Nepal"
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
                  rows="3"
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="Project requirements and details..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Type</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
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
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
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
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
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
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
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
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                />
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
              rows="2"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
              placeholder="Additional notes about this customer..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <FaUserPlus className="w-4 h-4" />
                  Add Customer
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddCustomerModal;