"use client";
import React from 'react';
import { Mail, Phone, Edit3, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from '../style/Login.module.scss';

const OTPInputSection = ({
  otpDigits,
  contact,
  contactType,
  errors,
  isLoading,
  timeLeft,
  canResend,
  inputRefs,
  onOtpChange,
  onOtpKeyDown,
  onChangeContact,
  onResendOTP,
  formatContact,
}) => {
  const { t } = useTranslation();

  return (
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
          {t('auth.almostThere')}
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

      <div className={styles.otpInputSection}>
        <div>
          <label className={styles.otpLabel}>
            {t('auth.enterVerificationCode')}
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
                onChange={(e) => onOtpChange(index, e.target.value)}
                onKeyDown={(e) => onOtpKeyDown(index, e)}
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
              <span className={styles.otpLoadingText}>{t('auth.verifying')}</span>
            </div>
          )}
        </div>

        <div className={styles.resendSection}>
          <p className={styles.resendText}>
            {t('auth.didntReceiveCode')}
          </p>

          {canResend ? (
            <button
              type="button"
              onClick={onResendOTP}
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
  );
};

export default OTPInputSection;

