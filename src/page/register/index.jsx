"use client"
import React, { useState } from 'react';
import WelcomeScreen from '@/components/auth/WelcomeScreen';
import BasicInfoStep from '@/components/auth/BasicInfoStep';
import PasswordStep from '@/components/auth/PasswordStep';
import VerificationStep from '@/components/auth/VerificationStep';
import SuccessScreen from '@/components/auth/SuccessScreen';
import { AnimatedBackground } from '@/components/ui';
import { authService } from '@/service/auth';
import { useLocation } from '@/app/(auth)/layout';
import styles from '@/page/style/Register.module.scss';

export default function Register() {
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
          general: result.message || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        general: 'An unexpected error occurred. Please try again.'
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
        authToken={authToken}
      />
    );
  }

  if (currentState === 'complete') {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardCard}>
          <div className={styles.dashboardIcon}>
            <span className={styles.dashboardIconText}>🚀</span>
          </div>
          <h1 className={styles.dashboardHeading}>Dashboard</h1>
          <p className={styles.dashboardDescription}>
            Welcome to your new account, {formData.firstName}! Start exploring all the amazing features we have to offer.
          </p>
          <div className={styles.dashboardButtons}>
            <button className={styles.exploreButton}>
              Explore Features
            </button>
            <button className={styles.profileButton}>
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AnimatedBackground variant="register" />
      <div className={styles.card}>
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
    </div>
  );
}
