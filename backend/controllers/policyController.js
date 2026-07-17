// controllers/policyController.js
const Policy = require('../models/Policy');
const User = require('../models/User');

// @desc    Get next policy ID (preview)
// @route   GET /api/policies/next-id
// @access  Private
const getNextPolicyId = async (req, res) => {
  try {
    const { appliesTo, category } = req.query;
    
    if (!appliesTo || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appliesTo and category'
      });
    }
    
    const nextId = await Policy.getNextPolicyId(appliesTo, category);
    
    res.status(200).json({
      success: true,
      data: { nextId }
    });
  } catch (error) {
    console.error('Get next policy ID error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get active employees by role
// @route   GET /api/policies/employees/:role
// @access  Private
const getEmployeesByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const employees = await Policy.getActiveEmployeesByRole(role);
    
    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Get employees by role error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a new policy
// @route   POST /api/policies
// @access  Private (Admin/Super Admin only)
const createPolicy = async (req, res) => {
  try {
    const {
      policyName,
      category,
      appliesTo,
      approvalAuthority,
      description,
      content,
      version,
      status,
      signatureCards
    } = req.body;

    if (!policyName || !category || !description || !content || !appliesTo || !approvalAuthority) {
      return res.status(400).json({
        success: false,
        message: 'Please provide policy name, category, applies to, approval authority, description and content'
      });
    }

    const policyId = await Policy.getNextPolicyId(appliesTo, category);
    const categoryCode = Policy.getCategoryCode(category);
    const appliesToCode = Policy.getAppliesToCode(appliesTo);

    const filteredSignatureCards = (signatureCards || [])
      .filter(card => {
        if (card.type === 'Approved By') {
          return card.userId || (card.name && card.name.trim() !== '');
        }
        return card.name && card.name.trim() !== '';
      });

    const policyData = {
      policyId,
      policyName,
      category,
      categoryCode,
      appliesTo,
      appliesToCode,
      approvalAuthority: approvalAuthority || 'Admin',
      description,
      content,
      version: version || '1.0',
      status: status || 'Published',
      signatureCards: filteredSignatureCards,
      createdBy: req.user.id,
      createdByName: req.user.name
    };

    const policy = new Policy(policyData);
    await policy.save();

    policy.auditLog.push({
      action: 'created',
      user: req.user.id,
      userName: req.user.name,
      details: `Policy ${policy.policyId} created`
    });
    await policy.save();

    res.status(201).json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Create policy error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all policies (All authenticated users can view)
// @route   GET /api/policies
// @access  Private (All authenticated users)
const getPolicies = async (req, res) => {
  try {
    const { category, status, appliesTo, search, page = 1, limit = 20 } = req.query;
    
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (appliesTo) query.appliesTo = appliesTo;
    
    if (search) {
      query.$or = [
        { policyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { policyId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const policies = await Policy.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .populate('signatureCards.userId', 'name email role');

    const total = await Policy.countDocuments(query);

    res.status(200).json({
      success: true,
      count: policies.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: policies
    });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single policy (All authenticated users can view)
// @route   GET /api/policies/:id
// @access  Private (All authenticated users)
const getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .populate('signatureCards.userId', 'name email role')
      .populate('customSignatures.signedBy', 'name email role');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    policy.viewCount += 1;
    await policy.save();

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Get policy error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update policy
// @route   PUT /api/policies/:id
// @access  Private (Admin/Super Admin only)
const updatePolicy = async (req, res) => {
  try {
    const {
      policyName,
      category,
      appliesTo,
      approvalAuthority,
      description,
      content,
      version,
      status,
      signatureCards
    } = req.body;

    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    if (policyName) policy.policyName = policyName;
    if (category) {
      policy.category = category;
      policy.categoryCode = Policy.getCategoryCode(category);
    }
    if (appliesTo) {
      policy.appliesTo = appliesTo;
      policy.appliesToCode = Policy.getAppliesToCode(appliesTo);
    }
    if (approvalAuthority) policy.approvalAuthority = approvalAuthority;
    if (description) policy.description = description;
    if (content) policy.content = content;
    if (version) policy.version = version;
    if (status) policy.status = status;
    if (signatureCards) {
      const filtered = signatureCards.filter(card => {
        if (card.type === 'Approved By') {
          return card.userId || (card.name && card.name.trim() !== '');
        }
        return card.name && card.name.trim() !== '';
      });
      policy.signatureCards = filtered;
    }
    
    policy.updatedBy = req.user.id;
    policy.updatedByName = req.user.name;

    await policy.save();

    policy.auditLog.push({
      action: 'updated',
      user: req.user.id,
      userName: req.user.name,
      details: `Policy ${policy.policyId} updated`
    });
    await policy.save();

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete policy (soft delete) - Admin/Super Admin only
// @route   DELETE /api/policies/:id
// @access  Private (Admin or Super Admin only)
const deletePolicy = async (req, res) => {
  try {
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder'].includes(req.user.role);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete policies. Only Admins can delete.'
      });
    }

    const result = await Policy.updateOne(
      { _id: req.params.id, isActive: true },
      { 
        $set: { 
          isActive: false,
          updatedBy: req.user.id,
          updatedByName: req.user.name
        },
        $push: {
          auditLog: {
            action: 'deleted',
            user: req.user.id,
            userName: req.user.name,
            details: `Policy deleted`,
            timestamp: new Date()
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or already deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download policy - All authenticated users can download
// @route   PUT /api/policies/:id/download
// @access  Private (All authenticated users)
const downloadPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    policy.downloadCount += 1;
    await policy.save();

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Download policy error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// SIGNATURE MANAGEMENT - ALL USERS
// ============================================

// @desc    Add/Edit custom signature - All authenticated users
// @route   POST /api/policies/:id/signatures
// @access  Private (All authenticated users)
const addSignature = async (req, res) => {
  try {
    const { type, name, role, userId, signature, signatureId } = req.body;
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    const signatureData = {
      type: type || 'Approved By',
      name: name || req.user.name,
      role: role || req.user.role,
      userId: userId || req.user.id,
      signature: signature || 'Digital Signature',
      signedBy: req.user.id
    };

    // If signatureId is provided, update existing signature
    if (signatureId) {
      const existingIndex = policy.customSignatures.findIndex(
        s => s._id.toString() === signatureId && s.signedBy.toString() === req.user.id
      );

      if (existingIndex === -1) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own signatures'
        });
      }

      policy.customSignatures[existingIndex] = {
        ...policy.customSignatures[existingIndex].toObject(),
        ...signatureData,
        signedAt: new Date()
      };
    } else {
      // Check if signature already exists for this user and type
      const existingIndex = policy.customSignatures.findIndex(
        s => s.type === signatureData.type && s.signedBy.toString() === req.user.id
      );

      if (existingIndex !== -1) {
        policy.customSignatures[existingIndex] = {
          ...policy.customSignatures[existingIndex].toObject(),
          ...signatureData,
          signedAt: new Date()
        };
      } else {
        policy.customSignatures.push(signatureData);
      }
    }

    await policy.save();

    // Populate the signatures for response
    await policy.populate('customSignatures.signedBy', 'name email role');

    res.status(200).json({
      success: true,
      data: policy.customSignatures
    });
  } catch (error) {
    console.error('Add signature error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all signatures for a policy
// @route   GET /api/policies/:id/signatures
// @access  Private (All authenticated users)
const getSignatures = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('customSignatures.signedBy', 'name email role')
      .populate('signatureCards.userId', 'name email role');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    const signatures = {
      signatureCards: policy.signatureCards || [],
      customSignatures: policy.customSignatures || []
    };

    res.status(200).json({
      success: true,
      data: signatures
    });
  } catch (error) {
    console.error('Get signatures error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove signature - Users can only remove their own signatures
// @route   DELETE /api/policies/:id/signatures/:signatureId
// @access  Private (All authenticated users)
const removeSignature = async (req, res) => {
  try {
    const { id, signatureId } = req.params;
    const policy = await Policy.findById(id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Find the signature
    const signatureIndex = policy.customSignatures.findIndex(
      s => s._id.toString() === signatureId
    );

    if (signatureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Signature not found'
      });
    }

    const signature = policy.customSignatures[signatureIndex];

    // Check if user owns this signature or is admin
    const isOwner = signature.signedBy.toString() === req.user.id;
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove your own signatures'
      });
    }

    policy.customSignatures.splice(signatureIndex, 1);
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Signature removed successfully'
    });
  } catch (error) {
    console.error('Remove signature error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
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
};