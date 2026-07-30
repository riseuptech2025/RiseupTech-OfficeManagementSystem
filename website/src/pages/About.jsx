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
        {/* Background Image */}
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

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {/* Mission Section with Image on Right */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 bg-[#111118] p-8 rounded-2xl border border-[#00D4FF]/10"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                To empower businesses with innovative technology solutions that drive growth, 
                efficiency, and digital transformation. We strive to make technology accessible 
                and beneficial for organizations of all sizes.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-1/3 h-64 rounded-2xl overflow-hidden flex-shrink-0"
            >
              <img 
                src="https://i.pinimg.com/1200x/41/28/87/412887b201c9fa3cd0dec1296ba9b4c2.jpg" 
                alt="Our Mission"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Vision Section with Image on Left */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-1/3 h-64 rounded-2xl overflow-hidden flex-shrink-0"
            >
              <img 
                src="https://i.pinimg.com/736x/60/70/69/607069d9dd92a248624756ce3874d8ad.jpg" 
                alt="Our Vision"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 bg-[#111118] p-8 rounded-2xl border border-[#00D4FF]/10"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                To become a global leader in software development and digital innovation, 
                creating solutions that positively impact businesses and communities worldwide. 
                We envision a future where technology seamlessly integrates with human potential.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-[#111118]/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              These principles guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Innovation', description: 'We embrace creativity and push boundaries to deliver cutting-edge solutions.' },
              { title: 'Quality', description: 'We are committed to excellence in every line of code and every pixel of design.' },
              { title: 'Integrity', description: 'We build trust through transparency, honesty, and ethical practices.' },
              { title: 'Collaboration', description: 'We believe in the power of teamwork and open communication.' },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0A0A0F] p-6 rounded-xl border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {index + 1}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{value.title}</h4>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team.length > 0 && (
        <section className="py-20 px-4">
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