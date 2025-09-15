import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps {
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  leftIcon?: LucideIcon;
  rightElement?: React.ReactNode;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  maxLength?: number;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  leftIcon: LeftIcon,
  rightElement,
  error,
  className = '',
  autoFocus = false,
  disabled = false,
  name,
  id,
  maxLength
}) => {
  const baseClasses = 'w-full py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
  
  const paddingClasses = LeftIcon ? 'pl-16' : 'pl-4';
  const rightPaddingClasses = rightElement ? 'pr-12' : 'pr-4';
  
  const stateClasses = error 
    ? 'border-red-500 bg-red-50' 
    : 'border-gray-200 focus:border-blue-500';

  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  const inputClasses = `${baseClasses} ${paddingClasses} ${rightPaddingClasses} ${stateClasses} ${disabledClasses} ${className}`;

  return (
    <div className="relative">
      {/* Left Icon */}
      {LeftIcon && (
        <LeftIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      )}
      
      {/* Input Field */}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        disabled={disabled}
        name={name}
        id={id}
        maxLength={maxLength}
        className={inputClasses}
      />
      
      {/* Right Element */}
      {rightElement && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default Input;
