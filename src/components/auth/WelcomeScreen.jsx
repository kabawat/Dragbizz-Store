"use client"
import React from 'react';
import { Rocket, Users, Shield, Zap, Github, Chrome } from 'lucide-react';
import Link from 'next/link';
import { AnimatedBackground } from '../ui';

const WelcomeScreen = ({ onGetStarted, onSocialLogin }) => {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-3 sm:p-4">
      <AnimatedBackground variant="default" />
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-20 h-20 sm:w-40 sm:h-40 bg-[rgb(var(--color-primary))] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 sm:-bottom-20 sm:-left-20 w-20 h-20 sm:w-40 sm:h-40 bg-[rgb(var(--color-secondary))] opacity-10 rounded-full blur-3xl"></div>

        <div className="relative bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg backdrop-blur-sm">
          {/* Hero Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
            <Rocket className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4 text-[rgb(var(--color-text-primary))]">
            Welcome! 👋
          </h1>

          <p className="text-center text-sm sm:text-base text-[rgb(var(--color-text-secondary))] mb-1 sm:mb-2">
            Create your account in
          </p>

          <p className="text-center text-xl sm:text-xl md:text-2xl font-bold mb-6 sm:mb-8 gradient-text">
            less than a minute 🚀
          </p>

          {/* Features */}
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-primary))]" />
              <span>Join 10M+ happy users</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-primary))]" />
              <span>100% secure & private</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-primary))]" />
              <span>Quick & easy setup</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          {onSocialLogin && (
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <button
                onClick={() => onSocialLogin('google')}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors text-sm sm:text-base"
              >
                <Chrome className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => onSocialLogin('github')}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors text-sm sm:text-base"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-gray-200" />
                <span>Continue with GitHub</span>
              </button>
            </div>
          )}

          {/* Divider */}
          {onSocialLogin && (
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgb(var(--color-border-primary))]"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-secondary))]">
                  Or create account with email
                </span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={onGetStarted}
            className="w-full bg-[rgb(var(--color-primary))] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity mb-3 sm:mb-4"
          >
            Get Started
          </button>

          <p className="text-center text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] mb-4 sm:mb-6">
            No spam, ever. We respect your privacy.
          </p>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[rgb(var(--color-primary))] hover:underline font-medium"
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