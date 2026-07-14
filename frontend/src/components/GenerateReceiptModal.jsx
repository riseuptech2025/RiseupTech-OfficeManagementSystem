// components/GenerateReceiptModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTimes, 
  FaSpinner, 
  FaReceipt, 
  FaTrash, 
  FaPlus, 
  FaMoneyBillWave, 
  FaFileInvoice, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaSearch 
} from 'react-icons/fa';
import { receiptService } from '../services/receiptService';
import { customerService } from '../services/customerService';
import logo from '../assets/logo.png';

const DEFAULT_REMARKS = 'Thank you for choosing Riseup-Tech Software Company. We appreciate your business and look forward to serving you again.';

// Payment methods that require transaction ID
const ONLINE_METHODS = ['eSewa', 'Khalti', 'Bank Transfer', 'FonePay', 'Credit/Debit Card'];

const GenerateReceiptModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    saveCustomer: true,
    services: [{ serviceName: '', description: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    vatRate: 13,
    paymentMethod: 'Cash',
    transactionId: '',
    bankName: '',
    paidAmount: '',
    paymentStatus: 'Pending',
    remarks: DEFAULT_REMARKS,
    customerSignature: '',
    authorizedSignature: '',
    companyStamp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [customerSearchResult, setCustomerSearchResult] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
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

  // ============================================
  // Search customer by phone
  // ============================================
  const searchCustomer = async () => {
    if (!formData.customerPhone || formData.customerPhone.length < 10) {
      setError('Please enter a valid phone number to search');
      return;
    }

    setSearchingCustomer(true);
    setError('');
    setCustomerSearchResult(null);

    try {
      const response = await customerService.searchCustomer(formData.customerPhone);
      if (response.data) {
        setCustomerSearchResult(response.data);
        setFormData(prev => ({
          ...prev,
          customerId: response.data._id,
          customerName: response.data.name || prev.customerName,
          customerEmail: response.data.email || prev.customerEmail,
          customerAddress: response.data.address || prev.customerAddress,
        }));
      } else {
        setCustomerSearchResult(null);
        setFormData(prev => ({
          ...prev,
          customerId: '',
        }));
      }
    } catch (error) {
      console.error('Search customer error:', error);
      if (error.response?.status === 404) {
        setCustomerSearchResult(null);
        setFormData(prev => ({
          ...prev,
          customerId: '',
        }));
      } else {
        setError('Failed to search customer. Please try again.');
      }
    } finally {
      setSearchingCustomer(false);
    }
  };

  // ============================================
  // Auto-search when phone changes (debounced)
  // ============================================
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (formData.customerPhone && formData.customerPhone.length >= 10) {
        searchCustomer();
      }
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [formData.customerPhone]);

  // ============================================
  // Calculate totals
  // ============================================
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

  // ============================================
  // Check if payment method requires transaction ID
  // ============================================
  const requiresTransactionId = ONLINE_METHODS.includes(formData.paymentMethod);
  const isBankTransfer = formData.paymentMethod === 'Bank Transfer';
  const isCash = formData.paymentMethod === 'Cash';

  // ============================================
  // Submit handler with validation
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate customer
      if (!formData.customerName || !formData.customerPhone) {
        setError('Please provide customer name and phone number');
        setLoading(false);
        return;
      }

      // Validate services
      const hasEmptyService = formData.services.some(s => !s.serviceName || s.quantity <= 0 || s.unitPrice <= 0);
      if (hasEmptyService) {
        setError('Please fill in all service details correctly');
        setLoading(false);
        return;
      }

      // Validate payment method
      if (requiresTransactionId && !formData.transactionId) {
        setError(`Transaction ID is required for ${formData.paymentMethod} payments`);
        setLoading(false);
        return;
      }

      if (isBankTransfer && !formData.bankName) {
        setError('Bank name is required for Bank Transfer payments');
        setLoading(false);
        return;
      }

      // Validate paid amount
      const paidAmount = parseFloat(formData.paidAmount) || 0;
      if (paidAmount > grandTotal) {
        setError(`Paid amount cannot exceed grand total (${grandTotal})`);
        setLoading(false);
        return;
      }

      const receiptData = {
        ...formData,
        paidAmount: paidAmount,
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
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-400">Customer Information</h4>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="saveCustomer"
                  checked={formData.saveCustomer}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#00D4FF]"
                />
                <label className="text-xs text-gray-400">Save Customer</label>
              </div>
            </div>

            {/* Customer Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number *</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                    className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    placeholder="9827399860"
                  />
                  <button
                    type="button"
                    onClick={searchCustomer}
                    disabled={searchingCustomer}
                    className="px-3 py-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all"
                  >
                    {searchingCustomer ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                  </button>
                </div>
                {customerSearchResult && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0F] border border-[#00D4FF]/20 rounded-lg p-2 z-10">
                    <p className="text-xs text-green-400">✓ Customer found: {customerSearchResult.name}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
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

          {/* Payment Information with Partial Payment */}
          <div className="bg-[#0A0A0F]/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Payment Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Payment Method */}
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

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Transaction ID {requiresTransactionId && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  required={requiresTransactionId}
                  disabled={isCash}
                  placeholder={isCash ? 'Not required for Cash' : 'TXN123456'}
                  className={`w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent ${
                    isCash ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                {isCash && (
                  <p className="text-xs text-gray-500 mt-1">Transaction ID not required for Cash payments</p>
                )}
              </div>

              {/* Bank Name */}
              {isBankTransfer && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    required={isBankTransfer}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    placeholder="Nepal Bank Limited"
                  />
                </div>
              )}
            </div>

            {/* Partial Payment Section */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700/50 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Paid Amount (Optional)
                  <span className="text-xs text-gray-500 ml-2">Leave empty for full payment</span>
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  min="0"
                  max={grandTotal}
                  step="0.01"
                  placeholder={`Max: ${grandTotal.toFixed(2)}`}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Status</label>
                <div className="px-4 py-2 bg-[#0A0A0F] border border-gray-700 rounded-lg">
                  <span className={`font-medium ${
                    parseFloat(formData.paidAmount) >= grandTotal ? 'text-green-400' :
                    parseFloat(formData.paidAmount) > 0 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {parseFloat(formData.paidAmount) >= grandTotal ? '✓ Paid' :
                     parseFloat(formData.paidAmount) > 0 ? 'Partial Payment' : 'Pending'}
                  </span>
                  {parseFloat(formData.paidAmount) > 0 && parseFloat(formData.paidAmount) < grandTotal && (
                    <span className="text-xs text-gray-400 ml-2">
                      Due: Rs. {(grandTotal - parseFloat(formData.paidAmount)).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-400">
              <div className="bg-[#0A0A0F] p-2 rounded text-center">
                <span className="block">Grand Total</span>
                <span className="text-white font-medium">Rs. {grandTotal.toFixed(2)}</span>
              </div>
              <div className="bg-[#0A0A0F] p-2 rounded text-center">
                <span className="block">Paid</span>
                <span className="text-green-400 font-medium">Rs. {(parseFloat(formData.paidAmount) || 0).toFixed(2)}</span>
              </div>
              <div className="bg-[#0A0A0F] p-2 rounded text-center">
                <span className="block">Due</span>
                <span className="text-red-400 font-medium">Rs. {(grandTotal - (parseFloat(formData.paidAmount) || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
              placeholder={DEFAULT_REMARKS}
            />
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