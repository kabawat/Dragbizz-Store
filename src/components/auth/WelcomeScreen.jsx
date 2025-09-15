import React from 'react';
import { Rocket, Users, Shield, Zap, Github, Chrome } from 'lucide-react';
import Link from 'next/link';
import styles from './WelcomeScreen.module.css';
import { AnimatedBackground } from '../ui';

const WelcomeScreen = ({ onGetStarted, onSocialLogin }) => {
  return (
    <div className={styles.container}>
      <AnimatedBackground variant="default" />
      <div className={styles.card}>
        {/* Background decoration */}
        <div className={styles.backgroundDecoration1}></div>
        <div className={styles.backgroundDecoration2}></div>
        
        <div className={styles.content}>
          {/* Hero Icon */}
          <div className={styles.heroIcon}>
            <Rocket />
          </div>

          {/* Main Heading */}
          <h1 className={styles.mainHeading}>
            Welcome! 👋
          </h1>
          
          <p className={styles.subHeading}>
            Create your account in
          </p>
          
          <p className={styles.gradientText}>
            less than a minute 🚀
          </p>

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <Users />
              <span className={styles.featureText}>Join 10M+ happy users</span>
            </div>
            <div className={styles.featureItem}>
              <Shield />
              <span className={styles.featureText}>100% secure & private</span>
            </div>
            <div className={styles.featureItem}>
              <Zap />
              <span className={styles.featureText}>Quick & easy setup</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          {onSocialLogin && (
            <div className={styles.socialButtons}>
              <button
                onClick={() => onSocialLogin('google')}
                className={styles.socialButton}
              >
                <Chrome className={styles.googleIcon} />
                <span className={styles.socialButtonText}>Continue with Google</span>
              </button>
              
              <button
                onClick={() => onSocialLogin('github')}
                className={styles.socialButton}
              >
                <Github className={styles.githubIcon} />
                <span className={styles.socialButtonText}>Continue with GitHub</span>
              </button>
            </div>
          )}

          {/* Divider */}
          {onSocialLogin && (
            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <div className={styles.dividerText}>
                <span>Or create account with email</span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={onGetStarted}
            className={styles.ctaButton}
          >
            <span className={styles.ctaButtonText}>Get Started</span>
            <div className={styles.ctaButtonOverlay}></div>
          </button>

          <p className={styles.privacyText}>
            No spam, ever. We respect your privacy.
          </p>

          {/* Login Link */}
          <div className={styles.loginSection}>
            <p className={styles.loginText}>
              Already have an account?{' '}
              <Link
                href="/login"
                className={styles.loginLink}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;