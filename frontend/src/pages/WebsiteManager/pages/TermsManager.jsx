// src/pages/WebsiteManager/pages/TermsManager.jsx
import React from 'react';
import PageManager from './PageManager';

const TermsManager = () => {
  return (
    <PageManager 
      pageType="terms"
      pageLabel="Terms & Conditions"
      pageIcon="FaFileContract"
      defaultTitle="Terms & Conditions"
      defaultSlug="terms-and-conditions"
    />
  );
};

export default TermsManager;