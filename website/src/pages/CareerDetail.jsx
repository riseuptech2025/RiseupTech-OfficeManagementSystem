import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaUsers, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import CareerForm from '../components/Forms/CareerForm';

const CareerDetail = () => {
  const { slug } = useParams();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCareer();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchCareer = async () => {
    try {
      const response = await websiteService.getCareerBySlug(slug);
      setCareer(response.data);
    } catch (error) {
      console.error('Error fetching career:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!career) {
    return (
      <div className="pt-32 text-center text-gray-400">
        <h2 className="text-2xl font-bold text-white">Position not found</h2>
        <Link to="/careers" className="text-[#00D4FF] hover:underline mt-4 inline-block">
          ← Back to Careers
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{career.title} - Riseup-Tech Careers</title>
        <meta name="description" content={career.description} />
      </Helmet>

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/careers" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00D4FF] transition-colors mb-8">
            <FaArrowLeft className="w-4 h-4" />
            Back to Careers
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{career.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="w-4 h-4 text-[#00D4FF]" />
                  {career.location}
                </span>
                <span className="flex items-center gap-1">
                  <FaClock className="w-4 h-4 text-[#00D4FF]" />
                  {career.employmentType}
                </span>
                <span className="flex items-center gap-1">
                  <FaUsers className="w-4 h-4 text-[#00D4FF]" />
                  {career.experienceLevel}
                </span>
                {career.salaryRange?.min > 0 && (
                  <span className="flex items-center gap-1">
                    <FaMoneyBillWave className="w-4 h-4 text-[#00D4FF]" />
                    Rs. {career.salaryRange.min} - {career.salaryRange.max}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#111118] p-6 rounded-xl border border-[#00D4FF]/10 mb-8">
              <p className="text-gray-300 leading-relaxed">{career.description}</p>
            </div>

            {/* Requirements */}
            {career.requirements && career.requirements.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Requirements</h3>
                <ul className="space-y-2">
                  {career.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <FaCheckCircle className="text-[#00D4FF] w-5 h-5 flex-shrink-0 mt-1" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {career.responsibilities && career.responsibilities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Responsibilities</h3>
                <ul className="space-y-2">
                  {career.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <FaCheckCircle className="text-[#7C3AED] w-5 h-5 flex-shrink-0 mt-1" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {career.benefits && career.benefits.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Benefits</h3>
                <ul className="space-y-2">
                  {career.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <FaCheckCircle className="text-[#06D6A0] w-5 h-5 flex-shrink-0 mt-1" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply Button */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-3 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all font-medium"
              >
                Apply Now
              </button>
              <Link
                to="/contact"
                className="px-8 py-3 border border-[#00D4FF]/30 text-white rounded-lg hover:bg-[#00D4FF]/10 transition-all font-medium"
              >
                Ask a Question
              </Link>
            </div>

            {/* Application Form */}
            {showForm && (
              <div className="mt-8">
                <CareerForm 
                  careerId={career._id} 
                  onSuccess={() => {
                    setShowForm(false);
                    alert('Application submitted successfully!');
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default CareerDetail;