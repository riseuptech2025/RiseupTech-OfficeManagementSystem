import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaTag, FaShareAlt } from 'react-icons/fa';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const response = await websiteService.getBlogBySlug(slug);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!blog) {
    return (
      <div className="pt-32 text-center text-gray-400">
        <h2 className="text-2xl font-bold text-white">Blog not found</h2>
        <Link to="/blogs" className="text-[#00D4FF] hover:underline mt-4 inline-block">
          ← Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.seo?.title || blog.title} - Riseup-Tech</title>
        <meta name="description" content={blog.seo?.description || blog.excerpt} />
        <meta name="keywords" content={blog.seo?.keywords?.join(', ') || ''} />
        <meta property="og:title" content={blog.seo?.title || blog.title} />
        <meta property="og:description" content={blog.seo?.description || blog.excerpt} />
        {blog.featuredImage && <meta property="og:image" content={blog.featuredImage} />}
      </Helmet>

      <article className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00D4FF] transition-colors mb-8">
            <FaArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="rounded-2xl overflow-hidden mb-8 border border-[#00D4FF]/10">
                <img 
                  src={blog.featuredImage} 
                  alt={blog.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
              <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] rounded-full">
                {blog.category}
              </span>
              <span className="flex items-center gap-1">
                <FaCalendarAlt className="w-3 h-3" />
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <FaUser className="w-3 h-3" />
                {blog.authorName || 'Unknown'}
              </span>
              {blog.tags && blog.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <FaTag className="w-3 h-3" />
                  {blog.tags.join(', ')}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {blog.title}
            </h1>

            {/* Content */}
            <div 
              className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-[#00D4FF] prose-strong:text-white prose-li:text-gray-300"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Share Button */}
            <div className="mt-8 pt-8 border-t border-[#00D4FF]/10">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all"
              >
                <FaShareAlt className="w-4 h-4" />
                Share this article
              </button>
            </div>
          </motion.div>
        </div>
      </article>
    </>
  );
};

export default BlogDetail;