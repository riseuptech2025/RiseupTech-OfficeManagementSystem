import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { websiteService } from '../services/api';
import Hero from '../components/Common/Hero';
import ServiceCard from '../components/Common/ServiceCard';
import TeamCard from '../components/Common/TeamCard';
import TestimonialCard from '../components/Common/TestimonialCard';
import BlogCard from '../components/Common/BlogCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import heroImage from '../assets/hero-illustration.png';

const Home = () => {
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, teamRes, testimonialsRes, blogsRes, settingsRes] = await Promise.all([
        websiteService.getServices({ isActive: true }),
        websiteService.getTeam(),
        websiteService.getTestimonials(),
        websiteService.getBlogs({ status: 'published', limit: 3 }),
        websiteService.getSettings(),
      ]);

      setServices(servicesRes.data || []);
      setTeam(teamRes.data || []);
      setTestimonials(testimonialsRes.data || []);
      setBlogs(blogsRes.data || []);
      setSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error fetching home data:', error);
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
        <title>{settings.siteName || 'Riseup-Tech'} - {settings.siteTagline || 'Building Digital Excellence'}</title>
        <meta name="description" content="Riseup-Tech is a software company in Nepal specializing in website development, school management systems, mobile apps, and digital solutions for schools, colleges, hospitals, and businesses across Nepal." />
        <meta name="keywords" content={settings.metaKeywords || 'software development, web development, mobile apps, Nepal'} />
      </Helmet>

      {/* Hero Section */}
      <Hero 
        title={
          <>
            <h1 className="text-white">
  We Build Digital Excellence
</h1>
          </>
        }
        subtitle="Riseup-Tech Software Company delivers innovative web solutions, mobile apps, and software development services to help businesses thrive in the digital age."
        ctaText="Our Services"
        ctaLink="/services"
        secondaryCtaText="Contact Us"
        secondaryCtaLink="/contact"
        image={heroImage}
      />

      {/* Services Section */}
      <section className="py-20 px-4 bg-[#111118]/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We offer comprehensive digital solutions tailored to your business needs
            </p>
          </motion.div>

          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map((service, index) => (
                <ServiceCard key={service._id} service={service} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p>No services available at the moment.</p>
            </div>
          )}

          {services.length > 6 && (
            <div className="text-center mt-8">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-[#00D4FF] hover:gap-3 transition-all font-medium"
              >
                View All Services →
              </Link>
            </div>
          )}
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
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Team</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Meet the talented people behind our success
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.slice(0, 4).map((member, index) => (
                <TeamCard key={member._id} member={member} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4 bg-[#111118]/50">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Real feedback from real clients who trusted us with their projects
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <TestimonialCard key={testimonial._id} testimonial={testimonial} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blogs Section */}
      {blogs.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Latest Blogs</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Insights, updates, and stories from our team
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, index) => (
                <BlogCard key={blog._id} blog={blog} index={index} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/blogs"
                className="inline-flex items-center gap-2 text-[#00D4FF] hover:gap-3 transition-all font-medium"
              >
                View All Blogs →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#00D4FF]/10 to-[#7C3AED]/10">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss how we can help you achieve your digital goals
            </p>
            <Link
              to="/contact"
              className="px-8 py-3 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all inline-block font-medium"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;