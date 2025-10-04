"use client"
import React, { forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  error,
  errorMessage,
  success,
  successMessage,
  label,
  helperText,
  className = '',
  autoFocus = false,
  disabled = false,
  required = false,
  name,
  id,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  showPasswordToggle = false,
  rightElement, // Keep for backward compatibility
  size = 'md', // New size prop with default 'md'
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = showPasswordToggle && type === 'password'
    ? (showPassword ? 'text' : 'password')
    : type;

  // Size classes - Original padding restored
  const sizeClasses = {
    sm: 'py-1.5 text-xs h-10',
    md: 'py-2.5 text-sm h-12', // Restored original padding
    lg: 'py-3 text-base h-14'
  };

  // Base classes - Theme aware
  const baseClasses = `w-full border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] ${sizeClasses[size]}`;

  // Padding classes - Reduced spacing based on size
  const paddingClasses = {
    sm: LeftIcon ? 'pl-8' : 'pl-2.5',
    md: LeftIcon ? 'pl-10' : 'pl-3', // Default padding
    lg: LeftIcon ? 'pl-12' : 'pl-4'
  };
  
  const rightPaddingClasses = {
    sm: (RightIcon || showPasswordToggle || error || success || rightElement) ? 'pr-8' : 'pr-2.5',
    md: (RightIcon || showPasswordToggle || error || success || rightElement) ? 'pr-10' : 'pr-3', // Default padding
    lg: (RightIcon || showPasswordToggle || error || success || rightElement) ? 'pr-12' : 'pr-4'
  };

  // State classes - Theme aware with higher specificity
  const stateClasses = error
    ? '!border-red-500 !bg-red-50 focus:!border-red-500 focus:!ring-red-500'
    : success
      ? '!border-green-500 !bg-green-50 focus:!border-green-500 focus:!ring-green-500'
      : 'border-[rgb(var(--color-border-primary))] focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]';

  const disabledClasses = disabled ? 'bg-[rgb(var(--color-bg-tertiary))] cursor-not-allowed opacity-50' : '';

  const inputClasses = `${baseClasses} ${paddingClasses[size]} ${rightPaddingClasses[size]} ${stateClasses} ${disabledClasses} ${className}`;

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {/* Left Icon */}
      <div className="relative">
        {LeftIcon && (
          <div className={`absolute left-0 top-0 h-full z-10 flex items-center justify-center ${size === 'sm' ? 'w-8 ps-3' : size === 'lg' ? 'w-12 ps-5' : 'w-10 ps-4'}`}>
            <LeftIcon className={`pointer-events-none ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} ${error ? 'text-red-500' : 'text-[rgb(var(--color-text-tertiary))]'}`} />
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          className={inputClasses}
          style={error ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
          {...props}
        />
      </div>

      {/* Right Elements */}
      <div className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center ${size === 'sm' ? 'right-2' : size === 'lg' ? 'right-4' : 'right-3'}`}>
        {/* Password Toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
            ) : (
              <Eye className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
            )}
          </button>
        )}

        {/* Right Icon */}
        {RightIcon && !showPasswordToggle && (
          <RightIcon className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-[rgb(var(--color-text-tertiary))] pointer-events-none`} />
        )}

        {/* Legacy rightElement support */}
        {rightElement && !RightIcon && !showPasswordToggle && (
          <div>
            {rightElement}
          </div>
        )}

        {/* Error/Success Icon */}
        {(error || success) && (
          <AlertCircle className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} ${error ? 'text-red-500' : 'text-green-500'}`} />
        )}
      </div>

      {/* Helper Text / Error Message / Success Message */}
      {(helperText || errorMessage || successMessage) && (
        <div className="mt-2">
          {error && errorMessage && (
            <p className="text-sm text-red-600 animate-fade-in">{errorMessage}</p>
          )}
          {success && successMessage && (
            <p className="text-sm text-green-600 animate-fade-in">{successMessage}</p>
          )}
          {!error && !success && helperText && (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
