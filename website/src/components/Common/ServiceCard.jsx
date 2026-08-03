import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const ServiceCard = ({ service, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#111118] p-6 rounded-xl border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all group card-hover"
    >
      {/* Icon */}
      {service.icon && (
        <div className="text-4xl mb-4">{service.icon}</div>
      )}
      
      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00D4FF] transition-colors">
        {service.name}
      </h3>
      
      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
        {service.description}
      </p>
      
      {/* Features */}
      {service.features && service.features.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {service.features.slice(0, 3).map((feature, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#00D4FF]/10 text-[#00D4FF] text-xs rounded-full">
              {feature}
            </span>
          ))}
          {service.features.length > 3 && (
            <span className="px-2 py-0.5 text-gray-500 text-xs">+{service.features.length - 3}</span>
          )}
        </div>
      )}
      
      {/* Price Range */}
      {service.priceRange && service.priceRange.min > 0 && (
        <p className="text-sm text-gray-400 mb-4">
          Starting from <span className="text-[#00D4FF] font-semibold">Rs. {service.priceRange.min}</span>
        </p>
      )}
      
      {/* Link */}
      <Link
        to={service?.slug ? `/services/${service.slug}` : '/services'}
        className="inline-flex items-center gap-2 text-[#00D4FF] hover:gap-3 transition-all text-sm font-medium"
      >
        Learn More <FaArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
};

export default ServiceCard;