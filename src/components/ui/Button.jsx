"use client"
import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-80 disabled:cursor-not-allowed disabled:pointer-events-none btn-ripple cursor-pointer';
  
  // Size variants - Reduced padding and font sizes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm',
    xl: 'px-5 py-3 text-base'
  };
  
  // Color variants - Theme aware
  const variantClasses = {
    primary: 'bg-[rgb(var(--color-primary))] text-white hover:opacity-90 focus:ring-[rgb(var(--color-primary))] shadow-sm hover:shadow-md',
    secondary: 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] focus:ring-[rgb(var(--color-secondary))]',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-sm hover:shadow-md',
    outline: 'border-2 border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] focus:ring-[rgb(var(--color-primary))]',
    ghost: 'text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] focus:ring-[rgb(var(--color-primary))]',
    link: 'text-[rgb(var(--color-primary))] hover:opacity-80 underline-offset-4 hover:underline focus:ring-[rgb(var(--color-primary))]'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`;
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!loading && LeftIcon && (
        <LeftIcon className="w-4 h-4 mr-2" />
      )}
      
      {children}
      
      {!loading && RightIcon && (
        <RightIcon className="w-4 h-4 ml-2" />
      )}
    </button>
  );
};

export default Button;
