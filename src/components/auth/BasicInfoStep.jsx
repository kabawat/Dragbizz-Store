"use client"
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, AlertCircle, CheckCircle, ArrowLeft, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { Input, AnimatedBackground, AnimatedGridPattern } from '../ui';

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
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="register" />
      <AnimatedGridPattern opacity={30} blur={1} gridSize={80} />
      
      {/* Full width wrapper */}
      <div className="w-full min-h-screen flex relative z-10">
        {/* Left Side - Welcome Content */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center">
          {/* Container with max-width 1200px for content */}
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center relative z-10 pl-4 sm:pl-6 lg:pl-8 xl:pl-10">
            {/* Content */}
            <div className="flex flex-col justify-center xl:pl-35 pr-8 xl:pr-22 py-12 w-full max-w-full">
              <div className="mb-8">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-300/30">
                  <Shield className="w-8 h-8 text-indigo-700" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
                  Let's get started! 🚀
                </h1>
                <p className="text-xl text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                  We just need a few details to create your account
                </p>
              </div>

              {/* Features List */}
              <div className="mt-16 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <User className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">Quick Setup</h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">Just your name and contact information</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Zap className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">Smart Detection</h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">We automatically detect email or phone</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Users className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">Secure & Private</h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">Your information is always protected</p>
                  </div>
                </div>
              </div>

              {/* Bottom Text */}
              <div className="mt-auto pt-8">
                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                  © 2025 DragBizz. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
          {/* Container with max-width 1200px for content */}
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div className="w-full max-w-xl bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-lg p-8 sm:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                  DragBizz Store
                </h1>
              </div>

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-1 sm:mb-2">
                  Nice to meet you! 👋
                </h1>
                <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
                  Let's start with some basic information
                </p>
                
                {/* Progress Indicator */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    1
                  </div>
                  <div className="w-8 h-1 bg-[rgb(var(--color-border-primary))]"></div>
                  <div className="w-6 h-6 bg-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] rounded-full flex items-center justify-center text-xs font-semibold">
                    2
                  </div>
                  <div className="w-8 h-1 bg-[rgb(var(--color-border-primary))]"></div>
                  <div className="w-6 h-6 bg-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] rounded-full flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                </div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-2">Step 1 of 3</p>
              </div>

              {/* Form */}
              <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-3 sm:space-y-4">
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
                      <p className="text-green-600 dark:text-green-400 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Great! This {contactType} is available
                      </p>
                    )}
                    {validationStatus === 'taken' && (
                      <p className="text-red-500 dark:text-red-400 text-sm flex items-center">
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

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6">
                  <button 
                    type="button"
                    onClick={onBack} 
                    className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 w-full sm:w-auto flex items-center justify-center bg-[rgb(var(--color-primary))] text-white shadow-md hover:shadow-lg ${isFormValid
                      ? 'hover:brightness-[1.01] cursor-pointer'
                      : 'opacity-70 cursor-not-allowed'
                      }`}
                  >
                    Continue
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;