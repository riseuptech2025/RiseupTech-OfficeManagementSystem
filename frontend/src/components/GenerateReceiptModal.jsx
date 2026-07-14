// components/GenerateReceiptModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSpinner, FaReceipt, FaTrash, FaPlus, FaMoneyBillWave, FaFileInvoice } from 'react-icons/fa';
import { receiptService } from '../services/receiptService';
import logo from '../assets/logo.png';

// ============================================
// DEFAULT REMARKS - Fixed template
// ============================================
const DEFAULT_REMARKS = 'Thank you for choosing Riseup-Tech Software Company. We appreciate your business and look forward to serving you again.';

const GenerateReceiptModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    
    // Services
    services: [{ serviceName: '', description: '', quantity: 1, unitPrice: 0 }],
    
    // Billing
    discount: 0,
    vatRate: 13,
    
    // Payment
    paymentMethod: 'Cash',
    transactionId: '',
    paymentStatus: 'Pending',
    
    // ============================================
    // FIX: Default remarks pre-filled
    // ============================================
    remarks: DEFAULT_REMARKS,
    
    // Signatures
    customerSignature: '',
    authorizedSignature: '',
    companyStamp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, services: updatedServices });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { serviceName: '', description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeService = (index) => {
    if (formData.services.length > 1) {
      const updatedServices = formData.services.filter((_, i) => i !== index);
      setFormData({ ...formData, services: updatedServices });
    }
  };

  const calculateSubtotal = () => {
    return formData.services.reduce((sum, service) => {
      return sum + (service.quantity * service.unitPrice);
    }, 0);
  };

  const calculateTotals = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = formData.discount || 0;
    const vatRateValue = formData.vatRate || 13;
    const vatAmount = (subtotal - discountAmount) * (vatRateValue / 100);
    const grandTotal = subtotal - discountAmount + vatAmount;
    return { subtotal, discountAmount, vatAmount, grandTotal };
  };

  const { subtotal, discountAmount, vatAmount, grandTotal } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.customerName || !formData.customerPhone) {
        setError('Please provide customer name and phone number');
        setLoading(false);
        return;
      }

      const hasEmptyService = formData.services.some(s => !s.serviceName || s.quantity <= 0 || s.unitPrice <= 0);
      if (hasEmptyService) {
        setError('Please fill in all service details correctly');
        setLoading(false);
        return;
      }

      const receiptData = {
        ...formData,
        services: formData.services.map(s => ({
          serviceName: s.serviceName,
          description: s.description,
          quantity: s.quantity,
          unitPrice: s.unitPrice
        }))
      };

      await receiptService.generateReceipt(receiptData);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate receipt');
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
        className="bg-[#111118] rounded-2xl p-8 max-w-4xl w-full border border-[#00D4FF]/20 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Riseup-Tech" className="h-12 w-auto" />
            <div>
              <h3 className="text-2xl font-bold text-white">Generate Receipt</h3>
              <p className="text-sm text-gray-400">Riseup-Tech Software Company</p>
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
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="9827399860"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Customer Address</label>
                <input
                  type="text"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="Kathmandu, Nepal"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-400">Purchased Services</h4>
              <button
                type="button"
                onClick={addService}
                className="flex items-center gap-1 px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all text-sm"
              >
                <FaPlus className="w-3 h-3" />
                Add Service
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.services.map((service, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end bg-[#0A0A0F] p-3 rounded-lg">
                  <div className="col-span-4">
                    <label className="block text-xs text-gray-500 mb-1">Service Name</label>
                    <input
                      type="text"
                      value={service.serviceName}
                      onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                      placeholder="Web Development"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Qty</label>
                    <input
                      type="number"
                      value={service.quantity}
                      onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
                      min="1"
                      className="w-full px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                    <input
                      type="number"
                      value={service.unitPrice}
                      onChange={(e) => handleServiceChange(index, 'unitPrice', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-1.5 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">Total</label>
                    <div className="px-3 py-1.5 bg-[#0A0A0F] text-[#00D4FF] border border-gray-700 rounded-lg text-sm font-medium">
                      Rs. {(service.quantity * service.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      disabled={formData.services.length === 1}
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Billing Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Discount</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">VAT Rate (%)</label>
                <input
                  type="number"
                  name="vatRate"
                  value={formData.vatRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="13"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-gray-700/50 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">Rs. {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-red-400">- Rs. {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">VAT ({formData.vatRate || 13}%)</span>
                <span className="text-white">Rs. {vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-700/50 pt-2">
                <span className="text-white">Grand Total</span>
                <span className="text-[#00D4FF]">Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Transaction ID</label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="TXN123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Status</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information - Remarks with default value */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Additional Information</h4>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                placeholder={DEFAULT_REMARKS}
              />
              <p className="text-xs text-gray-500 mt-1">Default remarks are pre-filled. Edit if needed.</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                'Generate Receipt'
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

export default GenerateReceiptModal;