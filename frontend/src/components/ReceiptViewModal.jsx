// components/ReceiptViewModal.jsx
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaEye
} from 'react-icons/fa';
import { receiptService } from '../services/receiptService';
import { authService } from '../services/api';
import logo from '../assets/logo.png';

const ReceiptViewModal = ({ receipt, onClose, onDownload: parentDownload, onEdit: parentEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const currentUser = authService.getUser();
  const receiptRef = useRef(null);

  const getStatusBadge = (status) => {
    const colors = {
      issued: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'issued': return <FaClock className="text-yellow-600" />;
      case 'paid': return <FaCheckCircle className="text-green-600" />;
      case 'cancelled': return <FaTimesCircle className="text-red-600" />;
      default: return <FaClock className="text-gray-600" />;
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

  const canEdit = receipt.isEditable && receipt.status !== 'paid' && 
    (receipt.generatedBy?._id === currentUser?._id || 
     ['super_admin', 'ceo', 'founder'].includes(currentUser?.role));

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      customerName: receipt.recipientName,
      customerPhone: receipt.recipientPhone,
      customerEmail: receipt.recipientEmail || '',
      customerAddress: receipt.recipientAddress || '',
      paymentMethod: receipt.paymentMethod,
      paymentStatus: receipt.paymentStatus,
      remarks: receipt.remarks
    });
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      await receiptService.editReceipt(receipt._id, editData);
      setIsEditing(false);
      if (parentEdit) parentEdit();
      const response = await receiptService.getReceipt(receipt._id);
      receipt = response.data;
    } catch (error) {
      console.error('Failed to edit receipt:', error);
      alert(error.response?.data?.message || 'Failed to edit receipt');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // PRINT / DOWNLOAD VERSION (Optimized for A4)
  // ============================================
  const generatePrintHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receipt.receiptNumber}</title>
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
            
            .print-invoice-number {
              font-size: 12px;
              color: #6b7280;
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
            .print-status-issued { 
              background: #fef3c7; 
              color: #92400e; 
              border-color: #fcd34d; 
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
            
            /* ===== CUSTOMER INFO ===== */
            .print-customer {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px 20px;
            }
            
            .print-customer p {
              font-size: 13px;
              margin: 2px 0;
              line-height: 1.5;
            }
            
            .print-label {
              color: #6b7280;
              font-weight: 500;
            }
            
            /* ===== TABLE ===== */
            .print-table-wrapper {
              overflow-x: auto;
              margin: 4px 0;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .print-table thead th {
              text-align: left;
              padding: 10px 12px;
              background: #f8fafc;
              border-bottom: 2px solid #e5e7eb;
              font-size: 11px;
              font-weight: 700;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .print-table thead th:last-child,
            .print-table thead th:nth-child(3) {
              text-align: right;
            }
            
            .print-table thead th:nth-child(2) {
              text-align: center;
            }
            
            .print-table tbody td {
              padding: 10px 12px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 13px;
              color: #1a1a2e;
            }
            
            .print-table tbody td:last-child,
            .print-table tbody td:nth-child(3) {
              text-align: right;
            }
            
            .print-table tbody td:nth-child(2) {
              text-align: center;
            }
            
            .print-service-name {
              font-weight: 500;
            }
            
            .print-service-detail {
              font-size: 11px;
              color: #6b7280;
              margin-top: 2px;
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
            
            .print-amount-words {
              font-size: 12px;
              color: #6b7280;
              font-style: italic;
              text-align: center;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px dashed #e5e7eb;
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
            
            .print-payment-status-paid { color: #059669; font-weight: 600; }
            .print-payment-status-pending { color: #d97706; font-weight: 600; }
            .print-payment-status-refunded { color: #dc2626; font-weight: 600; }
            
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
              .print-status-issued,
              .print-status-cancelled,
              .print-status-draft,
              .print-table thead th {
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
              
              .print-table {
                page-break-inside: auto;
              }
              
              .print-table tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              
              .print-table thead {
                display: table-header-group;
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
              
              .print-customer {
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
                  <h2>${receipt.companyName}</h2>
                  <p>${receipt.companyAddress}</p>
                  <p>Phone: ${receipt.companyPhone} | Email: ${receipt.companyEmail}</p>
                  <p>PAN: ${receipt.companyPan} | Website: ${receipt.companyWebsite}</p>
                </div>
              </div>
              <div class="print-meta">
                <div class="print-receipt-number">${receipt.receiptNumber}</div>
                <div class="print-invoice-number">${receipt.invoiceNumber}</div>
                <span class="print-status print-status-${receipt.status}">${receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}</span>
              </div>
            </div>

            <!-- Title -->
            <div class="print-title">
              <h1>${receipt.receiptTitle}</h1>
              <p>Date: ${receipt.dateStr} | Time: ${receipt.timeStr}</p>
            </div>

            <!-- Customer Info -->
            <div class="print-section">
              <div class="print-section-title">Bill To:</div>
              <div class="print-customer">
                <p><span class="print-label">Name:</span> ${receipt.recipientName}</p>
                <p><span class="print-label">Phone:</span> ${receipt.recipientPhone}</p>
                ${receipt.recipientEmail ? `<p><span class="print-label">Email:</span> ${receipt.recipientEmail}</p>` : ''}
                ${receipt.recipientAddress ? `<p><span class="print-label">Address:</span> ${receipt.recipientAddress}</p>` : ''}
              </div>
            </div>

            <!-- Services Table -->
            <div class="print-section">
              <div class="print-section-title">Services</div>
              <div class="print-table-wrapper">
                <table class="print-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th style="text-align:center">Qty</th>
                      <th style="text-align:right">Unit Price</th>
                      <th style="text-align:right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${receipt.items.map(item => `
                      <tr>
                        <td>
                          <div class="print-service-name">${item.description}</div>
                          ${item.descriptionDetail ? `<div class="print-service-detail">${item.descriptionDetail}</div>` : ''}
                        </td>
                        <td style="text-align:center">${item.quantity}</td>
                        <td style="text-align:right">${formatCurrency(item.unitPrice)}</td>
                        <td style="text-align:right">${formatCurrency(item.totalPrice)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Totals -->
            <div class="print-section">
              <div class="print-totals">
                <div class="print-totals-row">
                  <span class="print-label-text">Subtotal</span>
                  <span>${formatCurrency(receipt.subtotal)}</span>
                </div>
                ${receipt.discountAmount > 0 ? `
                  <div class="print-totals-row">
                    <span class="print-label-text">Discount</span>
                    <span style="color:#dc2626">-${formatCurrency(receipt.discountAmount)}</span>
                  </div>
                ` : ''}
                <div class="print-totals-row">
                  <span class="print-label-text">VAT (${receipt.taxRate}%)</span>
                  <span>${formatCurrency(receipt.taxAmount)}</span>
                </div>
                <div class="print-totals-row print-grand-total">
                  <span>Grand Total</span>
                  <span class="print-amount">${formatCurrency(receipt.totalAmount)}</span>
                </div>
                ${receipt.paidAmount > 0 ? `
                  <div class="print-totals-row print-payment-details">
                    <span class="print-label-text">Paid Amount</span>
                    <span class="print-amount-paid">${formatCurrency(receipt.paidAmount)}</span>
                  </div>
                ` : ''}
                ${receipt.dueAmount > 0 ? `
                  <div class="print-totals-row print-payment-details">
                    <span class="print-label-text">Due Amount</span>
                    <span class="print-amount-due">${formatCurrency(receipt.dueAmount)}</span>
                  </div>
                ` : ''}
                <div class="print-amount-words">${receipt.amountInWords}</div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="print-section">
              <div class="print-section-title">Payment Information</div>
              <div class="print-payment">
                <p><span class="print-label">Method:</span> ${receipt.paymentMethod}</p>
                <p><span class="print-label">Transaction ID:</span> ${receipt.paymentReference || 'N/A'}</p>
                <p>
                  <span class="print-label">Status:</span>
                  <span class="print-payment-status-${receipt.paymentStatus.toLowerCase()}">${receipt.paymentStatus}</span>
                </p>
                ${receipt.paymentDate ? `<p><span class="print-label">Date:</span> ${new Date(receipt.paymentDate).toLocaleDateString()}</p>` : ''}
              </div>
            </div>

            <!-- Remarks -->
            ${receipt.remarks ? `
              <div class="print-section">
                <div class="print-section-title">Remarks</div>
                <p style="font-size:13px;color:#4b5563">${receipt.remarks}</p>
              </div>
            ` : ''}

            <!-- Signatures -->
            <div class="print-signatures">
              <div class="print-signature-box">
                <div class="print-signature-line"></div>
                <p class="print-signature-label">Customer Signature</p>
              </div>
              <div class="print-signature-box">
                <div class="print-signature-line"></div>
                <p class="print-signature-label">Authorized Signature</p>
              </div>
              <div class="print-signature-box">
                <div class="print-signature-line"></div>
                <p class="print-signature-label">Company Stamp</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="print-footer">
              <p class="print-thankyou">Thank you for choosing Riseup-Tech Software Company. We appreciate your business.</p>
              <p>Generated by ${receipt.generatedByName} 
              </p>
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
    if (parentDownload) {
      parentDownload();
    }
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
              <h4 className="text-sm font-semibold text-blue-800 mb-3">Edit Receipt</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={editData.customerName}
                  onChange={(e) => setEditData({...editData, customerName: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Customer Name"
                />
                <input
                  type="text"
                  value={editData.customerPhone}
                  onChange={(e) => setEditData({...editData, customerPhone: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone"
                />
                <input
                  type="email"
                  value={editData.customerEmail}
                  onChange={(e) => setEditData({...editData, customerEmail: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={editData.customerAddress}
                  onChange={(e) => setEditData({...editData, customerAddress: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Address"
                />
                <select
                  value={editData.paymentMethod}
                  onChange={(e) => setEditData({...editData, paymentMethod: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="eSewa">eSewa</option>
                  <option value="Khalti">Khalti</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="FonePay">FonePay</option>
                  <option value="Credit/Debit Card">Credit/Debit Card</option>
                </select>
                <select
                  value={editData.paymentStatus}
                  onChange={(e) => setEditData({...editData, paymentStatus: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Refunded">Refunded</option>
                </select>
                <div className="md:col-span-2">
                  <textarea
                    value={editData.remarks}
                    onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Remarks"
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
                    <h2 className="text-xl font-bold text-gray-800">{receipt.companyName}</h2>
                    <p className="text-xs text-gray-500">{receipt.companyAddress}</p>
                    <p className="text-xs text-gray-500">Phone: {receipt.companyPhone} | Email: {receipt.companyEmail}</p>
                    <p className="text-xs text-gray-500">PAN: {receipt.companyPan} | Website: {receipt.companyWebsite}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#00B4D8]">{receipt.receiptNumber}</div>
                  <div className="text-sm text-gray-500">{receipt.invoiceNumber}</div>
                  <span className={`inline-flex items-center gap-1 px-4 py-1 rounded-full text-xs font-medium border ${getStatusBadge(receipt.status)}`}>
                    {getStatusIcon(receipt.status)} {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Preview Title */}
              <div className="text-center py-4">
                <h1 className="text-3xl font-bold text-[#00B4D8] tracking-wider">{receipt.receiptTitle}</h1>
                <p className="text-sm text-gray-500 mt-1">Date: {receipt.dateStr} | Time: {receipt.timeStr}</p>
              </div>

              {/* Preview Customer Info */}
              <div className="py-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <p className="text-sm"><span className="text-gray-500">Name:</span> {receipt.recipientName}</p>
                  <p className="text-sm"><span className="text-gray-500">Phone:</span> {receipt.recipientPhone}</p>
                  {receipt.recipientEmail && <p className="text-sm"><span className="text-gray-500">Email:</span> {receipt.recipientEmail}</p>}
                  {receipt.recipientAddress && <p className="text-sm"><span className="text-gray-500">Address:</span> {receipt.recipientAddress}</p>}
                </div>
              </div>

              {/* Preview Services Table */}
              <div className="py-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Services</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">Service</th>
                        <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">Qty</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">Unit Price</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipt.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 text-sm">
                            <div className="font-medium">{item.description}</div>
                            {item.descriptionDetail && <div className="text-xs text-gray-400">{item.descriptionDetail}</div>}
                          </td>
                          <td className="py-3 text-sm text-center">{item.quantity}</td>
                          <td className="py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 text-sm text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Preview Totals */}
              <div className="py-4 border-t border-gray-200">
                <div className="max-w-sm ml-auto">
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(receipt.subtotal)}</span>
                  </div>
                  {receipt.discountAmount > 0 && (
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-red-500">-{formatCurrency(receipt.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">VAT ({receipt.taxRate}%)</span>
                    <span>{formatCurrency(receipt.taxAmount)}</span>
                  </div>
                  
                  {/* Grand Total */}
                  <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-3 mt-2">
                    <span>Grand Total</span>
                    <span className="text-[#00B4D8]">{formatCurrency(receipt.totalAmount)}</span>
                  </div>
                  
                  {/* Paid Amount & Due Amount - Now AFTER Grand Total */}
                  {receipt.paidAmount > 0 && (
                    <div className="flex justify-between text-sm py-1 mt-2 border-t border-dashed border-gray-200 pt-2">
                      <span className="text-gray-600">Paid Amount</span>
                      <span className="text-green-500 font-medium">{formatCurrency(receipt.paidAmount)}</span>
                    </div>
                  )}
                  {receipt.dueAmount > 0 && (
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">Due Amount</span>
                      <span className="text-red-500 font-medium">{formatCurrency(receipt.dueAmount)}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500 italic text-center mt-3 pt-2 border-t border-dashed border-gray-200">
                    {receipt.amountInWords}
                  </div>
                </div>
              </div>

              {/* Preview Payment Info */}
              <div className="py-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <p className="text-sm"><span className="text-gray-500">Method:</span> {receipt.paymentMethod}</p>
                  <p className="text-sm"><span className="text-gray-500">Transaction ID:</span> <span className="font-mono">{receipt.paymentReference || 'N/A'}</span></p>
                  <p className="text-sm">
                    <span className="text-gray-500">Status:</span> 
                    <span className={`ml-1 font-medium ${
                      receipt.paymentStatus === 'Paid' ? 'text-green-600' :
                      receipt.paymentStatus === 'Pending' ? 'text-yellow-600' :
                      receipt.paymentStatus === 'Refunded' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {receipt.paymentStatus}
                    </span>
                  </p>
                  {receipt.paymentDate && (
                    <p className="text-sm"><span className="text-gray-500">Date:</span> {new Date(receipt.paymentDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Preview Remarks */}
              {receipt.remarks && (
                <div className="py-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Remarks</h4>
                  <p className="text-sm text-gray-600">{receipt.remarks}</p>
                </div>
              )}

              {/* Preview Signatures */}
              <div className="py-6 border-t border-gray-200 mt-2">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="text-center flex-1">
                    <div className="border-b-2 border-gray-400 w-3/4 mx-auto h-8"></div>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Customer Signature</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="border-b-2 border-gray-400 w-3/4 mx-auto h-8"></div>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Authorized Signature</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="border-b-2 border-gray-400 w-3/4 mx-auto h-8"></div>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Company Stamp</p>
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="pt-4 mt-2 border-t-2 border-gray-200 text-center">
                <p className="text-sm text-gray-500">Thank you for choosing Riseup-Tech Software Company. We appreciate your business.</p>
                <p className="text-xs text-gray-400 mt-1">Generated by {receipt.generatedByName} 
                    {/* • {new Date(receipt.createdAt).toLocaleString()} */}
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
                Edit Receipt
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

export default ReceiptViewModal;