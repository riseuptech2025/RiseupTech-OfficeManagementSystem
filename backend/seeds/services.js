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
    description: 'Professional web development solutions for businesses across Nepal.',
    fullDescription: `
      <h2>Web Development Services</h2>
      <p>We build modern, responsive, and high-performance websites tailored to your business needs.</p>
      
      <h3>Packages:</h3>
      <ul>
        <li><strong>Basic:</strong> 3-5 pages, responsive design, contact form, basic SEO - NPR 8,000 - 15,000</li>
        <li><strong>Standard:</strong> 6-10 pages, CMS, gallery, blog, SEO setup - NPR 18,000 - 30,000</li>
        <li><strong>Premium:</strong> E-commerce, admin panel, payment gateway, advanced SEO - NPR 40,000 - 80,000+</li>
      </ul>
    `,
    icon: '🌐',
    packages: [
      {
        name: 'Basic',
        features: ['3-5 pages', 'Responsive design', 'Contact form', 'Basic SEO'],
        price: '8,000 - 15,000'
      },
      {
        name: 'Standard',
        features: ['6-10 pages', 'CMS (editable content)', 'Gallery', 'Blog', 'SEO setup'],
        price: '18,000 - 30,000'
      },
      {
        name: 'Premium',
        features: ['E-commerce/business web app', 'Admin panel', 'Payment gateway', 'Advanced SEO'],
        price: '40,000 - 80,000+'
      }
    ],
    features: ['Responsive Design', 'SEO Optimized', 'Fast Performance', 'Secure & Scalable'],
    isActive: true,
    order: 1,
    seo: {
      title: 'Web Development Services | Riseup-Tech',
      description: 'Professional web development solutions for businesses across Nepal.',
      keywords: ['web development', 'website design', 'e-commerce', 'CMS']
    }
  },
  {
    name: 'Mobile App Development',
    slug: 'mobile-app-development',
    description: 'Native and cross-platform mobile applications for Android and iOS.',
    fullDescription: `
      <h2>Mobile App Development Services</h2>
      <p>We create powerful, user-friendly mobile applications that engage users and drive business growth.</p>
      
      <h3>Packages:</h3>
      <ul>
        <li><strong>Basic:</strong> Simple app (5-7 screens), single platform - NPR 25,000 - 45,000</li>
        <li><strong>Standard:</strong> Medium app, both platforms, API integration, admin panel - NPR 60,000 - 100,000</li>
        <li><strong>Advanced:</strong> Complex app (e-commerce, booking, real-time features), both platforms - NPR 120,000+</li>
      </ul>
    `,
    icon: '📱',
    packages: [
      {
        name: 'Basic',
        features: ['Simple app (5-7 screens)', 'Single platform (Android or iOS)'],
        price: '25,000 - 45,000'
      },
      {
        name: 'Standard',
        features: ['Medium app', 'Both platforms', 'API integration', 'Admin panel'],
        price: '60,000 - 100,000'
      },
      {
        name: 'Advanced',
        features: ['Complex app (e-commerce, booking, real-time features)', 'Both platforms'],
        price: '120,000+'
      }
    ],
    features: ['Native Performance', 'Beautiful UI/UX', 'Push Notifications', 'Offline Support'],
    isActive: true,
    order: 2,
    seo: {
      title: 'Mobile App Development | Riseup-Tech',
      description: 'Native and cross-platform mobile applications for Android and iOS.',
      keywords: ['mobile app', 'iOS', 'Android', 'React Native']
    }
  },
  {
    name: 'Logo Design & Branding',
    slug: 'logo-design-branding',
    description: 'Professional logo design and complete branding solutions.',
    fullDescription: `
      <h2>Logo Design & Branding Services</h2>
      <p>We create memorable brand identities that help your business stand out.</p>
      
      <h3>Packages:</h3>
      <ul>
        <li><strong>Basic:</strong> 1 logo concept, 2 revisions, basic file formats - NPR 1,500 - 3,000</li>
        <li><strong>Standard:</strong> 3 logo concepts, 3 revisions, full brand color/font guide - NPR 4,000 - 7,000</li>
        <li><strong>Premium:</strong> Full branding kit (logo, business card, letterhead, social media kit) - NPR 8,000 - 15,000</li>
      </ul>
    `,
    icon: '🎨',
    packages: [
      {
        name: 'Basic',
        features: ['1 logo concept', '2 revisions', 'Basic file formats'],
        price: '1,500 - 3,000'
      },
      {
        name: 'Standard',
        features: ['3 logo concepts', '3 revisions', 'Full brand color/font guide'],
        price: '4,000 - 7,000'
      },
      {
        name: 'Premium',
        features: ['Full branding kit (logo, business card, letterhead, social media kit)'],
        price: '8,000 - 15,000'
      }
    ],
    features: ['Unique Design', 'Brand Identity', 'Multiple Formats', 'Professional Quality'],
    isActive: true,
    order: 3,
    seo: {
      title: 'Logo Design & Branding | Riseup-Tech',
      description: 'Professional logo design and complete branding solutions.',
      keywords: ['logo design', 'branding', 'brand identity', 'graphic design']
    }
  },
  {
    name: 'Website / App Maintenance',
    slug: 'website-app-maintenance',
    description: 'Comprehensive maintenance and support services for websites and applications.',
    fullDescription: `
      <h2>Website / App Maintenance Services</h2>
      <p>Keep your digital assets running smoothly with our professional maintenance services.</p>
      
      <h3>Packages (Monthly):</h3>
      <ul>
        <li><strong>Basic:</strong> Monthly backups, minor updates, uptime monitoring - NPR 1,000 - 2,000/mo</li>
        <li><strong>Standard:</strong> Content updates, bug fixes, security monitoring - NPR 2,500 - 5,000/mo</li>
        <li><strong>Premium:</strong> Priority support, regular updates, performance optimization - NPR 6,000 - 10,000/mo</li>
      </ul>
    `,
    icon: '🔧',
    packages: [
      {
        name: 'Basic',
        features: ['Monthly backups', 'Minor updates', 'Uptime monitoring'],
        price: '1,000 - 2,000/mo'
      },
      {
        name: 'Standard',
        features: ['Content updates', 'Bug fixes', 'Security monitoring'],
        price: '2,500 - 5,000/mo'
      },
      {
        name: 'Premium',
        features: ['Priority support', 'Regular updates', 'Performance optimization'],
        price: '6,000 - 10,000/mo'
      }
    ],
    features: ['24/7 Monitoring', 'Regular Backups', 'Security Updates', 'Performance Optimization'],
    isActive: true,
    order: 4,
    seo: {
      title: 'Website & App Maintenance | Riseup-Tech',
      description: 'Comprehensive maintenance and support services.',
      keywords: ['website maintenance', 'app support', 'security monitoring']
    }
  },
  {
    name: 'Cloud Solutions',
    slug: 'cloud-solutions',
    description: 'Scalable cloud infrastructure and setup for modern applications.',
    fullDescription: `
      <h2>Cloud Solutions Services</h2>
      <p>We help businesses leverage cloud computing for scalability, reliability, and cost-efficiency.</p>
      
      <h3>Packages:</h3>
      <ul>
        <li><strong>Basic:</strong> Cloud hosting setup, basic storage - NPR 3,000 - 6,000*</li>
        <li><strong>Standard:</strong> Scalable hosting, backups, migration support - NPR 8,000 - 15,000</li>
        <li><strong>Premium:</strong> Full cloud infrastructure setup, monitoring, security - NPR 20,000+</li>
      </ul>
      <p>*Setup cost - monthly hosting billed separately based on provider.</p>
    `,
    icon: '☁️',
    packages: [
      {
        name: 'Basic',
        features: ['Cloud hosting setup', 'Basic storage'],
        price: '3,000 - 6,000*'
      },
      {
        name: 'Standard',
        features: ['Scalable hosting', 'Backups', 'Migration support'],
        price: '8,000 - 15,000'
      },
      {
        name: 'Premium',
        features: ['Full cloud infrastructure setup', 'Monitoring', 'Security'],
        price: '20,000+'
      }
    ],
    features: ['Scalable Infrastructure', 'Security Best Practices', '24/7 Monitoring', 'Disaster Recovery'],
    isActive: true,
    order: 5,
    seo: {
      title: 'Cloud Solutions | Riseup-Tech',
      description: 'Scalable cloud infrastructure and setup for modern applications.',
      keywords: ['cloud', 'hosting', 'infrastructure', 'DevOps']
    }
  },
  {
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Results-driven digital marketing strategies to grow your online presence.',
    fullDescription: `
      <h2>Digital Marketing Services</h2>
      <p>We create and execute data-driven marketing strategies that deliver measurable results.</p>
      
      <h3>Packages (Monthly):</h3>
      <ul>
        <li><strong>Basic:</strong> Social media setup + posting (2-3 posts/week) - NPR 3,000 - 5,000/mo</li>
        <li><strong>Standard:</strong> Social media management, basic SEO, ad campaign - NPR 8,000 - 15,000/mo</li>
        <li><strong>Premium:</strong> Full strategy, SEO, paid ads, analytics reporting - NPR 20,000+/mo</li>
      </ul>
    `,
    icon: '📊',
    packages: [
      {
        name: 'Basic',
        features: ['Social media setup + posting (2-3 posts/week)'],
        price: '3,000 - 5,000/mo'
      },
      {
        name: 'Standard',
        features: ['Social media management', 'Basic SEO', 'Ad campaign (small budget)'],
        price: '8,000 - 15,000/mo'
      },
      {
        name: 'Premium',
        features: ['Full strategy', 'SEO', 'Paid ads', 'Analytics reporting'],
        price: '20,000+/mo'
      }
    ],
    features: ['Data-Driven Strategy', 'SEO Optimization', 'Social Media Management', 'Performance Tracking'],
    isActive: true,
    order: 6,
    seo: {
      title: 'Digital Marketing | Riseup-Tech',
      description: 'Results-driven digital marketing strategies.',
      keywords: ['digital marketing', 'SEO', 'social media', 'PPC']
    }
  },
  {
    name: 'IT Consulting & Support',
    slug: 'it-consulting-support',
    description: 'Professional IT consulting and ongoing support services.',
    fullDescription: `
      <h2>IT Consulting & Support Services</h2>
      <p>Get expert IT guidance and support for your business technology needs.</p>
      
      <h3>Services:</h3>
      <ul>
        <li><strong>Basic:</strong> One-time consultation (up to 1 hour) - NPR 1,000 - 2,000</li>
        <li><strong>Standard:</strong> Ongoing monthly support/consulting - NPR 5,000 - 10,000/mo</li>
        <li><strong>Premium:</strong> Dedicated IT support & strategy partner - Custom Quote</li>
      </ul>
    `,
    icon: '💼',
    packages: [
      {
        name: 'Basic',
        features: ['One-time consultation (up to 1 hour)'],
        price: '1,000 - 2,000'
      },
      {
        name: 'Standard',
        features: ['Ongoing monthly support/consulting'],
        price: '5,000 - 10,000/mo'
      },
      {
        name: 'Premium',
        features: ['Dedicated IT support & strategy partner'],
        price: 'Custom Quote'
      }
    ],
    features: ['Expert Consultation', 'Strategic Planning', 'Technical Support', 'Cost Optimization'],
    isActive: true,
    order: 7,
    seo: {
      title: 'IT Consulting & Support | Riseup-Tech',
      description: 'Professional IT consulting and ongoing support services.',
      keywords: ['IT consulting', 'IT support', 'technology consulting']
    }
  },
  {
    name: 'Custom Software Solutions',
    slug: 'custom-software-solutions',
    description: 'Tailored software solutions for specific business needs.',
    fullDescription: `
      <h2>Custom Software Solutions</h2>
      <p>We develop custom software solutions tailored to your specific business requirements.</p>
      
      <h3>Our Solutions:</h3>
      <ul>
        <li><strong>E-commerce Platform:</strong> Product catalog, cart, payment, order management - NPR 50,000 - 150,000+</li>
        <li><strong>School Management:</strong> Student records, attendance, results, fees - NPR 60,000 - 150,000+</li>
        <li><strong>Hospital Management:</strong> Patient records, appointments, billing - NPR 80,000 - 180,000+</li>
        <li><strong>Local Business Software:</strong> Billing, inventory, customer management - NPR 20,000 - 50,000</li>
        <li><strong>Blog / Content Platform:</strong> Custom CMS, blog features - NPR 10,000 - 25,000</li>
        <li><strong>Personal Portfolio:</strong> Personal branding site, resume/CV showcase - NPR 3,000 - 8,000</li>
      </ul>
    `,
    icon: '⚙️',
    packages: [
      {
        name: 'E-commerce Platform',
        features: ['Product catalog', 'Cart', 'Payment', 'Order management'],
        price: '50,000 - 150,000+'
      },
      {
        name: 'School Management',
        features: ['Student records', 'Attendance', 'Results', 'Fees'],
        price: '60,000 - 150,000+'
      },
      {
        name: 'Hospital Management',
        features: ['Patient records', 'Appointments', 'Billing'],
        price: '80,000 - 180,000+'
      },
      {
        name: 'Local Business Software',
        features: ['Billing', 'Inventory', 'Customer management'],
        price: '20,000 - 50,000'
      },
      {
        name: 'Blog / Content Platform',
        features: ['Custom CMS', 'Blog features'],
        price: '10,000 - 25,000'
      },
      {
        name: 'Personal Portfolio',
        features: ['Personal branding site', 'Resume/CV showcase'],
        price: '3,000 - 8,000'
      }
    ],
    features: ['Tailored Solutions', 'Scalable Architecture', 'Modern Technologies', 'Ongoing Support'],
    isActive: true,
    order: 8,
    seo: {
      title: 'Custom Software Solutions | Riseup-Tech',
      description: 'Tailored software solutions for specific business needs.',
      keywords: ['custom software', 'business software', 'enterprise solutions']
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