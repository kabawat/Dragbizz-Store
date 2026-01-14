"use client"
import React, { useState } from 'react';
import WelcomeScreen from '@/components/auth/WelcomeScreen';
import BasicInfoStep from '@/components/auth/BasicInfoStep';
import PasswordStep from '@/components/auth/PasswordStep';
import VerificationStep from '@/components/auth/VerificationStep';
import SuccessScreen from '@/components/auth/SuccessScreen';
import { AnimatedBackground } from '@/components/ui';
import { authService } from '@/service/auth';
import { useLocation } from '@/app/LocationProvider';
import { useTranslation } from '@/hooks/useTranslation';

export default function Register() {
  const { t } = useTranslation();
  // Get location from context
  const { userLocation } = useLocation();

  const [currentState, setCurrentState] = useState('welcome');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    contactType: 'email',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationToken, setRegistrationToken] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateBasicInfo = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('auth.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.lastNameRequired');
    }

    if (!formData.contact.trim()) {
      newErrors.contact = t('auth.emailOrPhoneRequired');
    } else if (formData.contactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact)) {
        newErrors.contact = t('auth.validEmailAddress');
      }
    } else if (formData.contactType === 'phone') {
      // More flexible phone validation - accepts various formats
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      const cleanPhone = formData.contact.replace(/\D/g, '');

      if (!phoneRegex.test(formData.contact)) {
        newErrors.contact = t('auth.validPhoneNumber');
      } else if (cleanPhone.length < 10) {
        newErrors.contact = t('auth.phoneMustBe10Digits');
      } else if (cleanPhone.length > 15) {
        newErrors.contact = t('auth.phoneTooLong');
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

  const handlePasswordNext = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        identifier: formData.contact,
        pwds: formData.password
      };

      // Call the registration API
      const result = await authService.register(registrationData);

      if (result.success) {
        setRegistrationToken(result.token);
        setCurrentState('verification');
      } else {
        setErrors({
          general: result.message || t('auth.registrationFailed')
        });
      }
    } catch (error) {
      setErrors({
        general: t('auth.unexpectedErrorOccurred')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = (token) => {
    setAuthToken(token);
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
    // Redirect to agency creation instead of showing complete state
    window.location.href = '/onboarding/agency';
  };

  if (currentState === 'welcome') {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  if (currentState === 'success') {
    return (
      <SuccessScreen
        firstName={formData.firstName}
        onContinue={handleSuccessContinue}
        authToken={authToken}
      />
    );
  }

  if (currentState === 'complete') {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
        <AnimatedBackground variant="success" />
        <div className="relative bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-6 sm:p-8 shadow-lg backdrop-blur-sm w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">🚀</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))] mb-6">
            Welcome to your new account, {formData.firstName}! Start exploring all the amazing features we have to offer.
          </p>
          <div className="flex flex-col gap-3">
            <button className="w-full bg-[rgb(var(--color-primary))] text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-all duration-500 ease-in-out cursor-pointer">
              Explore Features
            </button>
            <button className="w-full border-2 border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] py-3 px-6 rounded-xl font-semibold bg-transparent hover:bg-[rgb(var(--color-bg-secondary))] transition-all duration-500 ease-in-out cursor-pointer">
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden" data-register-page>
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
          isLoading={isLoading}
          errors={errors}
        />
      )}

      {currentState === 'verification' && (
        <VerificationStep
          contactType={formData.contactType}
          contact={formData.contact}
          firstName={formData.firstName}
          onVerificationComplete={handleVerificationComplete}
          onChangeContact={handleChangeContact}
          registrationToken={registrationToken}
          registrationData={formData}
          onTokenUpdate={setRegistrationToken}
        />
      )}
    </div>
  );
}
