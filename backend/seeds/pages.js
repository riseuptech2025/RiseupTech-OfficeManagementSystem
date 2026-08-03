// backend/seeds/pages.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Page = require('../models/Page');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const defaultPages = [
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    type: 'privacy',
    status: 'published',
    excerpt: 'Learn how we collect, use, and protect your personal information.',
    content: `
      <h2>Privacy Policy</h2>
      <p><strong>Last updated:</strong> January 1, 2024</p>
      
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, such as when you create an account, fill out a form, or communicate with us. This may include:</p>
      <ul>
        <li>Name and contact information</li>
        <li>Account credentials</li>
        <li>Payment information</li>
        <li>Communication preferences</li>
      </ul>
      
      <h3>2. How We Use Your Information</h3>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and improve our services</li>
        <li>Process transactions</li>
        <li>Send you updates and marketing communications</li>
        <li>Ensure security and prevent fraud</li>
      </ul>
      
      <h3>3. Information Sharing</h3>
      <p>We do not sell your personal information. We may share information with:</p>
      <ul>
        <li>Service providers who assist our operations</li>
        <li>Legal authorities when required by law</li>
        <li>Business partners with your consent</li>
      </ul>
      
      <h3>4. Data Security</h3>
      <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      
      <h3>5. Your Rights</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal information</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your information</li>
        <li>Opt-out of marketing communications</li>
      </ul>
      
      <h3>6. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at:</p>
      <p><strong>Email:</strong> mail@riseuptech.com.np</p>
      <p><strong>Phone:</strong> 9827399860</p>
    `,
    seo: {
      title: 'Privacy Policy | Riseup-Tech',
      description: 'Read our privacy policy to understand how we protect your data.',
      keywords: ['privacy policy', 'data protection', 'privacy', 'security']
    }
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    type: 'terms',
    status: 'published',
    excerpt: 'Read our terms and conditions for using our services.',
    content: `
      <h2>Terms & Conditions</h2>
      <p><strong>Last updated:</strong> January 1, 2024</p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By using our services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
      
      <h3>2. Services Description</h3>
      <p>Riseup-Tech provides software development, web development, mobile app development, and related digital services.</p>
      
      <h3>3. User Accounts</h3>
      <p>You are responsible for maintaining the security of your account and password. We cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
      
      <h3>4. Intellectual Property</h3>
      <p>All content, features, and functionality of our services are owned by Riseup-Tech and are protected by copyright, trademark, and other intellectual property laws.</p>
      
      <h3>5. Payment Terms</h3>
      <p>Fees are due as specified in your agreement. Late payments may incur additional charges.</p>
      
      <h3>6. Limitation of Liability</h3>
      <p>Our services are provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages.</p>
      
      <h3>7. Termination</h3>
      <p>We may terminate or suspend your account at any time for violations of these terms or for any other reason.</p>
      
      <h3>8. Governing Law</h3>
      <p>These terms are governed by the laws of Nepal.</p>
      
      <h3>9. Changes to Terms</h3>
      <p>We reserve the right to update these terms at any time. Continued use of our services constitutes acceptance of the updated terms.</p>
      
      <h3>10. Contact</h3>
      <p>For questions about these terms, please contact us at:</p>
      <p><strong>Email:</strong> mail@riseuptech.com.np</p>
      <p><strong>Phone:</strong> 9827399860</p>
    `,
    seo: {
      title: 'Terms & Conditions | Riseup-Tech',
      description: 'Read our terms and conditions for using our services.',
      keywords: ['terms', 'conditions', 'terms of service', 'legal']
    }
  },
  {
    title: 'Cookies Policy',
    slug: 'cookies-policy',
    type: 'cookies',
    status: 'published',
    excerpt: 'Understand how we use cookies on our website.',
    content: `
      <h2>Cookies Policy</h2>
      <p><strong>Last updated:</strong> January 1, 2024</p>
      
      <h3>1. What Are Cookies</h3>
      <p>Cookies are small text files stored on your device when you visit our website. They help us improve your browsing experience.</p>
      
      <h3>2. Types of Cookies We Use</h3>
      <ul>
        <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
        <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
        <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
        <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
      </ul>
      
      <h3>3. Managing Cookies</h3>
      <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
      <ul>
        <li>View cookies stored on your device</li>
        <li>Block or delete cookies</li>
        <li>Set preferences for specific websites</li>
      </ul>
      
      <h3>4. Third-Party Cookies</h3>
      <p>We may use third-party services that set their own cookies. These include:</p>
      <ul>
        <li>Google Analytics</li>
        <li>Social media platforms</li>
        <li>Payment processors</li>
      </ul>
      
      <h3>5. Contact Us</h3>
      <p>If you have questions about our cookie usage, please contact us:</p>
      <p><strong>Email:</strong> mail@riseuptech.com.np</p>
    `,
    seo: {
      title: 'Cookies Policy | Riseup-Tech',
      description: 'Understand how we use cookies on our website.',
      keywords: ['cookies', 'cookie policy', 'privacy', 'data tracking']
    }
  },
  {
    title: 'About Us',
    slug: 'about',
    type: 'about',
    status: 'published',
    excerpt: 'Learn about Riseup-Tech Software Company and our mission.',
    content: `
      <h2>About Riseup-Tech</h2>
      
      <p>Riseup-Tech Software Company is a leading technology firm dedicated to building digital excellence. We specialize in creating innovative software solutions that empower businesses and drive digital transformation.</p>
      
      <h3>Our Mission</h3>
      <p>To empower businesses with innovative technology solutions that drive growth, efficiency, and digital transformation.</p>
      
      <h3>Our Vision</h3>
      <p>To become a global leader in software development and digital innovation, creating solutions that positively impact businesses and communities worldwide.</p>
      
      <h3>Core Values</h3>
      <ul>
        <li><strong>Innovation:</strong> We embrace creativity and push boundaries.</li>
        <li><strong>Quality:</strong> We are committed to excellence in everything we do.</li>
        <li><strong>Integrity:</strong> We build trust through transparency and honesty.</li>
        <li><strong>Collaboration:</strong> We believe in the power of teamwork.</li>
      </ul>
      
      <h3>Our Team</h3>
      <p>Our team consists of passionate developers, designers, and innovators who are dedicated to delivering exceptional results.</p>
    `,
    seo: {
      title: 'About Us | Riseup-Tech',
      description: 'Learn about Riseup-Tech Software Company and our mission.',
      keywords: ['about us', 'company', 'mission', 'vision']
    }
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    type: 'contact',
    status: 'published',
    excerpt: 'Get in touch with Riseup-Tech for inquiries and collaboration.',
    content: `
      <h2>Contact Us</h2>
      
      <p>We'd love to hear from you. Reach out to us for any inquiries, questions, or collaboration opportunities.</p>
      
      <h3>Our Office</h3>
      <p><strong>Address:</strong> Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal</p>
      
      <h3>Contact Information</h3>
      <p><strong>Phone:</strong> 9827399860</p>
      <p><strong>Email:</strong> mail@riseuptech.com.np</p>
      
      <h3>Business Hours</h3>
      <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
      <p><strong>Saturday - Sunday:</strong> Closed</p>
    `,
    seo: {
      title: 'Contact Us | Riseup-Tech',
      description: 'Get in touch with Riseup-Tech for inquiries and collaboration.',
      keywords: ['contact', 'support', 'inquiry', 'collaboration']
    }
  }
];

const seedPages = async () => {
  try {
    console.log('🗑️  Removing existing pages...');
    await Page.deleteMany({ type: { $in: ['privacy', 'terms', 'cookies', 'about', 'contact'] } });
    
    console.log('📄 Creating default pages...');
    for (const pageData of defaultPages) {
      // Check if page already exists
      const existing = await Page.findOne({ slug: pageData.slug });
      if (!existing) {
        const page = new Page(pageData);
        await page.save();
        console.log(`✅ Created: ${pageData.title}`);
      } else {
        console.log(`⏭️  Skipped: ${pageData.title} (already exists)`);
      }
    }
    
    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pages:', error);
    process.exit(1);
  }
};

seedPages();