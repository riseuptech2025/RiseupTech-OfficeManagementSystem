// components/Expenditure/ExpenditureViewModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaDownload,
  FaPrint,
  FaReceipt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEdit,
  FaSave,
  FaMoneyBillWave,
  FaFileInvoice,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt,
  FaClock as FaClockIcon,
  FaIdCard,
  FaPercent,
  FaTag,
  FaFilePdf,
  FaEye,
  FaWallet,
  FaCreditCard,
  FaHandHoldingUsd,
  FaInfoCircle,
  FaUserCheck,
  FaUserShield
} from 'react-icons/fa';
import { expenditureService } from '../../services/expenditureService';
import { authService } from '../../services/api';
import logo from '../../assets/logo.png';

const ExpenditureViewModal = ({ expenditure, onClose, onEdit: parentEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [editData, setEditData] = useState(null);
  const currentUser = authService.getUser();

  const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo', 'accountant'].includes(currentUser?.role);

  const getStatusBadge = (status) => {
    const colors = {
      Draft: 'bg-gray-100 text-gray-800 border-gray-200',
      Submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      Approved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Paid: 'bg-green-100 text-green-800 border-green-200',
      Cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.Draft;
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      Paid: 'bg-green-100 text-green-800 border-green-200',
      Partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Pending: 'bg-red-100 text-red-800 border-red-200',
      Cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.Pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return <FaCheckCircle className="text-green-600" />;
      case 'Approved': return <FaUserCheck className="text-yellow-600" />;
      case 'Submitted': return <FaClock className="text-blue-600" />;
      case 'Cancelled': return <FaTimesCircle className="text-red-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return <FaCheckCircle className="text-green-600" />;
      case 'Partial': return <FaClock className="text-yellow-600" />;
      case 'Pending': return <FaClock className="text-red-600" />;
      default: return <FaTimesCircle className="text-gray-600" />;
    }
  };

  const formatCurrency = (amount, currency = 'NPR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canEdit = isAdmin && expenditure.status !== 'Paid' && expenditure.status !== 'Cancelled';

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      category: expenditure.category,
      subCategory: expenditure.subCategory || '',
      description: expenditure.description,
      amount: expenditure.amount,
      currency: expenditure.currency,
      vendorName: expenditure.vendorName,
      vendorPhone: expenditure.vendorPhone || '',
      vendorEmail: expenditure.vendorEmail || '',
      vendorAddress: expenditure.vendorAddress || '',
      panNumber: expenditure.panNumber || '',
      invoiceNumber: expenditure.invoiceNumber || '',
      paymentMethod: expenditure.paymentMethod,
      paymentReference: expenditure.paymentReference || '',
      notes: expenditure.notes || '',
      status: expenditure.status
    });
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      await expenditureService.updateExpenditure(expenditure._id, editData);
      setIsEditing(false);
      if (parentEdit) parentEdit();
      const response = await expenditureService.getExpenditure(expenditure._id);
      expenditure = response.data;
    } catch (error) {
      console.error('Failed to edit expenditure:', error);
      alert(error.response?.data?.message || 'Failed to edit expenditure');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // PRINT / DOWNLOAD VERSION (Optimized for A4)
  // ============================================
  const generatePrintHTML = () => {
    const categoryIcons = {
      'Office Rent': '🏢',
      'Utilities': '💡',
      'Salaries': '👥',
      'Equipment': '💻',
      'Software Licenses': '📦',
      'Marketing': '📢',
      'Travel': '✈️',
      'Food & Beverage': '🍽️',
      'Stationery': '📝',
      'Maintenance': '🔧',
      'Insurance': '🛡️',
      'Taxes': '📊',
      'Training': '🎓',
      'Miscellaneous': '📋'
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expenditure - ${expenditure.receiptNumber}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          
          <style>
            /* ===== RESET ===== */
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            
            body { 
              font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
              background: #ffffff;
              padding: 0;
              margin: 0;
              color: #1a1a2e;
            }
            
            /* ===== PRINT CONTAINER ===== */
            .print-wrapper {
              max-width: 794px;
              margin: 0 auto;
              padding: 40px 45px;
              background: white;
              min-height: 100vh;
            }
            
            /* ===== HEADER ===== */
            .print-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 20px;
              border-bottom: 3px solid #e8edf3;
              margin-bottom: 20px;
            }
            
            .print-company {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            
            .print-logo {
              height: 65px;
              width: auto;
              max-width: 120px;
              object-fit: contain;
            }
            
            .print-company-details h2 {
              font-size: 18px;
              font-weight: 800;
              color: #1a1a2e;
              margin: 0 0 2px 0;
            }
            
            .print-company-details p {
              font-size: 11px;
              color: #6b7280;
              margin: 1px 0;
              line-height: 1.4;
            }
            
            .print-meta {
              text-align: right;
              flex-shrink: 0;
            }
            
            .print-receipt-number {
              font-size: 20px;
              font-weight: 800;
              color: #00B4D8;
            }
            
            .print-status {
              display: inline-block;
              padding: 4px 16px;
              border-radius: 50px;
              font-size: 11px;
              font-weight: 600;
              margin-top: 4px;
              border: 1px solid;
            }
            
            .print-status-paid { 
              background: #d1fae5; 
              color: #065f46; 
              border-color: #a7f3d0; 
            }
            .print-status-approved { 
              background: #fef3c7; 
              color: #92400e; 
              border-color: #fcd34d; 
            }
            .print-status-submitted { 
              background: #dbeafe; 
              color: #1e40af; 
              border-color: #93c5fd; 
            }
            .print-status-cancelled { 
              background: #fee2e2; 
              color: #991b1b; 
              border-color: #fca5a5; 
            }
            .print-status-draft { 
              background: #f3f4f6; 
              color: #374151; 
              border-color: #d1d5db; 
            }
            
            .print-payment-status-paid { color: #059669; font-weight: 600; }
            .print-payment-status-partial { color: #d97706; font-weight: 600; }
            .print-payment-status-pending { color: #dc2626; font-weight: 600; }
            
            /* ===== TITLE ===== */
            .print-title {
              text-align: center;
              padding: 12px 0 16px 0;
            }
            
            .print-title h1 {
              font-size: 26px;
              font-weight: 800;
              color: #00B4D8;
              letter-spacing: 3px;
              margin: 0;
            }
            
            .print-title p {
              font-size: 12px;
              color: #6b7280;
              margin-top: 4px;
            }
            
            /* ===== SECTIONS ===== */
            .print-section {
              padding: 14px 0;
              border-top: 1px solid #e5e7eb;
            }
            
            .print-section-title {
              font-size: 11px;
              font-weight: 700;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin-bottom: 8px;
            }
            
            /* ===== CATEGORY INFO ===== */
            .print-category {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px 20px;
            }
            
            .print-category p {
              font-size: 13px;
              margin: 2px 0;
              line-height: 1.5;
            }
            
            .print-label {
              color: #6b7280;
              font-weight: 500;
            }
            
            .print-category-icon {
              font-size: 20px;
              margin-right: 4px;
            }
            
            /* ===== VENDOR INFO ===== */
            .print-vendor {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px 20px;
            }
            
            .print-vendor p {
              font-size: 13px;
              margin: 2px 0;
              line-height: 1.5;
            }
            
            /* ===== TOTALS ===== */
            .print-totals {
              max-width: 350px;
              margin-left: auto;
              margin-top: 12px;
            }
            
            .print-totals-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              font-size: 13px;
            }
            
            .print-totals-row .print-label-text {
              color: #6b7280;
            }
            
            .print-totals-row.print-grand-total {
              font-size: 18px;
              font-weight: 800;
              border-top: 2px solid #e5e7eb;
              padding-top: 12px;
              margin-top: 6px;
            }
            
            .print-totals-row.print-grand-total .print-amount {
              color: #00B4D8;
            }
            
            .print-totals-row.print-payment-details {
              font-size: 14px;
              font-weight: 600;
              padding: 6px 0;
              border-top: 1px dashed #e5e7eb;
              margin-top: 4px;
            }
            
            .print-totals-row.print-payment-details .print-amount-paid {
              color: #059669;
            }
            
            .print-totals-row.print-payment-details .print-amount-due {
              color: #dc2626;
            }
            
            /* ===== PAYMENT INFO ===== */
            .print-payment {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 4px 20px;
            }
            
            .print-payment p {
              font-size: 13px;
              margin: 2px 0;
              line-height: 1.5;
            }
            
            /* ===== SIGNATURES ===== */
            .print-signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 28px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            
            .print-signature-box {
              text-align: center;
              flex: 1;
            }
            
            .print-signature-line {
              width: 80%;
              margin: 0 auto;
              border-bottom: 2px solid #1a1a2e;
              height: 35px;
            }
            
            .print-signature-label {
              font-size: 10px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
            }
            
            /* ===== FOOTER ===== */
            .print-footer {
              text-align: center;
              padding-top: 18px;
              margin-top: 18px;
              border-top: 2px solid #e5e7eb;
            }
            
            .print-footer p {
              font-size: 12px;
              color: #6b7280;
              margin: 2px 0;
            }
            
            .print-footer .print-thankyou {
              font-size: 13px;
              color: #374151;
              font-weight: 500;
            }
            
            /* ===== PRINT STYLES ===== */
            @media print {
              body {
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              
              .print-wrapper {
                padding: 20px 30px !important;
                max-width: 100% !important;
                margin: 0 !important;
                min-height: auto !important;
              }
              
              /* Force colors */
              .print-status,
              .print-status-paid,
              .print-status-approved,
              .print-status-submitted,
              .print-status-cancelled,
              .print-status-draft {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* A4 Settings */
              @page {
                size: A4;
                margin: 12mm 15mm;
              }
              
              /* Page breaks */
              .print-section {
                page-break-inside: avoid;
              }
            }
            
            /* ===== RESPONSIVE ===== */
            @media (max-width: 600px) {
              .print-wrapper {
                padding: 20px !important;
              }
              
              .print-header {
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 12px;
              }
              
              .print-company {
                flex-direction: column;
                align-items: center;
              }
              
              .print-logo {
                height: 50px !important;
              }
              
              .print-meta {
                text-align: center;
                width: 100%;
              }
              
              .print-category {
                grid-template-columns: 1fr;
              }
              
              .print-vendor {
                grid-template-columns: 1fr;
              }
              
              .print-payment {
                grid-template-columns: 1fr;
              }
              
              .print-signatures {
                flex-direction: column;
                gap: 16px;
              }
              
              .print-totals {
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            <!-- Header -->
            <div class="print-header">
              <div class="print-company">
                <img src="${logo}" alt="Riseup-Tech" class="print-logo" />
                <div class="print-company-details">
                  <h2>${expenditure.companyName || 'Riseup-Tech Software Company'}</h2>
                  <p>${expenditure.companyAddress || 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal'}</p>
                  <p>Phone: ${expenditure.companyPhone || '9827399860'} | Email: ${expenditure.companyEmail || 'mail@riseuptech.com.np'}</p>
                  <p>PAN: ${expenditure.companyPan || '152445267'} | Website: ${expenditure.companyWebsite || 'riseuptech.com.np'}</p>
                </div>
              </div>
              <div class="print-meta">
                <div class="print-receipt-number">${expenditure.receiptNumber}</div>
                ${expenditure.invoiceNumber ? `<div class="print-invoice-number">${expenditure.invoiceNumber}</div>` : ''}
                <span class="print-status print-status-${expenditure.status.toLowerCase()}">${expenditure.status}</span>
              </div>
            </div>

            <!-- Title -->
            <div class="print-title">
              <h1>EXPENDITURE RECEIPT</h1>
              <p>Date: ${formatDateShort(expenditure.transactionDate)} | ${expenditure.status === 'Paid' ? 'Paid' : 'Pending'}</p>
            </div>

            <!-- Category & Description -->
            <div class="print-section">
              <div class="print-section-title">Expenditure Details</div>
              <div class="print-category">
                <p><span class="print-label">Category:</span> <span class="print-category-icon">${categoryIcons[expenditure.category] || '📋'}</span> ${expenditure.category}</p>
                ${expenditure.subCategory ? `<p><span class="print-label">Sub Category:</span> ${expenditure.subCategory}</p>` : ''}
                <p style="grid-column: 1 / -1;"><span class="print-label">Description:</span> ${expenditure.description}</p>
              </div>
            </div>

            <!-- Vendor Info -->
            <div class="print-section">
              <div class="print-section-title">Vendor Information</div>
              <div class="print-vendor">
                <p><span class="print-label">Name:</span> ${expenditure.vendorName}</p>
                ${expenditure.vendorPhone ? `<p><span class="print-label">Phone:</span> ${expenditure.vendorPhone}</p>` : ''}
                ${expenditure.vendorEmail ? `<p><span class="print-label">Email:</span> ${expenditure.vendorEmail}</p>` : ''}
                ${expenditure.vendorAddress ? `<p><span class="print-label">Address:</span> ${expenditure.vendorAddress}</p>` : ''}
                ${expenditure.panNumber ? `<p><span class="print-label">VAT/PAN:</span> ${expenditure.panNumber}</p>` : ''}
              </div>
            </div>

            <!-- Amount Details -->
            <div class="print-section">
              <div class="print-section-title">Amount Details</div>
              <div class="print-totals">
                <div class="print-totals-row">
                  <span class="print-label-text">Total Amount</span>
                  <span>${formatCurrency(expenditure.amount, expenditure.currency)}</span>
                </div>
                <div class="print-totals-row">
                  <span class="print-label-text">Paid Amount</span>
                  <span style="color:#059669">${formatCurrency(expenditure.paidAmount, expenditure.currency)}</span>
                </div>
                <div class="print-totals-row">
                  <span class="print-label-text">Due Amount</span>
                  <span style="color:#dc2626">${formatCurrency(expenditure.dueAmount, expenditure.currency)}</span>
                </div>
                <div class="print-totals-row print-grand-total">
                  <span>Payment Status</span>
                  <span class="print-payment-status-${expenditure.paymentStatus.toLowerCase()}">${expenditure.paymentStatus}</span>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="print-section">
              <div class="print-section-title">Payment Information</div>
              <div class="print-payment">
                <p><span class="print-label">Method:</span> ${expenditure.paymentMethod}</p>
                <p><span class="print-label">Reference:</span> ${expenditure.paymentReference || 'N/A'}</p>
                ${expenditure.paymentDate ? `<p><span class="print-label">Date:</span> ${formatDateShort(expenditure.paymentDate)}</p>` : ''}
              </div>
            </div>

            <!-- Notes -->
            ${expenditure.notes ? `
              <div class="print-section">
                <div class="print-section-title">Notes</div>
                <p style="font-size:13px;color:#4b5563">${expenditure.notes}</p>
              </div>
            ` : ''}

            <!-- Signatures -->
            <div class="print-signatures">
              <div class="print-signature-box">
                <div class="print-signature-line"></div>
                <p class="print-signature-label">Authorized Signature</p>
              </div>
              <div class="print-signature-box">
                <div class="print-signature-line"></div>
                <p class="print-signature-label">Finance Officer</p>
              </div>
              <div class="print-signature-box">
                <div class="print-signature-line"></div>
                <p class="print-signature-label">Company Stamp</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="print-footer">
              <p class="print-thankyou">This is a system-generated expenditure receipt.</p>
              <p>Created by ${expenditure.createdByName} • ${formatDateShort(expenditure.createdAt)}</p>
              ${expenditure.approvedByName ? `<p>Approved by ${expenditure.approvedByName}</p>` : ''}
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
              
              window.onafterprint = function() {
                window.close();
              };
            }
          <\/script>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    setIsPrinting(true);
    const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!printWindow) {
      alert('Please allow pop-ups to print the receipt');
      setIsPrinting(false);
      return;
    }
    
    const htmlContent = generatePrintHTML();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };

  const handleDownload = () => {
    handlePrint();
  };

  // ============================================
  // PREVIEW VERSION (Interactive & Beautiful)
  // ============================================
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Edit Mode */}
          {isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">Edit Expenditure</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={editData.category}
                  onChange={(e) => setEditData({...editData, category: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Category"
                />
                <input
                  type="text"
                  value={editData.subCategory}
                  onChange={(e) => setEditData({...editData, subCategory: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sub Category"
                />
                <input
                  type="text"
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={editData.amount}
                  onChange={(e) => setEditData({...editData, amount: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Amount"
                />
                <input
                  type="text"
                  value={editData.vendorName}
                  onChange={(e) => setEditData({...editData, vendorName: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Vendor Name"
                />
                <input
                  type="text"
                  value={editData.paymentMethod}
                  onChange={(e) => setEditData({...editData, paymentMethod: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Payment Method"
                />
                <div className="md:col-span-2">
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Notes"
                    rows="2"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#00B4D8] text-white rounded-lg hover:bg-[#0096B4] transition-all text-sm flex items-center gap-2"
                >
                  {isLoading ? 'Saving...' : <><FaSave className="w-4 h-4" /> Save Changes</>}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PREVIEW VERSION - Beautiful & Interactive */}
          {/* ============================================================ */}
          <div className="preview-receipt bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8 md:p-10">
              
              {/* Preview Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <img 
                    src={logo} 
                    alt="Riseup-Tech" 
                    className="h-16 w-auto object-contain" 
                    style={{ height: '60px', width: 'auto', maxWidth: '120px' }}
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Riseup-Tech Software Company</h2>
                    <p className="text-xs text-gray-500">Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal</p>
                    <p className="text-xs text-gray-500">Phone: 9827399860 | Email: mail@riseuptech.com.np</p>
                    <p className="text-xs text-gray-500">PAN: 152445267 | Website: riseuptech.com.np</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#00B4D8]">{expenditure.receiptNumber}</div>
                  {expenditure.invoiceNumber && (
                    <div className="text-sm text-gray-500">{expenditure.invoiceNumber}</div>
                  )}
                  <span className={`inline-flex items-center gap-1 px-4 py-1 rounded-full text-xs font-medium border ${getStatusBadge(expenditure.status)}`}>
                    {getStatusIcon(expenditure.status)} {expenditure.status}
                  </span>
                </div>
              </div>

              {/* Preview Title */}
              <div className="text-center py-4">
                <h1 className="text-3xl font-bold text-[#00B4D8] tracking-wider">EXPENDITURE RECEIPT</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Date: {formatDateShort(expenditure.transactionDate)} | 
                  {expenditure.status === 'Paid' ? ' Paid' : ' Pending'}
                </p>
              </div>

              {/* Preview Category & Description */}
              <div className="py-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Expenditure Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <p className="text-sm"><span className="text-gray-500">Category:</span> {expenditure.category}</p>
                  {expenditure.subCategory && (
                    <p className="text-sm"><span className="text-gray-500">Sub Category:</span> {expenditure.subCategory}</p>
                  )}
                  <p className="text-sm md:col-span-2"><span className="text-gray-500">Description:</span> {expenditure.description}</p>
                </div>
              </div>

              {/* Preview Vendor Info */}
              <div className="py-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vendor Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <p className="text-sm"><span className="text-gray-500">Name:</span> {expenditure.vendorName}</p>
                  {expenditure.vendorPhone && (
                    <p className="text-sm"><span className="text-gray-500">Phone:</span> {expenditure.vendorPhone}</p>
                  )}
                  {expenditure.vendorEmail && (
                    <p className="text-sm"><span className="text-gray-500">Email:</span> {expenditure.vendorEmail}</p>
                  )}
                  {expenditure.vendorAddress && (
                    <p className="text-sm"><span className="text-gray-500">Address:</span> {expenditure.vendorAddress}</p>
                  )}
                  {expenditure.panNumber && (
                    <p className="text-sm"><span className="text-gray-500">VAT/PAN:</span> {expenditure.panNumber}</p>
                  )}
                </div>
              </div>

              {/* Preview Amount Details */}
              <div className="py-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Amount Details</h4>
                <div className="max-w-sm ml-auto">
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium">{formatCurrency(expenditure.amount, expenditure.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-t border-dashed border-gray-200 mt-1 pt-1">
                    <span className="text-gray-600">Paid Amount</span>
                    <span className="text-green-500 font-medium">{formatCurrency(expenditure.paidAmount, expenditure.currency)}</span>
                  </div>
                  {expenditure.dueAmount > 0 && (
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">Due Amount</span>
                      <span className="text-red-500 font-medium">{formatCurrency(expenditure.dueAmount, expenditure.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-3 mt-2">
                    <span>Payment Status</span>
                    <span className={`${
                      expenditure.paymentStatus === 'Paid' ? 'text-green-500' :
                      expenditure.paymentStatus === 'Partial' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {expenditure.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Payment Info */}
              <div className="py-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <p className="text-sm"><span className="text-gray-500">Method:</span> {expenditure.paymentMethod}</p>
                  <p className="text-sm"><span className="text-gray-500">Reference:</span> <span className="font-mono">{expenditure.paymentReference || 'N/A'}</span></p>
                  {expenditure.paymentDate && (
                    <p className="text-sm"><span className="text-gray-500">Date:</span> {formatDateShort(expenditure.paymentDate)}</p>
                  )}
                </div>
              </div>

              {/* Preview Notes */}
              {expenditure.notes && (
                <div className="py-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{expenditure.notes}</p>
                </div>
              )}

              {/* Preview Signatures */}
              <div className="py-6 border-t border-gray-200 mt-2">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="text-center flex-1">
                    <div className="border-b-2 border-gray-400 w-3/4 mx-auto h-8"></div>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Authorized Signature</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="border-b-2 border-gray-400 w-3/4 mx-auto h-8"></div>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Finance Officer</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="border-b-2 border-gray-400 w-3/4 mx-auto h-8"></div>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Company Stamp</p>
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="pt-4 mt-2 border-t-2 border-gray-200 text-center">
                <p className="text-sm text-gray-500">This is a system-generated expenditure receipt.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Created by {expenditure.createdByName} • {formatDateShort(expenditure.createdAt)}
                  {expenditure.approvedByName && ` • Approved by ${expenditure.approvedByName}`}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
            {canEdit && !isEditing && (
              <button
                onClick={handleEdit}
                className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00B4D8] text-white rounded-lg hover:bg-[#0096B4] transition-all text-sm font-medium"
              >
                <FaEdit className="w-4 h-4" />
                Edit Expenditure
              </button>
            )}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6C63FF] text-white rounded-lg hover:bg-[#5A52D5] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Printing...
                </>
              ) : (
                <>
                  <FaPrint className="w-4 h-4" />
                  Print / PDF
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-all text-sm font-medium"
            >
              <FaFilePdf className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm font-medium"
            >
              <FaTimes className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpenditureViewModal;