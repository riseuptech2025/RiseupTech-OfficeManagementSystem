// components/Policy/PolicyViewModal.jsx
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaDownload,
  FaPrint,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFilePdf,
  FaGlobe,
  FaUserShield,
  FaUsers,
  FaCalendarAlt,
  FaUser,
  FaUserTie,
  FaUserCog,
  FaShieldAlt,
  FaSignature,
  FaEye,
  FaClock,
  FaTag,
  FaFileAlt,
  FaBuilding,
  FaUserCheck
} from 'react-icons/fa';
import logo from '../../assets/logo.png';

const PolicyViewModal = ({ policy, user, onClose, onDownload }) => {
  const contentRef = useRef(null);
  
  // Company contact information
  const companyInfo = {
    name: 'Riseup-Tech Software Company',
    address: 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal',
    phone: '9827399860',
    email: 'mail@riseuptech.com.np',
    website: 'riseuptech.com.np',
    registration: 'Reg. No: RTC-2024-001'
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPrintHTML = () => {
    const downloadDate = formatDate(new Date());
    const logoBase64 = logo;
    
    // Generate signature cards HTML
    const signatureCardsHTML = policy.signatureCards?.map((card, index) => {
      const cardType = card.type === 'Approved By' ? 'Approved By' : 'Customer';
      const cardIcon = card.type === 'Approved By' ? '🛡️' : '👤';
      
      return `
        <div class="approval-box">
          <div class="label">${cardType}</div>
          <div class="name">${card.name || 'Not specified'}</div>
          ${card.role ? `<div class="role">${card.role}</div>` : ''}
          <div class="signature-line"></div>
          ${card.showDate !== false ? `<div class="download-date">Date: ${downloadDate}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${policy.policyName} - ${policy.policyId}</title>
          <style>
            /* Reset & Base */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Times New Roman', Times, serif;
              background: white;
              color: #1a1a1a;
              padding: 0;
              margin: 0;
              line-height: 1.6;
            }

            .policy-container {
              max-width: 794px;
              min-height: 1123px;
              margin: 0 auto;
              background: #ffffff;
              border: none;
              border-radius: 0;
              overflow: hidden;
              position: relative;
              padding: 0;
            }

            .watermark-container {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              pointer-events: none;
              z-index: 0;
              opacity: 8;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }

            .watermark-container img {
              width: 60%;
              height: auto;
              max-height: 70%;
              object-fit: contain;
              filter: grayscale(100%);
            }

            .content-wrapper {
              position: relative;
              z-index: 2;
              background: transparent;
            }

            .document-header {
              padding: 25px 35px 15px 35px;
              border-bottom: 3px double #1a3c6e;
              background: rgba(248, 250, 252, 0.95);
            }

            .header-top {
              display: flex;
              align-items: center;
              gap: 20px;
              margin-bottom: 8px;
            }

            .header-logo {
              flex-shrink: 0;
              border-right: 2px solid #e5e7eb;
              padding-right: 20px;
            }

            .header-logo img {
              height: 65px;
              width: auto;
            }

            .header-details {
              flex: 1;
            }

            .company-name {
              font-size: 20px;
              font-weight: 700;
              color: #1a3c6e;
              letter-spacing: 1px;
              font-family: 'Times New Roman', Times, serif;
            }

            .company-tagline {
              font-size: 12px;
              color: #4b5563;
              font-style: italic;
              margin-top: 2px;
            }

            .header-divider {
              border-top: 1px solid #e5e7eb;
              margin: 8px 0;
            }

            .contact-row {
              display: flex;
              flex-wrap: wrap;
              gap: 16px 24px;
              font-size: 11px;
              color: #4b5563;
              justify-content: center;
            }

            .contact-row span {
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .contact-row .separator {
              color: #d1d5db;
            }

            .document-title {
              padding: 18px 35px 14px 35px;
              background: rgba(255, 255, 255, 0.95);
              border-bottom: 1px solid #e5e7eb;
            }

            .document-title h1 {
              font-size: 22px;
              font-weight: 700;
              color: #1a1a1a;
              text-align: center;
              font-family: 'Times New Roman', Times, serif;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .document-meta {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 8px 16px;
              margin-top: 6px;
              font-size: 12px;
              color: #4b5563;
            }

            .document-meta .separator {
              color: #d1d5db;
            }

            .policy-body {
              padding: 22px 35px 18px 35px;
              background: rgba(255, 255, 255, 0.97);
            }

            .doc-section {
              margin-bottom: 18px;
            }

            .doc-section:last-child {
              margin-bottom: 0;
            }

            .doc-section h3 {
              font-size: 15px;
              font-weight: 700;
              color: #1a3c6e;
              margin-bottom: 6px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 4px;
              font-family: 'Times New Roman', Times, serif;
            }

            .doc-section p {
              font-size: 13px;
              color: #1a1a1a;
              line-height: 1.8;
              text-align: justify;
            }

            .doc-section .content-body {
              font-size: 13px;
              color: #1a1a1a;
              line-height: 1.8;
              white-space: pre-wrap;
              text-align: justify;
            }

            .signature-section {
              margin-top: 25px;
              padding-top: 18px;
              border-top: 2px solid #1a3c6e;
            }

            .signature-section h3 {
              font-size: 15px;
              font-weight: 700;
              color: #1a3c6e;
              margin-bottom: 4px;
              font-family: 'Times New Roman', Times, serif;
            }

            .signature-subtitle {
              font-size: 12px;
              color: #4b5563;
              margin-bottom: 14px;
              font-style: italic;
            }

            .signature-grid {
              display: grid;
              grid-template-columns: repeat(${Math.min(policy.signatureCards?.length || 1, 3)}, 1fr);
              gap: 20px;
            }

            .approval-box {
              text-align: center;
              padding: 12px 8px;
              border: 1px solid #d1d5db;
              background: rgba(250, 250, 250, 0.9);
            }

            .approval-box .label {
              font-size: 10px;
              font-weight: 700;
              color: #4b5563;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-family: 'Times New Roman', Times, serif;
            }

            .approval-box .name {
              font-size: 13px;
              font-weight: 600;
              color: #1a1a1a;
              margin-top: 2px;
            }

            .approval-box .role {
              font-size: 11px;
              color: #4b5563;
              font-style: italic;
            }

            .approval-box .signature-line {
              width: 70%;
              border-bottom: 1.5px solid #1a1a1a;
              margin: 10px auto 4px;
              height: 25px;
            }

            .approval-box .download-date {
              font-size: 10px;
              color: #1a3c6e;
              margin-top: 2px;
              font-weight: 500;
            }

            .document-footer {
              padding: 10px 35px;
              border-top: 1px solid #e5e7eb;
              background: rgba(250, 250, 250, 0.95);
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 10px;
              color: #6b7280;
            }

            .document-footer .footer-left {
              text-align: left;
            }

            .document-footer .footer-right {
              text-align: right;
            }

            .document-footer .footer-center {
              text-align: center;
              font-style: italic;
            }

            @media print {
              body {
                background: white;
                padding: 0;
                margin: 0;
                display: block;
                min-height: 100vh;
              }
              
              .policy-container {
                max-width: 100%;
                min-height: 100vh;
                border: none !important;
                box-shadow: none !important;
                border-radius: 0;
                margin: 0;
                page-break-after: avoid;
                page-break-inside: avoid;
              }

              .document-header {
                background: white !important;
                border-bottom: 3px double #1a3c6e !important;
                padding-top: 20px;
              }

              .document-title {
                background: white !important;
                padding-top: 15px;
              }

              .policy-body {
                background: white !important;
                padding-top: 20px;
              }

              .approval-box {
                border: 1px solid #d1d5db !important;
                background: white !important;
              }

              .document-footer {
                background: white !important;
                border-top: 1px solid #d1d5db !important;
                padding-bottom: 15px;
              }

              .watermark-container {
                opacity: 8 !important;
              }

              .watermark-container img {
                width: 60%;
                max-height: 70%;
                filter: grayscale(100%) !important;
              }
            }

            @page {
              margin: 0;
              size: A4;
            }

            @media screen {
              .policy-container {
                margin: 20px auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
              }
            }
          </style>
        </head>
        <body>
          <div class="policy-container">
            <div class="watermark-container">
              <img src="${logoBase64}" alt="Watermark" />
            </div>

            <div class="content-wrapper">
              <div class="document-header">
                <div class="header-top">
                  <div class="header-logo">
                    <img src="${logoBase64}" alt="${companyInfo.name}" />
                  </div>
                  <div class="header-details">
                    <div class="company-name">${companyInfo.name}</div>
                    <div class="company-tagline">Excellence in Technology & Innovation</div>
                  </div>
                </div>
                <div class="header-divider"></div>
                <div class="contact-row">
                  <span>📍 ${companyInfo.address}</span>
                  <span class="separator">|</span>
                  <span>📞 ${companyInfo.phone}</span>
                  <span class="separator">|</span>
                  <span>✉ ${companyInfo.email}</span>
                  <span class="separator">|</span>
                  <span>🌐 ${companyInfo.website}</span>
                  <span class="separator">|</span>
                  <span>${companyInfo.registration}</span>
                </div>
              </div>

              <div class="document-title">
                <h1>${policy.policyName}</h1>
                <div class="document-meta">
                  <span>Document ID: ${policy.policyId}</span>
                  <span class="separator">|</span>
                  <span>Version: ${policy.version}</span>
                </div>
              </div>

              <div class="policy-body">
                <div class="doc-section">
                  <h3>1.0 Document Description</h3>
                  <p>${policy.description || 'No description provided.'}</p>
                </div>

                <div class="doc-section">
                  <h3>2.0 Policy Details</h3>
                  <div class="content-body">${policy.content || 'No content available.'}</div>
                </div>

                ${policy.signatureCards && policy.signatureCards.length > 0 ? `
                  <div class="signature-section">
                    <h3>3.0 ${policy.signatureCards.length === 1 ? 'Signature' : 'Signatures'}</h3>
                    <p class="signature-subtitle">This document has been reviewed by the following:</p>
                    
                    <div class="signature-grid">
                      ${signatureCardsHTML}
                    </div>
                  </div>
                ` : ''}
              </div>

              <div class="document-footer">
                <div class="footer-left">
                  Created: ${formatDateShort(policy.createdAt)}
                </div>
                <div class="footer-center">
                  © ${new Date().getFullYear()} ${companyInfo.name}. Confidential Document
                </div>
                <div class="footer-right">
                  Last Updated: ${formatDateShort(policy.updatedAt || policy.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow popups for this site to print the document.');
      return;
    }
    
    printWindow.document.write(getPrintHTML());
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
    
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
      }
    }, 800);
  };

  const handleDownload = async () => {
    try {
      await onDownload();
      
      const htmlContent = getPrintHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${policy.policyName.replace(/\s+/g, '_')}_${policy.policyId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const htmlContent = getPrintHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${policy.policyName.replace(/\s+/g, '_')}_${policy.policyId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl"
        style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4 pb-0 no-print sticky top-0 bg-white z-10 rounded-t-2xl">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          <div id="policy-content" className="policy-content-wrapper px-4 pb-4" style={{ position: 'relative' }}>
            <div 
              className="mx-auto bg-white relative overflow-hidden"
              style={{ 
                maxWidth: '794px', 
                width: '100%',
                minHeight: '1123px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                border: 'none'
              }}
            >
              {/* Watermark for screen view */}
              <div className="absolute inset-0 pointer-events-none z-0 flex justify-center items-center overflow-hidden opacity-15">
                <img 
                  src={logo} 
                  alt="Watermark" 
                  className="w-[60%] h-auto max-h-[70%] object-contain"
                  style={{ filter: 'grayscale(100%)' }}
                />
              </div>
              
              <div className="relative z-2 bg-transparent">
                {/* Official Document Header */}
                <div className="px-8 pt-6 pb-4 border-b-2 border-blue-900 bg-gray-50/95">
                  <div className="flex items-center gap-5 pb-2 border-b border-gray-200">
                    <div className="flex-shrink-0 border-r-2 border-gray-200 pr-5">
                      <img src={logo} alt={companyInfo.name} className="h-16 w-auto" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-blue-900 tracking-wide" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                        {companyInfo.name}
                      </h2>
                      <p className="text-xs text-gray-500 italic">Excellence in Technology & Innovation</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="w-3 h-3" />
                        {companyInfo.address}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <FaPhone className="w-3 h-3" />
                        {companyInfo.phone}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <FaEnvelope className="w-3 h-3" />
                        {companyInfo.email}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <FaGlobe className="w-3 h-3" />
                        {companyInfo.website}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500">{companyInfo.registration}</span>
                    </div>
                  </div>
                </div>

                {/* Document Title */}
                <div className="px-8 py-4 bg-white/95 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-center text-gray-900 uppercase tracking-wide" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                    {policy.policyName}
                  </h1>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-600">
                    <span>Document ID: {policy.policyId}</span>
                    <span className="text-gray-300">|</span>
                    <span>Version: {policy.version}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="px-8 py-5 bg-white/97">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-blue-900 border-b border-gray-200 pb-1 mb-2" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                      1.0 Document Description
                    </h3>
                    <p className="text-sm text-gray-800 leading-relaxed text-justify">
                      {policy.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-base font-bold text-blue-900 border-b border-gray-200 pb-1 mb-2" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                      2.0 Policy Details
                    </h3>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed text-justify">
                      {policy.content || 'No content available.'}
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* SIGNATURE CARDS - OPTIONAL */}
                  {/* ============================================ */}
                  {policy.signatureCards && policy.signatureCards.length > 0 && (
                    <div className="mt-6 pt-4 border-t-2 border-blue-900">
                      <h3 className="text-base font-bold text-blue-900 mb-1" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                        3.0 {policy.signatureCards.length === 1 ? 'Signature' : 'Signatures'}
                      </h3>
                      <p className="text-xs text-gray-500 italic mb-3">
                        This document has been reviewed by the following:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {policy.signatureCards.map((card, index) => (
                          <div key={index} className="text-center p-3 border border-gray-300 bg-gray-50/90">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                              {card.type === 'Approved By' ? (
                                <span className="flex items-center justify-center gap-1">
                                  <FaUserShield className="w-3 h-3" />
                                  Approved By
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-1">
                                  <FaUsers className="w-3 h-3" />
                                  Customer
                                </span>
                              )}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {card.name || 'Not specified'}
                            </p>
                            {card.role && (
                              <p className="text-xs text-gray-500 italic">{card.role}</p>
                            )}
                            <div className="w-3/4 border-b border-gray-900 mx-auto mt-3 h-6"></div>
                            {card.showDate !== false && (
                              <p className="text-xs text-gray-400 italic mt-1">
                                Date: {formatDate(new Date())}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-8 py-3 bg-gray-50/95 flex justify-between items-center text-xs text-gray-500">
                  <span>Created: {formatDateShort(policy.createdAt)}</span>
                  <span className="italic">© {new Date().getFullYear()} {companyInfo.name}. Confidential Document</span>
                  <span>Last Updated: {formatDateShort(policy.updatedAt || policy.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 p-4 pt-2 border-t border-gray-200 no-print sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all"
          >
            <FaFilePdf className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-all"
          >
            <FaPrint className="w-4 h-4" />
            Print Document
          </button>
          <button
            onClick={onClose}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
          >
            <FaTimes className="w-4 h-4" />
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PolicyViewModal;