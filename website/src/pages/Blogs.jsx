import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { websiteService } from '../services/api';
import BlogCard from '../components/Common/BlogCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [blogsRes, settingsRes] = await Promise.all([
        websiteService.getBlogs({ status: 'published' }),
        websiteService.getSettings(),
      ]);
      
      const blogData = blogsRes.data || [];
      setBlogs(blogData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(blogData.map(blog => blog.category).filter(Boolean))];
      setCategories(uniqueCategories);
      setSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = filter === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.category === filter);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Blogs - {settings.siteName || 'Riseup-Tech'}</title>
        <meta name="description" content="Read our latest insights, updates, and stories about technology and innovation." />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-[#00D4FF]/5 to-transparent relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://i.pinimg.com/1200x/cf/c8/f8/cfc8f8a9939b8cc1d422e89a1fc3fa8c.jpg")',
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Blog</h1>
            <p className="text-lg text-gray-400">
              Insights, updates, and stories from our team
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog List */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === 'all'
                    ? 'bg-[#00D4FF] text-white'
                    : 'bg-[#111118] text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filter === category
                      ? 'bg-[#00D4FF] text-white'
                      : 'bg-[#111118] text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog, index) => (
                <BlogCard key={blog._id} blog={blog} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p>No blogs found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blogs;