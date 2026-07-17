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
  getNextPolicyId,
  getEmployeesByRole
} = require('../controllers/policyController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All routes are protected
router.get('/next-id', protect, getNextPolicyId);
router.get('/employees/:role', protect, getEmployeesByRole);

router.route('/')
  .get(protect, getPolicies)
  .post(protect, adminOnly, createPolicy);

router.put('/:id/download', protect, downloadPolicy);
router.post('/:id/signatures', protect, addSignature);
router.get('/:id', protect, getPolicy);
router.put('/:id', protect, adminOnly, updatePolicy);
router.delete('/:id', protect, adminOnly, deletePolicy);

module.exports = router;