const adminOnly = (req, res, next) => {
  const adminRoles = ['super_admin', 'admin', 'hr_manager'];
  
  if (req.user && adminRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized. Admin access required.',
    });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized. Super admin access required.',
    });
  }
};

module.exports = { adminOnly, superAdminOnly };