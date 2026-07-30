import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaTag, FaArrowRight, FaClock, FaEye, FaHeart } from 'react-icons/fa';

const BlogCard = ({ blog, index }) => {
  // Placeholder image if no featured image
  const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.title)}&background=00D4FF&color=fff&size=128`;
  const imageUrl = blog.featuredImage || placeholderImage;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-gradient-to-br from-[#111118] to-[#0A0A0F] rounded-2xl overflow-hidden border border-[#00D4FF]/10 hover:border-[#00D4FF]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#00D4FF]/5"
    >
      {/* Image Container with Overlay */}
      <div className="relative h-56 overflow-hidden bg-[#1A1A2E]">
        <img 
          src={imageUrl} 
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent opacity-60" />
        
        {/* Category Badge */}
        {blog.category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-xs font-semibold rounded-full shadow-lg shadow-[#00D4FF]/20">
              {blog.category}
            </span>
          </div>
        )}
        
        {/* Featured Badge */}
        {blog.featured && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-semibold rounded-full shadow-lg shadow-yellow-500/30 flex items-center gap-1">
            <FaHeart className="w-3 h-3" />
            Featured
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/90 text-xs bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <FaCalendarAlt className="w-3 h-3 text-[#00D4FF]" />
          {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        
        {/* Read Time */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/70 text-xs bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <FaClock className="w-3 h-3 text-[#00D4FF]" />
          <span>{Math.ceil((blog.excerpt?.length || 200) / 150)} min read</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 relative">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-semibold text-xs">
            {(blog.authorName || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm text-white font-medium">{blog.authorName || 'Unknown'}</span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Author</span>
              {blog.tags && blog.tags.length > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="flex items-center gap-1">
                    <FaTag className="w-3 h-3" />
                    {blog.tags[0]}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00D4FF] transition-colors duration-300 line-clamp-2">
          <Link to={`/blogs/${blog.slug}`} className="hover:text-[#00D4FF]">
            {blog.title}
          </Link>
        </h3>
        
        {/* Excerpt */}
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
          {blog.excerpt}
        </p>
        
        {/* Tags & Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#00D4FF]/5">
          <div className="flex flex-wrap gap-1.5">
            {blog.tags && blog.tags.slice(0, 3).map((tag, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-[#00D4FF]/5 text-gray-400 text-xs rounded-full hover:bg-[#00D4FF]/10 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {blog.tags && blog.tags.length > 3 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
          
          {/* Read More Button */}
          <Link
            to={`/blogs/${blog.slug}`}
            className="group/btn inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all duration-300"
          >
            <span>Read More</span>
            <FaArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* View Counter (Optional) */}
        <div className="absolute top-6 right-6 flex items-center gap-1 text-gray-600 text-xs">
          <FaEye className="w-3 h-3" />
          <span>{Math.floor(Math.random() * 1000) + 100}</span>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;