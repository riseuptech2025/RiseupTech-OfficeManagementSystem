import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const TestimonialCard = ({ testimonial, index }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#111118] p-6 rounded-xl border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Client Image */}
        {testimonial.clientImage ? (
          <img 
            src={testimonial.clientImage} 
            alt={testimonial.clientName}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white text-xl font-bold">
            {testimonial.clientName.charAt(0)}
          </div>
        )}
        
        <div>
          <h4 className="text-white font-semibold">{testimonial.clientName}</h4>
          <p className="text-gray-400 text-sm">{testimonial.clientPosition}</p>
          <p className="text-gray-500 text-sm">{testimonial.clientCompany}</p>
        </div>
      </div>
      
      {/* Rating */}
      <div className="flex gap-1 mb-3">
        {renderStars(testimonial.rating)}
      </div>
      
      {/* Content */}
      <p className="text-gray-300 text-sm italic">"{testimonial.content}"</p>
    </motion.div>
  );
};

export default TestimonialCard;