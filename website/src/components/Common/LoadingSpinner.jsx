import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'border-[#00D4FF]',
    secondary: 'border-[#7C3AED]',
    white: 'border-white',
  };

  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className={`${sizeClasses[size]} border-4 border-t-transparent rounded-full animate-spin ${colorClasses[color]}`} />
    </div>
  );
};

export default LoadingSpinner;