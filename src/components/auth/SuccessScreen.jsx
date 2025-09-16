import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedBackground } from '../ui';
import confetti from 'canvas-confetti';
import styles from './style/SuccessScreen.module.scss';

const SuccessScreen = ({ firstName, onContinue }) => {
  const [countdown, setCountdown] = useState(5);
  const [showConfetti, setShowConfetti] = useState(true);

  // Rainbow palette
  const RAINBOW = [
    "#ef4444",
    "#f97316", 
    "#facc15",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899"
  ];

  // Confetti state
  let rafId = null;
  let endAt = 0;

  // Reduced motion fallback
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Single burst with fade effect
  const createSingleBurst = () => {
    // Main burst from center
    confetti({
      particleCount: 80,
      spread: 120,
      origin: { x: 0.5, y: 0.3 },
      colors: RAINBOW,
      startVelocity: 30,
      gravity: 1,
      ticks: 400,
      scalar: 1,
      shapes: ['square', 'circle'],
    });

    // Additional scattered bursts for full coverage
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.2, y: 0.2 },
        colors: RAINBOW,
        startVelocity: 25,
        gravity: 0.8,
        ticks: 350,
        scalar: 0.8,
      });
    }, 50);

    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.8, y: 0.2 },
        colors: RAINBOW,
        startVelocity: 25,
        gravity: 0.8,
        ticks: 350,
        scalar: 0.8,
      });
    }, 100);

    // Random opacity fade effects
    setTimeout(() => {
      // First fade effect
      confetti({
        particleCount: 20,
        spread: 60,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: RAINBOW,
        startVelocity: 20,
        gravity: 0.6,
        ticks: 200,
        scalar: 0.6,
        opacity: 0.7,
      });
    }, 300);

    setTimeout(() => {
      // Second fade effect
      confetti({
        particleCount: 15,
        spread: 50,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: RAINBOW,
        startVelocity: 15,
        gravity: 0.5,
        ticks: 150,
        scalar: 0.5,
        opacity: 0.5,
      });
    }, 600);
  };

  // Loop with cancel
  const loop = () => {
    const now = Date.now();
    if (now >= endAt) {
      stopRain(true);
      return;
    }
    const intensity = 3; // Reduced intensity for fewer particles
    rainFrame(intensity);
    rafId = requestAnimationFrame(loop);
  };

  const startRain = () => {
    if (rafId !== null) return; // already running

    // Reduced motion: single gentle burst
    if (prefersReducedMotion) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { x: 0.5, y: 0.2 },
        colors: RAINBOW,
        startVelocity: 25,
        gravity: 0.8,
        ticks: 300,
      });
      return;
    }

    // Single burst with fade effects
    createSingleBurst();
  };

  const stopRain = (fromLoop = false) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start single confetti burst immediately
    startRain();

    // Hide confetti after animation completes
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 2000); // Shorter duration since it's a single burst

    return () => {
      clearInterval(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  // Handle countdown completion
  useEffect(() => {
    if (countdown === 0) {
      onContinue();
    }
  }, [countdown, onContinue]);

  return (
    <div className={styles.container}>
      <AnimatedBackground variant="success" />

      <div className={styles.card}>

        {/* Success Message */}
        <h1 className={styles.mainHeading}>
          You're all set, {firstName}!
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
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Manual Continue Button */}
        <button
          onClick={onContinue}
          className={styles.continueButton}
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className={styles.buttonIcon} />
        </button>

        <p className={styles.thankYouText}>
          Thank you for joining our community! 💙
        </p>
      </div>
    </div>
  );
};

export default SuccessScreen;