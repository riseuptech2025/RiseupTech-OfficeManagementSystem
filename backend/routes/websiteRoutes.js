const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
  // Pages
  getPages,
  getPage,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  
  // Blogs
  getBlogs,
  getBlog,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  
  // Services
  getServices,
  getService,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  
  // Team
  getTeam,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  
  // Testimonials
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  
  // Settings
  getSettings,
  updateSetting,
  updateSettings,
  
  // Careers
  getCareers,
  getCareer,
  getCareerBySlug,
  createCareer,
  updateCareer,
  deleteCareer,
  applyForCareer,
  
  // Contacts
  getContacts,
  submitContact,
  updateContactStatus,
  deleteContact,
  
  // Upload
  uploadImage
} = require('../controllers/websiteController');

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp|svg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.toLowerCase().split('.').pop());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Pages - Public
router.get('/pages/slug/:slug', getPageBySlug);

// Blogs - Public
router.get('/blogs', getBlogs);
router.get('/blogs/slug/:slug', getBlogBySlug);
router.get('/blogs/:id', getBlog);

// Services - Public
router.get('/services', getServices);
router.get('/services/slug/:slug', getServiceBySlug);
router.get('/services/:id', getService);

// Team - Public
router.get('/team', getTeam);
router.get('/team/:id', getTeamMember);

// Testimonials - Public
router.get('/testimonials', getTestimonials);

// Careers - Public
router.get('/careers', getCareers);
router.get('/careers/slug/:slug', getCareerBySlug);
router.get('/careers/:id', getCareer);
router.post('/careers/:id/apply', upload.single('resume'), applyForCareer);

// Contact - Public
router.post('/contacts', submitContact);

// Settings - Public (limited)
router.get('/settings', getSettings);

// ============================================
// ADMIN ROUTES (Authentication required)
// ============================================

// All admin routes require authentication and admin/super_admin role
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Pages - Admin
router.get('/pages', getPages);
router.get('/pages/:id', getPage);
router.post('/pages', createPage);
router.put('/pages/:id', updatePage);
router.delete('/pages/:id', deletePage);

// Blogs - Admin
router.post('/blogs', createBlog);
router.put('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// Services - Admin
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Team - Admin
router.post('/team', createTeamMember);
router.put('/team/:id', updateTeamMember);
router.delete('/team/:id', deleteTeamMember);

// Testimonials - Admin
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// Settings - Admin
router.put('/settings/:key', updateSetting);
router.put('/settings', updateSettings);

// Careers - Admin
router.post('/careers', createCareer);
router.put('/careers/:id', updateCareer);
router.delete('/careers/:id', deleteCareer);

// Contacts - Admin
router.get('/contacts', getContacts);
router.put('/contacts/:id/status', updateContactStatus);
router.delete('/contacts/:id', deleteContact);

// Upload - Admin
router.post('/upload', protect, authorize('admin', 'super_admin'), upload.single('image'), uploadImage);

module.exports = router;