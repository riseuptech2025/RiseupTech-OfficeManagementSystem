import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa';
import { websiteService } from '../services/api';
import ContactForm from '../components/Forms/ContactForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await websiteService.getSettings();
      setSettings(response.data || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
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
        <title>Contact Us - {settings.siteName || 'Riseup-Tech'}</title>
        <meta name="description" content="Get in touch with Riseup-Tech. We'd love to hear from you!" />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-[#00D4FF]/5 to-transparent relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://i.pinimg.com/1200x/56/11/7e/56117eebd713bbf9f38c0b6894c0005e.jpg")',
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact Us</h1>
            <p className="text-lg text-gray-400">
              We'd love to hear from you. Reach out to us for any inquiries, questions, or collaboration opportunities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-[#00D4FF] text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Address</h4>
                    <p className="text-gray-400">{settings.companyAddress || 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-[#00D4FF] text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Phone</h4>
                    <p className="text-gray-400">
                      <a href={`tel:${settings.companyPhone || '9827399860'}`} className="hover:text-[#00D4FF] transition-colors">
                        {settings.companyPhone || '9827399860'}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-[#00D4FF] text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Email</h4>
                    <p className="text-gray-400">
                      <a href={`mailto:${settings.companyEmail || 'mail@riseuptech.com.np'}`} className="hover:text-[#00D4FF] transition-colors">
                        {settings.companyEmail || 'mail@riseuptech.com.np'}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-8 rounded-xl overflow-hidden border border-[#00D4FF]/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1039.936350751214!2d86.77092580927581!3d26.484458142392366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eefb001f847887%3A0xcdf8e1c00eaa995c!2sTILATHI%20KOILADI-2!5e0!3m2!1sen!2snp!4v1785436708483!5m2!1sen!2snp"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Riseup-Tech Location"
                />
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Send Us a Message</h2>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;