import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import styles from './SuccessScreen.module.scss';

interface SuccessScreenProps {
  firstName: string;
  onContinue: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ firstName, onContinue }) => {
  const [countdown, setCountdown] = useState(3);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Hide confetti after animation
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(confettiTimer);
    };
  }, [onContinue]);

  return (
    <div className={styles.container}>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className={styles.confettiContainer}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={styles.confettiItem}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div
                className={`${styles.confettiDot} ${
                  ['confettiBlue', 'confettiGreen', 'confettiYellow', 'confettiPurple', 'confettiPink'][
                    Math.floor(Math.random() * 5)
                  ]
                }`}
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className={styles.card}>
        {/* Success Icon with Animation */}
        <div className={styles.successIconContainer}>
          <div className={styles.successIcon}>
            <CheckCircle />
          </div>
          
          {/* Sparkle Effects */}
          <div className={`${styles.sparkleEffect} ${styles.sparkleTopRight}`}>
            <Sparkles className={`${styles.sparkleIcon} ${styles.sparkleIconYellow}`} />
          </div>
          <div className={`${styles.sparkleEffect} ${styles.sparkleBottomLeft}`}>
            <Sparkles className={`${styles.sparkleIcon} ${styles.sparkleIconBlue}`} />
          </div>
        </div>

        {/* Success Message */}
        <h1 className={styles.mainHeading}>
          You're all set, {firstName}! 🎉
        </h1>
        
        <p className={styles.subHeading}>
          Welcome aboard
        </p>
        
        <p className={styles.gradientText}>
          Account created successfully! 👋
        </p>

        {/* Features Preview */}
        <div className={styles.features}>
          <div className={styles.featureItem}>
            <div className={`${styles.featureDot} ${styles.featureDotGreen}`}></div>
            <span className={styles.featureText}>Account verified & secured</span>
          </div>
          <div className={styles.featureItem}>
            <div className={`${styles.featureDot} ${styles.featureDotBlue}`}></div>
            <span className={styles.featureText}>Profile setup complete</span>
          </div>
          <div className={styles.featureItem}>
            <div className={`${styles.featureDot} ${styles.featureDotPurple}`}></div>
            <span className={styles.featureText}>Ready to explore</span>
          </div>
        </div>

        {/* Auto-redirect Info */}
        <div className={styles.redirectInfo}>
          <p className={styles.redirectText}>
            🚀 <strong>Redirecting to dashboard in {countdown}s</strong>
          </p>
          <div className={styles.redirectBar}>
            <div
              className={styles.redirectFill}
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Manual Continue Button */}
        <button
          onClick={onContinue}
          className={styles.continueButton}
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className={styles.continueIcon} />
        </button>

        <p className={styles.thankYouText}>
          Thank you for joining our community! 💙
        </p>
      </div>
    </div>
  );
};

export default SuccessScreen;