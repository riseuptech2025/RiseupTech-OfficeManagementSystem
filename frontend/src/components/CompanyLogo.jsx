import React from 'react';
import logo from '../assets/logo.png';

const CompanyLogo = ({ size = 'medium', showText = true, textColor = 'text-riseup-dark-navy' }) => {
  const sizes = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const textSizes = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl',
    xl: 'text-5xl',
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`${sizes[size]} flex-shrink-0`}>
        <img 
          src={logo} 
          alt="Riseup-Tech Software Company" 
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold ${textColor} leading-tight`}>
            Riseup-Tech
          </h1>
          <p className={`text-xs ${textColor} opacity-70 font-medium tracking-wider`}>
            SOFTWARE COMPANY
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyLogo;