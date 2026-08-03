// backend/seeds/blogs.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../models/Blog');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

// Blog data with rich HTML content
const blogPosts = [
  {
    title: 'The Future of Web Development: Trends to Watch in 2024',
    slug: 'future-of-web-development-trends-2024',
    category: 'Technology',
    status: 'published',
    featured: true,
    excerpt: 'Discover the latest trends shaping the future of web development, from AI-powered tools to serverless architectures.',
    content: `
      <h2>The Evolution of Web Development</h2>
      <p>The web development landscape is evolving at an unprecedented pace. As we move through 2024, several key trends are reshaping how we build and deliver web applications.</p>
      
      <h3>1. AI-Powered Development</h3>
      <p>Artificial intelligence is revolutionizing the way developers work. From code completion to bug detection, AI tools are becoming indispensable.</p>
      <ul>
        <li><strong>GitHub Copilot</strong> - AI pair programming</li>
        <li><strong>AI testing tools</strong> - Automated test generation</li>
        <li><strong>Smart debugging</strong> - AI-assisted error resolution</li>
      </ul>
      
      <h3>2. Serverless Architecture</h3>
      <p>Serverless computing continues to gain traction, offering scalability and cost-efficiency for modern applications.</p>
      <ul>
        <li>Reduced operational overhead</li>
        <li>Automatic scaling</li>
        <li>Pay-per-execution pricing models</li>
      </ul>
      
      <h3>3. WebAssembly (Wasm)</h3>
      <p>WebAssembly is opening new possibilities for high-performance web applications, enabling languages like Rust and C++ to run in the browser.</p>
      
      <h3>4. Progressive Web Apps (PWAs)</h3>
      <p>PWAs continue to bridge the gap between web and native mobile experiences, offering offline capabilities and app-like interactions.</p>
      
      <h2>Conclusion</h2>
      <p>The future of web development is bright, with technologies evolving to make development faster, more efficient, and more accessible than ever before.</p>
    `,
    tags: ['web development', 'AI', 'serverless', 'WebAssembly', 'PWA', 'trends'],
    seo: {
      title: 'Web Development Trends 2024 | Riseup-Tech',
      description: 'Discover the latest trends shaping web development in 2024, from AI-powered tools to serverless architectures.',
      keywords: ['web development', 'AI', 'serverless', 'WebAssembly', 'PWA', 'trends 2024']
    }
  },
  {
    title: 'Building Scalable Mobile Apps with React Native',
    slug: 'building-scalable-mobile-apps-react-native',
    category: 'Development',
    status: 'published',
    featured: true,
    excerpt: 'Learn how to build scalable, high-performance mobile applications using React Native and best practices.',
    content: `
      <h2>Why React Native for Mobile Development?</h2>
      <p>React Native has emerged as a leading framework for cross-platform mobile development, offering a balance of performance and developer experience.</p>
      
      <h3>Key Advantages</h3>
      <ul>
        <li><strong>Code Reusability</strong> - Write once, run on iOS and Android</li>
        <li><strong>Hot Reloading</strong> - Instant feedback during development</li>
        <li><strong>Native Performance</strong> - Direct access to native components</li>
        <li><strong>Large Ecosystem</strong> - Extensive libraries and community support</li>
      </ul>
      
      <h3>Best Practices for Scalability</h3>
      <p>Building a scalable React Native app requires careful planning and architecture:</p>
      <ul>
        <li><strong>State Management</strong> - Use Redux or MobX for complex state</li>
        <li><strong>Code Splitting</strong> - Lazy load components and screens</li>
        <li><strong>Performance Optimization</strong> - Use FlatList, memoization, and optimization techniques</li>
        <li><strong>Testing</strong> - Implement unit, integration, and E2E testing</li>
      </ul>
      
      <h3>Real-World Examples</h3>
      <p>Many successful apps are built with React Native, including:</p>
      <ul>
        <li>Facebook</li>
        <li>Instagram</li>
        <li>Airbnb (partially)</li>
        <li>Walmart</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>React Native provides a powerful platform for building scalable mobile applications. With the right architecture and best practices, you can create high-performance apps that serve millions of users.</p>
    `,
    tags: ['React Native', 'mobile development', 'scalability', 'cross-platform'],
    seo: {
      title: 'React Native Mobile Apps | Riseup-Tech',
      description: 'Learn how to build scalable, high-performance mobile applications using React Native.',
      keywords: ['React Native', 'mobile development', 'scalability', 'cross-platform', 'iOS', 'Android']
    }
  },
  {
    title: 'Mastering UI/UX Design: Principles for Digital Products',
    slug: 'mastering-ui-ux-design-principles',
    category: 'Design',
    status: 'published',
    featured: false,
    excerpt: 'Explore the fundamental principles of UI/UX design and learn how to create digital products that users love.',
    content: `
      <h2>The Art and Science of UI/UX Design</h2>
      <p>Great digital products are built on a foundation of exceptional user experience (UX) and user interface (UI) design. Understanding the principles behind effective design is crucial for creating products that resonate with users.</p>
      
      <h3>Core UX Principles</h3>
      <ul>
        <li><strong>User-Centered Design</strong> - Design with user needs as the priority</li>
        <li><strong>Usability</strong> - Make products intuitive and easy to use</li>
        <li><strong>Accessibility</strong> - Ensure inclusivity for all users</li>
        <li><strong>Consistency</strong> - Maintain design patterns throughout</li>
      </ul>
      
      <h3>Essential UI Design Elements</h3>
      <ul>
        <li><strong>Typography</strong> - Choose readable and aesthetically pleasing fonts</li>
        <li><strong>Color Theory</strong> - Use colors to convey meaning and evoke emotions</li>
        <li><strong>Layout</strong> - Create visual hierarchy and balance</li>
        <li><strong>Interaction Design</strong> - Design meaningful animations and transitions</li>
      </ul>
      
      <h3>Design Thinking Process</h3>
      <p>The design thinking methodology provides a structured approach to product design:</p>
      <ol>
        <li><strong>Empathize</strong> - Understand user needs through research</li>
        <li><strong>Define</strong> - Frame the problem clearly</li>
        <li><strong>Ideate</strong> - Generate creative solutions</li>
        <li><strong>Prototype</strong> - Build quick, testable versions</li>
        <li><strong>Test</strong> - Validate with real users</li>
      </ol>
      
      <h2>Conclusion</h2>
      <p>Mastering UI/UX design is an ongoing journey that combines creativity, empathy, and technical skill. By applying these principles, you can create digital products that users love.</p>
    `,
    tags: ['UI design', 'UX design', 'product design', 'design thinking', 'user experience'],
    seo: {
      title: 'UI/UX Design Principles | Riseup-Tech',
      description: 'Explore the fundamental principles of UI/UX design and learn how to create digital products that users love.',
      keywords: ['UI design', 'UX design', 'product design', 'design thinking', 'user experience']
    }
  },
  {
    title: 'Cloud Migration: A Step-by-Step Guide',
    slug: 'cloud-migration-step-by-step-guide',
    category: 'Technology',
    status: 'published',
    featured: false,
    excerpt: 'A comprehensive guide to migrating your infrastructure to the cloud, including planning, execution, and optimization strategies.',
    content: `
      <h2>Why Cloud Migration Matters</h2>
      <p>Cloud migration is the process of moving digital assets from on-premise infrastructure to cloud environments. This shift offers numerous benefits, including scalability, cost-efficiency, and agility.</p>
      
      <h3>Benefits of Cloud Migration</h3>
      <ul>
        <li><strong>Scalability</strong> - Easily scale resources up or down</li>
        <li><strong>Cost Efficiency</strong> - Pay only for what you use</li>
        <li><strong>Security</strong> - Advanced security features and compliance</li>
        <li><strong>Innovation</strong> - Access to cutting-edge technologies</li>
      </ul>
      
      <h3>Step-by-Step Migration Process</h3>
      <ol>
        <li><strong>Assessment</strong> - Evaluate current infrastructure</li>
        <li><strong>Strategy</strong> - Choose migration approach (lift-and-shift, re-platform, refactor)</li>
        <li><strong>Planning</strong> - Create detailed migration plan</li>
        <li><strong>Execution</strong> - Migrate workloads systematically</li>
        <li><strong>Optimization</strong> - Performance tuning and cost optimization</li>
      </ol>
      
      <h3>Common Migration Challenges</h3>
      <ul>
        <li>Data transfer time and bandwidth</li>
        <li>Application dependencies</li>
        <li>Security and compliance requirements</li>
        <li>Skills gap in the team</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Cloud migration, when done correctly, can transform your business. With careful planning and execution, you can leverage the full power of cloud computing.</p>
    `,
    tags: ['cloud migration', 'cloud computing', 'AWS', 'Azure', 'infrastructure'],
    seo: {
      title: 'Cloud Migration Guide | Riseup-Tech',
      description: 'A comprehensive guide to migrating your infrastructure to the cloud.',
      keywords: ['cloud migration', 'cloud computing', 'AWS', 'Azure', 'infrastructure']
    }
  },
  {
    title: 'Digital Marketing Strategies for 2024',
    slug: 'digital-marketing-strategies-2024',
    category: 'Marketing',
    status: 'published',
    featured: false,
    excerpt: 'Stay ahead of the curve with these effective digital marketing strategies for 2024, from SEO to social media and beyond.',
    content: `
      <h2>The Digital Marketing Landscape</h2>
      <p>Digital marketing continues to evolve rapidly. In 2024, successful strategies require a mix of traditional and emerging approaches.</p>
      
      <h3>Search Engine Optimization (SEO)</h3>
      <ul>
        <li><strong>Core Web Vitals</strong> - Focus on user experience signals</li>
        <li><strong>E-E-A-T</strong> - Experience, Expertise, Authoritativeness, and Trust</li>
        <li><strong>AI-Generated Content</strong> - Leverage AI while maintaining quality</li>
        <li><strong>Voice Search Optimization</strong> - Optimize for conversational queries</li>
      </ul>
      
      <h3>Social Media Marketing</h3>
      <ul>
        <li><strong>Short-Form Video</strong> - TikTok, Reels, and Shorts</li>
        <li><strong>Influencer Partnerships</strong> - Authentic collaborations</li>
        <li><strong>Social Commerce</strong> - Direct shopping through social platforms</li>
        <li><strong>Community Building</strong> - Foster engagement and loyalty</li>
      </ul>
      
      <h3>Content Marketing</h3>
      <ul>
        <li><strong>Interactive Content</strong> - Quizzes, polls, and interactive videos</li>
        <li><strong>User-Generated Content</strong> - Leverage customer content</li>
        <li><strong>Personalization</strong> - Tailored content experiences</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Digital marketing success in 2024 requires a strategic blend of traditional and innovative approaches, with a focus on authenticity and user experience.</p>
    `,
    tags: ['digital marketing', 'SEO', 'social media', 'content marketing', '2024 trends'],
    seo: {
      title: 'Digital Marketing Strategies 2024 | Riseup-Tech',
      description: 'Stay ahead of the curve with these effective digital marketing strategies for 2024.',
      keywords: ['digital marketing', 'SEO', 'social media', 'content marketing', '2024 trends']
    }
  },
  {
    title: 'Why Choose Riseup-Tech for Your Next Project?',
    slug: 'why-choose-riseup-tech',
    category: 'Business',
    status: 'published',
    featured: true,
    excerpt: 'Discover what makes Riseup-Tech the right partner for your software development and digital transformation projects.',
    content: `
      <h2>Your Trusted Technology Partner</h2>
      <p>At Riseup-Tech, we understand that choosing a technology partner is a critical decision. Here's why organizations trust us with their most important projects.</p>
      
      <h3>Our Commitment to Excellence</h3>
      <ul>
        <li><strong>Quality-Driven Development</strong> - We never compromise on code quality</li>
        <li><strong>Innovation First</strong> - Stay ahead with cutting-edge solutions</li>
        <li><strong>Transparent Communication</strong> - Regular updates and clear reporting</li>
        <li><strong>Customer Success</strong> - Your success is our priority</li>
      </ul>
      
      <h3>Our Areas of Expertise</h3>
      <ul>
        <li>Web Development (React, Node.js, Next.js)</li>
        <li>Mobile App Development (React Native, Flutter)</li>
        <li>Cloud Solutions (AWS, Azure, GCP)</li>
        <li>UI/UX Design</li>
        <li>Digital Marketing</li>
      </ul>
      
      <h3>What Our Clients Say</h3>
      <p>"Riseup-Tech delivered exceptional results for our web development project. Their team was professional, responsive, and exceeded our expectations."</p>
      <p>"Working with Riseup-Tech was a great experience. They truly understand our business needs and provided solutions that made a real difference."</p>
      
      <h2>Ready to Get Started?</h2>
      <p>Contact Riseup-Tech today and let's build something amazing together.</p>
    `,
    tags: ['Riseup-Tech', 'software development', 'digital transformation', 'technology partner'],
    seo: {
      title: 'Why Choose Riseup-Tech | Software Development Company',
      description: 'Discover what makes Riseup-Tech the right partner for your software development projects.',
      keywords: ['Riseup-Tech', 'software development', 'digital transformation', 'technology partner']
    }
  }
];

const seedBlogs = async () => {
  try {
    console.log('🗑️  Removing existing blogs...');
    await Blog.deleteMany({});
    
    console.log('📄 Creating blog posts...');
    
    // Find a user to set as author (first admin user)
    const author = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    
    if (!author) {
      console.warn('⚠️  No admin user found! Blogs will be created without author.');
    }
    
    let createdCount = 0;
    
    for (const blogData of blogPosts) {
      const blog = new Blog({
        ...blogData,
        author: author?._id || null,
        authorName: author?.name || 'Riseup-Tech Team',
        publishedAt: blogData.status === 'published' ? new Date() : null,
        views: Math.floor(Math.random() * 100) + 10,
      });
      
      await blog.save();
      console.log(`✅ Created: ${blogData.title}`);
      createdCount++;
    }
    
    console.log(`\n🎉 Seeding complete! Created ${createdCount} blog posts.`);
    
    // Display summary
    const total = await Blog.countDocuments();
    const published = await Blog.countDocuments({ status: 'published' });
    const featured = await Blog.countDocuments({ featured: true });
    
    console.log('\n📊 Summary:');
    console.log(`   Total Blogs: ${total}`);
    console.log(`   Published: ${published}`);
    console.log(`   Featured: ${featured}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
    process.exit(1);
  }
};

seedBlogs();