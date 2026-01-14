import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, RefreshCw, Edit3, AlertCircle, CheckCircle, MessageSquare, Shield, Zap, ArrowRight } from 'lucide-react';
import { authService } from '@/service/auth';
import { ENV_CONFIG } from '@/config';
import { AnimatedBackground, AnimatedGridPattern, Button } from '../ui';
import styles from '../../page/style/Login.module.scss';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();
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

  const handleManualSubmit = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 5 && !isVerifying) {
      handleVerification(otpCode);
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
          setError(t('auth.tooManyFailedAttempts'));
          setOtp(['', '', '', '', '']);
          setCanResend(true);
          setTimeLeft(0);
        } else {
          setError(result.message || t('auth.invalidOtpTryAgain'));
          setOtp(['', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      setAttempts(prev => prev + 1);
      if (attempts >= 10) {
        setError(t('auth.tooManyFailedAttempts'));
        setOtp(['', '', '', '', '']);
        setCanResend(true);
        setTimeLeft(0);
      } else {
        setError(t('auth.errorOccurredTryAgain'));
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
        setError(result.message || t('auth.failedToResendOtpTryAgain'));
      }
    } catch (error) {
      setError(t('auth.errorResendingOtp'));
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
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="register" />
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
                  <MessageSquare className="w-8 h-8 text-indigo-700" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
                  {t('auth.almostThere')}
                </h1>
                <p className="text-xl text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                  {t('auth.verifyAccountWithCode')}
                </p>
              </div>

              {/* Features List */}
              <div className="mt-16 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Mail className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">{t('auth.secureVerification')}</h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">{t('auth.digitCodeSentTo', { type: contactType })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Zap className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">{t('auth.quickProcess')}</h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">{t('auth.autoSubmitsWhenFilled')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Shield className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">{t('auth.safeAndSecure')}</h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">{t('auth.verificationCodeExpires')}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Text */}
              <div className="mt-auto pt-8">
                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                  {t('auth.copyright')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
          {/* Container with max-width 1200px for content */}
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div className="w-full max-w-xl bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-lg p-8 sm:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                  {t('auth.dragBizzStore')}
                </h1>
              </div>

              {/* OTP Section */}
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
                    {t('auth.almostThereFirstName', { firstName })}
                  </h2>

                  <p className={styles.otpDescription}>
                    {t('auth.sentCodeTo')}
                  </p>

                  <div className={styles.otpContactInfo}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`${styles.otpContactBadge} ${contactType === 'email' ? styles.otpContactBadgeEmail : styles.otpContactBadgePhone}`}>
                          {contactType === 'email' ? (
                            <>
                              <Mail className="w-3 h-3 mr-1" />
                              {t('auth.email')}
                            </>
                          ) : (
                            <>
                              <Phone className="w-3 h-3 mr-1" />
                              {t('auth.phone')}
                            </>
                          )}
                        </div>
                        <p className={styles.otpContactText}>
                          {formatContact(contact, contactType)}
                        </p>
                      </div>
                      <button
                        onClick={onChangeContact}
                        className="text-blue-500 hover:text-blue-600 transition-colors duration-200 p-1 cursor-pointer"
                        title={t('auth.changeContact')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    ✓
                  </div>
                  <div className="w-8 h-1 bg-green-500"></div>
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    ✓
                  </div>
                  <div className="w-8 h-1 bg-green-500"></div>
                  <div className="w-6 h-6 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                </div>
                <p className="text-xs text-center text-[rgb(var(--color-text-secondary))] mb-6">{t('auth.step3Of3')}</p>

                <div className={styles.otpInputSection}>
                  {/* OTP Input */}
                  <div>
                    <label className={styles.otpLabel}>
                      {t('auth.enterVerificationCode')}
                    </label>
                    <div className={styles.otpInputs}>
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
                          className={`${styles.otpInput} ${error ? styles.otpInputError : ''}`}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    {error && (
                      <div className={styles.otpError}>
                        <p className={styles.otpErrorMessage}>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {error}
                        </p>
                      </div>
                    )}

                    {isVerifying && (
                      <div className={styles.otpLoading}>
                        <div className={styles.otpLoadingSpinner}></div>
                        <span className={styles.otpLoadingText}>{t('auth.verifying')}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        onClick={handleManualSubmit}
                        disabled={otp.join('').length !== 5 || isVerifying}
                        loading={isVerifying}
                        variant="primary"
                        size="lg"
                        rightIcon={!isVerifying ? ArrowRight : undefined}
                        className="w-[14.5rem]"
                      >
                        {isVerifying ? t('auth.verifying') : t('auth.verifyCode')}
                      </Button>
                    </div>
                  </div>

                  {/* Resend Section */}
                  <div className={styles.resendSection}>
                    <p className={styles.resendText}>
                      {t('auth.didntReceiveCode')}
                    </p>

                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className={styles.resendButton}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('auth.resendCode')}
                      </button>
                    ) : (
                      <p className={styles.resendTimer}>
                        {t('auth.resendIn', { time: timeLeft })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStep;
