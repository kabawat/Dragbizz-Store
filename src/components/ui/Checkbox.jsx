import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  required = false,
  error = false,
  errorMessage,
  size = 'md',
  className = '',
  name,
  id,
  value,
  ...props
}) => {
  // Size variants
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  // Base classes
  const baseClasses = 'rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  // State classes
  const stateClasses = error
    ? 'border-red-500 focus:ring-red-500'
    : checked
    ? 'border-blue-500 bg-blue-500 focus:ring-blue-500'
    : 'border-gray-300 focus:ring-blue-500';
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const checkboxClasses = `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${disabledClasses} ${className}`;
  
  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked);
    }
  };
  
  return (
    <div className="flex items-start space-x-3">
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
          value={value}
          className="sr-only"
          {...props}
        />
        
        <div className={checkboxClasses}>
          {checked && (
            <Check className={`${iconSizes[size]} text-white animate-bounce-in`} />
          )}
        </div>
      </div>
      
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label 
              htmlFor={id}
              className={`text-sm font-medium cursor-pointer ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          {description && (
            <p className={`text-sm mt-1 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
          
          {error && errorMessage && (
            <p className="text-sm text-red-600 mt-1 animate-fade-in">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Checkbox Group Component
const CheckboxGroup = ({
  children,
  label,
  description,
  error = false,
  errorMessage,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <legend className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </legend>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-4">
          {description}
        </p>
      )}
      
      <div className="space-y-3" {...props}>
        {children}
      </div>
      
      {error && errorMessage && (
        <p className="text-sm text-red-600 mt-2 animate-fade-in">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export { Checkbox, CheckboxGroup };
export default Checkbox;
