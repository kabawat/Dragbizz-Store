"use client"
import React, { useState } from 'react';
import WelcomeScreen from '@/components/auth/WelcomeScreen';
import BasicInfoStep from '@/components/auth/BasicInfoStep';
import PasswordStep from '@/components/auth/PasswordStep';
import VerificationStep from '@/components/auth/VerificationStep';
import SuccessScreen from '@/components/auth/SuccessScreen';
import { AnimatedBackground } from '@/components/ui';

export default function Register() {
  const [currentState, setCurrentState] = useState('success');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    contactType: 'email',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateBasicInfo = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Email or phone number is required';
    } else if (formData.contactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact)) {
        newErrors.contact = 'Please enter a valid email address';
      }
    } else if (formData.contactType === 'phone') {
      // More flexible phone validation - accepts various formats
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      const cleanPhone = formData.contact.replace(/\D/g, '');

      if (!phoneRegex.test(formData.contact)) {
        newErrors.contact = 'Please enter a valid phone number';
      } else if (cleanPhone.length < 10) {
        newErrors.contact = 'Phone number must be at least 10 digits';
      } else if (cleanPhone.length > 15) {
        newErrors.contact = 'Phone number is too long';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetStarted = () => {
    setCurrentState('basic-info');
  };

  const handleBasicInfoNext = () => {
    if (validateBasicInfo()) {
      setCurrentState('password');
    }
  };

  const handlePasswordNext = () => {
    setCurrentState('verification');
  };

  const handleVerificationComplete = () => {
    setCurrentState('success');
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
  };

  const handleBackToBasicInfo = () => {
    setCurrentState('basic-info');
  };

  const handleChangeContact = () => {
    setCurrentState('basic-info');
  };

  const handleSuccessContinue = () => {
    setCurrentState('complete');
  };

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
    // Handle social login logic here
    // For now, just show a message
    alert(`Social login with ${provider} - This would integrate with OAuth providers`);
  };

  if (currentState === 'welcome') {
    return <WelcomeScreen onGetStarted={handleGetStarted} onSocialLogin={handleSocialLogin} />;
  }

  if (currentState === 'success') {
    return (
      <SuccessScreen
        firstName={formData.firstName}
        onContinue={handleSuccessContinue}
      />
    );
  }

  if (currentState === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl text-center transition-all duration-700 ease-in-out">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">🚀</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Welcome to your new account, {formData.firstName}! Start exploring all the amazing features we have to offer.
          </p>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transition-all duration-500 ease-in-out cursor-pointer">
              Explore Features
            </button>
            <button className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-500 ease-in-out cursor-pointer">
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      <AnimatedBackground variant="register" />
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl transition-all duration-700 ease-in-out">
        {currentState === 'basic-info' && (
          <BasicInfoStep
            firstName={formData.firstName}
            lastName={formData.lastName}
            contact={formData.contact}
            contactType={formData.contactType}
            onUpdate={updateFormData}
            onNext={handleBasicInfoNext}
            onBack={handleBackToWelcome}
            errors={errors}
          />
        )}

        {currentState === 'password' && (
          <PasswordStep
            password={formData.password}
            onUpdate={updateFormData}
            onNext={handlePasswordNext}
            onBack={handleBackToBasicInfo}
            firstName={formData.firstName}
          />
        )}

        {currentState === 'verification' && (
          <VerificationStep
            contactType={formData.contactType}
            contact={formData.contact}
            firstName={formData.firstName}
            onVerificationComplete={handleVerificationComplete}
            onChangeContact={handleChangeContact}
          />
        )}
      </div>
    </div>
  );
}
