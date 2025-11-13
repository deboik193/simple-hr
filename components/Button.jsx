'use client';

import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex cursor-pointer items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variants based on your design
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 border border-teal-600',
    outline: 'border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white bg-transparent',
    ghost: 'text-teal-600 hover:bg-gray-100 bg-transparent border border-transparent',
  };

  // Sizes
  const sizes = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'sm:px-4 sm:py-2 text-sm px-3 py-1.5',
    large: 'sm:px-6 sm:py-3 text-base px-4 py-2 ',
  };

  // Icon sizes
  const iconSizes = {
    small: 14,
    medium: 16,
    large: 18,
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Icon on left */}
      {!loading && Icon && (
        <Icon size={iconSizes[size]} className="shrink-0 mr-2" />
      )}

      {/* Button text */}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

export default Button;