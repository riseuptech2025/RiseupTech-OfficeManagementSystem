import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { websiteService } from '../services/api';
import TeamCard from '../components/Common/TeamCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const About = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamRes, settingsRes] = await Promise.all([
        websiteService.getTeam(),
        websiteService.getSettings(),
      ]);
      setTeam(teamRes.data || []);
      setSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>About Us - {settings.siteName || 'Riseup-Tech'}</title>
        <meta name="description" content="Learn about Riseup-Tech Software Company, our mission, vision, and the team behind our success." />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-[#00D4FF]/5 to-transparent relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://i.pinimg.com/736x/6e/e4/5e/6ee45e3adcc3db12b0b24ab11b324d1b.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About Us</h1>
            <p className="text-lg text-gray-400">
              We are a passionate team of developers, designers, and innovators 
              dedicated to building digital solutions that make a difference.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {/* Mission Section with Image on Right */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 bg-[#111118] p-8 rounded-2xl border border-[#00D4FF]/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎯</span>
                <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                To deliver affordable, reliable, and innovative technology solutions, from web and app development to branding, cloud, and digital marketing, that help businesses of all sizes grow, compete, and succeed in an increasingly digital world.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-2/5 h-64 rounded-2xl overflow-hidden flex-shrink-0"
            >
              <img 
                src="https://i.pinimg.com/1200x/41/28/87/412887b201c9fa3cd0dec1296ba9b4c2.jpg" 
                alt="Our Mission"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>

          {/* Vision Section with Image on Left */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-2/5 h-64 rounded-2xl overflow-hidden flex-shrink-0"
            >
              <img 
                src="https://i.pinimg.com/736x/60/70/69/607069d9dd92a248624756ce3874d8ad.jpg" 
                alt="Our Vision"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 bg-[#111118] p-8 rounded-2xl border border-[#00D4FF]/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">👁️</span>
                <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                To become a trusted, nationally recognized software company that bridges the digital divide—empowering businesses across Nepal with cutting-edge technology, while creating meaningful employment and skill-building opportunities for local tech talent in Madhesh Province and beyond.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="py-20 px-4 bg-[#111118]/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Goals</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              What we aim to achieve as a company
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Empower Local Businesses',
                description: 'Bring modern digital tools to businesses in Madhesh Province and rural Nepal that are often left behind in the tech revolution.'
              },
              {
                title: 'Deliver Quality & Reliability',
                description: 'Provide professional, high-quality software and design solutions at accessible prices for startups, schools, hospitals, and small businesses.'
              },
              {
                title: 'Build Long-Term Partnerships',
                description: 'Focus not just on one-time projects, but ongoing support, maintenance, and growth for every client.'
              },
              {
                title: 'Drive Digital Transformation',
                description: 'Help traditional and offline businesses (local shops, schools, clinics) move online and modernize their operations.'
              },
              {
                title: 'Nurture Local Tech Talent',
                description: 'Grow into a company that creates employment and skill-building opportunities for young developers and designers in Saptari and Madhesh Province.'
              },
              {
                title: 'Expand Nationwide',
                description: 'Start strong in Madhesh Province and grow into a recognized, trusted software brand across all of Nepal.'
              }
            ].map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0A0A0F] p-6 rounded-xl border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{goal.title}</h4>
                    <p className="text-gray-400 text-sm">{goal.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'Integrity', 
                description: 'Honest pricing, honest timelines, honest work.',
                icon: '🤝'
              },
              { 
                title: 'Innovation', 
                description: 'Staying current with the latest technology trends.',
                icon: '💡'
              },
              { 
                title: 'Client-Centered', 
                description: 'Every solution is built around the client\'s real needs.',
                icon: '🎯'
              },
              { 
                title: 'Accessibility', 
                description: 'Great technology shouldn\'t be limited to big cities or big budgets.',
                icon: '🌍'
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0A0A0F] p-6 rounded-xl border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all text-center group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">{value.icon}</div>
                <h4 className="text-lg font-semibold text-white mb-2">{value.title}</h4>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-[#111118]/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Riseup-Tech</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              What sets us apart from the competition
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Affordable & Transparent Pricing',
                description: 'Quality technology solutions priced for startups, schools, hospitals, and local businesses.',
                icon: '💰'
              },
              {
                title: 'Local Understanding, National Reach',
                description: 'Based in Madhesh Province with deep local knowledge, while serving clients across Nepal.',
                icon: '🌏'
              },
              {
                title: 'End-to-End Service',
                description: 'From design and development to hosting, maintenance, and marketing, all under one roof.',
                icon: '🔄'
              },
              {
                title: 'Client-Centered Approach',
                description: 'Every solution is built around your real business needs, not a one-size-fits-all template.',
                icon: '👤'
              },
              {
                title: 'Reliable Ongoing Support',
                description: 'We stay with you after launch, with maintenance and support plans to keep your systems running smoothly.',
                icon: '🛡️'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0A0A0F] p-6 rounded-xl border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Documents You Can Expect From Us</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Keeping every project transparent and professional
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Company Profile / Brochure',
              'Proposal / Quotation',
              'Terms & Conditions',
              'Project Agreement / Contract',
              'Progress Updates',
              'Handover Document',
              'Warranty / Support Note',
              'User Manual / Guide',
              'Invoices & Payment Receipts'
            ].map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#0A0A0F] p-4 rounded-xl border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all text-center hover:bg-[#111118] group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</div>
                <p className="text-gray-300 text-sm group-hover:text-white transition-colors">{doc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team.length > 0 && (
        <section className="py-20 px-4 bg-[#111118]/30">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet Our Team</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                The talented people behind Riseup-Tech
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <TeamCard key={member._id} member={member} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default About;