"use client"
import React from 'react';
import { X } from 'lucide-react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-200 text-gray-900',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
    solid: 'bg-gray-800 text-white'
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  
  // Base classes
  const baseClasses = 'inline-flex items-center font-medium transition-all duration-200';
  
  const badgeClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses[rounded]} ${className}`;
  
  return (
    <span className={badgeClasses} {...props}>
      {children}
      
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors duration-200"
          aria-label="Remove badge"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

// Badge Group Component
const BadgeGroup = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex flex-wrap gap-2 ${className}`} {...props}>
    {children}
  </div>
);

// Status Badge Component
const StatusBadge = ({
  status,
  className = '',
  ...props
}) => {
  const statusConfig = {
    active: { variant: 'success', text: 'Active' },
    inactive: { variant: 'secondary', text: 'Inactive' },
    pending: { variant: 'warning', text: 'Pending' },
    approved: { variant: 'success', text: 'Approved' },
    rejected: { variant: 'danger', text: 'Rejected' },
    draft: { variant: 'secondary', text: 'Draft' },
    published: { variant: 'primary', text: 'Published' },
    archived: { variant: 'outline', text: 'Archived' },
    online: { variant: 'success', text: 'Online' },
    offline: { variant: 'danger', text: 'Offline' },
    available: { variant: 'success', text: 'Available' },
    unavailable: { variant: 'danger', text: 'Unavailable' }
  };
  
  const config = statusConfig[status] || { variant: 'default', text: status };
  
  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.text}
    </Badge>
  );
};

// Notification Badge Component
const NotificationBadge = ({
  count,
  maxCount = 99,
  variant = 'danger',
  size = 'sm',
  className = '',
  ...props
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  if (count === 0) return null;
  
  return (
    <Badge 
      variant={variant} 
      size={size} 
      className={`min-w-5 h-5 flex items-center justify-center ${className}`}
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

export { Badge, BadgeGroup, StatusBadge, NotificationBadge };
export default Badge;
