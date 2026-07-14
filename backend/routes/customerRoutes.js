// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrUpdateCustomer,
  getCustomers,
  getCustomer,
  searchCustomerByPhone
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.route('/')
  .get(protect, getCustomers)
  .post(protect, createOrUpdateCustomer);

router.get('/search/:phone', protect, searchCustomerByPhone);
router.get('/:id', protect, getCustomer);

module.exports = router;