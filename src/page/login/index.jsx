"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Github, Chrome, Phone, CheckCircle, MessageSquare, RefreshCw, Edit3 } from 'lucide-react';
import { Input, AnimatedBackground } from '@/components/ui';
import Link from 'next/link';
import styles from '@/page/style/Login.module.scss';

export default function Login() {
  const [formData, setFormData] = useState({
    contact: '',
    password: '',
    otp: ''
  });
  const [contactType, setContactType] = useState('email');
  const [loginMethod, setLoginMethod] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState('idle');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');
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
        // Simulate API call to check if contact exists - always valid for demo
        const isValid = true; // Always valid for demo purposes
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle login logic here
      console.log('Login data:', { ...formData, contactType, loginMethod });
    }, 1500);
  };

  const handleSendOTP = async () => {
    if (!formData.contact.trim()) {
      setErrors({ contact: 'Email or phone number is required' });
      return;
    }

    setIsLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setTimeLeft(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '']);
      setOtpError('');
      console.log(`OTP sent to ${contactType}: ${formData.contact}`);
      // In real app, this would send OTP via email/SMS
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);
    setOtpError('');

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
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      if (code === '12345') { // Demo code - same as registration
        console.log('OTP verified successfully');
        // Handle successful login
      } else {
        setOtpError('Invalid OTP. Please try again.');
        setOtpDigits(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }, 1500);
  };

  const handleResendOTP = () => {
    if (!canResend) return;
    setCanResend(false);
    setTimeLeft(60);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    handleSendOTP();
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
    setErrors(prev => ({ ...prev, password: '', otp: '' }));
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setTimeLeft(60);
    setCanResend(false);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // Handle social login logic here
  };

  return (
    <div className={styles.container}>
      <AnimatedBackground variant="login" />
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className={styles.mainHeading}>
            Welcome back! 👋
          </h1>
          <p className={styles.subHeading}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Social Login Buttons - Only show when OTP not sent */}
        {!otpSent && (
          <>
            <div className={styles.socialButtons}>
              <button
                onClick={() => handleSocialLogin('google')}
                className={styles.socialButton}
              >
                <Chrome className={styles.googleIcon} />
                <span className={styles.socialButtonText}>Continue with Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('github')}
                className={styles.socialButton}
              >
                <Github className={styles.githubIcon} />
                <span className={styles.socialButtonText}>Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <div className={styles.dividerText}>
                <span>Or continue with email/phone</span>
              </div>
            </div>
          </>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Contact Type Indicator - Only show when OTP not sent */}
          {formData.contact && !otpSent && (
            <div className={styles.contactTypeIndicator}>
              <div className="flex items-center justify-start">
                <div className={`${styles.contactTypeBadge} ${contactType === 'email' ? styles.contactTypeBadgeEmail : styles.contactTypeBadgePhone}`}>
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
              <div className={styles.helperText}>
                {validationStatus === 'valid' && (
                  <p className={styles.helperTextValid}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Account found
                  </p>
                )}
                {validationStatus === 'invalid' && (
                  <p className={styles.helperTextInvalid}>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    No account found with this {contactType}
                  </p>
                )}
                {validationStatus === 'idle' && (
                  <p className={styles.helperTextIdle}>
                    Enter your email or phone number
                  </p>
                )}
                {errors.contact && (
                  <p className={styles.helperTextError}>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.contact}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Password Field - Only show when password method is selected */}
          {loginMethod === 'password' && (
            <div className={styles.passwordField}>
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
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                error={errors.password}
              />
              {errors.password && (
                <p className={styles.helperTextError}>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}

              {/* OTP Option Checkbox - Below password field, only show when OTP not sent */}
              {!otpSent && (
                <div className={styles.otpOption}>
                  <label className={styles.otpLabel}>
                    <input
                      type="checkbox"
                      checked={loginMethod === 'otp'}
                      onChange={toggleLoginMethod}
                      className={styles.otpCheckbox}
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
              className={`${styles.sendOtpButton} ${isLoading || !formData.contact.trim() ? styles.sendOtpButtonDisabled : styles.sendOtpButtonEnabled}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className={styles.sendOtpLoading} />
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
                        className={`${styles.otpInput} ${otpError ? styles.otpInputError : ''}`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className={styles.otpError}>
                      <p className={styles.otpErrorMessage}>
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {otpError}
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



          {/* Submit Button - Only show for password method */}
          {loginMethod === 'password' && (
            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.submitButton} ${isLoading ? styles.submitButtonDisabled : styles.submitButtonEnabled}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className={styles.submitButtonLoading} />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          )}
        </form>

        {/* Sign Up Link */}
        <div className={styles.signUpSection}>
          <p className={styles.signUpText}>
            Don't have an account?{' '}
            <Link
              href="/register"
              className={styles.signUpLink}
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Forgot Password - Only show for password method */}
        {loginMethod === 'password' && (
          <div className={styles.forgotPasswordSection}>
            <Link
              href="/forgot-password"
              className={styles.forgotPasswordLink}
            >
              Forgot your password?
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
