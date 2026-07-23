// components/PartialPaymentModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTimes, 
  FaSpinner, 
  FaMoneyBillWave, 
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { receiptService } from '../services/receiptService';
import { formatCurrency } from '../utils/formatCurrency';

const PartialPaymentModal = ({ receipt, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    paymentAmount: '',
    paymentMethod: 'Cash',
    transactionId: '',
    bankName: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const paymentAmount = parseFloat(formData.paymentAmount);
      if (!paymentAmount || paymentAmount <= 0) {
        setError('Please enter a valid payment amount');
        setLoading(false);
        return;
      }

      if (paymentAmount > receipt.dueAmount) {
        setError(`Payment amount cannot exceed due amount (${formatCurrency(receipt.dueAmount)})`);
        setLoading(false);
        return;
      }

      // Validate payment method
      const onlineMethods = ['eSewa', 'Khalti', 'Bank Transfer', 'FonePay', 'Credit/Debit Card'];
      if (onlineMethods.includes(formData.paymentMethod) && !formData.transactionId) {
        setError(`Transaction ID is required for ${formData.paymentMethod} payments`);
        setLoading(false);
        return;
      }

      if (formData.paymentMethod === 'Bank Transfer' && !formData.bankName) {
        setError('Bank name is required for Bank Transfer payments');
        setLoading(false);
        return;
      }

      const data = {
        paymentAmount,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        bankName: formData.bankName,
        remarks: formData.remarks || `Partial payment for receipt ${receipt.receiptNumber}`
      };

      await receiptService.makePartialPayment(receipt._id, data);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process partial payment');
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
        className="bg-[#111118] rounded-2xl p-8 max-w-md w-full border border-[#00D4FF]/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Partial Payment</h3>
            <p className="text-sm text-gray-400">Receipt: {receipt.receiptNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Info */}
        <div className="bg-[#0A0A0F]/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Amount</span>
            <span className="text-white font-medium">{formatCurrency(receipt.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Already Paid</span>
            <span className="text-green-400 font-medium">{formatCurrency(receipt.paidAmount)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-700/50 pt-2 mt-2">
            <span className="text-gray-400">Due Amount</span>
            <span className="text-red-400 font-bold">{formatCurrency(receipt.dueAmount)}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Amount *</label>
            <input
              type="number"
              name="paymentAmount"
              value={formData.paymentAmount}
              onChange={handleChange}
              min="0.01"
              max={receipt.dueAmount}
              step="0.01"
              required
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
              placeholder={`Max: ${receipt.dueAmount}`}
            />
            <p className="text-xs text-gray-500 mt-1">Max: {formatCurrency(receipt.dueAmount)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
            >
              <option value="Cash">Cash</option>
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="FonePay">FonePay</option>
              <option value="Credit/Debit Card">Credit/Debit Card</option>
            </select>
          </div>

          {(formData.paymentMethod === 'eSewa' || formData.paymentMethod === 'Khalti' || 
            formData.paymentMethod === 'FonePay' || formData.paymentMethod === 'Credit/Debit Card') && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Transaction ID *</label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                placeholder="TXN123456"
              />
            </div>
          )}

          {formData.paymentMethod === 'Bank Transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Bank Name *</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                placeholder="Nepal Bank Limited"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
              placeholder={`Partial payment for receipt ${receipt.receiptNumber}`}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaMoneyBillWave className="w-4 h-4" />
                  Make Payment
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

export default PartialPaymentModal;