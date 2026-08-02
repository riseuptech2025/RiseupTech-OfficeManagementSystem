const Page = require('../models/Page');
const Blog = require('../models/Blog');
const Service = require('../models/Service');
const Team = require('../models/Team');
const Testimonial = require('../models/Testimonial');
const Setting = require('../models/Setting');
const Career = require('../models/Career');
const Contact = require('../models/Contact');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// PAGE CONTROLLERS
// ============================================

// @desc    Get all pages
// @route   GET /api/website/pages
const getPages = async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    const pages = await Page.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single page
// @route   GET /api/website/pages/:id
const getPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get page by slug
// @route   GET /api/website/pages/slug/:slug
const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: 'published' });
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Get page by slug error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create page
// @route   POST /api/website/pages
const createPage = async (req, res) => {
  try {
    const { title, content, excerpt, featuredImage, seo, type, order, status } = req.body;
    
    // Check if page with same slug exists
    const slug = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: 'A page with this title already exists'
      });
    }
    
    const page = await Page.create({
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      seo,
      type: type || 'page',
      order: order || 0,
      status: status || 'draft',
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update page
// @route   PUT /api/website/pages/:id
const updatePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    const { title, content, excerpt, featuredImage, seo, type, order, status } = req.body;
    
    // Save version before update
    page.versions = page.versions || [];
    page.versions.push({
      content: page.content,
      updatedAt: new Date(),
      updatedBy: req.user.id
    });
    
    // Update slug if title changed
    if (title && title !== page.title) {
      page.slug = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      // Check if new slug exists
      const existingPage = await Page.findOne({ slug: page.slug, _id: { $ne: page._id } });
      if (existingPage) {
        return res.status(400).json({
          success: false,
          message: 'A page with this title already exists'
        });
      }
    }
    
    // Update page
    page.title = title || page.title;
    page.content = content || page.content;
    page.excerpt = excerpt || page.excerpt;
    page.featuredImage = featuredImage || page.featuredImage;
    page.seo = seo || page.seo;
    page.type = type || page.type;
    page.order = order !== undefined ? order : page.order;
    page.status = status || page.status;
    page.updatedBy = req.user.id;
    
    await page.save();
    
    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete page
// @route   DELETE /api/website/pages/:id
const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    await page.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// BLOG CONTROLLERS
// ============================================

// @desc    Get all blogs
// @route   GET /api/website/blogs
const getBlogs = async (req, res) => {
  try {
    const { category, status, featured } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    
    const blogs = await Blog.find(query)
      .sort({ featured: -1, publishedAt: -1 })
      .populate('author', 'name email profilePicture');
    
    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single blog
// @route   GET /api/website/blogs/:id
const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email profilePicture');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get blog by slug
// @route   GET /api/website/blogs/slug/:slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name email profilePicture');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create blog
// @route   POST /api/website/blogs
const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, featuredImage, category, tags, seo, status, featured } = req.body;
    
    const slug = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      author: req.user.id,
      authorName: req.user.name,
      category,
      tags: tags || [],
      seo,
      status: status || 'draft',
      featured: featured || false,
      publishedAt: status === 'published' ? new Date() : null
    });
    
    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/website/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    const { title, content, excerpt, featuredImage, category, tags, seo, status, featured } = req.body;
    
    // Update slug if title changed
    if (title && title !== blog.title) {
      blog.slug = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
    
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.featuredImage = featuredImage || blog.featuredImage;
    blog.category = category || blog.category;
    blog.tags = tags || blog.tags;
    blog.seo = seo || blog.seo;
    blog.status = status || blog.status;
    blog.featured = featured !== undefined ? featured : blog.featured;
    
    if (status === 'published' && blog.status !== 'published') {
      blog.publishedAt = new Date();
    }
    
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/website/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    await blog.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// SERVICE CONTROLLERS
// ============================================

// @desc    Get all services
// @route   GET /api/website/services
const getServices = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const services = await Service.find(query)
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single service
// @route   GET /api/website/services/:id
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get service by slug
// @route   GET /api/website/services/slug/:slug
const getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service by slug error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create service
// @route   POST /api/website/services
const createService = async (req, res) => {
  try {
    const { name, description, fullDescription, icon, image, features, priceRange, seo, isActive, order } = req.body;
    
    const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    const service = await Service.create({
      name,
      slug,
      description,
      fullDescription,
      icon,
      image,
      features: features || [],
      priceRange,
      seo,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update service
// @route   PUT /api/website/services/:id
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    const { name, description, fullDescription, icon, image, features, priceRange, seo, isActive, order } = req.body;
    
    if (name && name !== service.name) {
      service.slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
    
    service.name = name || service.name;
    service.description = description || service.description;
    service.fullDescription = fullDescription || service.fullDescription;
    service.icon = icon || service.icon;
    service.image = image || service.image;
    service.features = features || service.features;
    service.priceRange = priceRange || service.priceRange;
    service.seo = seo || service.seo;
    service.isActive = isActive !== undefined ? isActive : service.isActive;
    service.order = order !== undefined ? order : service.order;
    
    await service.save();
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/website/services/:id
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    await service.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// TEAM CONTROLLERS
// ============================================

// @desc    Get all team members
// @route   GET /api/website/team
const getTeam = async (req, res) => {
  try {
    const team = await Team.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single team member
// @route   GET /api/website/team/:id
const getTeamMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create team member
// @route   POST /api/website/team
const createTeamMember = async (req, res) => {
  try {
    const { name, position, bio, image, email, socialLinks, order, isActive } = req.body;
    
    const team = await Team.create({
      name,
      position,
      bio,
      image,
      email,
      socialLinks,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update team member
// @route   PUT /api/website/team/:id
const updateTeamMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    const { name, position, bio, image, email, socialLinks, order, isActive } = req.body;
    
    team.name = name || team.name;
    team.position = position || team.position;
    team.bio = bio || team.bio;
    team.image = image || team.image;
    team.email = email || team.email;
    team.socialLinks = socialLinks || team.socialLinks;
    team.order = order !== undefined ? order : team.order;
    team.isActive = isActive !== undefined ? isActive : team.isActive;
    
    await team.save();
    
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete team member
// @route   DELETE /api/website/team/:id
const deleteTeamMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    await team.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// TESTIMONIAL CONTROLLERS
// ============================================

// @desc    Get all testimonials
// @route   GET /api/website/testimonials
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create testimonial
// @route   POST /api/website/testimonials
const createTestimonial = async (req, res) => {
  try {
    const { clientName, clientPosition, clientCompany, clientImage, content, rating, order, isActive } = req.body;
    
    const testimonial = await Testimonial.create({
      clientName,
      clientPosition,
      clientCompany,
      clientImage,
      content,
      rating: rating || 5,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update testimonial
// @route   PUT /api/website/testimonials/:id
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    const { clientName, clientPosition, clientCompany, clientImage, content, rating, order, isActive } = req.body;
    
    testimonial.clientName = clientName || testimonial.clientName;
    testimonial.clientPosition = clientPosition || testimonial.clientPosition;
    testimonial.clientCompany = clientCompany || testimonial.clientCompany;
    testimonial.clientImage = clientImage || testimonial.clientImage;
    testimonial.content = content || testimonial.content;
    testimonial.rating = rating || testimonial.rating;
    testimonial.order = order !== undefined ? order : testimonial.order;
    testimonial.isActive = isActive !== undefined ? isActive : testimonial.isActive;
    
    await testimonial.save();
    
    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/website/testimonials/:id
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    await testimonial.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// SETTINGS CONTROLLERS
// ============================================

// @desc    Get all settings (Public)
// @route   GET /api/website/settings
const getSettings = async (req, res) => {
  try {
    const { group } = req.query;
    const query = {};
    if (group) query.group = group;
    
    const settings = await Setting.find(query);
    
    // Convert to object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.status(200).json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update single setting
// @route   PUT /api/website/settings/:key
const updateSetting = async (req, res) => {
  try {
    const { value, type, group, description } = req.body;
    
    let setting = await Setting.findOne({ key: req.params.key });
    
    if (setting) {
      setting.value = value;
      setting.type = type || setting.type;
      setting.group = group || setting.group;
      setting.description = description || setting.description;
      setting.updatedBy = req.user.id;
    } else {
      setting = await Setting.create({
        key: req.params.key,
        value,
        type: type || 'string',
        group: group || 'general',
        description,
        updatedBy: req.user.id
      });
    }
    
    await setting.save();
    
    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update multiple settings (Admin only)
// @route   PUT /api/website/settings
const updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    const updates = [];
    
    for (const [key, value] of Object.entries(settings)) {
      // Skip if value is undefined or null
      if (value === undefined || value === null) continue;
      
      let setting = await Setting.findOne({ key });
      
      if (setting) {
        setting.value = value;
        setting.updatedBy = req.user.id;
      } else {
        setting = new Setting({
          key,
          value,
          updatedBy: req.user.id
        });
      }
      
      await setting.save();
      updates.push(setting);
    }
    
    res.status(200).json({
      success: true,
      data: updates,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// CAREER CONTROLLERS
// ============================================

// @desc    Get all careers
// @route   GET /api/website/careers
const getCareers = async (req, res) => {
  try {
    const { isActive, featured } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (featured !== undefined) query.featured = featured === 'true';
    
    const careers = await Career.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: careers
    });
  } catch (error) {
    console.error('Get careers error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single career
// @route   GET /api/website/careers/:id
const getCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: career
    });
  } catch (error) {
    console.error('Get career error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get career by slug
// @route   GET /api/website/careers/slug/:slug
const getCareerBySlug = async (req, res) => {
  try {
    const career = await Career.findOne({ slug: req.params.slug, isActive: true })
      .populate('createdBy', 'name email');
    
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: career
    });
  } catch (error) {
    console.error('Get career by slug error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create career
// @route   POST /api/website/careers
const createCareer = async (req, res) => {
  try {
    const { 
      title, description, requirements, responsibilities, benefits,
      location, employmentType, experienceLevel, salaryRange,
      applicationDeadline, isActive, featured
    } = req.body;
    
    const slug = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    const career = await Career.create({
      title,
      slug,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      benefits: benefits || [],
      location,
      employmentType: employmentType || 'Full-time',
      experienceLevel: experienceLevel || 'Mid',
      salaryRange,
      applicationDeadline,
      isActive: isActive !== undefined ? isActive : true,
      featured: featured || false,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: career
    });
  } catch (error) {
    console.error('Create career error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update career
// @route   PUT /api/website/careers/:id
const updateCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career not found'
      });
    }
    
    const { 
      title, description, requirements, responsibilities, benefits,
      location, employmentType, experienceLevel, salaryRange,
      applicationDeadline, isActive, featured
    } = req.body;
    
    if (title && title !== career.title) {
      career.slug = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
    
    career.title = title || career.title;
    career.description = description || career.description;
    career.requirements = requirements || career.requirements;
    career.responsibilities = responsibilities || career.responsibilities;
    career.benefits = benefits || career.benefits;
    career.location = location || career.location;
    career.employmentType = employmentType || career.employmentType;
    career.experienceLevel = experienceLevel || career.experienceLevel;
    career.salaryRange = salaryRange || career.salaryRange;
    career.applicationDeadline = applicationDeadline || career.applicationDeadline;
    career.isActive = isActive !== undefined ? isActive : career.isActive;
    career.featured = featured !== undefined ? featured : career.featured;
    
    await career.save();
    
    res.status(200).json({
      success: true,
      data: career
    });
  } catch (error) {
    console.error('Update career error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete career
// @route   DELETE /api/website/careers/:id
const deleteCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career not found'
      });
    }
    
    await career.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Career deleted successfully'
    });
  } catch (error) {
    console.error('Delete career error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Apply for career
// @route   POST /api/website/careers/:id/apply
const applyForCareer = async (req, res) => {
  try {
    const { name, email, phone, coverLetter } = req.body;
    let resume = null;
    
    // Upload resume to Cloudinary if file exists
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.buffer, {
          folder: 'riseup-tech/resumes',
          resource_type: 'auto'
        });
        resume = result.secure_url;
      } catch (uploadError) {
        console.error('Resume upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload resume'
        });
      }
    }
    
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career not found'
      });
    }
    
    career.applications.push({
      name,
      email,
      phone,
      resume,
      coverLetter,
      status: 'pending'
    });
    
    await career.save();
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply for career error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// CONTACT CONTROLLERS
// ============================================

// @desc    Get all contacts
// @route   GET /api/website/contacts
const getContacts = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit contact
// @route   POST /api/website/contacts
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/website/contacts/:id/status
const updateContactStatus = async (req, res) => {
  try {
    const { status, reply } = req.body;
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    contact.status = status || contact.status;
    
    if (reply) {
      contact.reply = {
        content: reply,
        repliedAt: new Date(),
        repliedBy: req.user.id
      };
    }
    
    await contact.save();
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/website/contacts/:id
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    await contact.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// IMAGE UPLOAD TO CLOUDINARY
// ============================================

// @desc    Upload image to Cloudinary
// @route   POST /api/website/upload
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.buffer, {
      folder: 'riseup-tech/website',
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        filename: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================

module.exports = {
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
};