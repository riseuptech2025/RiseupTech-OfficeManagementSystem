// src/pages/WebsiteManager/pages/PrivacyManager.jsx
import React from 'react';
import PageManager from './PageManager';

const PrivacyManager = () => {
  return (
    <PageManager 
      pageType="privacy"
      pageLabel="Privacy Policy"
      pageIcon="FaShieldAlt"
      defaultTitle="Privacy Policy"
      defaultSlug="privacy-policy"
    />
  );
};

export default PrivacyManager;