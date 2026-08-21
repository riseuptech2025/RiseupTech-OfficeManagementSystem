import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaUser, 
  FaTag, 
  FaShareAlt,
  FaRegBookmark,
  FaRegHeart,
  FaHeart,
  FaClock,
  FaComments,
  FaArrowUp,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaChevronRight
} from 'react-icons/fa';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    fetchBlogAndRelated();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);

      if (contentRef.current) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchBlogAndRelated = async () => {
    try {
      setLoading(true);
      setLoadingRelated(true);
      
      // Fetch current blog
      const blogResponse = await websiteService.getBlogBySlug(slug);
      const currentBlog = blogResponse.data;
      setBlog(currentBlog);
      setLikesCount(currentBlog.likes || Math.floor(Math.random() * 100) + 10);

      // Fetch related blogs based on category and tags
      if (currentBlog) {
        const params = new URLSearchParams();
        
        // Get blogs from same category
        if (currentBlog.category) {
          params.append('category', currentBlog.category);
        }
        
        // Get blogs with similar tags
        if (currentBlog.tags && currentBlog.tags.length > 0) {
          params.append('tags', currentBlog.tags.join(','));
        }
        
        // Exclude current blog
        params.append('exclude', currentBlog._id || currentBlog.id);
        params.append('limit', '4');
        params.append('status', 'published');

        const relatedResponse = await websiteService.getBlogs(params.toString());
        setRelatedBlogs(relatedResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching blog or related blogs:', error);
      setRelatedBlogs([]);
    } finally {
      setLoading(false);
      setLoadingRelated(false);
    }
  };

  const handleShare = async (platform = null) => {
    const shareData = {
      title: blog.title,
      text: blog.excerpt,
      url: window.location.href,
    };

    if (platform) {
      const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      };
      window.open(urls[platform], '_blank', 'width=600,height=400');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#00D4FF] text-gray-900 px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const getReadingTime = () => {
    if (!blog?.content) return '2 min read';
    const words = blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <LoadingSpinner />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="pt-32 text-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Blog not found</h2>
          <p className="text-gray-400 mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/blogs" className="inline-flex items-center gap-2 text-[#00D4FF] hover:text-white transition-colors border border-[#00D4FF] px-6 py-3 rounded-lg hover:bg-[#00D4FF]/10">
            <FaArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </motion.div>
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

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#00D4FF] to-[#00A3FF] transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <article className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Hero Section with Parallax Effect */}
        <div className="relative overflow-hidden">
          {blog.featuredImage && (
            <div className="absolute inset-0 opacity-30">
              <img 
                src={blog.featuredImage} 
                alt={blog.title}
                className="w-full h-full object-cover"
                style={{ filter: 'blur(2px)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />
            </div>
          )}
          
          <div className="relative pt-32 pb-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link to="/blogs" className="inline-flex items-center gap-2 text-white/70 hover:text-[#00D4FF] transition-colors mb-8 group">
                  <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Blogs
                </Link>

                <div className="space-y-6">
                  {/* Category Badge */}
                  <span className="inline-block px-4 py-1.5 bg-[#00D4FF]/20 text-[#00D4FF] rounded-full text-sm font-medium backdrop-blur-sm border border-[#00D4FF]/20">
                    {blog.category}
                  </span>

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {blog.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#00A3FF] flex items-center justify-center text-gray-900 font-bold">
                        {blog.authorName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{blog.authorName || 'Unknown'}</div>
                        <div className="text-xs text-white/60">Author</div>
                      </div>
                    </div>
                    
                    <span className="w-px h-6 bg-white/20" />
                    
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    
                    <span className="w-px h-6 bg-white/20" />
                    
                    <div className="flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      <span>{getReadingTime()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 pb-20">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative"
            >
              {/* Featured Image */}
              {blog.featuredImage && (
                <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl border border-white/10">
                  <img 
                    src={blog.featuredImage} 
                    alt={blog.title}
                    className="w-full h-auto hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {blog.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-3 py-1 bg-white/5 text-white/70 rounded-full text-sm border border-white/10 hover:border-[#00D4FF]/30 transition-colors cursor-default"
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div 
                ref={contentRef}
                className="prose prose-lg prose-invert max-w-none 
                  [&>*]:text-white/90 
                  [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-white
                  [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-white
                  [&_p]:leading-relaxed [&_p]:mb-6
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:text-white/90
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:text-white/90
                  [&_li]:mb-2
                  [&_a]:text-[#00D4FF] [&_a:hover]:text-white [&_a]:transition-colors
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#00D4FF] [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-8
                  [&_blockquote_p]:text-white/80 [&_blockquote_p]:italic
                  [&_img]:rounded-xl [&_img]:shadow-lg [&_img]:my-8
                  [&_pre]:bg-white/5 [&_pre]:rounded-xl [&_pre]:p-6 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-white/10
                  [&_code]:text-[#00D4FF] [&_code]:bg-white/5 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded
                  [&_pre_code]:bg-transparent [&_pre_code]:text-white [&_pre_code]:p-0"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Engagement Section */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Like Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLike}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      {isLiked ? (
                        <FaHeart className="w-5 h-5 text-red-500" />
                      ) : (
                        <FaRegHeart className="w-5 h-5 text-white" />
                      )}
                      <span className="text-white">{likesCount}</span>
                    </motion.button>

                    {/* Bookmark Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <FaRegBookmark className={`w-5 h-5 ${isBookmarked ? 'text-[#00D4FF] fill-[#00D4FF]' : 'text-white'}`} />
                      <span className="text-white">{isBookmarked ? 'Saved' : 'Save'}</span>
                    </motion.button>
                  </div>

                  {/* Share Section */}
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm mr-2">Share:</span>
                    {['twitter', 'linkedin', 'facebook'].map((platform) => {
                      const icons = {
                        twitter: FaTwitter,
                        linkedin: FaLinkedin,
                        facebook: FaFacebook,
                      };
                      const Icon = icons[platform];
                      return (
                        <motion.button
                          key={platform}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleShare(platform)}
                          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-white hover:text-[#00D4FF]"
                        >
                          <Icon className="w-4 h-4" />
                        </motion.button>
                      );
                    })}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="p-2 rounded-full bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 transition-colors border border-[#00D4FF]/30 text-white"
                    >
                      <FaShareAlt className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Blogs Section */}
        {!loadingRelated && relatedBlogs.length > 0 && (
          <div className="px-4 pb-20">
            <div className="container mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Related Articles</h2>
                    <p className="text-white/60">Continue reading with these related articles</p>
                  </div>
                  <Link 
                    to="/blogs" 
                    className="flex items-center gap-2 text-[#00D4FF] hover:text-white transition-colors group"
                  >
                    <span>View all</span>
                    <FaChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedBlogs.map((relatedBlog, index) => (
                    <motion.div
                      key={relatedBlog._id || relatedBlog.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      className="group"
                    >
                      <Link to={`/blog/${relatedBlog.slug}`} className="block h-full">
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#00D4FF]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#00D4FF]/5 h-full flex flex-col">
                          {/* Image */}
                          {relatedBlog.featuredImage && (
                            <div className="relative overflow-hidden h-48">
                              <img 
                                src={relatedBlog.featuredImage} 
                                alt={relatedBlog.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          )}

                          <div className="p-5 flex-1 flex flex-col">
                            {/* Category */}
                            {relatedBlog.category && (
                              <span className="inline-block px-2.5 py-0.5 bg-[#00D4FF]/10 text-[#00D4FF] rounded-full text-xs font-medium mb-3 self-start">
                                {relatedBlog.category}
                              </span>
                            )}

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-white group-hover:text-[#00D4FF] transition-colors line-clamp-2 mb-2">
                              {relatedBlog.title}
                            </h3>

                            {/* Excerpt */}
                            {relatedBlog.excerpt && (
                              <p className="text-white/60 text-sm line-clamp-2 mb-3 flex-1">
                                {relatedBlog.excerpt}
                              </p>
                            )}

                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-xs text-white/50 pt-3 border-t border-white/10">
                              <span className="flex items-center gap-1">
                                <FaUser className="w-3 h-3" />
                                {relatedBlog.authorName || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="w-3 h-3" />
                                {new Date(relatedBlog.publishedAt || relatedBlog.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Scroll to Top Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showScrollTop ? 1 : 0, scale: showScrollTop ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 p-3 rounded-full bg-[#00D4FF]/20 backdrop-blur-sm border border-[#00D4FF]/30 text-white hover:bg-[#00D4FF]/40 transition-all z-40`}
          style={{ display: showScrollTop ? 'flex' : 'none' }}
        >
          <FaArrowUp className="w-5 h-5" />
        </motion.button>
      </article>

      {/* Add custom styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default BlogDetail;