import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '../common';

interface BasicInfoStepProps {
  firstName: string;
  lastName: string;
  contact: string;
  contactType: 'email' | 'phone';
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
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
  const [validationStatus, setValidationStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Smart contact detection
  const detectContactType = (value: string) => {
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
        // Simulate API call
        const isAvailable = Math.random() > 0.3; // 70% chance available
        setValidationStatus(isAvailable ? 'available' : 'taken');
        setIsValidating(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setValidationStatus('idle');
    }
  }, [contact]);

  const handleContactChange = (value: string) => {
    onUpdate('contact', value);
    detectContactType(value);
  };

  const isFormValid = firstName.trim() && lastName.trim() && contact.trim() && !errors.firstName && !errors.lastName && !errors.contact && validationStatus === 'available';

  return (
    <div className="animate-slide-in transition-all duration-700 ease-in-out">
      {/* Progress Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="w-16 h-1 bg-gray-200 mx-2"></div>
            <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="w-16 h-1 bg-gray-200 mx-2"></div>
            <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">Step 1 of 3</p>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center">
        Nice to meet you! 👋
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center">
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
              <div className="flex items-center justify-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  contactType === 'email' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
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
              <p className="text-gray-500 text-sm text-center">
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
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6 sm:mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-500 ease-in-out cursor-pointer"
        >
          ← Back
        </button>
        
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-500 ease-in-out w-full sm:w-auto ${
            isFormValid
              ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default BasicInfoStep;