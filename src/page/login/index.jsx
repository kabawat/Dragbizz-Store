"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Github, Chrome, Phone, CheckCircle, MessageSquare, RefreshCw, Edit3 } from 'lucide-react';
import { Input, AnimatedBackground } from '@/components/ui';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      <AnimatedBackground variant="login" />
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl transition-all duration-700 ease-in-out">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Social Login Buttons - Only show when OTP not sent */}
        {!otpSent && (
          <>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-500 ease-in-out hover:bg-gray-50 cursor-pointer"
              >
                <Chrome className="w-5 h-5 mr-3 text-red-500" />
                <span className="font-medium text-gray-700">Continue with Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('github')}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-500 ease-in-out hover:bg-gray-50 cursor-pointer"
              >
                <Github className="w-5 h-5 mr-3 text-gray-800" />
                <span className="font-medium text-gray-700">Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email/phone</span>
              </div>
            </div>
          </>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Contact Type Indicator - Only show when OTP not sent */}
          {formData.contact && !otpSent && (
            <div className="mb-2">
              <div className="flex items-center justify-start">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${contactType === 'email'
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
                  <p className="text-gray-500 text-sm text-left">
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
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                error={errors.password}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}

              {/* OTP Option Checkbox - Below password field, only show when OTP not sent */}
              {!otpSent && (
                <div className="flex items-center justify-start mt-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loginMethod === 'otp'}
                      onChange={toggleLoginMethod}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">
                      Login with OTP instead of password
                    </span>
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
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-500 ease-in-out ${isLoading || !formData.contact.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 hover:shadow-xl cursor-pointer'
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
            <div className="animate-slide-in transition-all duration-700 ease-in-out">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {contactType === 'email' ? (
                    <Mail className="w-8 h-8 text-blue-500" />
                  ) : (
                    <Phone className="w-8 h-8 text-blue-500" />
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Almost there! 🎯
                </h2>

                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  We've sent a 5-digit code to
                </p>

                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mr-3 ${contactType === 'email'
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
                    <p className="font-semibold text-gray-800 mr-2">
                      {formatContact(formData.contact, contactType)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center space-x-3 mb-4">
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
                        className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${otpError ? 'border-red-500 bg-red-50 animate-shake' : 'border-gray-300'
                          }`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="text-center mb-4">
                      <p className="text-red-500 text-sm flex items-center justify-center animate-fade-in">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {otpError}
                      </p>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-600">Verifying...</span>
                    </div>
                  )}
                </div>

                {/* Resend Section */}
                <div className="text-center">
                  <p className="text-gray-600 mb-3">
                    Didn't receive the code?
                  </p>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="flex items-center justify-center mx-auto px-4 py-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-500 ease-in-out rounded-lg cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Code
                    </button>
                  ) : (
                    <p className="text-gray-500">
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
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-500 ease-in-out ${isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-xl cursor-pointer'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
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
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200 cursor-pointer"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Forgot Password - Only show for password method */}
        {
          loginMethod === 'password' ? <>
            <div className="text-center mt-4">
              <Link
                href="/forgot-password"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200 cursor-pointer"
              >
                Forgot your password?
              </Link>
            </div>
          </> : <></>
        }

      </div>
    </div>
  );
}
