// src/pages/WebsiteManager/pages/CookiesManager.jsx
import React from 'react';
import PageManager from './PageManager';

const CookiesManager = () => {
  return (
    <PageManager 
      pageType="cookies"
      pageLabel="Cookies Policy"
      pageIcon="FaCookie"
      defaultTitle="Cookies Policy"
      defaultSlug="cookies-policy"
    />
  );
};

export default CookiesManager;