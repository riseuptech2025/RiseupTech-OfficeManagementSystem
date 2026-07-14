// controllers/receiptController.js
const Receipt = require('../models/Receipt');
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

// Function to generate transaction ID for cash payments
const generateTransactionId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `CASH-${year}${month}${day}-${random}`;
};

// Default remarks template
const DEFAULT_REMARKS = 'Thank you for choosing Riseup-Tech Software Company. We appreciate your business and look forward to serving you again.';

// @desc    Generate a new receipt
// @route   POST /api/receipts
// @access  Private
const generateReceipt = async (req, res) => {
  try {
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
      paymentStatus,
      remarks,
      customerSignature,
      authorizedSignature,
      companyStamp
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

    // Auto-generate transaction ID for cash payments
    let finalTransactionId = transactionId || '';
    if (paymentMethod === 'Cash' && !finalTransactionId) {
      finalTransactionId = generateTransactionId();
    }

    // Use default remarks if not provided
    const finalRemarks = remarks || DEFAULT_REMARKS;

    // ============================================
    // FIX: Determine payment status correctly
    // ============================================
    const isPaid = paymentStatus === 'Paid';
    const finalStatus = isPaid ? 'paid' : 'issued';
    const isEditable = !isPaid;

    console.log(`Payment Status: ${paymentStatus}, Final Status: ${finalStatus}, Is Paid: ${isPaid}`);

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

    // Create receipt data
    const receiptData = {
      receiptNumber,
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
      paymentMethod: paymentMethod || 'Cash',
      paymentReference: finalTransactionId,
      paymentStatus: paymentStatus || 'Pending',
      remarks: finalRemarks,
      customerSignature: customerSignature || '',
      authorizedSignature: authorizedSignature || '',
      companyStamp: companyStamp || '',
      generatedBy: req.user.id,
      generatedByName: req.user.name,
      generatedByRole: req.user.role,
      issuedBy: req.user.id,
      issuedByName: req.user.name,
      // ============================================
      // FIX: Use the correct status
      // ============================================
      status: finalStatus,
      isEditable: isEditable,
      category: 'Invoice'
    };

    // If paid, set payment date
    if (isPaid) {
      receiptData.paymentDate = new Date();
    }

    console.log('Receipt data to save:', {
      ...receiptData,
      status: receiptData.status,
      paymentStatus: receiptData.paymentStatus,
      isEditable: receiptData.isEditable
    });

    // Create receipt
    const receipt = new Receipt(receiptData);
    await receipt.save();

    // Add audit log
    receipt.auditLog.push({
      action: isPaid ? 'generated_and_paid' : 'generated',
      user: req.user.id,
      userName: req.user.name,
      details: `Receipt ${receipt.receiptNumber} generated for ${customerName}${isPaid ? ' (Paid)' : ''}`
    });
    await receipt.save();

    // Send notification to recipient if they exist in system
    if (customerEmail) {
      const recipient = await User.findOne({ email: customerEmail });
      if (recipient) {
        await notificationService.createNotification({
          recipient: recipient._id,
          sender: req.user.id,
          senderName: req.user.name,
          type: 'system_alert',
          title: `New Receipt - ${receipt.receiptNumber}`,
          message: `A new receipt of NPR ${grandTotal.toFixed(2)} has been generated${isPaid ? ' and paid' : ''}`,
          data: { receiptId: receipt._id },
          link: `/account/receipts/${receipt._id}`,
          priority: 'high'
        });
      }
    }

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

// @desc    Edit receipt (only if not paid)
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

    // Check if receipt is editable
    if (!receipt.isEditable || receipt.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This receipt cannot be edited. It has already been paid or is locked.'
      });
    }

    // Check authorization
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
      paymentStatus: receipt.paymentStatus
    };

    // Update customer information
    if (customerName) receipt.recipientName = customerName;
    if (customerPhone) receipt.recipientPhone = customerPhone;
    if (customerEmail !== undefined) receipt.recipientEmail = customerEmail;
    if (customerAddress !== undefined) receipt.recipientAddress = customerAddress;

    // Update services if provided
    if (services && services.length) {
      // Validate services
      for (const service of services) {
        if (!service.serviceName || service.quantity <= 0 || service.unitPrice <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Please fill in all service details correctly'
          });
        }
      }

      // Recalculate totals
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
    }

    // Update payment information
    if (paymentMethod) receipt.paymentMethod = paymentMethod;
    if (transactionId) receipt.paymentReference = transactionId;
    
    // ============================================
    // FIX: Update status when payment status changes
    // ============================================
    if (paymentStatus) {
      receipt.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') {
        receipt.status = 'paid';
        receipt.isEditable = false;
        receipt.paymentDate = new Date();
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
          paymentStatus: receipt.paymentStatus
        }
      }
    });

    await receipt.save();

    // Add audit log
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

    // Check authorization
    const isGenerator = receipt.generatedBy.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isGenerator && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this receipt as paid'
      });
    }

    // ============================================
    // FIX: Update both status and paymentStatus
    // ============================================
    receipt.status = 'paid';
    receipt.isEditable = false;
    receipt.paymentStatus = 'Paid';
    receipt.paymentDate = paymentDate || new Date();
    if (paymentReference) {
      receipt.paymentReference = paymentReference;
    }

    await receipt.save();

    // Add audit log
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
      .populate('issuedBy', 'name email role');

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
      .populate('issuedBy', 'name email role');

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

    // ============================================
    // FIX: Update both status and paymentStatus
    // ============================================
    receipt.status = status;
    if (status === 'paid') {
      receipt.isEditable = false;
      receipt.paymentStatus = 'Paid';
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