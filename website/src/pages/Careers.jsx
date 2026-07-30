import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaUsers, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Careers = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [careersRes, settingsRes] = await Promise.all([
        websiteService.getCareers({ isActive: true }),
        websiteService.getSettings(),
      ]);
      setCareers(careersRes.data || []);
      setSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error fetching careers:', error);
    } finally {
      setLoading(false);
    }
  };

  const employmentTypes = ['all', ...new Set(careers.map(c => c.employmentType).filter(Boolean))];
  
  const filteredCareers = filter === 'all' 
    ? careers 
    : careers.filter(career => career.employmentType === filter);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Careers - {settings.siteName || 'Riseup-Tech'}</title>
        <meta name="description" content="Join our team and build your career at Riseup-Tech. We're hiring talented individuals to shape the future of technology." />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-[#00D4FF]/5 to-transparent relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://i.pinimg.com/736x/1b/e8/e1/1be8e121e01afdcfa53469b6c390b86b.jpg")',
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Join Our Team</h1>
            <p className="text-lg text-gray-400">
              Build your career with us and help shape the future of technology
            </p>
          </motion.div>
        </div>
      </section>

      {/* Career Listings */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Filter */}
          {employmentTypes.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {employmentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filter === type
                      ? 'bg-[#00D4FF] text-white'
                      : 'bg-[#111118] text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                  }`}
                >
                  {type === 'all' ? 'All Positions' : type}
                </button>
              ))}
            </div>
          )}

          {filteredCareers.length > 0 ? (
            <div className="space-y-6">
              {filteredCareers.map((career, index) => (
                <motion.div
                  key={career._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#111118] p-6 rounded-xl border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white">
                          <Link to={`/careers/${career.slug}`} className="hover:text-[#00D4FF] transition-colors">
                            {career.title}
                          </Link>
                        </h3>
                        {career.featured && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <FaStar className="inline mr-1" />
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{career.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="w-3 h-3" />
                          {career.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="w-3 h-3" />
                          {career.employmentType}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUsers className="w-3 h-3" />
                          {career.experienceLevel}
                        </span>
                        {career.salaryRange?.min > 0 && (
                          <span className="flex items-center gap-1">
                            <FaMoneyBillWave className="w-3 h-3" />
                            Rs. {career.salaryRange.min} - {career.salaryRange.max}
                          </span>
                        )}
                        {career.applicationDeadline && (
                          <span>Deadline: {new Date(career.applicationDeadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/careers/${career.slug}`}
                      className="px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all text-sm font-medium whitespace-nowrap"
                    >
                      Apply Now
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p>No positions available at the moment.</p>
              <p className="text-sm mt-2">Check back later for new opportunities!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Careers;