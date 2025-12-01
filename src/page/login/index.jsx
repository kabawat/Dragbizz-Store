"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Github, Chrome, Phone, CheckCircle, MessageSquare, RefreshCw, Edit3, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import { Input, AnimatedBackground, AnimatedGridPattern, Button } from '@/components/ui';
import { authService } from '@/service/auth';
import { cookieManager } from '@/utils/cookieManager';
import { useLocation } from '@/app/LocationProvider';
import { handleApiError } from '@/utils/errorHandler';
import LoginSuccessScreen from '@/components/auth/LoginSuccessScreen';
import Link from 'next/link';
import styles from '../style/Login.module.scss';

export default function Login() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';
  // Get location from context
  const { userLocation } = useLocation();

  const [formData, setFormData] = useState({
    contact: '',
    password: '',
    otp: ''
  });
  const [contactType, setContactType] = useState('email');
  const [loginMethod, setLoginMethod] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState('idle');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loginToken, setLoginToken] = useState(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errors, setErrors] = useState({
    contact: '',
    password: '',
    otp: '',
    general: ''
  });
  const inputRefs = useRef([]);
  const isVerifyingRef = useRef(false); // Guard to prevent duplicate API calls

  // OTP Timer Effect
  useEffect(() => {
    if (otpSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [otpSent, timeLeft]);

  // Smart contact detection
  const detectContactType = (value) => {
    const cleanValue = value.replace(/\s+/g, '');

    // Check for email pattern
    if (value.includes('@') && value.includes('.')) {
      setContactType('email');
    }
    // Check for phone pattern (digits, +, -, spaces, parentheses)
    else if (/^[\+]?[\d\s\-\(\)]+$/.test(value) && cleanValue.length >= 10) {
      setContactType('phone');
    }
    // If user starts typing numbers, assume phone
    else if (/^\d/.test(cleanValue)) {
      setContactType('phone');
    }
    // If user starts typing letters or @, assume email
    else if (/^[a-zA-Z@]/.test(cleanValue)) {
      setContactType('email');
    }
  };

  // Simulate contact validation
  useEffect(() => {
    if (formData.contact && formData.contact.length > 3) {
      setIsValidating(true);
      setValidationStatus('checking');

      const timer = setTimeout(() => {
        const isValid = true;
        setValidationStatus(isValid ? 'valid' : 'invalid');
        setIsValidating(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setValidationStatus('idle');
    }
  }, [formData.contact]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear specific field error and general error when user starts typing
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    }

    if (field === 'contact') {
      detectContactType(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contact.trim()) {
      newErrors.contact = 'Email or phone number is required';
    } else if (contactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact)) {
        newErrors.contact = 'Please enter a valid email address';
      }
    } else if (contactType === 'phone') {
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

    if (loginMethod === 'password') {
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (loginMethod === 'otp') {
      if (!formData.otp.trim()) {
        newErrors.otp = 'OTP is required';
      } else if (formData.otp.length !== 5) {
        newErrors.otp = 'OTP must be 5 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Call login API with password
      const loginData = {
        identifier: formData.contact,
        password: formData.password,
        useOtp: false,
        deviceId: 'web_device_' + Date.now(),
        platform: 'web',
        deviceToken: '',
        location: userLocation
      };

      const result = await authService.login(loginData);

      if (result.success) {
        // Save authentication tokens
        if (result.data.token) {
          // Set success data and show success screen
          setSuccessData({
            firstName: result.data.user?.firstName || 'User',
            authToken: result.data.token,
            refreshToken: result.data.refreshToken || null
          });
          setShowSuccessScreen(true);
        }
      } else {
        setErrors({ general: result.message || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: handleApiError(error, 'login') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.contact.trim()) {
      setErrors({ contact: 'Email or phone number is required' });
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, otp: '' }));

    try {
      // Call login API with OTP option
      const loginData = {
        identifier: formData.contact,
        password: '', // Empty for OTP login
        useOtp: true,
        deviceId: 'web_device_' + Date.now(),
        platform: 'web',
        deviceToken: '',
        location: userLocation
      };

      const result = await authService.sendOTP(loginData);

      if (result.success) {
        const token = result.data?.token;
        if (!token) {
          setErrors(prev => ({ ...prev, otp: 'Failed to receive verification token. Please try again.' }));
          return;
        }
        setLoginToken(token);
        setOtpSent(true);
        setTimeLeft(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '']);
        setErrors(prev => ({ ...prev, otp: '' }));
      } else {
        setErrors(prev => ({ ...prev, otp: result.message || 'Failed to send OTP. Please try again.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, otp: handleApiError(error, 'otp-send') }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    // Prevent changes if verification is in progress
    if (isVerifyingRef.current || isLoading) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    // Clear OTP error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '')) {
      const otpCode = newOtp.join('');
      handleOtpVerification(otpCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerification = async (code) => {
    // Prevent duplicate API calls
    if (isVerifyingRef.current || isLoading) {
      return;
    }

    if (!loginToken) {
      setErrors(prev => ({ ...prev, otp: 'OTP session expired. Please request a new OTP.' }));
      setOtpSent(false);
      setOtpDigits(['', '', '', '', '']);
      return;
    }

    // Set guard flag
    isVerifyingRef.current = true;
    setIsLoading(true);
    setErrors(prev => ({ ...prev, otp: '' }));

    try {
      // Call OTP verification API
      const verifyData = {
        code: code,
        token: loginToken,
        deviceId: 'web_device_' + Date.now(),
        platform: 'web',
        deviceToken: '',
        location: userLocation
      };

      const result = await authService.verifyLoginOTP(verifyData);
      if (result.success) {
        // Save authentication tokens - same structure as password login
        if (result.data.token) {
          // Set success data and show success screen
          setSuccessData({
            firstName: result.data.user?.firstName || 'User',
            authToken: result.data.token,
            refreshToken: result.data.refreshToken || null
          });
          setShowSuccessScreen(true);
        } else {
          setErrors(prev => ({ ...prev, otp: 'Login successful but token not received. Please try again.' }));
          setOtpDigits(['', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      } else {
        setErrors(prev => ({ ...prev, otp: result.message || 'Invalid OTP. Please try again.' }));
        setOtpDigits(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, otp: handleApiError(error, 'otp') }));
      setOtpDigits(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
      isVerifyingRef.current = false; // Reset guard flag
    }
  };

  const handleChangeContact = () => {
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '']);
    setLoginToken(null);
    setTimeLeft(60);
    setCanResend(false);
    setErrors({ contact: '', password: '', otp: '', general: '' });
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setErrors(prev => ({ ...prev, otp: '' }));

    try {
      const loginData = {
        identifier: formData.contact,
        password: '',
        useOtp: true,
        deviceId: 'web_device_' + Date.now(),
        platform: 'web',
        deviceToken: '',
        location: userLocation
      };

      const result = await authService.sendOTP(loginData);

      if (result.success) {
        // Update the verification token - same structure as other responses
        const token = result.data?.token;
        if (!token) {
          setErrors(prev => ({ ...prev, otp: 'Failed to receive verification token. Please try again.' }));
          return;
        }
        setLoginToken(token);
        setCanResend(false);
        setTimeLeft(60);
        setOtpDigits(['', '', '', '', '']);
        setErrors(prev => ({ ...prev, otp: '' }));
        inputRefs.current[0]?.focus();
      } else {
        setErrors(prev => ({ ...prev, otp: result.message || 'Failed to resend OTP. Please try again.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, otp: handleApiError(error, 'otp-resend') }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatContact = (contact, type) => {
    if (type === 'email') {
      const [username, domain] = contact.split('@');
      if (username.length <= 3) return contact;
      return `${username.slice(0, 2)}***@${domain}`;
    } else {
      if (contact.length <= 6) return contact;
      return `${contact.slice(0, 3)}***${contact.slice(-2)}`;
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(prev => prev === 'password' ? 'otp' : 'password');
    // Clear related fields when switching
    setFormData(prev => ({ ...prev, password: '', otp: '' }));
    setErrors({ contact: '', password: '', otp: '', general: '' });
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '']);
    setTimeLeft(60);
    setCanResend(false);
  };

  const handleSocialLogin = (provider) => {
    // Handle social login logic here
  };

  // Show success screen if login was successful
  if (showSuccessScreen && successData) {
    return (
      <LoginSuccessScreen
        firstName={successData.firstName}
        authToken={successData.authToken}
        refreshToken={successData.refreshToken}
        redirectUrl={redirectUrl}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden" data-login-page>
      {/* Animated Background */}
      <AnimatedBackground variant="login" />
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
                <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                  Welcome to DragBizz Store
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  Manage your store with powerful tools and insights
                </p>
              </div>

              {/* Features List */}
              <div className="mt-16 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Zap className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Powerful Management</h3>
                    <p className="text-gray-600 text-sm">Complete control over inventory, orders, and customers</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <BarChart3 className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Analytics & Insights</h3>
                    <p className="text-gray-600 text-sm">Track performance with real-time analytics</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Users className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Secure Access</h3>
                    <p className="text-gray-600 text-sm">Enterprise-grade security for your store operations</p>
                  </div>
                </div>
              </div>

              {/* Bottom Text */}
              <div className="mt-auto pt-8">
                <p className="text-gray-600 text-sm">
                  © 2025 DragBizz. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
          {/* Container with max-width 1200px for content */}
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div className="w-full max-w-xl bg-[#fff] rounded-xl border border-[#e0e0e0]/40 p-8 sm:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                  DragBizz Store
                </h1>
              </div>

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-1 sm:mb-2">
                  Welcome back! 👋
                </h1>
                <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
                  Sign in to your account to continue
                </p>
              </div>


              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Contact Type Indicator - Only show when OTP not sent */}
                {formData.contact && !otpSent && (
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

                {/* Contact Field - Only show when OTP not sent */}
                {!otpSent && (
                  <div>
                    <Input
                      label="Enter your email or phone number"
                      type={contactType === 'email' ? 'email' : 'tel'}
                      placeholder={contactType === 'email' ? 'your@email.com' : '+91 98765 43210'}
                      value={formData.contact}
                      onChange={(value) => handleInputChange('contact', value)}
                      leftIcon={contactType === 'email' ? Mail : Phone}
                      error={errors.contact}
                      rightElement={
                        <div>
                          {isValidating && (
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          )}
                          {validationStatus === 'valid' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {validationStatus === 'invalid' && (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      }
                      className={
                        validationStatus === 'valid' ? 'border-green-500 bg-green-50' :
                          validationStatus === 'invalid' ? 'border-red-500 bg-red-50' :
                            ''
                      }
                    />

                    {/* Helper Text */}
                    <div className="mt-2">
                      {validationStatus === 'valid' && (
                        <p className="text-green-600 text-sm flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Account found
                        </p>
                      )}
                      {validationStatus === 'invalid' && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          No account found with this {contactType}
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
                )}

                {/* Login Method Toggle - Show when OTP not sent */}
                {!otpSent && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('password');
                          setFormData(prev => ({ ...prev, otp: '' }));
                          setErrors({ contact: '', password: '', otp: '', general: '' });
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${loginMethod === 'password'
                            ? 'bg-white text-[rgb(var(--color-primary))] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" />
                          <span>Password</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('otp');
                          setFormData(prev => ({ ...prev, password: '' }));
                          setErrors({ contact: '', password: '', otp: '', general: '' });
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${loginMethod === 'otp'
                            ? 'bg-white text-[rgb(var(--color-primary))] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>OTP</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Password Field - Only show when password method is selected */}
                {loginMethod === 'password' && !otpSent && (
                  <div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(value) => handleInputChange('password', value)}
                      leftIcon={Lock}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      }
                      error={errors.password}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm flex items-center mt-2">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}

                {/* Send OTP Button - Only show when OTP method is selected and OTP not sent yet */}
                {loginMethod === 'otp' && !otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading || !formData.contact.trim()}
                    className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center bg-[rgb(var(--color-primary))] text-white ${isLoading || !formData.contact.trim() ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
                      }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span className="text-sm sm:text-base">Sending OTP...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="text-sm sm:text-base">Send OTP to {contactType}</span>
                      </div>
                    )}
                  </button>
                )}

                {/* OTP Input Section - Only show when OTP is sent */}
                {loginMethod === 'otp' && otpSent && (
                  <div className={styles.otpSection}>
                    <div className={styles.otpHeader}>
                      <div className={styles.otpHeaderIcon}>
                        {contactType === 'email' ? (
                          <Mail className="w-8 h-8 text-blue-500" />
                        ) : (
                          <Phone className="w-8 h-8 text-blue-500" />
                        )}
                      </div>

                      <h2 className={styles.otpTitle}>
                        Almost there! 🎯
                      </h2>

                      <p className={styles.otpDescription}>
                        We've sent a 5-digit code to
                      </p>

                      <div className={styles.otpContactInfo}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`${styles.otpContactBadge} ${contactType === 'email' ? styles.otpContactBadgeEmail : styles.otpContactBadgePhone}`}>
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
                            <p className={styles.otpContactText}>
                              {formatContact(formData.contact, contactType)}
                            </p>
                          </div>
                          <button
                            onClick={handleChangeContact}
                            className="text-blue-500 hover:text-blue-600 transition-colors duration-200 p-1 cursor-pointer"
                            title="Change contact"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.otpInputSection}>
                      {/* OTP Input */}
                      <div>
                        <label className={styles.otpLabel}>
                          Enter verification code
                        </label>
                        <div className={styles.otpInputs}>
                          {otpDigits.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => {
                                if (el) inputRefs.current[index] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className={`${styles.otpInput} ${errors.otp ? styles.otpInputError : ''}`}
                              autoFocus={index === 0}
                            />
                          ))}
                        </div>

                        {errors.otp && (
                          <div className={styles.otpError}>
                            <p className={styles.otpErrorMessage}>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.otp}
                            </p>
                          </div>
                        )}

                        {isLoading && (
                          <div className={styles.otpLoading}>
                            <div className={styles.otpLoadingSpinner}></div>
                            <span className={styles.otpLoadingText}>Verifying...</span>
                          </div>
                        )}
                      </div>

                      {/* Resend Section */}
                      <div className={styles.resendSection}>
                        <p className={styles.resendText}>
                          Didn't receive the code?
                        </p>

                        {canResend ? (
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            className={styles.resendButton}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resend Code
                          </button>
                        ) : (
                          <p className={styles.resendTimer}>
                            Resend in {timeLeft}s
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}



                {/* General Error Display - Above submit button */}
                {errors.general && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-700 text-sm">{errors.general}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button - Only show for password method */}
                {loginMethod === 'password' && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 bg-[rgb(var(--color-primary))] text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
                      }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span className="text-sm sm:text-base">Signing in...</span>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base">Sign In</span>
                    )}
                  </button>
                )}
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="text-[rgb(var(--color-primary))] hover:underline font-medium"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>

              {/* Forgot Password - Only show for password method */}
              {loginMethod === 'password' && (
                <div className="text-center mt-3 sm:mt-4">
                  <Link
                    href="/forgot-password"
                    className="text-xs sm:text-sm text-[rgb(var(--color-primary))] hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

