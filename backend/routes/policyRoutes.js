// routes/policyRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPolicy,
  getPolicies,
  getPolicy,
  updatePolicy,
  deletePolicy,
  downloadPolicy,
  addSignature,
  getSignatures,
  removeSignature,
  getNextPolicyId,
  getEmployeesByRole
} = require('../controllers/policyController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// ============================================
// PUBLIC ROUTES (All authenticated users)
// ============================================
router.get('/next-id', protect, getNextPolicyId);
router.get('/employees/:role', protect, getEmployeesByRole);

// View policies - All users
router.route('/')
  .get(protect, getPolicies);

// View single policy - All users
router.get('/:id', protect, getPolicy);

// Download policy - All users
router.put('/:id/download', protect, downloadPolicy);

// ============================================
// SIGNATURE MANAGEMENT - ALL USERS
// ============================================
router.get('/:id/signatures', protect, getSignatures);
router.post('/:id/signatures', protect, addSignature);
router.delete('/:id/signatures/:signatureId', protect, removeSignature);

// ============================================
// ADMIN ONLY ROUTES
// ============================================
router.post('/', protect, adminOnly, createPolicy);
router.put('/:id', protect, adminOnly, updatePolicy);
router.delete('/:id', protect, adminOnly, deletePolicy);

module.exports = router;