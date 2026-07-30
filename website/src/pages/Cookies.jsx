import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Cookies = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pageRes, settingsRes] = await Promise.all([
        websiteService.getPageBySlug('cookies-policy'),
        websiteService.getSettings(),
      ]);
      setContent(pageRes.data);
      setSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error fetching cookies policy:', error);
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
        <title>Cookies Policy - {settings.siteName || 'Riseup-Tech'}</title>
        <meta name="description" content={content?.seo?.description || 'Read our cookies policy to understand how we use cookies.'} />
      </Helmet>

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
              {content?.title || 'Cookies Policy'}
            </h1>
            <div 
              className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-li:text-gray-300"
              dangerouslySetInnerHTML={{ __html: content?.content || '<p>No content available.</p>' }}
            />
            <p className="text-sm text-gray-500 mt-8">
              Last updated: {content?.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Cookies;