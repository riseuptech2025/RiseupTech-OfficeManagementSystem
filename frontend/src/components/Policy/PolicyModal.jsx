// components/Policy/PolicyModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaSpinner,
  FaFileAlt,
  FaSave,
  FaInfoCircle,
  FaPlus,
  FaTrash,
  FaUser,
  FaUserTie,
  FaUserCog,
  FaShieldAlt,
  FaUserShield,
  FaSignature,
  FaUsers,
  FaCheckCircle,
  FaUserCheck,
  FaMinusCircle
} from 'react-icons/fa';
import { policyService } from '../../services/policyService';

const PolicyModal = ({ isEditing, policy, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedId, setGeneratedId] = useState(policy?.policyId || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState({});
  const [formData, setFormData] = useState({
    policyName: policy?.policyName || '',
    category: policy?.category || 'Employee Handbook',
    appliesTo: policy?.appliesTo || 'All',
    approvalAuthority: policy?.approvalAuthority || 'Admin',
    description: policy?.description || '',
    content: policy?.content || '',
    version: policy?.version || '1.0',
    status: policy?.status || 'Draft',
    signatureCards: policy?.signatureCards || []
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

  // ============================================
  // Signature Cards Management (ALL OPTIONAL)
  // ============================================
  const addSignatureCard = (type = 'Customer') => {
    const newCard = {
      type: type,
      name: '',
      role: '',
      showDate: true
    };
    if (type === 'Approved By') {
      newCard.userId = '';
    }
    setFormData(prev => ({
      ...prev,
      signatureCards: [...prev.signatureCards, newCard]
    }));
  };

  const removeSignatureCard = (index) => {
    setFormData(prev => ({
      ...prev,
      signatureCards: prev.signatureCards.filter((_, i) => i !== index)
    }));
  };

  const updateSignatureCard = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      signatureCards: prev.signatureCards.map((card, i) => 
        i === index ? { ...card, [field]: value } : card
      )
    }));
  };

  const updateApprovedByEmployee = (index, employeeId) => {
    const employees = availableEmployees[formData.approvalAuthority] || [];
    const selected = employees.find(emp => emp._id === employeeId);
    if (selected) {
      updateSignatureCard(index, 'name', selected.name);
      updateSignatureCard(index, 'role', selected.role);
      updateSignatureCard(index, 'userId', selected._id);
    } else {
      updateSignatureCard(index, 'name', '');
      updateSignatureCard(index, 'role', '');
      updateSignatureCard(index, 'userId', null);
    }
  };

  // Fetch employees when approval authority changes
  useEffect(() => {
    const fetchEmployees = async () => {
      if (formData.approvalAuthority) {
        try {
          const response = await policyService.getEmployeesByRole(formData.approvalAuthority);
          if (response.data) {
            setAvailableEmployees(prev => ({
              ...prev,
              [formData.approvalAuthority]: response.data
            }));
          }
        } catch (error) {
          console.error('Failed to fetch employees:', error);
        }
      }
    };
    fetchEmployees();
  }, [formData.approvalAuthority]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ============================================
      // NO VALIDATION - ALL SIGNATURES ARE OPTIONAL
      // Simply filter out completely empty signature cards
      // ============================================
      const data = {
        ...formData,
        createdBy: user.id,
        createdByName: user.name
      };

      // Filter out completely empty signature cards (no name, no userId)
      data.signatureCards = data.signatureCards.filter(card => {
        // Keep if it has any valid data
        if (card.type === 'Approved By') {
          return card.userId || (card.name && card.name.trim() !== '');
        }
        return card.name && card.name.trim() !== '';
      });

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
          {/* SIGNATURE CARDS SECTION - ALL OPTIONAL */}
          {/* ============================================ */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-400">Signature Cards (Optional)</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addSignatureCard('Approved By')}
                  className="flex items-center gap-1 px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg hover:bg-[#7C3AED]/20 transition-all text-sm"
                >
                  <FaUserShield className="w-3 h-3" />
                  Add Approved By
                </button>
                <button
                  type="button"
                  onClick={() => addSignatureCard('Customer')}
                  className="flex items-center gap-1 px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all text-sm"
                >
                  <FaPlus className="w-3 h-3" />
                  Add Customer
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {formData.signatureCards.map((card, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end bg-[#0A0A0F] p-3 rounded-lg border border-[#00D4FF]/10">
                  <div className="col-span-12 text-xs text-gray-500 mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {card.type === 'Approved By' ? (
                        <>
                          <FaUserShield className="text-[#7C3AED] w-3 h-3" />
                          <span className="text-[#7C3AED]">Approved By</span>
                        </>
                      ) : (
                        <>
                          <FaUsers className="text-[#F59E0B] w-3 h-3" />
                          <span className="text-[#F59E0B]">Customer Signature</span>
                        </>
                      )}
                      <span className="text-xs text-gray-500">(Optional)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSignatureCard(index)}
                      className="text-red-400 hover:text-red-300 transition-colors text-xs flex items-center gap-1"
                    >
                      <FaTrash className="w-3 h-3" />
                      Remove
                    </button>
                  </div>

                  {card.type === 'Approved By' ? (
                    <>
                      <div className="col-span-5">
                        <select
                          value={card.userId || ''}
                          onChange={(e) => updateApprovedByEmployee(index, e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-sm"
                        >
                          <option value="">Select Employee (Optional)</option>
                          {(availableEmployees[formData.approvalAuthority] || []).map(emp => (
                            <option key={emp._id} value={emp._id}>
                              {emp.name} ({emp.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Name (Optional)"
                          value={card.name}
                          onChange={(e) => updateSignatureCard(index, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={card.showDate !== false}
                            onChange={(e) => updateSignatureCard(index, 'showDate', e.target.checked)}
                            className="w-4 h-4 accent-[#7C3AED]"
                          />
                          <span className="text-xs text-gray-400">Show Date</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Customer Signature Card
                    <>
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Customer Name (Optional)"
                          value={card.name}
                          onChange={(e) => updateSignatureCard(index, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Role (Optional)"
                          value={card.role || ''}
                          onChange={(e) => updateSignatureCard(index, 'role', e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={card.showDate !== false}
                            onChange={(e) => updateSignatureCard(index, 'showDate', e.target.checked)}
                            className="w-4 h-4 accent-[#00D4FF]"
                          />
                          <span className="text-xs text-gray-400">Show Date</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {formData.signatureCards.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
                  <p className="text-gray-400">No signature cards added</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Click "Add Approved By" or "Add Customer" to add optional signature cards
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <FaInfoCircle className="inline w-3 h-3 mr-1" />
              All signature cards are optional. You can add or remove them as needed.
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