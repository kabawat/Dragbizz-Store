import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, RefreshCw, Edit3, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './VerificationStep.module.scss';

interface VerificationStepProps {
  contactType: 'email' | 'phone';
  contact: string;
  firstName: string;
  onVerificationComplete: () => void;
  onChangeContact: () => void;
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  contactType,
  contact,
  firstName,
  onVerificationComplete,
  onChangeContact
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleOtpChange = (index: number, value: string) => {
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

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerification = async (code: string) => {
    setIsVerifying(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (code === '12345') { // Demo code
        onVerificationComplete();
      } else {
        setAttempts(prev => prev + 1);
        if (attempts >= 2) {
          setError('Too many failed attempts. Please request a new code.');
          setOtp(['', '', '', '', '', '']);
          setCanResend(true);
          setTimeLeft(0);
        } else {
          setError('That code didn\'t work, try again.');
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleResendCode = () => {
    if (!canResend) return;
    
    setCanResend(false);
    setTimeLeft(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setAttempts(0);
    inputRefs.current[0]?.focus();
  };

  const formatContact = (contact: string, type: 'email' | 'phone') => {
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
    <div className={styles.container}>
      {/* Progress Header */}
      <div className={styles.progressHeader}>
        <div className={styles.progressSteps}>
          <div className={`${styles.stepCircle} ${styles.stepCircleCompleted}`}>
            ✓
          </div>
          <div className={`${styles.stepConnector} ${styles.stepConnectorCompleted}`}></div>
          <div className={`${styles.stepCircle} ${styles.stepCircleCompleted}`}>
            ✓
          </div>
          <div className={`${styles.stepConnector} ${styles.stepConnectorCompleted}`}></div>
          <div className={`${styles.stepCircle} ${styles.stepCircleActive}`}>
            3
          </div>
        </div>
        <p className={styles.stepText}>Step 3 of 3</p>
      </div>

      <div className={styles.headerSection}>
        <div className={styles.iconContainer}>
          {contactType === 'email' ? (
            <Mail className={styles.icon} />
          ) : (
            <Phone className={styles.icon} />
          )}
        </div>
        
        <h2 className={styles.mainHeading}>
          Almost there, {firstName}! 🎯
        </h2>
        
        <p className={styles.subHeading}>
          We've sent a 5-digit code to
        </p>
        
        <div className={styles.contactInfo}>
          <div className={`${styles.contactTypeBadge} ${
            contactType === 'email' 
              ? styles.contactTypeBadgeEmail
              : styles.contactTypeBadgePhone
          }`}>
            {contactType === 'email' ? (
              <>
                <Mail className={styles.contactTypeIcon} />
                Email
              </>
            ) : (
              <>
                <Phone className={styles.contactTypeIcon} />
                Phone
              </>
            )}
          </div>
          <p className={styles.contactText}>
            {formatContact(contact, contactType)}
          </p>
          <button
            onClick={onChangeContact}
            className={styles.editButton}
          >
            <Edit3 className={styles.editIcon} />
          </button>
        </div>
      </div>

      <div className={styles.formContainer}>
        {/* OTP Input */}
        <div>
          <label className={styles.otpLabel}>
            Enter verification code
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
                className={`${styles.otpInput} ${
                  error ? styles.otpInputError : styles.otpInputDefault
                }`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <p className={styles.errorText}>
                <AlertCircle className={styles.errorIcon} />
                {error}
              </p>
            </div>
          )}

          {isVerifying && (
            <div className={styles.verifyingMessage}>
              <div className={styles.verifyingSpinner}></div>
              <span className={styles.verifyingText}>Verifying...</span>
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
              onClick={handleResendCode}
              className={styles.resendButton}
            >
              <RefreshCw className={styles.resendIcon} />
              Resend Code
            </button>
          ) : (
            <p className={styles.resendTimer}>
              Resend in {timeLeft}s
            </p>
          )}
          
          <button
            onClick={onChangeContact}
            className={styles.changeContactButton}
          >
            Change {contactType}?
          </button>
        </div>

        {/* Demo Hint */}
        <div className={styles.demoHint}>
          <p className={styles.demoText}>
            💡 <strong>Demo:</strong> Use code <code className={styles.demoCode}>12345</code> to continue
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationStep;