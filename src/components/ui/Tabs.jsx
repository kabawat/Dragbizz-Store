import React from 'react';

const Tabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };
  
  // Variant classes
  const variantClasses = {
    default: 'border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700',
    pills: 'rounded-lg hover:bg-gray-100',
    underline: 'border-b-2 border-transparent hover:border-gray-300'
  };
  
  const activeClasses = {
    default: 'border-blue-500 text-blue-600',
    pills: 'bg-blue-100 text-blue-700',
    underline: 'border-blue-500 text-blue-600'
  };
  
  return (
    <div className={className} {...props}>
      {/* Tab Headers */}
      <div className={`flex ${variant === 'pills' ? 'space-x-1 bg-gray-100 p-1 rounded-lg' : 'border-b border-gray-200'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`${sizeClasses[size]} font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? activeClasses[variant]
                : variantClasses[variant]
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

// Tab Panel Component
const TabPanel = ({
  children,
  isActive = false,
  className = '',
  ...props
}) => {
  if (!isActive) return null;
  
  return (
    <div className={`animate-fade-in ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Tabs, TabPanel };
export default Tabs;
