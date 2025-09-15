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
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;
  
  // Base classes - Original common folder styling
  const baseClasses = 'w-full py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
  
  // Padding classes
  const paddingClasses = LeftIcon ? 'pl-12' : 'pl-4';
  const rightPaddingClasses = (RightIcon || showPasswordToggle || error || success || rightElement) ? 'pr-12' : 'pr-4';
  
  // State classes - Original styling
  const stateClasses = error 
    ? 'border-red-500 bg-red-50' 
    : success
    ? 'border-green-500 bg-green-50'
    : 'border-gray-200 focus:border-blue-500';
  
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  
  const inputClasses = `${baseClasses} ${paddingClasses} ${rightPaddingClasses} ${stateClasses} ${disabledClasses} ${className}`;
  
  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
        {/* Left Icon */}
        {LeftIcon && (
          <LeftIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
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
          {...props}
        />
        
        {/* Right Elements */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {/* Password Toggle */}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
          
          {/* Right Icon */}
          {RightIcon && !showPasswordToggle && (
            <RightIcon className="w-5 h-5 text-gray-400 pointer-events-none" />
          )}
          
          {/* Legacy rightElement support */}
          {rightElement && !RightIcon && !showPasswordToggle && (
            <div>
              {rightElement}
            </div>
          )}
          
          {/* Error/Success Icon */}
          {(error || success) && (
            <AlertCircle className={`w-5 h-5 ${error ? 'text-red-500' : 'text-green-500'}`} />
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
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
