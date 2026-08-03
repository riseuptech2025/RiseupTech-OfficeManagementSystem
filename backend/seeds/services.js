// backend/seeds/services.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('../models/Service');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const defaultServices = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Custom web development solutions tailored to your business needs.',
    fullDescription: `
      <h2>Web Development Services</h2>
      <p>We build modern, responsive, and high-performance websites and web applications using the latest technologies.</p>
      
      <h3>Our Web Development Services Include:</h3>
      <ul>
        <li>Custom Website Development</li>
        <li>E-commerce Solutions</li>
        <li>Content Management Systems (CMS)</li>
        <li>Progressive Web Apps (PWA)</li>
        <li>API Development & Integration</li>
        <li>Website Maintenance & Support</li>
      </ul>
      
      <h3>Technologies We Use:</h3>
      <ul>
        <li>React.js / Next.js</li>
        <li>Node.js / Express</li>
        <li>MongoDB / PostgreSQL</li>
        <li>Tailwind CSS / Bootstrap</li>
        <li>Docker / AWS</li>
      </ul>
    `,
    icon: '🌐',
    features: [
      'Responsive Design',
      'SEO Optimized',
      'Fast Performance',
      'Secure & Scalable',
      'Custom Functionality',
      'Ongoing Support'
    ],
    priceRange: { min: 50000, max: 200000 },
    isActive: true,
    order: 1,
    seo: {
      title: 'Web Development Services | Riseup-Tech',
      description: 'Custom web development solutions for your business.',
      keywords: ['web development', 'website design', 'e-commerce', 'CMS']
    }
  },
  {
    name: 'Mobile App Development',
    slug: 'mobile-app-development',
    description: 'Native and cross-platform mobile applications for iOS and Android.',
    fullDescription: `
      <h2>Mobile App Development Services</h2>
      <p>We create powerful, user-friendly mobile applications that engage users and drive business growth.</p>
      
      <h3>Our Mobile App Services Include:</h3>
      <ul>
        <li>iOS App Development</li>
        <li>Android App Development</li>
        <li>Cross-Platform Apps (React Native)</li>
        <li>App UI/UX Design</li>
        <li>App Store Optimization</li>
        <li>App Maintenance & Updates</li>
      </ul>
    `,
    icon: '📱',
    features: [
      'Native Performance',
      'Beautiful UI/UX',
      'Push Notifications',
      'Offline Support',
      'App Store Ready',
      'Analytics Integration'
    ],
    priceRange: { min: 100000, max: 400000 },
    isActive: true,
    order: 2,
    seo: {
      title: 'Mobile App Development | Riseup-Tech',
      description: 'Native and cross-platform mobile applications.',
      keywords: ['mobile app', 'iOS', 'Android', 'React Native']
    }
  },
  {
    name: 'UI/UX Design',
    slug: 'ui-ux-design',
    description: 'User-centered design solutions that enhance user experience and engagement.',
    fullDescription: `
      <h2>UI/UX Design Services</h2>
      <p>We create intuitive, beautiful, and user-friendly designs that delight users and achieve business goals.</p>
      
      <h3>Our Design Services Include:</h3>
      <ul>
        <li>User Research & Analysis</li>
        <li>Wireframing & Prototyping</li>
        <li>UI Design & Visual Design</li>
        <li>Usability Testing</li>
        <li>Design Systems & Guidelines</li>
        <li>Interaction Design</li>
      </ul>
    `,
    icon: '🎨',
    features: [
      'User-Centered Design',
      'Interactive Prototypes',
      'Design Systems',
      'Responsive Design',
      'Brand Identity',
      'User Testing'
    ],
    priceRange: { min: 30000, max: 150000 },
    isActive: true,
    order: 3,
    seo: {
      title: 'UI/UX Design | Riseup-Tech',
      description: 'User-centered design solutions.',
      keywords: ['UI design', 'UX design', 'prototyping', 'design system']
    }
  },
  {
    name: 'Cloud Solutions',
    slug: 'cloud-solutions',
    description: 'Scalable cloud infrastructure and DevOps solutions for modern applications.',
    fullDescription: `
      <h2>Cloud Solutions Services</h2>
      <p>We help businesses leverage cloud computing for scalability, reliability, and cost-efficiency.</p>
      
      <h3>Our Cloud Services Include:</h3>
      <ul>
        <li>Cloud Architecture Design</li>
        <li>DevOps & CI/CD Implementation</li>
        <li>Cloud Migration Services</li>
        <li>Infrastructure as Code</li>
        <li>Cloud Security & Compliance</li>
        <li>Cost Optimization</li>
      </ul>
    `,
    icon: '☁️',
    features: [
      'Scalable Infrastructure',
      'CI/CD Pipeline',
      'Security Best Practices',
      'Cost Optimization',
      '24/7 Monitoring',
      'Disaster Recovery'
    ],
    priceRange: { min: 75000, max: 300000 },
    isActive: true,
    order: 4,
    seo: {
      title: 'Cloud Solutions | Riseup-Tech',
      description: 'Scalable cloud infrastructure and DevOps solutions.',
      keywords: ['cloud', 'DevOps', 'AWS', 'Azure', 'CI/CD']
    }
  },
  {
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Results-driven digital marketing strategies to grow your online presence.',
    fullDescription: `
      <h2>Digital Marketing Services</h2>
      <p>We create and execute data-driven marketing strategies that deliver measurable results.</p>
      
      <h3>Our Digital Marketing Services Include:</h3>
      <ul>
        <li>SEO (Search Engine Optimization)</li>
        <li>Social Media Marketing</li>
        <li>Content Marketing</li>
        <li>PPC Advertising</li>
        <li>Email Marketing</li>
        <li>Analytics & Reporting</li>
      </ul>
    `,
    icon: '📊',
    features: [
      'Data-Driven Strategy',
      'SEO Optimization',
      'Social Media Management',
      'Content Creation',
      'Paid Advertising',
      'Performance Tracking'
    ],
    priceRange: { min: 25000, max: 100000 },
    isActive: true,
    order: 5,
    seo: {
      title: 'Digital Marketing | Riseup-Tech',
      description: 'Results-driven digital marketing strategies.',
      keywords: ['digital marketing', 'SEO', 'social media', 'PPC']
    }
  }
];

const seedServices = async () => {
  try {
    console.log('🗑️  Removing existing services...');
    await Service.deleteMany({});
    
    console.log('📄 Creating default services...');
    for (const serviceData of defaultServices) {
      const service = new Service(serviceData);
      await service.save();
      console.log(`✅ Created: ${serviceData.name}`);
    }
    
    console.log('🎉 Services seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();