// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrUpdateCustomer,
  addCommunication,
  uploadDocument,
  updateCustomerStatus,
  getCustomers,
  getCustomer,
  deleteCustomer,
  searchCustomerByPhone
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.route('/')
  .get(protect, getCustomers)
  .post(protect, createOrUpdateCustomer);

router.post('/:id/communication', protect, addCommunication);
router.post('/:id/documents', protect, uploadDocument);
router.put('/:id/status', protect, updateCustomerStatus);
router.get('/search/:phone', protect, searchCustomerByPhone);
router.get('/:id', protect, getCustomer);
router.delete('/:id', protect, deleteCustomer);

module.exports = router;