// components/Expenditure/ExpenditureModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaSpinner,
  FaSave,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaFileInvoice,
  FaMoneyBillWave,
  FaCreditCard,
  FaWallet,
  FaInfoCircle
} from 'react-icons/fa';
import { expenditureService } from '../../services/expenditureService';

const ExpenditureModal = ({ isEditing, expenditure, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: expenditure?.category || 'Office Rent',
    subCategory: expenditure?.subCategory || '',
    description: expenditure?.description || '',
    amount: expenditure?.amount || '',
    currency: expenditure?.currency || 'NPR',
    paidAmount: expenditure?.paidAmount || 0,
    paymentMethod: expenditure?.paymentMethod || 'Cash',
    paymentReference: expenditure?.paymentReference || '',
    transactionDate: expenditure?.transactionDate ? expenditure.transactionDate.split('T')[0] : new Date().toISOString().split('T')[0],
    vendorName: expenditure?.vendorName || '',
    vendorPhone: expenditure?.vendorPhone || '',
    vendorEmail: expenditure?.vendorEmail || '',
    vendorAddress: expenditure?.vendorAddress || '',
    panNumber: expenditure?.panNumber || '',
    invoiceNumber: expenditure?.invoiceNumber || '',
    notes: expenditure?.notes || '',
    status: expenditure?.status || 'Draft'
  });

  const categories = [
    'Office Rent',
    'Utilities',
    'Salaries',
    'Equipment',
    'Software Licenses',
    'Marketing',
    'Travel',
    'Food & Beverage',
    'Stationery',
    'Maintenance',
    'Insurance',
    'Taxes',
    'Training',
    'Miscellaneous'
  ];

  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'eSewa', 'Khalti', 'FonePay'];
  const currencies = ['NPR', 'USD', 'EUR', 'GBP', 'INR'];
  const statuses = ['Draft', 'Submitted', 'Approved', 'Paid', 'Cancelled'];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.category || !formData.description || !formData.amount || !formData.vendorName) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (parseFloat(formData.amount) <= 0) {
        setError('Amount must be greater than 0');
        setLoading(false);
        return;
      }

      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        paidAmount: parseFloat(formData.paidAmount) || 0,
        createdBy: user.id,
        createdByName: user.name
      };

      if (isEditing) {
        await expenditureService.updateExpenditure(expenditure._id, data);
      } else {
        await expenditureService.createExpenditure(data);
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save expenditure');
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
        className="bg-[#111118] rounded-2xl p-8 max-w-3xl w-full border border-[#00D4FF]/20 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-[#00D4FF] w-6 h-6" />
            <h3 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Expenditure' : 'Add Expenditure'}
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
          {/* Basic Information */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Basic Information</h4>
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
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Sub Category</label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="e.g., Office Supplies"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="Brief description of the expenditure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Paid Amount</label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Transaction Date</label>
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
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
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <FaUser className="text-[#00D4FF]" />
              Vendor Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="Vendor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  name="vendorPhone"
                  value={formData.vendorPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="vendorEmail"
                  value={formData.vendorEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">VAT/PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="VAT/PAN number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <input
                  type="text"
                  name="vendorAddress"
                  value={formData.vendorAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="Vendor address"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <FaCreditCard className="text-[#00D4FF]" />
              Payment Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="Invoice number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Reference</label>
                <input
                  type="text"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="Transaction/Reference ID"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="Additional notes..."
            />
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
                  {isEditing ? 'Update Expenditure' : 'Create Expenditure'}
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

export default ExpenditureModal;