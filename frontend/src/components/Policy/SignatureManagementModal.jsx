// components/Policy/SignatureManagementModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaSpinner,
  FaSignature,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimesCircle,
  FaUserShield,
  FaUsers,
  FaUser,
  FaUserTie,
  FaUserCog,
  FaShieldAlt,
  FaUserCheck,
  FaFileAlt
} from 'react-icons/fa';
import { policyService } from '../../services/policyService';

const SignatureManagementModal = ({ policy, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [loadingSignatures, setLoadingSignatures] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [signatureRole, setSignatureRole] = useState('');
  const [signatureType, setSignatureType] = useState('Approved By');
  const [isAddingSignature, setIsAddingSignature] = useState(false);
  const [editingSignatureId, setEditingSignatureId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editType, setEditType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (policy) {
      fetchSignatures();
    }
  }, [policy]);

  const fetchSignatures = async () => {
    setLoadingSignatures(true);
    try {
      const response = await policyService.getSignatures(policy._id);
      setSignatures(response.data.customSignatures || []);
    } catch (error) {
      console.error('Failed to fetch signatures:', error);
      setError('Failed to load signatures');
    } finally {
      setLoadingSignatures(false);
    }
  };

  const handleAddSignature = async () => {
    if (!signatureName.trim()) {
      setError('Please enter your name');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsAddingSignature(true);
    setError('');
    try {
      await policyService.addSignature(policy._id, {
        type: signatureType,
        name: signatureName,
        role: signatureRole || user?.role || 'Employee',
        userId: user?._id
      });
      await fetchSignatures();
      setSignatureName('');
      setSignatureRole('');
      setSuccess('Signature added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      if (onSuccess) onSuccess();
    } catch (error) {
      setError('Failed to add signature');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsAddingSignature(false);
    }
  };

  const handleEditSignature = async (signatureId) => {
    if (!editName.trim()) {
      setError('Please enter your name');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsAddingSignature(true);
    setError('');
    try {
      await policyService.addSignature(policy._id, {
        signatureId: signatureId,
        type: editType || 'Approved By',
        name: editName,
        role: editRole || user?.role || 'Employee',
        userId: user?._id
      });
      await fetchSignatures();
      setEditingSignatureId(null);
      setEditName('');
      setEditRole('');
      setEditType('');
      setSuccess('Signature updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      if (onSuccess) onSuccess();
    } catch (error) {
      setError('Failed to update signature');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsAddingSignature(false);
    }
  };

  // ============================================
  // FIXED: Delete Signature - Any user can delete their own signatures
  // ============================================
  const handleRemoveSignature = async (signatureId) => {
    // Find the signature to verify ownership
    const signature = signatures.find(s => s._id === signatureId);
    if (!signature) {
      setError('Signature not found');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Check if user owns this signature
    const isOwner = signature.signedBy?._id === user?._id || signature.signedBy === user?._id;
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder'].includes(user?.role);

    if (!isOwner && !isAdmin) {
      setError('You can only delete your own signatures');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm('Are you sure you want to remove this signature?')) return;
    
    setLoading(true);
    setError('');
    try {
      await policyService.removeSignature(policy._id, signatureId);
      await fetchSignatures();
      setSuccess('Signature removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
      if (onSuccess) onSuccess();
    } catch (error) {
      setError('Failed to remove signature');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (sig) => {
    setEditingSignatureId(sig._id);
    setEditName(sig.name);
    setEditRole(sig.role || '');
    setEditType(sig.type || 'Approved By');
  };

  const cancelEdit = () => {
    setEditingSignatureId(null);
    setEditName('');
    setEditRole('');
    setEditType('');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    if (type === 'Approved By') {
      return <FaUserShield className="text-[#7C3AED] w-4 h-4" />;
    }
    return <FaUsers className="text-[#00D4FF] w-4 h-4" />;
  };

  // Check if user owns a signature
  const isSignatureOwner = (signature) => {
    return signature.signedBy?._id === user?._id || signature.signedBy === user?._id;
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
            <FaSignature className="text-[#00D4FF] w-6 h-6" />
            <div>
              <h3 className="text-2xl font-bold text-white">Manage Signatures</h3>
              <p className="text-sm text-gray-400">
                {policy.policyName} - {policy.policyId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-4">
            {success}
          </div>
        )}

        {/* Add Signature Form */}
        <div className="bg-[#0A0A0F]/50 rounded-xl p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <FaPlus className="text-[#00D4FF]" />
            Add Authorised Signature
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Your Name *"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
            />
            <input
              type="text"
              placeholder="Role"
              value={signatureRole}
              onChange={(e) => setSignatureRole(e.target.value)}
              className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
            />
            <div className="flex gap-2">
              <select
                value={signatureType}
                onChange={(e) => setSignatureType(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
              >
                <option value="Approved By">Approved By</option>
                <option value="Customer">Customer</option>
              </select>
              <button
                onClick={handleAddSignature}
                disabled={isAddingSignature}
                className="px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00D4FF]/80 transition-all disabled:opacity-50 text-sm flex items-center gap-1"
              >
                {isAddingSignature ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaPlus className="w-4 h-4" />}
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Existing Signatures */}
        {loadingSignatures ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
          </div>
        ) : signatures.length > 0 ? (
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <FaUsers className="text-[#7C3AED]" />
              Signatures ({signatures.length})
            </h4>
            <div className="space-y-3">
              {signatures.map((sig) => {
                const isOwner = isSignatureOwner(sig);
                const isAdmin = ['super_admin', 'admin', 'ceo', 'founder'].includes(user?.role);
                const canEdit = isOwner || isAdmin;
                
                return (
                  <div key={sig._id} className="bg-[#0A0A0F] p-3 rounded-lg border border-gray-700">
                    {editingSignatureId === sig._id ? (
                      // Edit Mode
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Name"
                            className="px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                          />
                          <input
                            type="text"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            placeholder="Role"
                            className="px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                          />
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                          >
                            <option value="Approved By">Approved By</option>
                            <option value="Customer">Customer</option>
                          </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditSignature(sig._id)}
                            disabled={isAddingSignature}
                            className="px-3 py-1.5 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/80 transition-all text-sm flex items-center gap-1"
                          >
                            {isAddingSignature ? <FaSpinner className="w-3 h-3 animate-spin" /> : <FaCheck className="w-3 h-3" />}
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all text-sm flex items-center gap-1"
                          >
                            <FaTimesCircle className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(sig.type)}
                            <p className="text-sm text-white font-medium">{sig.name}</p>
                            {isOwner && (
                              <span className="text-xs text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{sig.role}</p>
                          <p className="text-xs text-gray-500">Signed: {formatDate(sig.signedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            sig.type === 'Approved By' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'bg-[#00D4FF]/20 text-[#00D4FF]'
                          }`}>
                            {sig.type}
                          </span>
                          {/* Show edit/delete for owner or admin */}
                          {canEdit && (
                            <>
                              <button
                                onClick={() => startEdit(sig)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Edit Signature"
                              >
                                <FaEdit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRemoveSignature(sig._id)}
                                disabled={loading}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Remove Signature"
                              >
                                {loading ? <FaSpinner className="w-3 h-3 animate-spin" /> : <FaTrash className="w-3 h-3" />}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 bg-[#0A0A0F]/30 rounded-xl">
            <FaSignature className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No authorised signatures added yet</p>
            <p className="text-xs text-gray-500">Add an authorised signature using the form above</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 mt-4 border-t border-[#00D4FF]/10">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SignatureManagementModal;