import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';

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
    if (value.includes('@')) {
      onUpdate('contactType', 'email');
    } else if (/^\d+$/.test(value.replace(/\s+/g, ''))) {
      onUpdate('contactType', 'phone');
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
    <div className="animate-slide-in">
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

      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Nice to meet you! 👋
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Let's start with some basic information
      </p>

      <div className="space-y-6">
        {/* First Name */}
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => onUpdate('firstName', e.target.value)}
              autoFocus
              className={`w-full pl-10 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => onUpdate('lastName', e.target.value)}
              className={`w-full pl-10 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Smart Contact Field */}
        <div>
          <div className="relative">
            {contactType === 'email' ? (
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            ) : (
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            )}
            <input
              type={contactType === 'email' ? 'email' : 'tel'}
              placeholder={contactType === 'email' ? 'your@email.com' : '+91 98765 43210'}
              value={contact}
              onChange={(e) => handleContactChange(e.target.value)}
              className={`w-full pl-10 pr-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.contact ? 'border-red-500 bg-red-50' : 
                validationStatus === 'available' ? 'border-green-500 bg-green-50' :
                validationStatus === 'taken' ? 'border-red-500 bg-red-50' :
                'border-gray-200 focus:border-blue-500'
              }`}
            />
            
            {/* Validation Status Icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
          </div>
          
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
              <p className="text-gray-500 text-sm">
                We'll use this to keep your account secure
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
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          ← Back
        </button>
        
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
            isFormValid
              ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 active:scale-95'
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