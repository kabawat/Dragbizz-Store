"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Github, Chrome, Phone, CheckCircle, MessageSquare, RefreshCw, Edit3 } from 'lucide-react';
import { Input, AnimatedBackground } from '@/components/ui';
import { authService } from '@/service/auth';
import { cookieManager } from '@/utils/cookieManager';
import { useLocation } from '@/app/(auth)/layout';
import { handleApiError } from '@/utils/errorHandler';
import LoginSuccessScreen from '@/components/auth/LoginSuccessScreen';
import Link from 'next/link';
import styles from '../style/Login.module.scss';

export default function Login() {
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
      console.log('Login result:', result);

      if (result.success) {
        console.log('Login successful');
        // Save authentication token
        if (result.data.token) {
          console.log('Auth service token received');
          
          // Set success data and show success screen
          setSuccessData({
            firstName: result.data.user?.firstName || 'User',
            authToken: result.data.token
          });
          setShowSuccessScreen(true);
        }
      } else {
        console.log('Login failed, setting error:', result.message);
        setErrors({ general: result.message || 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
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
        // Store the verification token
        setLoginToken(result.token);
        setOtpSent(true);
        setTimeLeft(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '']);
        setErrors(prev => ({ ...prev, otp: '' }));
        console.log(`OTP sent to ${contactType}: ${formData.contact}`);
      } else {
        setErrors(prev => ({ ...prev, otp: result.message || 'Failed to send OTP. Please try again.' }));
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setErrors(prev => ({ ...prev, otp: handleApiError(error, 'otp-send') }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

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
      handleOtpVerification(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerification = async (code) => {
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
      setErrors(prev => ({ ...prev, otp: result.message || 'Failed to resend OTP. Please try again.' }));
      console.log('OTP verification result:', result);
      if (result.success) {
        console.log('OTP verified successfully');
        // Save authentication token
        if (result.data.token) {
          console.log('Auth service token received');
          
          // Set success data and show success screen
          setSuccessData({
            firstName: result.data.user?.firstName || 'User',
            authToken: result.data.token
          });
          setShowSuccessScreen(true);
        }
      } else {
        setErrors(prev => ({ ...prev, otp: result.message || 'Invalid OTP. Please try again.' }));
        setOtpDigits(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrors(prev => ({ ...prev, otp: handleApiError(error, 'otp') }));
      setOtpDigits(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
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
        // Update the verification 
        setLoginToken(result.token);
        setCanResend(false);
        setTimeLeft(60);
        setOtpDigits(['', '', '', '', '']);
        setErrors(prev => ({ ...prev, otp: '' }));
        inputRefs.current[0]?.focus();
      } else {
        setErrors(prev => ({ ...prev, otp: result.message || 'Failed to resend OTP. Please try again.' }));
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
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
    console.log(`Login with ${provider}`);
    // Handle social login logic here
  };

  // Show success screen if login was successful
  if (showSuccessScreen && successData) {
    return (
      <LoginSuccessScreen
        firstName={successData.firstName}
        authToken={successData.authToken}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
      <AnimatedBackground variant="login" />
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
        <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-6 sm:p-8 shadow-lg backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Sign in to your account to continue
            </p>
          </div>

          {/* Social Login Buttons - Only show when OTP not sent */}
          {!otpSent && (
            <>
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-3 p-3 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors cursor-pointer"
                >
                  <Chrome className="w-5 h-5 text-red-500" />
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => handleSocialLogin('github')}
                  className="w-full flex items-center justify-center gap-3 p-3 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors cursor-pointer"
                >
                  <Github className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgb(var(--color-border-primary))]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-secondary))]">
                    Or continue with email/phone
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                {validationStatus === 'idle' && (
                  <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                    Enter your email or phone number
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

            {/* Password Field - Only show when password method is selected */}
            {loginMethod === 'password' && (
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

                {/* OTP Option Checkbox - Below password field, only show when OTP not sent */}
                {!otpSent && (
                  <div className="mt-3">
                    <label className="flex items-center text-sm text-[rgb(var(--color-text-secondary))] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loginMethod === 'otp'}
                        onChange={toggleLoginMethod}
                        className="mr-2 rounded border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                      />
                      Login with OTP instead of password
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Send OTP Button - Only show when OTP method is selected and OTP not sent yet */}
            {loginMethod === 'otp' && !otpSent && (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoading || !formData.contact.trim()}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center bg-[rgb(var(--color-primary))] text-white ${
                  isLoading || !formData.contact.trim() ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending OTP...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Send OTP to {contactType}
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
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 bg-[rgb(var(--color-primary))] text-white ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            )}
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-[rgb(var(--color-text-secondary))]">
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
            <div className="text-center mt-4">
              <Link
                href="/forgot-password"
                className="text-[rgb(var(--color-primary))] hover:underline text-sm"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

