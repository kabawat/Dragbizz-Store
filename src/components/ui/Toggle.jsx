"use client"
import React from 'react';
import { Grid, List } from 'lucide-react';

const Toggle = ({
  options = [],
  value,
  onChange,
  size = 'md',
  variant = 'default',
  disabled = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const variantClasses = {
    default: 'bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))]',
    primary: 'bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]',
    secondary: 'bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-secondary))]'
  };
  
  const handleOptionClick = (optionValue) => {
    if (!disabled && optionValue !== value) {
      onChange?.(optionValue);
    }
  };
  
  return (
    <div className={`inline-flex rounded-lg border ${variantClasses[variant]} ${className}`} {...props}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        
        return (
          <button
            key={option.value}
            onClick={() => handleOptionClick(option.value)}
            disabled={disabled}
            className={`
              ${sizeClasses[size]}
              font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-2
              ${isFirst ? 'rounded-l-lg' : ''}
              ${isLast ? 'rounded-r-lg' : ''}
              ${!isFirst && !isLast ? 'border-l border-[rgb(var(--color-border-primary))]' : ''}
              ${isSelected 
                ? 'bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))]' 
                : 'text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-pressed={isSelected}
            aria-label={option.label}
          >
            {option.icon && <option.icon className="w-4 h-4 mr-2" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

// Predefined toggle components for common use cases
export const ViewToggle = ({ value, onChange, className = '', ...props }) => (
  <Toggle
    options={[
      { value: 'grid', label: 'Grid', icon: Grid },
      { value: 'list', label: 'List', icon: List }
    ]}
    value={value}
    onChange={onChange}
    className={className}
    {...props}
  />
);

export default Toggle;
