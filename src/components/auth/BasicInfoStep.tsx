import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '../common';
import styles from './BasicInfoStep.module.scss';

interface BasicInfoStepProps {
  firstName: string;
  lastName: string;
  contact: string;
  contactType: 'email' | 'phone';
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  firstName,
  lastName,
  contact,
  contactType,
  onUpdate,
  onNext,
  onBack,
  errors
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Smart contact detection
  const detectContactType = (value: string) => {
    const cleanValue = value.replace(/\s+/g, '');
    
    // Check for email pattern
    if (value.includes('@') && value.includes('.')) {
      onUpdate('contactType', 'email');
    } 
    // Check for phone pattern (digits, +, -, spaces, parentheses)
    else if (/^[\+]?[\d\s\-\(\)]+$/.test(value) && cleanValue.length >= 10) {
      onUpdate('contactType', 'phone');
    }
    // If user starts typing numbers, assume phone
    else if (/^\d/.test(cleanValue)) {
      onUpdate('contactType', 'phone');
    }
    // If user starts typing letters or @, assume email
    else if (/^[a-zA-Z@]/.test(cleanValue)) {
      onUpdate('contactType', 'email');
    }
  };

  // Simulate availability check
  useEffect(() => {
    if (contact && contact.length > 3) {
      setIsValidating(true);
      setValidationStatus('checking');
      
      const timer = setTimeout(() => {
        // Simulate API call
        const isAvailable = Math.random() > 0.3; // 70% chance available
        setValidationStatus(isAvailable ? 'available' : 'taken');
        setIsValidating(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setValidationStatus('idle');
    }
  }, [contact]);

  const handleContactChange = (value: string) => {
    onUpdate('contact', value);
    detectContactType(value);
  };

  const isFormValid = firstName.trim() && lastName.trim() && contact.trim() && !errors.firstName && !errors.lastName && !errors.contact && validationStatus === 'available';

  return (
    <div className={styles.container}>
      {/* Progress Header */}
      <div className={styles.progressHeader}>
        <div className={styles.progressSteps}>
          <div className={styles.progressSteps}>
            <div className={`${styles.stepCircle} ${styles.stepCircleActive}`}>
              1
            </div>
            <div className={`${styles.stepConnector} ${styles.stepConnectorInactive}`}></div>
            <div className={`${styles.stepCircle} ${styles.stepCircleInactive}`}>
              2
            </div>
            <div className={`${styles.stepConnector} ${styles.stepConnectorInactive}`}></div>
            <div className={`${styles.stepCircle} ${styles.stepCircleInactive}`}>
              3
            </div>
          </div>
        </div>
        <p className={styles.stepText}>Step 1 of 3</p>
      </div>

      <h2 className={styles.mainHeading}>
        Nice to meet you! 👋
      </h2>
      <p className={styles.subHeading}>
        Let's start with some basic information
      </p>

      <div className={styles.formContainer}>
        {/* First Name */}
        <div className={styles.inputGroup}>
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(value) => onUpdate('firstName', value)}
            leftIcon={User}
            error={errors.firstName}
            autoFocus
          />
          {errors.firstName && (
            <p className={styles.errorMessage}>
              <AlertCircle className={styles.errorIcon} />
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className={styles.inputGroup}>
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(value) => onUpdate('lastName', value)}
            leftIcon={User}
            error={errors.lastName}
          />
          {errors.lastName && (
            <p className={styles.errorMessage}>
              <AlertCircle className={styles.errorIcon} />
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Smart Contact Field */}
        <div className={styles.inputGroup}>
          {/* Contact Type Indicator */}
          {contact && (
            <div className={styles.contactTypeIndicator}>
              <div className="d-flex align-items-center justify-content-start">
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
              </div>
            </div>
          )}
          
          <Input
            type={contactType === 'email' ? 'email' : 'tel'}
            placeholder={contactType === 'email' ? 'your@email.com' : '+91 98765 43210'}
            value={contact}
            onChange={handleContactChange}
            leftIcon={contactType === 'email' ? Mail : Phone}
            error={errors.contact}
            rightElement={
              <div>
                {isValidating && (
                  <div className={styles.validationSpinner}></div>
                )}
                {validationStatus === 'available' && (
                  <CheckCircle className={`${styles.validationIcon} ${styles.validationIconSuccess}`} />
                )}
                {validationStatus === 'taken' && (
                  <AlertCircle className={`${styles.validationIcon} ${styles.validationIconError}`} />
                )}
              </div>
            }
            className={
              validationStatus === 'available' ? styles.inputSuccess :
              validationStatus === 'taken' ? styles.inputError :
              ''
            }
          />
          
          {/* Helper Text */}
          <div className={styles.helperText}>
            {validationStatus === 'available' && (
              <p className={styles.helperTextSuccess}>
                <CheckCircle className={styles.helperIcon} />
                Great! This {contactType} is available
              </p>
            )}
            {validationStatus === 'taken' && (
              <p className={styles.helperTextError}>
                <AlertCircle className={styles.helperIcon} />
                This {contactType} is already registered
              </p>
            )}
            {validationStatus === 'idle' && (
              <p className={styles.helperTextIdle}>
                Enter your email or phone number - we'll detect the type automatically
              </p>
            )}
            {errors.contact && (
              <p className={styles.helperTextError}>
                <AlertCircle className={styles.helperIcon} />
                {errors.contact}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.navigationContainer}>
        <button
          onClick={onBack}
          className={styles.backButton}
        >
          ← Back
        </button>
        
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`${styles.continueButton} ${
            isFormValid
              ? styles.continueButtonEnabled
              : styles.continueButtonDisabled
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default BasicInfoStep;