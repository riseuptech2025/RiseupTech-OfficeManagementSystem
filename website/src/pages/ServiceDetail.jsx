// src/pages/ServiceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
  FaRocket,
  FaUsers,
  FaCrown,
  FaCode,
  FaDatabase,
  FaCloud,
  FaPalette,
  FaChartLine,
  FaMobileAlt,
  FaServer,
  FaLock,
  // FaGear,
  FaTag,
  FaStore,
  FaGraduationCap,
  FaHospital,
  FaBriefcase,
  FaBlog,
  FaUser
} from 'react-icons/fa';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

// Component for rendering full description with custom styling
const FullDescription = ({ htmlContent, serviceName }) => {
  return (
    <div className="full-description prose prose-invert max-w-none">
      <style>
        {`
          .full-description {
            color: #e5e7eb;
          }
          .full-description h2 {
            font-size: 2rem;
            font-weight: 700;
            color: white;
            margin-top: 2rem;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: inline-block;
          }
          .full-description h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #00D4FF;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .full-description h3::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 24px;
            background: linear-gradient(180deg, #00D4FF, #7C3AED);
            border-radius: 2px;
          }
          .full-description p {
            color: #d1d5db;
            line-height: 1.8;
            margin-bottom: 1.25rem;
            font-size: 1.05rem;
          }
          .full-description ul {
            list-style: none;
            padding: 0;
            margin: 1.25rem 0;
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .full-description ul li {
            padding: 0.75rem 1rem;
            background: rgba(17, 17, 24, 0.6);
            border: 1px solid rgba(0, 212, 255, 0.08);
            border-radius: 0.75rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            transition: all 0.3s ease;
            color: #d1d5db;
          }
          .full-description ul li:hover {
            border-color: rgba(0, 212, 255, 0.3);
            transform: translateX(4px);
            background: rgba(17, 17, 24, 0.8);
          }
          .full-description ul li strong {
            color: #00D4FF;
            font-weight: 600;
          }
          .full-description ul li::before {
            content: '▸';
            color: #00D4FF;
            font-weight: bold;
            font-size: 1.2rem;
            line-height: 1.4;
            flex-shrink: 0;
          }
          .full-description .package-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1.5rem 0;
          }
          .full-description .package-card {
            background: rgba(17, 17, 24, 0.6);
            border: 1px solid rgba(0, 212, 255, 0.1);
            border-radius: 1rem;
            padding: 1.25rem;
            transition: all 0.3s ease;
          }
          .full-description .package-card:hover {
            border-color: rgba(0, 212, 255, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 212, 255, 0.1);
          }
          .full-description .package-card .name {
            color: white;
            font-weight: 600;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
          }
          .full-description .package-card .price {
            color: #00D4FF;
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
          }
          .full-description .package-card .features {
            color: #9ca3af;
            font-size: 0.9rem;
            line-height: 1.6;
          }
          .full-description .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 1rem 0;
          }
          .full-description .tech-tag {
            padding: 0.4rem 1rem;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 50px;
            color: #00D4FF;
            font-size: 0.85rem;
            transition: all 0.3s ease;
          }
          .full-description .tech-tag:hover {
            background: rgba(0, 212, 255, 0.2);
            transform: scale(1.05);
          }
          @media (max-width: 768px) {
            .full-description .package-grid {
              grid-template-columns: 1fr;
            }
            .full-description h2 {
              font-size: 1.5rem;
            }
            .full-description h3 {
              font-size: 1.25rem;
            }
          }
        `}
      </style>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchService();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchService = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Fetching service with slug: ${slug}`);
      const response = await websiteService.getServiceBySlug(slug);
      
      if (response.data) {
        setService(response.data);
        console.log(`✅ Found service: ${response.data.name}`);
      } else {
        setError('Service not found');
      }
    } catch (error) {
      console.error('❌ Error fetching service:', error);
      
      if (error.response?.status === 404) {
        setError(`Service "${slug}" not found`);
        
        try {
          const allServices = await websiteService.getServices({ isActive: true });
          const similar = allServices.data?.find(s => 
            s.slug.includes(slug) || slug.includes(s.slug)
          );
          
          if (similar) {
            console.log(`🔄 Redirecting to: /services/${similar.slug}`);
            navigate(`/services/${similar.slug}`, { replace: true });
            return;
          }
        } catch (e) {
          console.log('No similar service found');
        }
      } else {
        setError('Failed to load service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPackageIcon = (index) => {
    const icons = [
      <FaRocket className="text-[#00D4FF]" />,
      <FaUsers className="text-[#7C3AED]" />,
      <FaCrown className="text-yellow-500" />
    ];
    return icons[index] || icons[0];
  };

  const getPackageBadge = (index) => {
    const badges = ['Starter', 'Popular', 'Premium'];
    return badges[index] || badges[0];
  };

  const getPackageColor = (index) => {
    const colors = ['border-[#00D4FF]/30', 'border-[#7C3AED]/50', 'border-yellow-500/50'];
    return colors[index] || colors[0];
  };

  const getPackageGradient = (index) => {
    const gradients = [
      'from-[#00D4FF]/20 to-transparent',
      'from-[#7C3AED]/20 to-transparent',
      'from-yellow-500/20 to-transparent'
    ];
    return gradients[index] || gradients[0];
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !service) {
    return (
      <div className="pt-32 text-center px-4 min-h-screen bg-[#0A0A0F]">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-4">Service Not Found</h2>
            <p className="text-gray-400 mb-8">
              We couldn't find the service you're looking for.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/services"
                className="px-6 py-3 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all"
              >
                View All Services
              </Link>
              <Link
                to="/"
                className="px-6 py-3 border border-[#00D4FF]/30 text-white rounded-lg hover:bg-[#00D4FF]/10 transition-all"
              >
                Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{service.seo?.title || service.name} - Riseup-Tech</title>
        <meta name="description" content={service.seo?.description || service.description} />
        <meta name="keywords" content={service.seo?.keywords?.join(', ') || ''} />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-[#0A0A0F] to-[#111118]">
        <div className="container mx-auto max-w-6xl">
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00D4FF] transition-colors mb-8 group"
          >
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Services
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
          >
            <div>
              {service.icon && (
                <div className="text-7xl mb-6">{service.icon}</div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {service.name}
              </h1>
              <p className="text-lg text-gray-400 mb-6">
                {service.description}
              </p>
              
              {/* Key Features Tags */}
              {service.features && service.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.features.slice(0, 4).map((feature, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-full text-sm text-[#00D4FF]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="px-8 py-3 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all font-medium"
                >
                  Get Started
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-3 border border-[#00D4FF]/30 text-white rounded-lg hover:bg-[#00D4FF]/10 transition-all font-medium"
                >
                  Request Quote
                </Link>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111118] p-6 rounded-xl border border-[#00D4FF]/10">
                <FaClock className="text-[#00D4FF] text-2xl mb-2" />
                <p className="text-gray-400 text-sm">Delivery Time</p>
                <p className="text-white font-semibold">2-4 Weeks</p>
              </div>
              <div className="bg-[#111118] p-6 rounded-xl border border-[#7C3AED]/10">
                <FaShieldAlt className="text-[#7C3AED] text-2xl mb-2" />
                <p className="text-gray-400 text-sm">Support</p>
                <p className="text-white font-semibold">3 Months Free</p>
              </div>
              <div className="bg-[#111118] p-6 rounded-xl border border-yellow-500/10 col-span-2">
                <FaUsers className="text-yellow-500 text-2xl mb-2" />
                <p className="text-gray-400 text-sm">Client Satisfaction</p>
                <p className="text-white font-semibold">98% Happy Clients</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      {service.packages && service.packages.length > 0 && (
        <section className="py-16 px-4 bg-[#0A0A0F]">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]">Package</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Select the perfect plan that matches your business needs and budget
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {service.packages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative bg-gradient-to-b ${getPackageGradient(index)} border ${getPackageColor(index)} rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-[#00D4FF]/10`}
                >
                  {index === 1 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{getPackageIcon(index)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                      <span className="text-xs text-gray-400">{getPackageBadge(index)}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-white">NPR {pkg.price}</span>
                    {pkg.price.includes('/mo') && (
                      <span className="text-gray-400 text-sm ml-1">/month</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2 text-gray-300 text-sm">
                        <FaCheckCircle className="text-[#00D4FF] mt-1 flex-shrink-0 w-4 h-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/contact?service=${service.slug}&package=${pkg.name}`}
                    className={`block text-center px-4 py-2 rounded-lg transition-all font-medium ${
                      index === 1
                        ? 'bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-[#00D4FF]/20'
                        : 'border border-[#00D4FF]/30 text-white hover:bg-[#00D4FF]/10'
                    }`}
                  >
                    Choose Plan
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full Description Section - Enhanced */}
      {service.fullDescription && (
        <section className="py-20 px-4 bg-gradient-to-b from-[#111118] to-[#0A0A0F]">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#111118] rounded-2xl p-8 md:p-12 border border-[#00D4FF]/10 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-12 bg-gradient-to-b from-[#00D4FF] to-[#7C3AED] rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]">Details</span>
                </h2>
              </div>
              
              <FullDescription 
                htmlContent={service.fullDescription} 
                serviceName={service.name}
              />
              
              {/* Additional Info Banner */}
              <div className="mt-8 p-4 bg-gradient-to-r from-[#00D4FF]/5 to-[#7C3AED]/5 rounded-xl border border-[#00D4FF]/10">
                <div className="flex items-start gap-3">
                  <FaTag className="text-[#00D4FF] text-xl mt-1" />
                  <div>
                    <p className="text-gray-300 text-sm">
                      <span className="text-[#00D4FF] font-semibold">Need a custom solution?</span>{' '}
                      Contact us for a tailored package that fits your specific requirements and budget.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* All Features Section */}
      {service.features && service.features.length > 0 && (
        <section className="py-16 px-4 bg-[#0A0A0F]">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#111118] rounded-2xl p-8 border border-[#00D4FF]/10"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaCheckCircle className="text-[#00D4FF]" />
                All Features Included
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300 p-3 rounded-lg hover:bg-[#00D4FF]/5 transition-all">
                    <FaCheckCircle className="text-[#00D4FF] w-5 h-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Important Notes Section */}
      <section className="py-16 px-4 bg-[#111118] border-t border-[#00D4FF]/10">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaShieldAlt className="text-[#00D4FF]" />
              Important Notes
            </h3>
            <div className="space-y-4">
              <div className="bg-[#0A0A0F] p-4 rounded-lg border border-[#00D4FF]/5 hover:border-[#00D4FF]/20 transition-all">
                <p className="text-gray-400 text-sm">
                  <span className="text-[#00D4FF] font-semibold">•</span> Prices exclude third-party costs such as domain registration, hosting, or paid advertising budgets unless stated otherwise.
                </p>
              </div>
              <div className="bg-[#0A0A0F] p-4 rounded-lg border border-[#00D4FF]/5 hover:border-[#00D4FF]/20 transition-all">
                <p className="text-gray-400 text-sm">
                  <span className="text-[#00D4FF] font-semibold">•</span> A 50% advance payment is required before work begins; the remaining 50% is due upon project completion.
                </p>
              </div>
              <div className="bg-[#0A0A0F] p-4 rounded-lg border border-[#00D4FF]/5 hover:border-[#00D4FF]/20 transition-all">
                <p className="text-gray-400 text-sm">
                  <span className="text-[#00D4FF] font-semibold">•</span> Final pricing may vary depending on specific project requirements — contact us for a custom quotation.
                </p>
              </div>
              <div className="bg-[#0A0A0F] p-4 rounded-lg border border-[#00D4FF]/5 hover:border-[#00D4FF]/20 transition-all">
                <p className="text-gray-400 text-sm">
                  <span className="text-[#00D4FF] font-semibold">•</span> Prices listed are valid as of the publish date of this document and subject to change.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#00D4FF]/10 to-[#7C3AED]/10">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center bg-[#111118] rounded-2xl p-8 md:p-12 border border-[#00D4FF]/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]">Custom Quote</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Every business is different - contact us for a quotation tailored to your exact needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              <a
                href="tel:+9779827399860"
                className="flex items-center justify-center gap-3 bg-[#0A0A0F] p-4 rounded-lg border border-[#00D4FF]/20 hover:border-[#00D4FF] transition-all group"
              >
                <FaPhone className="text-[#00D4FF] group-hover:scale-110 transition-transform" />
                <span className="text-white group-hover:text-[#00D4FF] transition-colors">
                  +977 9827399860
                </span>
              </a>
              <a
                href="mailto:mail@riseuptech.com.np"
                className="flex items-center justify-center gap-3 bg-[#0A0A0F] p-4 rounded-lg border border-[#7C3AED]/20 hover:border-[#7C3AED] transition-all group"
              >
                <FaEnvelope className="text-[#7C3AED] group-hover:scale-110 transition-transform" />
                <span className="text-white group-hover:text-[#7C3AED] transition-colors">
                  mail@riseuptech.com.np
                </span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <FaMapMarkerAlt className="text-[#00D4FF]" />
              <span>Tilathi-Koiladi-2, Launiya, Saptari, Nepal</span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetail;