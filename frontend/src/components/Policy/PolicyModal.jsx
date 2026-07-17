// components/Policy/PolicyModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaSpinner,
  FaFileAlt,
  FaSave,
  FaInfoCircle,
  FaUser,
  FaUserTie,
  FaUserCog,
  FaShieldAlt,
  FaUserShield,
  FaSignature,
  FaUsers,
  FaCheckCircle,
  FaUserCheck
} from 'react-icons/fa';
import { policyService } from '../../services/policyService';

const PolicyModal = ({ isEditing, policy, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedId, setGeneratedId] = useState(policy?.policyId || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    policyName: policy?.policyName || '',
    category: policy?.category || 'Employee Handbook',
    appliesTo: policy?.appliesTo || 'All',
    approvalAuthority: policy?.approvalAuthority || 'Admin',
    description: policy?.description || '',
    content: policy?.content || '',
    version: policy?.version || '1.0',
    status: policy?.status || 'Draft'
  });

  // Category codes mapping
  const categoryCodes = {
    'Employee Handbook': 'EHB',
    'HR Policy': 'HRP',
    'CEO Policy': 'CEP',
    'Staff Policy': 'STP',
    'Customer Policy': 'CUP',
    'Shareholder Policy': 'SHP',
    'IT Policy': 'ITP',
    'Security Policy': 'SEP',
    'Finance Policy': 'FIP',
    'Operations Policy': 'OPP',
    'Code of Conduct': 'COC',
    'Data Privacy': 'DAP',
    'Corporate Governance': 'COG',
    'Corporate Financial Management': 'CFM',
    'Corporate Rule Book': 'CRB',
    'User/Developer Policy': 'UDP'
  };

  // Applies to codes mapping
  const appliesToCodes = {
    'All': 'A',
    'Staff': 'S',
    'HR Manager': 'H',
    'CEO': 'C',
    'Admin': 'A',
    'Super Admin': 'SA',
    'Customers': 'CU',
    'Shareholders': 'SH',
    'Developers': 'D',
    'Corporate': 'CO'
  };

  // Generate policy ID preview
  const generatePolicyIdPreview = async (appliesTo, category) => {
    setIsGenerating(true);
    try {
      const response = await policyService.getNextPolicyId(appliesTo, category);
      if (response.data) {
        setGeneratedId(response.data.nextId);
      }
    } catch (error) {
      console.error('Failed to generate policy ID:', error);
      const catCode = categoryCodes[category] || 'OTH';
      const appCode = appliesToCodes[appliesTo] || 'A';
      setGeneratedId(`RT-${catCode}-${appCode}01`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'category' || name === 'appliesTo') {
      const newCategory = name === 'category' ? value : formData.category;
      const newAppliesTo = name === 'appliesTo' ? value : formData.appliesTo;
      generatePolicyIdPreview(newAppliesTo, newCategory);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        createdBy: user.id,
        createdByName: user.name,
        // No signature cards - they are managed separately
        signatureCards: []
      };

      if (isEditing) {
        await policyService.updatePolicy(policy._id, data);
      } else {
        await policyService.createPolicy(data);
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save policy');
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
            <FaFileAlt className="text-[#00D4FF] w-6 h-6" />
            <h3 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Policy' : 'Create New Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Policy ID Preview */}
          {!isEditing && (
            <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-[#00D4FF] w-4 h-4" />
                <span className="text-sm text-gray-400">Policy ID will be:</span>
                <span className="text-sm font-bold text-[#00D4FF]">
                  {isGenerating ? <FaSpinner className="w-4 h-4 animate-spin" /> : generatedId || 'RT-XXX-A01'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: RT-{'{CategoryCode}'}-{'{AppliesToCode}'}{'{Sequence}'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Policy Name *</label>
            <input
              type="text"
              name="policyName"
              value={formData.policyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="e.g., Employee Code of Conduct"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              >
                <option value="Employee Handbook">Employee Handbook</option>
                <option value="HR Policy">HR Policy</option>
                <option value="CEO Policy">CEO Policy</option>
                <option value="Staff Policy">Staff Policy</option>
                <option value="Customer Policy">Customer Policy</option>
                <option value="Shareholder Policy">Shareholder Policy</option>
                <option value="IT Policy">IT Policy</option>
                <option value="Security Policy">Security Policy</option>
                <option value="Finance Policy">Finance Policy</option>
                <option value="Operations Policy">Operations Policy</option>
                <option value="Code of Conduct">Code of Conduct</option>
                <option value="Data Privacy">Data Privacy</option>
                <option value="Corporate Governance">Corporate Governance</option>
                <option value="Corporate Financial Management">Corporate Financial Management</option>
                <option value="Corporate Rule Book">Corporate Rule Book</option>
                <option value="User/Developer Policy">User/Developer Policy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Applies To *</label>
              <select
                name="appliesTo"
                value={formData.appliesTo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              >
                <option value="All">All</option>
                <option value="Staff">Staff</option>
                <option value="HR Manager">HR Manager</option>
                <option value="CEO">CEO</option>
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Customers">Customers</option>
                <option value="Shareholders">Shareholders</option>
                <option value="Developers">Developers</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Approval Authority *</label>
            <select
              name="approvalAuthority"
              value={formData.approvalAuthority}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              <option value="CEO">CEO</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
              <option value="COO">COO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Version</label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="1.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="2"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="Brief description of the policy..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="Full policy content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Under Review">Under Review</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* ============================================ */}
          {/* SIGNATURE CARDS SECTION REMOVED */}
          {/* Signatures are now managed separately via the */}
          {/* Signature Management button on the policy card */}
          {/* ============================================ */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-dashed border-[#00D4FF]/20">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FaSignature className="text-[#00D4FF]" />
              <span>Signatures are managed separately from the policy card</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click the "Signatures" button on any policy to add or manage signatures
            </p>
          </div>

          <div className="flex gap-3 pt-4">
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
                  {isEditing ? 'Update Policy' : 'Create Policy'}
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

export default PolicyModal;