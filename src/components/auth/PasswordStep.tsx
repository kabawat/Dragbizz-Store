import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './PasswordStep.module.scss';

interface PasswordStepProps {
  password: string;
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  firstName: string;
}

const PasswordStep: React.FC<PasswordStepProps> = ({
  password,
  onUpdate,
  onNext,
  onBack,
  firstName
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };

    score = Object.values(checks).filter(Boolean).length;
    
    if (score <= 2) return { strength: 'weak', color: 'red', percentage: 25 };
    if (score <= 3) return { strength: 'fair', color: 'yellow', percentage: 50 };
    if (score <= 4) return { strength: 'good', color: 'blue', percentage: 75 };
    return { strength: 'strong', color: 'green', percentage: 100 };
  };

  const passwordStrength = getPasswordStrength(password);
  const isValid = password.length >= 8 && passwordStrength.strength !== 'weak';

  const strengthChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains a number', valid: /\d/.test(password) },
    { label: 'Contains a symbol', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: 'Mix of upper & lowercase', valid: /[a-z]/.test(password) && /[A-Z]/.test(password) }
  ];

  return (
    <div className={styles.container}>
      {/* Progress Header */}
      <div className={styles.progressHeader}>
        <div className={styles.progressSteps}>
          <div className={`${styles.stepCircle} ${styles.stepCircleCompleted}`}>
            ✓
          </div>
          <div className={`${styles.stepConnector} ${styles.stepConnectorCompleted}`}></div>
          <div className={`${styles.stepCircle} ${styles.stepCircleActive}`}>
            2
          </div>
          <div className={`${styles.stepConnector} ${styles.stepConnectorInactive}`}></div>
          <div className={`${styles.stepCircle} ${styles.stepCircleInactive}`}>
            3
          </div>
        </div>
        <p className={styles.stepText}>Step 2 of 3</p>
      </div>

      <h2 className={styles.mainHeading}>
        Secure your account, {firstName}! 🔒
      </h2>
      <p className={styles.subHeading}>
        Choose a strong password to keep your data safe
      </p>

      <div className={styles.formContainer}>
        {/* Password Input */}
        <div>
          <div className={styles.passwordInputContainer}>
            <Lock className={styles.passwordIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => onUpdate('password', e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`${styles.passwordInput} ${
                password && passwordStrength.strength === 'strong' ? styles.passwordInputStrong :
                password && passwordStrength.strength === 'weak' ? styles.passwordInputWeak :
                styles.passwordInputDefault
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.toggleButton}
            >
              {showPassword ? <EyeOff className={styles.toggleIcon} /> : <Eye className={styles.toggleIcon} />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className={styles.strengthMeter}>
              <div className={styles.strengthHeader}>
                <span className={styles.strengthLabel}>Password strength</span>
                <span className={`${styles.strengthValue} ${
                  passwordStrength.color === 'red' ? styles.strengthValueWeak :
                  passwordStrength.color === 'yellow' ? styles.strengthValueFair :
                  passwordStrength.color === 'blue' ? styles.strengthValueGood :
                  styles.strengthValueStrong
                }`}>
                  {passwordStrength.strength}
                </span>
              </div>
              <div className={styles.strengthBar}>
                <div
                  className={`${styles.strengthFill} ${
                    passwordStrength.color === 'red' ? styles.strengthFillWeak :
                    passwordStrength.color === 'yellow' ? styles.strengthFillFair :
                    passwordStrength.color === 'blue' ? styles.strengthFillGood :
                    styles.strengthFillStrong
                  }`}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Password Requirements */}
        {(focused || password) && (
          <div className={styles.securityTips}>
            <div className={styles.securityTipsHeader}>
              <Shield className={styles.securityIcon} />
              <span className={styles.securityTitle}>Security Tips:</span>
            </div>
            <div className={styles.securityChecks}>
              {strengthChecks.map((check, index) => (
                <div key={index} className={styles.securityCheck}>
                  {check.valid ? (
                    <CheckCircle className={`${styles.checkIcon} ${styles.checkIconValid}`} />
                  ) : (
                    <AlertCircle className={`${styles.checkIcon} ${styles.checkIconInvalid}`} />
                  )}
                  <span className={`${styles.checkText} ${check.valid ? styles.checkTextValid : styles.checkTextInvalid}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
          disabled={!isValid}
          className={`${styles.continueButton} ${
            isValid
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

export default PasswordStep;