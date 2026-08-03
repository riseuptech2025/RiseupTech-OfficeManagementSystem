// src/pages/WebsiteManager/pages/AboutManager.jsx
import React, { useState, useEffect } from 'react';
import PageManager from './PageManager';

const AboutManager = () => {
  return (
    <PageManager 
      pageType="about"
      pageLabel="About"
      pageIcon="FaInfoCircle"
      defaultTitle="About Us"
      defaultSlug="about"
    />
  );
};

export default AboutManager;