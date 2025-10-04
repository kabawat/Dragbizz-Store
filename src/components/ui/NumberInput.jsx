"use client"
import React, { forwardRef, useState } from 'react';
import { AlertCircle, Minus, Plus } from 'lucide-react';

const NumberInput = forwardRef(({
  value,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  precision = 0,
  placeholder,
  label,
  error = false,
  errorMessage,
  success = false,
  successMessage,
  helperText,
  disabled = false,
  required = false,
  showButtons = true,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  name,
  id,
  autoFocus = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const inputValue = e.target.value;
    onChange?.(inputValue);
  };

  // Handle increment
  const handleIncrement = () => {
    if (disabled) return;

    const newValue = Math.min(value + 1, max);
    onChange?.(newValue);
  };

  // Handle decrement
  const handleDecrement = () => {
    if (disabled) return;

    const newValue = Math.max(value - 1, min);
    onChange?.(newValue);
  };

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  // Base classes - Theme aware with consistent height
  const baseClasses = 'w-full border-2 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] h-12';

  // Padding classes - More precise spacing
  const paddingClasses = LeftIcon ? 'pl-14' : 'pl-4';
  const rightPaddingClasses = (RightIcon || showButtons || error || success) ? 'pr-14' : 'pr-4';

  // State classes - Theme aware with higher specificity
  const stateClasses = error
    ? '!border-red-500 !bg-red-50 focus:!border-red-500 focus:!ring-red-500'
    : success
      ? '!border-green-500 !bg-green-50 focus:!border-green-500 focus:!ring-green-500'
      : 'border-[rgb(var(--color-border-primary))] focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]';

  const disabledClasses = disabled ? 'bg-[rgb(var(--color-bg-tertiary))] cursor-not-allowed opacity-50' : '';

  const inputClasses = `${baseClasses} ${paddingClasses} ${rightPaddingClasses} ${stateClasses} ${disabledClasses} ${className}`;

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
          <div className="absolute left-0 top-0 h-full z-10 flex items-center justify-center w-10 ps-4">
            <LeftIcon className={`pointer-events-none w-5 h-5 ${error ? 'text-red-500' : 'text-[rgb(var(--color-text-tertiary))]'}`} />
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
          autoFocus={autoFocus}
          min={min}
          max={max}
          step={step}
          className={inputClasses}
          style={error ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
          {...props}
        />
        {/* Right Elements */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center space-x-1">
          {/* Increment/Decrement Buttons */}
          {showButtons && !disabled && (
            <div className="flex flex-col">
              <button
                type="button"
                onClick={handleIncrement}
                className="p-1 text-[rgb(var(--color-text-tertiary))] cursor-pointer hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded transition-colors duration-200"
                disabled={parseFloat(value) >= max}
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleDecrement}
                className="p-1 text-[rgb(var(--color-text-tertiary))] cursor-pointer  hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded transition-colors duration-200"
                disabled={parseFloat(value) <= min}
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Right Icon */}
          {RightIcon && !showButtons && (
            <RightIcon className="w-5 h-5 text-[rgb(var(--color-text-tertiary))] pointer-events-none" />
          )}

          {/* Error/Success Icon */}
          {(error || success) && (
            <AlertCircle className={`w-5 h-5 ${error ? 'text-red-500' : 'text-green-500'}`} />
          )}
        </div>
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

NumberInput.displayName = 'NumberInput';

export default NumberInput;
