// components/Expenditure/PaymentModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaSpinner,
  FaHandHoldingUsd,
  FaCreditCard,
  FaWallet,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { expenditureService } from '../../services/expenditureService';

const PaymentModal = ({ expenditure, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: expenditure.dueAmount || 0,
    method: 'Cash',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'eSewa', 'Khalti', 'FonePay'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.amount <= 0) {
        setError('Amount must be greater than 0');
        setLoading(false);
        return;
      }

      if (formData.amount > expenditure.dueAmount) {
        setError(`Amount cannot exceed due amount (${formatCurrency(expenditure.dueAmount)})`);
        setLoading(false);
        return;
      }

      await expenditureService.processPayment(expenditure._id, {
        amount: formData.amount,
        method: formData.method,
        reference: formData.reference,
        date: formData.date
      });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process payment');
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
          <div className="flex items-center gap-3">
            <FaHandHoldingUsd className="text-[#00D4FF] w-6 h-6" />
            <div>
              <h3 className="text-2xl font-bold text-white">Make Payment</h3>
              <p className="text-sm text-gray-400">{expenditure.receiptNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-[#0A0A0F]/50 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Vendor</span>
            <span className="text-white font-medium">{expenditure.vendorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Description</span>
            <span className="text-white">{expenditure.description}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Amount</span>
            <span className="text-white font-medium">{formatCurrency(expenditure.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Paid Amount</span>
            <span className="text-[#06D6A0] font-medium">{formatCurrency(expenditure.paidAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-[#00D4FF]/10 pt-2">
            <span className="text-gray-400 font-medium">Due Amount</span>
            <span className="text-[#EF4444] font-bold text-lg">{formatCurrency(expenditure.dueAmount)}</span>
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">Rs.</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="1"
                max={expenditure.dueAmount}
                step="0.01"
                className="w-full pl-10 pr-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max: {formatCurrency(expenditure.dueAmount)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Reference (Optional)</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="Transaction ID / Cheque Number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/80 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-4 h-4" />
                  Process Payment
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

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
            <FaInfoCircle className="text-blue-400 w-4 h-4 mt-0.5" />
            <p className="text-xs text-gray-400">
              Once payment is processed, it will update the expenditure status and company finances automatically.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PaymentModal;