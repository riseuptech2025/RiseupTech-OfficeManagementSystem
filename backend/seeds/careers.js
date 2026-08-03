// backend/seeds/careers.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Career = require('../models/Career');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const careerJobs = [
  {
    title: 'Senior Full Stack Developer',
    slug: 'senior-full-stack-developer',
    location: 'Launiya, Saptari, Nepal (Hybrid)',
    employmentType: 'Full-time',
    experienceLevel: 'Senior',
    isActive: true,
    featured: true,
    description: `
      <h2>Join Our Development Team</h2>
      <p>We are looking for an experienced Senior Full Stack Developer to lead our development team and build cutting-edge web applications for our clients.</p>
      
      <h3>About the Role</h3>
      <p>As a Senior Full Stack Developer at Riseup-Tech, you will be responsible for architecting, developing, and maintaining complex web applications. You will work with a team of talented developers and contribute to all phases of the development lifecycle.</p>
    `,
    requirements: [
      'Bachelor\'s degree in Computer Science, Engineering, or related field',
      '5+ years of experience in full stack development',
      'Expert knowledge of React.js, Node.js, and MongoDB',
      'Experience with TypeScript and modern JavaScript (ES6+)',
      'Strong understanding of RESTful APIs and microservices architecture',
      'Experience with Docker, Kubernetes, and cloud platforms (AWS/Azure)',
      'Excellent problem-solving and communication skills',
      'Experience leading development teams is a plus'
    ],
    responsibilities: [
      'Lead the design and development of scalable web applications',
      'Architect robust backend systems and APIs',
      'Mentor junior developers and conduct code reviews',
      'Collaborate with cross-functional teams to define requirements',
      'Ensure code quality through testing and best practices',
      'Participate in architectural decisions and technical planning',
      'Stay up-to-date with emerging technologies and industry trends'
    ],
    benefits: [
      'Competitive salary and performance bonuses',
      'Flexible working hours and hybrid work model',
      'Professional development budget',
      'Health and life insurance',
      'Paid time off and holidays',
      'Company retreats and team building events',
      'Modern development tools and equipment'
    ],
    salaryRange: { min: 120000, max: 200000 },
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  {
    title: 'React Native Mobile Developer',
    slug: 'react-native-mobile-developer',
    location: 'Launiya, Saptari, Nepal (Remote)',
    employmentType: 'Full-time',
    experienceLevel: 'Mid',
    isActive: true,
    featured: true,
    description: `
      <h2>Build Amazing Mobile Experiences</h2>
      <p>We're seeking a talented React Native Developer to join our mobile development team. You'll be responsible for building high-quality mobile applications for iOS and Android platforms.</p>
      
      <h3>About the Role</h3>
      <p>As a React Native Developer, you will work on exciting mobile projects for clients across various industries. You'll collaborate with designers and backend developers to create seamless mobile experiences.</p>
    `,
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of experience in mobile development',
      'Strong experience with React Native and Redux',
      'Experience with iOS and Android deployment',
      'Knowledge of native mobile development (Swift/Kotlin) is a plus',
      'Understanding of RESTful APIs and GraphQL',
      'Experience with mobile CI/CD pipelines',
      'Portfolio of published mobile applications'
    ],
    responsibilities: [
      'Develop and maintain cross-platform mobile applications',
      'Write clean, maintainable, and testable code',
      'Collaborate with designers to implement UI/UX designs',
      'Optimize application performance and responsiveness',
      'Debug and resolve technical issues',
      'Stay current with mobile development trends',
      'Participate in code reviews and technical discussions'
    ],
    benefits: [
      'Competitive salary',
      '100% remote work option',
      'Flexible working hours',
      'Professional development allowance',
      'Health insurance coverage',
      'Performance-based bonuses',
      'Access to latest development tools'
    ],
    salaryRange: { min: 80000, max: 150000 },
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'UI/UX Designer',
    slug: 'ui-ux-designer',
    location: 'Launiya, Saptari, Nepal (Hybrid)',
    employmentType: 'Full-time',
    experienceLevel: 'Mid',
    isActive: true,
    featured: false,
    description: `
      <h2>Design Products That Users Love</h2>
      <p>We are looking for a creative UI/UX Designer who can translate user needs into beautiful, intuitive design solutions. You will work on a variety of projects across web and mobile platforms.</p>
      
      <h3>About the Role</h3>
      <p>As a UI/UX Designer, you will be responsible for the full design process from research to final implementation. You'll work closely with developers and stakeholders to create exceptional user experiences.</p>
    `,
    requirements: [
      'Bachelor\'s degree in Design, HCI, or related field',
      '3+ years of experience in UI/UX design',
      'Proficiency in Figma, Adobe XD, or similar design tools',
      'Strong portfolio demonstrating design thinking and visual skills',
      'Experience with user research and usability testing',
      'Understanding of design systems and component libraries',
      'Knowledge of HTML/CSS is a plus',
      'Excellent communication and presentation skills'
    ],
    responsibilities: [
      'Conduct user research and gather requirements',
      'Create wireframes, prototypes, and high-fidelity designs',
      'Develop and maintain design systems',
      'Collaborate with developers during implementation',
      'Conduct usability testing and iterate based on feedback',
      'Present design solutions to stakeholders',
      'Stay current with design trends and best practices'
    ],
    benefits: [
      'Competitive salary package',
      'Hybrid work environment',
      'Design tools subscription',
      'Professional development opportunities',
      'Health insurance',
      'Creative work culture',
      'Company-sponsored design events'
    ],
    salaryRange: { min: 70000, max: 130000 },
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    location: 'Launiya, Saptari, Nepal (Remote)',
    employmentType: 'Full-time',
    experienceLevel: 'Senior',
    isActive: true,
    featured: false,
    description: `
      <h2>Build and Scale Infrastructure</h2>
      <p>We're looking for a skilled DevOps Engineer to help us build and maintain our cloud infrastructure. You'll be responsible for automating deployments, ensuring system reliability, and optimizing performance.</p>
      
      <h3>About the Role</h3>
      <p>As a DevOps Engineer, you will work on both client projects and internal infrastructure. You'll implement CI/CD pipelines, manage cloud resources, and help teams deliver software faster and more reliably.</p>
    `,
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '5+ years of experience in DevOps or Site Reliability Engineering',
      'Experience with AWS, Azure, or Google Cloud Platform',
      'Strong knowledge of Docker and Kubernetes',
      'Experience with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)',
      'Infrastructure as Code (Terraform, CloudFormation)',
      'Experience with monitoring and logging tools',
      'Linux system administration experience',
      'Scripting skills (Python, Bash, Go)'
    ],
    responsibilities: [
      'Design and implement cloud infrastructure',
      'Build and maintain CI/CD pipelines',
      'Automate deployment processes',
      'Monitor system performance and reliability',
      'Implement security best practices',
      'Support development teams with infrastructure needs',
      'Optimize cloud costs and resources'
    ],
    benefits: [
      'Highly competitive salary',
      'Remote-first work culture',
      'Learning and certification budget',
      'Health insurance',
      'Flexible working hours',
      'Modern infrastructure tools',
      'Conference and training opportunities'
    ],
    salaryRange: { min: 130000, max: 220000 },
    applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Digital Marketing Specialist',
    slug: 'digital-marketing-specialist',
    location: 'Launiya, Saptari, Nepal (Hybrid)',
    employmentType: 'Full-time',
    experienceLevel: 'Mid',
    isActive: true,
    featured: false,
    description: `
      <h2>Drive Digital Growth</h2>
      <p>We're seeking a Digital Marketing Specialist to help our clients grow their online presence. You'll develop and execute marketing strategies across multiple channels.</p>
      
      <h3>About the Role</h3>
      <p>As a Digital Marketing Specialist, you will work with diverse clients to create and implement effective marketing campaigns. You'll combine creativity with data-driven insights to achieve measurable results.</p>
    `,
    requirements: [
      'Bachelor\'s degree in Marketing, Communications, or related field',
      '3+ years of experience in digital marketing',
      'Experience with SEO, SEM, and Google Analytics',
      'Social media marketing and advertising experience',
      'Content marketing and copywriting skills',
      'Experience with email marketing tools',
      'Data analysis and reporting skills',
      'Certifications in Google Ads and Analytics are a plus'
    ],
    responsibilities: [
      'Develop and execute digital marketing strategies',
      'Manage SEO and SEM campaigns',
      'Create engaging content for various platforms',
      'Manage social media accounts and campaigns',
      'Analyze marketing data and generate reports',
      'Stay current with digital marketing trends',
      'Collaborate with clients and internal teams'
    ],
    benefits: [
      'Competitive salary with bonuses',
      'Hybrid work model',
      'Marketing tools and subscriptions',
      'Professional development opportunities',
      'Health insurance coverage',
      'Creative and collaborative environment'
    ],
    salaryRange: { min: 60000, max: 120000 },
    applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Junior Software Developer (Internship)',
    slug: 'junior-software-developer-internship',
    location: 'Launiya, Saptari, Nepal (In-Office)',
    employmentType: 'Internship',
    experienceLevel: 'Entry',
    isActive: true,
    featured: false,
    description: `
      <h2>Start Your Career in Tech</h2>
      <p>We're looking for passionate junior developers to join our internship program. This is a great opportunity to learn from experienced professionals and work on real-world projects.</p>
      
      <h3>About the Program</h3>
      <p>Our internship program is designed to help you grow your skills and build a strong foundation in software development. You'll work on actual client projects and receive mentorship from senior developers.</p>
    `,
    requirements: [
      'Currently pursuing or recent graduate in Computer Science or related field',
      'Basic knowledge of web development (HTML, CSS, JavaScript)',
      'Familiarity with at least one programming language',
      'Eagerness to learn and grow',
      'Good problem-solving skills',
      'Ability to work in a team environment',
      'Portfolio or GitHub projects are a plus'
    ],
    responsibilities: [
      'Work on real-world development projects',
      'Learn from experienced mentors',
      'Contribute to code and documentation',
      'Participate in team meetings and code reviews',
      'Develop professional skills',
      'Build your portfolio with actual projects'
    ],
    benefits: [
      'Hands-on experience with modern technologies',
      'Mentorship from senior developers',
      'Certificate of completion',
      'Opportunity for full-time conversion',
      'Professional development',
      'Networking opportunities'
    ],
    salaryRange: { min: 30000, max: 50000 },
    applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  }
];

const seedCareers = async () => {
  try {
    console.log('🗑️  Removing existing careers...');
    await Career.deleteMany({});
    
    console.log('📄 Creating career postings...');
    
    // Find a user to set as creator (first admin user)
    const creator = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    
    if (!creator) {
      console.warn('⚠️  No admin user found! Careers will be created without creator.');
    }
    
    let createdCount = 0;
    
    for (const jobData of careerJobs) {
      const career = new Career({
        ...jobData,
        createdBy: creator?._id || null,
        applications: []
      });
      
      await career.save();
      console.log(`✅ Created: ${jobData.title}`);
      createdCount++;
    }
    
    console.log(`\n🎉 Seeding complete! Created ${createdCount} career postings.`);
    
    // Display summary
    const total = await Career.countDocuments();
    const active = await Career.countDocuments({ isActive: true });
    const featured = await Career.countDocuments({ featured: true });
    
    console.log('\n📊 Summary:');
    console.log(`   Total Jobs: ${total}`);
    console.log(`   Active: ${active}`);
    console.log(`   Featured: ${featured}`);
    console.log(`   Employment Types: ${[...new Set(careerJobs.map(j => j.employmentType))].join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding careers:', error);
    process.exit(1);
  }
};

seedCareers();