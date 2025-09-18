"use client"
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '../ui';

const BasicInfoStep = ({
  firstName,
  lastName,
  contact,
  contactType,
  onUpdate,
  onNext,
  onBack,
  errors
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState('idle');

  // Smart contact detection
  const detectContactType = (value) => {
    const cleanValue = value.replace(/\s+/g, '');

    // Check for email pattern
    if (value.includes('@') && value.includes('.')) {
      onUpdate('contactType', 'email');
    }
    // Check for phone pattern (digits, +, -, spaces, parentheses)
    else if (/^[\+]?[\d\s\-\(\)]+$/.test(value) && cleanValue.length >= 10) {
      onUpdate('contactType', 'phone');
    }
    // If user starts typing numbers, assume phone
    else if (/^\d/.test(cleanValue)) {
      onUpdate('contactType', 'phone');
    }
    // If user starts typing letters or @, assume email
    else if (/^[a-zA-Z@]/.test(cleanValue)) {
      onUpdate('contactType', 'email');
    }
  };

  // Simulate availability check
  useEffect(() => {
    if (contact && contact.length > 3) {
      setIsValidating(true);
      setValidationStatus('checking');

      const timer = setTimeout(() => {
        // Simulate API call - always available for demo
        const isAvailable = true; // Always available for demo purposes
        setValidationStatus(isAvailable ? 'available' : 'taken');
        setIsValidating(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setValidationStatus('idle');
    }
  }, [contact]);

  const handleContactChange = (value) => {
    onUpdate('contact', value);
    detectContactType(value);
  };

  const isFormValid = firstName.trim() && lastName.trim() && contact.trim() && !errors.firstName && !errors.lastName && !errors.contact && validationStatus === 'available';

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
        <div className="relative bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-6 sm:p-8 shadow-lg backdrop-blur-sm">
          {/* Progress Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div className="w-16 h-1 bg-[rgb(var(--color-border-primary))] mx-2"></div>
                <div className="w-8 h-8 bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div className="w-16 h-1 bg-[rgb(var(--color-border-primary))] mx-2"></div>
                <div className="w-8 h-8 bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
              </div>
            </div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Step 1 of 3</p>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2 text-center">
            Nice to meet you! 👋
          </h2>
          <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))] mb-6 text-center">
            Let's start with some basic information
          </p>

      <div className="space-y-4 sm:space-y-6">
        {/* First Name */}
        <div>
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(value) => onUpdate('firstName', value)}
            leftIcon={User}
            error={errors.firstName}
            autoFocus
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(value) => onUpdate('lastName', value)}
            leftIcon={User}
            error={errors.lastName}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Smart Contact Field */}
        <div>
          {/* Contact Type Indicator */}
          {contact && (
            <div className="mb-2">
              <div className="flex items-center justify-start">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${contactType === 'email'
                  ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
                  : 'bg-green-600 text-white dark:bg-green-600 dark:text-white'
                  }`}>
                  {contactType === 'email' ? (
                    <>
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </>
                  ) : (
                    <>
                      <Phone className="w-3 h-3 mr-1" />
                      Phone
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <Input
            type={contactType === 'email' ? 'email' : 'tel'}
            placeholder={contactType === 'email' ? 'your@email.com' : '+91 98765 43210'}
            value={contact}
            onChange={handleContactChange}
            leftIcon={contactType === 'email' ? Mail : Phone}
            error={errors.contact}
            rightElement={
              <div>
                {isValidating && (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                {validationStatus === 'available' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {validationStatus === 'taken' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            }
            className={
              validationStatus === 'available' ? 'border-green-500 bg-green-50' :
                validationStatus === 'taken' ? 'border-red-500 bg-red-50' :
                  ''
            }
          />

          {/* Helper Text */}
          <div className="mt-2">
            {validationStatus === 'available' && (
              <p className="text-green-600 text-sm flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Great! This {contactType} is available
              </p>
            )}
            {validationStatus === 'taken' && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                This {contactType} is already registered
              </p>
            )}
            {validationStatus === 'idle' && (
              <p className="text-[rgb(var(--color-text-secondary))] text-sm text-left">
                Enter your email or phone number - we'll detect the type automatically
              </p>
            )}
            {errors.contact && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.contact}
              </p>
            )}
          </div>
        </div>
      </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
            <button onClick={onBack} className="px-6 py-3 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-all duration-500 ease-in-out cursor-pointer flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            <button
              onClick={onNext}
              disabled={!isFormValid}
              className={`px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-500 ease-in-out w-full sm:w-auto flex items-center justify-center bg-[rgb(var(--color-primary))] text-white ${isFormValid
                ? 'hover:opacity-90 hover:shadow-lg cursor-pointer'
                : 'opacity-70 cursor-not-allowed'
                }`}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;