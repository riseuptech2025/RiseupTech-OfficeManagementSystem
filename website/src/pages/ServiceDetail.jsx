import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchService = async () => {
    try {
      const response = await websiteService.getServiceBySlug(slug);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!service) {
    return (
      <div className="pt-32 text-center text-gray-400">
        <h2 className="text-2xl font-bold text-white">Service not found</h2>
        <Link to="/services" className="text-[#00D4FF] hover:underline mt-4 inline-block">
          ← Back to Services
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{service.name} - Riseup-Tech</title>
        <meta name="description" content={service.seo?.description || service.description} />
        <meta name="keywords" content={service.seo?.keywords?.join(', ') || ''} />
      </Helmet>

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00D4FF] transition-colors mb-8">
            <FaArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Icon */}
            {service.icon && (
              <div className="text-6xl mb-6">{service.icon}</div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {service.name}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-400 mb-8">
              {service.fullDescription || service.description}
            </p>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-300">
                      <FaCheckCircle className="text-[#00D4FF] w-5 h-5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            {service.priceRange && service.priceRange.min > 0 && (
              <div className="bg-[#111118] p-6 rounded-xl border border-[#00D4FF]/10 mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Pricing</h3>
                <p className="text-gray-400">
                  Starting from <span className="text-[#00D4FF] font-semibold text-2xl">Rs. {service.priceRange.min}</span>
                  {service.priceRange.max > service.priceRange.min && (
                    <> to <span className="text-[#00D4FF] font-semibold text-2xl">Rs. {service.priceRange.max}</span></>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-2">* Contact us for custom pricing and enterprise solutions</p>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="px-8 py-3 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all font-medium"
              >
                Get This Service
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3 border border-[#00D4FF]/30 text-white rounded-lg hover:bg-[#00D4FF]/10 transition-all font-medium"
              >
                Request a Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetail;