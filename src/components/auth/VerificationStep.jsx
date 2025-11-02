import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, RefreshCw, Edit3, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '@/service/auth';
import { ENV_CONFIG } from '@/config';

const VerificationStep = ({
  contactType,
  contact,
  firstName,
  onVerificationComplete,
  onChangeContact,
  registrationToken,
  registrationData,
  onTokenUpdate
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
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
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '')) {
      handleVerification(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerification = async (code) => {
    setIsVerifying(true);
    setError('');

    try {
      const result = await authService.verifyRegistrationOTP(code, registrationToken);

      if (result.success) {
        // OTP verified, pass the token to success screen
        onVerificationComplete(result.token);
      } else {
        // OTP verification failed
        setAttempts(prev => prev + 1);
        if (attempts >= 10) {
          setError('Too many failed attempts. Please request a new code.');
          setOtp(['', '', '', '', '']);
          setCanResend(true);
          setTimeLeft(0);
        } else {
          setError(result.message || 'Invalid OTP. Please try again.');
          setOtp(['', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setAttempts(prev => prev + 1);
      if (attempts >= 10) {
        setError('Too many failed attempts. Please request a new code.');
        setOtp(['', '', '', '', '']);
        setCanResend(true);
        setTimeLeft(0);
      } else {
        setError('An error occurred. Please try again.');
        setOtp(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      // Prepare registration data in the correct format
      const resendData = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        identifier: registrationData.contact, // Map contact to identifier
        pwds: registrationData.password // Map password to pwds
      };
      
      console.log('Resending OTP with data:', resendData);
      
      // Call the registration API again to resend OTP
      const result = await authService.resendRegistrationOTP(resendData);
      
      if (result.success) {
        // Update the token with the new one
        onTokenUpdate(result.token);
        setCanResend(false);
        setTimeLeft(60);
        setOtp(['', '', '', '', '']);
        setError('');
        setAttempts(0);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('An error occurred while resending OTP. Please try again.');
    } finally {
      setIsVerifying(false);
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

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
        <div className="relative bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg backdrop-blur-sm">
          {/* Progress Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <div className="flex items-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                  ✓
                </div>
                <div className="w-12 sm:w-16 h-1 bg-green-500 mx-1 sm:mx-2"></div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                  ✓
                </div>
                <div className="w-12 sm:w-16 h-1 bg-green-500 mx-1 sm:mx-2"></div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                  3
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">Step 3 of 3</p>
          </div>

          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-bg-secondary))] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              {contactType === 'email' ? (
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[rgb(var(--color-primary))]" />
              ) : (
                <Phone className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[rgb(var(--color-primary))]" />
              )}
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-[rgb(var(--color-text-primary))] mb-1 sm:mb-2">
              Almost there, {firstName}! 🎯
            </h2>
            
            <p className="text-xs sm:text-sm md:text-base text-[rgb(var(--color-text-secondary))] mb-1 sm:mb-2">
              We've sent a 5-digit code to
            </p>
            
            <div className="flex items-center justify-center mb-3 sm:mb-4 flex-wrap gap-2">
              <div className="flex items-center">
                <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium mr-2 sm:mr-3 ${
                  contactType === 'email' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-green-600 text-white'
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
                <p className="font-semibold text-xs sm:text-sm text-[rgb(var(--color-text-primary))] mr-2">
                  {formatContact(contact, contactType)}
                </p>
                <button
                  onClick={onChangeContact}
                  className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] hover:opacity-80 transition-colors duration-200 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2 sm:mb-3 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                {otp.map((digit, index) => (
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
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] ${
                      error ? 'border-red-500 bg-red-50 animate-shake' : 'border-[rgb(var(--color-border-primary))]'
                    }`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="text-center mb-3 sm:mb-4">
                  <p className="text-red-500 text-xs sm:text-sm flex items-center justify-center animate-fade-in">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {error}
                  </p>
                </div>
              )}

              {isVerifying && (
                <div className="flex items-center justify-center mb-3 sm:mb-4">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">Verifying...</span>
                </div>
              )}
            </div>

            {/* Resend Section */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] mb-2 sm:mb-3">
                Didn't receive the code?
              </p>
              
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  disabled={isVerifying}
                  className={`flex items-center justify-center mx-auto px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-500 ease-in-out rounded-lg ${
                    isVerifying 
                      ? 'text-[rgb(var(--color-text-tertiary))] cursor-not-allowed' 
                      : 'text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] hover:opacity-80 hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-[rgb(var(--color-text-tertiary))] mr-2"></div>
                      <span className="text-xs sm:text-sm">Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">Resend Code</span>
                    </>
                  )}
                </button>
              ) : (
                <p className="text-xs sm:text-sm text-[rgb(var(--color-text-tertiary))]">
                  Resend in {timeLeft}s
                </p>
              )}
            </div>

            {/* Demo Hint - Only show in development */}
            {ENV_CONFIG.ENV.IS_DEVELOPMENT && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 text-center">
                <p className="text-yellow-700 text-xs sm:text-sm">
                  💡 <strong>Demo:</strong> Use code <code className="bg-yellow-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">00000</code> to continue
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStep;