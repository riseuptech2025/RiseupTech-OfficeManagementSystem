// controllers/customerController.js
const Customer = require('../models/Customer');

// @desc    Create or update customer
// @route   POST /api/customers
// @access  Private
const createOrUpdateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, company, panNumber, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and phone number'
      });
    }

    // Check if customer exists
    let customer = await Customer.findOne({ phone });

    if (customer) {
      // Update existing customer
      customer.name = name || customer.name;
      customer.email = email || customer.email;
      customer.address = address || customer.address;
      customer.company = company || customer.company;
      customer.panNumber = panNumber || customer.panNumber;
      customer.notes = notes || customer.notes;
      await customer.save();
    } else {
      // Create new customer
      customer = await Customer.create({
        name,
        phone,
        email,
        address,
        company,
        panNumber,
        notes,
        createdBy: req.user.id,
        createdByName: req.user.name
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Create/Update customer error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: customers
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search customer by phone
// @route   GET /api/customers/search/:phone
// @access  Private
const searchCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    const customer = await Customer.findOne({ phone });

    res.status(200).json({
      success: true,
      data: customer || null
    });
  } catch (error) {
    console.error('Search customer error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrUpdateCustomer,
  getCustomers,
  getCustomer,
  searchCustomerByPhone
};