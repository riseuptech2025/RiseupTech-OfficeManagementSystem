// controllers/customerController.js
const Customer = require('../models/Customer');

// @desc    Create or update customer
// @route   POST /api/customers
// @access  Private
const createOrUpdateCustomer = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      address, 
      company, 
      panNumber,
      requirements,
      dueDate,
      projectType,
      projectStatus,
      priority,
      assignedTo,
      assignedToName,
      followUpDate,
      notes
    } = req.body;

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
      customer.requirements = requirements || customer.requirements;
      customer.dueDate = dueDate || customer.dueDate;
      customer.projectType = projectType || customer.projectType;
      customer.projectStatus = projectStatus || customer.projectStatus;
      customer.priority = priority || customer.priority;
      customer.assignedTo = assignedTo || customer.assignedTo;
      customer.assignedToName = assignedToName || customer.assignedToName;
      customer.followUpDate = followUpDate || customer.followUpDate;
      customer.notes = notes || customer.notes;
      customer.updatedBy = req.user.id;
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
        requirements: requirements || '',
        dueDate: dueDate || null,
        projectType: projectType || 'Other',
        projectStatus: projectStatus || 'New',
        priority: priority || 'Medium',
        assignedTo: assignedTo || null,
        assignedToName: assignedToName || '',
        followUpDate: followUpDate || null,
        notes: notes || '',
        createdBy: req.user.id,
        createdByName: req.user.name,
        updatedBy: req.user.id
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

// @desc    Add communication log
// @route   POST /api/customers/:id/communication
// @access  Private
const addCommunication = async (req, res) => {
  try {
    const { type, subject, description, nextAction, nextActionDate } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.communicationLog.push({
      type,
      subject,
      description,
      nextAction,
      nextActionDate,
      performedBy: req.user.id,
      performedByName: req.user.name
    });

    await customer.save();

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Add communication error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload document
// @route   POST /api/customers/:id/documents
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    const { name, url } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.documents.push({
      name,
      url,
      uploadedAt: new Date(),
      uploadedBy: req.user.id
    });

    await customer.save();

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update customer status
// @route   PUT /api/customers/:id/status
// @access  Private
const updateCustomerStatus = async (req, res) => {
  try {
    const { projectStatus, priority, assignedTo, assignedToName, followUpDate } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (projectStatus) customer.projectStatus = projectStatus;
    if (priority) customer.priority = priority;
    if (assignedTo) customer.assignedTo = assignedTo;
    if (assignedToName) customer.assignedToName = assignedToName;
    if (followUpDate) customer.followUpDate = followUpDate;
    customer.updatedBy = req.user.id;

    await customer.save();

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Update customer status error:', error);
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

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const { search, status, priority, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.projectStatus = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

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
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('communicationLog.performedBy', 'name email');

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

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Soft delete - mark as inactive
    customer.isActive = false;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
  createOrUpdateCustomer,
  addCommunication,
  uploadDocument,
  updateCustomerStatus,
  searchCustomerByPhone,  // <-- THIS WAS MISSING
  getCustomers,
  getCustomer,
  deleteCustomer
};