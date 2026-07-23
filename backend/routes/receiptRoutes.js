// routes/receiptRoutes.js
const express = require('express');
const router = express.Router();
const {
  generateReceipt,
  generatePartialPayment,
  editReceipt,
  markAsPaid,
  getReceipts,
  getReceipt,
  getReceiptHistory,
  updateReceiptStatus,
  deleteReceipt,
  getReceiptStats,
  downloadReceipt
} = require('../controllers/receiptController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.route('/')
  .get(protect, getReceipts)
  .post(protect, generateReceipt);

router.get('/stats', protect, getReceiptStats);
router.get('/:id/history', protect, getReceiptHistory);
router.put('/:id/edit', protect, editReceipt);
router.put('/:id/pay', protect, markAsPaid);
router.post('/:id/pay-partial', protect, generatePartialPayment);
router.put('/:id/download', protect, downloadReceipt);
router.get('/:id', protect, getReceipt);
router.put('/:id/status', protect, updateReceiptStatus);
router.delete('/:id', protect, deleteReceipt);

module.exports = router;