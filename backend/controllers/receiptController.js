// controllers/receiptController.js
const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Helper function to convert number to words
const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (num) => {
    if (num === 0) return 'Zero';
    let words = '';
    if (num >= 1000000) {
      words += inWords(Math.floor(num / 1000000)) + ' Million ';
      num %= 1000000;
    }
    if (num >= 1000) {
      words += inWords(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    if (num >= 100) {
      words += inWords(Math.floor(num / 100)) + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      words += b[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      words += a[num] + ' ';
    }
    return words.trim();
  };

  const rupees = Math.floor(num);
  const paisa = Math.round((num - rupees) * 100);
  let result = inWords(rupees);
  if (paisa > 0) {
    result += ' and ' + inWords(paisa) + ' Paisa';
  }
  return result + ' Nepalese Rupees Only.';
};

// Function to generate receipt number
const generateReceiptNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const startOfDay = new Date(year, now.getMonth(), now.getDate());
  const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1);
  
  const count = await Receipt.countDocuments({
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `RCP-${year}${month}${day}-${sequence}`;
};

// Default remarks template
const DEFAULT_REMARKS = 'Thank you for choosing Riseup-Tech Software Company. We appreciate your business and look forward to serving you again.';

// @desc    Generate a new receipt
// @route   POST /api/receipts
// @access  Private
const generateReceipt = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      services,
      discount,
      vatRate,
      paymentMethod,
      transactionId,
      bankName,
      paidAmount,
      paymentStatus: requestedPaymentStatus,
      remarks,
      customerSignature,
      authorizedSignature,
      companyStamp,
      saveCustomer
    } = req.body;

    console.log('Received receipt data:', req.body);

    // Validate required fields
    if (!customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name and phone number'
      });
    }

    if (!services || !services.length) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one service'
      });
    }

    // Validate services
    for (const service of services) {
      if (!service.serviceName || service.quantity <= 0 || service.unitPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please fill in all service details correctly'
        });
      }
    }

    // Calculate totals
    let subtotal = 0;
    const serviceItems = services.map(service => {
      const total = service.quantity * service.unitPrice;
      subtotal += total;
      return {
        description: service.serviceName,
        descriptionDetail: service.description || '',
        quantity: service.quantity,
        unitPrice: service.unitPrice,
        totalPrice: total
      };
    });

    const discountAmount = parseFloat(discount) || 0;
    const vatRateValue = parseFloat(vatRate) || 13;
    const taxableAmount = subtotal - discountAmount;
    const vatAmount = taxableAmount * (vatRateValue / 100);
    const grandTotal = taxableAmount + vatAmount;

    // Handle partial payment
    const paidAmountValue = parseFloat(paidAmount) || 0;
    const finalPaidAmount = Math.min(paidAmountValue, grandTotal);
    const dueAmount = grandTotal - finalPaidAmount;

    // Determine payment status
    let paymentStatus = 'Pending';
    if (finalPaidAmount >= grandTotal) {
      paymentStatus = 'Paid';
    } else if (finalPaidAmount > 0 && finalPaidAmount < grandTotal) {
      paymentStatus = 'Partial';
    }

    // Determine receipt status
    const isFullyPaid = finalPaidAmount >= grandTotal;
    const finalStatus = isFullyPaid ? 'paid' : 'issued';
    const isEditable = !isFullyPaid;

    // Payment method validation
    const onlineMethods = ['eSewa', 'Khalti', 'Bank Transfer', 'FonePay', 'Credit/Debit Card'];
    const isOnlinePayment = onlineMethods.includes(paymentMethod);

    if (isOnlinePayment && !transactionId) {
      return res.status(400).json({
        success: false,
        message: `Transaction ID is required for ${paymentMethod} payments`
      });
    }

    if (paymentMethod === 'Bank Transfer' && !bankName) {
      return res.status(400).json({
        success: false,
        message: 'Bank name is required for Bank Transfer payments'
      });
    }

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Generate invoice number
    const invoiceCount = await Receipt.countDocuments({ category: 'Invoice' }) + 1;
    const now = new Date();
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(invoiceCount).padStart(4, '0')}`;

    // Format date and time
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Amount in words
    const amountInWords = numberToWords(grandTotal);

    // Use default remarks if not provided
    const finalRemarks = remarks || DEFAULT_REMARKS;

    // Company details
    const companyDetails = {
      companyName: 'Riseup-Tech Software Company',
      companyLogo: '/logo.png',
      companyAddress: 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal',
      companyPhone: '9827399860',
      companyEmail: 'mail@riseuptech.com.np',
      companyWebsite: 'riseuptech.com.np',
      companyPan: '152445267',
      receiptTitle: 'PAYMENT RECEIPT'
    };

    // Save or update customer
    let customerIdField = customerId || null;
    if (saveCustomer && customerPhone) {
      let customer = await Customer.findOne({ phone: customerPhone });
      if (customer) {
        customer.name = customerName || customer.name;
        customer.email = customerEmail || customer.email;
        customer.address = customerAddress || customer.address;
        customer.totalPurchases += 1;
        customer.totalAmountSpent += grandTotal;
        customer.lastPurchaseDate = new Date();
        await customer.save();
        customerIdField = customer._id;
      } else {
        const newCustomer = await Customer.create({
          name: customerName,
          phone: customerPhone,
          email: customerEmail || '',
          address: customerAddress || '',
          totalPurchases: 1,
          totalAmountSpent: grandTotal,
          lastPurchaseDate: new Date(),
          createdBy: req.user.id,
          createdByName: req.user.name
        });
        customerIdField = newCustomer._id;
      }
    }

    // Create receipt data
    const receiptData = {
      receiptNumber,
      customerId: customerIdField,
      companyName: companyDetails.companyName,
      companyLogo: companyDetails.companyLogo,
      companyAddress: companyDetails.companyAddress,
      companyPhone: companyDetails.companyPhone,
      companyEmail: companyDetails.companyEmail,
      companyWebsite: companyDetails.companyWebsite,
      companyPan: companyDetails.companyPan,
      receiptTitle: companyDetails.receiptTitle,
      invoiceNumber,
      issueDate: now,
      issueTime: timeStr,
      dateStr,
      timeStr,
      recipientName: customerName,
      recipientPhone: customerPhone,
      recipientEmail: customerEmail || '',
      recipientAddress: customerAddress || '',
      items: serviceItems,
      subtotal,
      discountAmount,
      taxRate: vatRateValue,
      taxAmount: vatAmount,
      totalAmount: grandTotal,
      amountInWords,
      paidAmount: finalPaidAmount,
      dueAmount: dueAmount,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod || 'Cash',
      paymentReference: transactionId || '',
      bankName: bankName || '',
      remarks: finalRemarks,
      customerSignature: customerSignature || '',
      authorizedSignature: authorizedSignature || '',
      companyStamp: companyStamp || '',
      generatedBy: req.user.id,
      generatedByName: req.user.name,
      generatedByRole: req.user.role,
      issuedBy: req.user.id,
      issuedByName: req.user.name,
      status: finalStatus,
      isEditable: isEditable,
      category: 'Invoice'
    };

    // If paid, set payment date
    if (isFullyPaid) {
      receiptData.paymentDate = new Date();
    }

    // Add payment history
    if (finalPaidAmount > 0) {
      receiptData.paymentHistory = [{
        amount: finalPaidAmount,
        method: paymentMethod || 'Cash',
        reference: transactionId || '',
        bankName: bankName || '',
        date: new Date(),
        receivedBy: req.user.id,
        receivedByName: req.user.name,
        notes: 'Initial payment'
      }];
    }

    console.log('Receipt data to save:', receiptData);

    // Create receipt - NO PRE-SAVE MIDDLEWARE
    const receipt = new Receipt(receiptData);
    await receipt.save();

    // Add audit log
    receipt.auditLog.push({
      action: isFullyPaid ? 'generated_and_paid' : 'generated',
      user: req.user.id,
      userName: req.user.name,
      details: `Receipt ${receipt.receiptNumber} generated for ${customerName} - Paid: ${finalPaidAmount}, Due: ${dueAmount}`
    });
    await receipt.save();

    res.status(201).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate receipt'
    });
  }
};

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Private
const getReceipts = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    const user = await User.findById(req.user.id);
    query.$or = [
      { generatedBy: req.user.id },
      { recipientEmail: user.email }
    ];

    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const receipts = await Receipt.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('generatedBy', 'name email role profilePicture')
      .populate('issuedBy', 'name email role')
      .populate('customerId', 'name phone email address');

    const total = await Receipt.countDocuments(query);

    res.status(200).json({
      success: true,
      count: receipts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: receipts
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single receipt
// @route   GET /api/receipts/:id
// @access  Private
const getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('generatedBy', 'name email role profilePicture')
      .populate('issuedBy', 'name email role')
      .populate('customerId', 'name phone email address');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const user = await User.findById(req.user.id);
    const isGenerator = receipt.generatedBy._id.toString() === req.user.id;
    const isRecipient = receipt.recipientEmail === user.email;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isGenerator && !isRecipient && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this receipt'
      });
    }

    receipt.viewCount += 1;
    await receipt.save();

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Edit receipt
// @route   PUT /api/receipts/:id/edit
// @access  Private
const editReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    if (!receipt.isEditable || receipt.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This receipt cannot be edited. It has already been paid or is locked.'
      });
    }

    const isGenerator = receipt.generatedBy.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isGenerator && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this receipt'
      });
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      services,
      discount,
      vatRate,
      paymentMethod,
      transactionId,
      bankName,
      paidAmount,
      paymentStatus,
      remarks,
      customerSignature,
      authorizedSignature,
      companyStamp
    } = req.body;

    // Store old values for audit
    const oldValues = {
      customerName: receipt.recipientName,
      customerPhone: receipt.recipientPhone,
      subtotal: receipt.subtotal,
      totalAmount: receipt.totalAmount,
      status: receipt.status,
      paymentStatus: receipt.paymentStatus,
      paidAmount: receipt.paidAmount,
      dueAmount: receipt.dueAmount
    };

    // Update customer information
    if (customerName) receipt.recipientName = customerName;
    if (customerPhone) receipt.recipientPhone = customerPhone;
    if (customerEmail !== undefined) receipt.recipientEmail = customerEmail;
    if (customerAddress !== undefined) receipt.recipientAddress = customerAddress;

    // Update services if provided
    if (services && services.length) {
      let subtotal = 0;
      const serviceItems = services.map(service => {
        const total = service.quantity * service.unitPrice;
        subtotal += total;
        return {
          description: service.serviceName,
          descriptionDetail: service.description || '',
          quantity: service.quantity,
          unitPrice: service.unitPrice,
          totalPrice: total
        };
      });

      receipt.items = serviceItems;
      receipt.subtotal = subtotal;
      
      const discountAmount = parseFloat(discount) || receipt.discountAmount || 0;
      const vatRateValue = parseFloat(vatRate) || receipt.taxRate || 13;
      const taxableAmount = subtotal - discountAmount;
      const vatAmount = taxableAmount * (vatRateValue / 100);
      const grandTotal = taxableAmount + vatAmount;

      receipt.discountAmount = discountAmount;
      receipt.taxRate = vatRateValue;
      receipt.taxAmount = vatAmount;
      receipt.totalAmount = grandTotal;
      receipt.amountInWords = numberToWords(grandTotal);

      // Recalculate due amount
      const paidAmountValue = parseFloat(paidAmount) || receipt.paidAmount || 0;
      receipt.paidAmount = Math.min(paidAmountValue, grandTotal);
      receipt.dueAmount = grandTotal - receipt.paidAmount;
    }

    // Update payment information
    if (paymentMethod) receipt.paymentMethod = paymentMethod;
    if (transactionId) receipt.paymentReference = transactionId;
    if (bankName) receipt.bankName = bankName;
    
    if (paymentStatus) {
      receipt.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') {
        receipt.status = 'paid';
        receipt.isEditable = false;
        receipt.paymentDate = new Date();
        // Ensure paid amount equals total
        receipt.paidAmount = receipt.totalAmount;
        receipt.dueAmount = 0;
      } else {
        receipt.status = 'issued';
        receipt.isEditable = true;
        receipt.paymentDate = null;
      }
    }

    // Update remarks
    if (remarks !== undefined) receipt.remarks = remarks;

    // Update signatures
    if (customerSignature !== undefined) receipt.customerSignature = customerSignature;
    if (authorizedSignature !== undefined) receipt.authorizedSignature = authorizedSignature;
    if (companyStamp !== undefined) receipt.companyStamp = companyStamp;

    // Add edit history
    receipt.editHistory.push({
      editedBy: req.user.id,
      editedByName: req.user.name,
      editedAt: new Date(),
      changes: {
        old: oldValues,
        new: {
          customerName: receipt.recipientName,
          customerPhone: receipt.recipientPhone,
          subtotal: receipt.subtotal,
          totalAmount: receipt.totalAmount,
          status: receipt.status,
          paymentStatus: receipt.paymentStatus,
          paidAmount: receipt.paidAmount,
          dueAmount: receipt.dueAmount
        }
      }
    });

    await receipt.save();

    receipt.auditLog.push({
      action: 'edited',
      user: req.user.id,
      userName: req.user.name,
      details: `Receipt ${receipt.receiptNumber} was edited`
    });
    await receipt.save();

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Edit receipt error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to edit receipt'
    });
  }
};

// @desc    Mark receipt as paid
// @route   PUT /api/receipts/:id/pay
// @access  Private
const markAsPaid = async (req, res) => {
  try {
    const { paymentReference, paymentDate } = req.body;
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    if (receipt.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Receipt is already paid'
      });
    }

    const isGenerator = receipt.generatedBy.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isGenerator && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this receipt as paid'
      });
    }

    receipt.status = 'paid';
    receipt.isEditable = false;
    receipt.paymentStatus = 'Paid';
    receipt.paidAmount = receipt.totalAmount;
    receipt.dueAmount = 0;
    receipt.paymentDate = paymentDate || new Date();
    if (paymentReference) {
      receipt.paymentReference = paymentReference;
    }

    await receipt.save();

    receipt.auditLog.push({
      action: 'paid',
      user: req.user.id,
      userName: req.user.name,
      details: `Receipt ${receipt.receiptNumber} marked as paid`
    });
    await receipt.save();

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update receipt status
// @route   PUT /api/receipts/:id/status
// @access  Private
const updateReceiptStatus = async (req, res) => {
  try {
    const { status, paymentReference, paymentDate } = req.body;

    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const isGenerator = receipt.generatedBy.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isGenerator && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this receipt'
      });
    }

    receipt.status = status;
    if (status === 'paid') {
      receipt.isEditable = false;
      receipt.paymentStatus = 'Paid';
      receipt.paidAmount = receipt.totalAmount;
      receipt.dueAmount = 0;
      receipt.paymentDate = paymentDate || new Date();
      if (paymentReference) {
        receipt.paymentReference = paymentReference;
      }
    } else if (status === 'issued') {
      receipt.isEditable = true;
      receipt.paymentStatus = 'Pending';
      receipt.paymentDate = null;
    }

    await receipt.save();

    receipt.auditLog.push({
      action: 'status_updated',
      user: req.user.id,
      userName: req.user.name,
      details: `Receipt status updated to ${status}`
    });
    await receipt.save();

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Update receipt status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const isGenerator = receipt.generatedBy.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isGenerator && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this receipt'
      });
    }

    receipt.status = 'cancelled';
    receipt.isEditable = false;
    await receipt.save();

    res.status(200).json({
      success: true,
      message: 'Receipt cancelled successfully'
    });
  } catch (error) {
    console.error('Delete receipt error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get receipt statistics
// @route   GET /api/receipts/stats
// @access  Private
const getReceiptStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const query = {
      $or: [
        { generatedBy: req.user.id },
        { recipientEmail: user.email }
      ]
    };

    const totalReceipts = await Receipt.countDocuments(query);
    const issuedReceipts = await Receipt.countDocuments({ ...query, status: 'issued' });
    const paidReceipts = await Receipt.countDocuments({ ...query, status: 'paid' });
    const cancelledReceipts = await Receipt.countDocuments({ ...query, status: 'cancelled' });

    const totalAmountResult = await Receipt.aggregate([
      { $match: { ...query, status: { $in: ['issued', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const receiptsByCategory = await Receipt.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReceipts,
        issuedReceipts,
        paidReceipts,
        cancelledReceipts,
        totalAmount: totalAmountResult[0]?.total || 0,
        receiptsByCategory
      }
    });
  } catch (error) {
    console.error('Get receipt stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download receipt (increment download count)
// @route   PUT /api/receipts/:id/download
// @access  Private
const downloadReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    receipt.downloadCount += 1;
    await receipt.save();

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Download receipt error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  generateReceipt,
  editReceipt,
  markAsPaid,
  getReceipts,
  getReceipt,
  updateReceiptStatus,
  deleteReceipt,
  getReceiptStats,
  downloadReceipt
};