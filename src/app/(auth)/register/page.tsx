"use client"
import React, { useState } from 'react';
import WelcomeScreen from '@/components/auth/WelcomeScreen';
import BasicInfoStep from '@/components/auth/BasicInfoStep';
import PasswordStep from '@/components/auth/PasswordStep';
import VerificationStep from '@/components/auth/VerificationStep';
import SuccessScreen from '@/components/auth/SuccessScreen';

type AppState = 'welcome' | 'basic-info' | 'password' | 'verification' | 'success' | 'complete';

interface FormData {
  firstName: string;
  lastName: string;
  contact: string;
  contactType: 'email' | 'phone';
  password: string;
}

function App() {
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    contact: '',
    contactType: 'email',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateBasicInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = `${formData.contactType === 'email' ? 'Email' : 'Phone'} is required`;
    } else if (formData.contactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact)) {
        newErrors.contact = 'Please enter a valid email address';
      }
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.contact.replace(/\D/g, ''))) {
        newErrors.contact = 'Please enter a valid 10-digit phone number';
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

  if (currentState === 'welcome') {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
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
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Welcome to your new account, {formData.firstName}! Start exploring all the amazing features we have to offer.
          </p>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105">
              Explore Features
            </button>
            <button className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200">
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
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

export default App;