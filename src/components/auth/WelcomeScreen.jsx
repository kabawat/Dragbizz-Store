"use client"
import React from 'react';
import { Rocket, Users, Shield, Zap, Github, Chrome } from 'lucide-react';
import Link from 'next/link';
import { AnimatedBackground, AnimatedGridPattern } from '../ui';

const WelcomeScreen = ({ onGetStarted, onSocialLogin }) => {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden" data-register-page>
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
                  <Rocket className="w-8 h-8 text-indigo-700" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                  Welcome to DragBizz Store
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  Create your account and start managing your store with powerful tools
                </p>
              </div>

              {/* Features List */}
              <div className="mt-16 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Users className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Join 10M+ Users</h3>
                    <p className="text-gray-600 text-sm">Be part of a growing community of store owners</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Shield className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">100% Secure</h3>
                    <p className="text-gray-600 text-sm">Enterprise-grade security for your data</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Zap className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Setup</h3>
                    <p className="text-gray-600 text-sm">Get started in less than a minute</p>
                  </div>
                </div>
              </div>

              {/* Bottom Text */}
              <div className="mt-auto pt-8">
                <p className="text-gray-600 text-sm">
                  © 2025 DragBizz. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
          {/* Container with max-width 1200px for content */}
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div className="w-full max-w-xl bg-white rounded-xl border border-gray-200 shadow-lg p-8 sm:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  DragBizz Store
                </h1>
              </div>

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Rocket className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Welcome! 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Create your account in less than a minute 🚀
                </p>
              </div>

              {/* Social Login Buttons */}
              {onSocialLogin && (
                <>
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <button
                      onClick={() => onSocialLogin('google')}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50/30 transition-colors text-sm sm:text-base font-medium"
                    >
                      <Chrome className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      <span>Continue with Google</span>
                    </button>

                    <button
                      onClick={() => onSocialLogin('github')}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50/30 transition-colors text-sm sm:text-base font-medium"
                    >
                      <Github className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                      <span>Continue with GitHub</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-4 sm:my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-3 bg-white text-gray-500">
                        Or create account with email
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* CTA Button */}
              <button
                onClick={onGetStarted}
                className="w-full bg-[rgb(var(--color-primary))] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base hover:brightness-[1.01] transition-all duration-200 shadow-md hover:shadow-lg mb-3 sm:mb-4"
              >
                Get Started
              </button>

              <p className="text-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                No spam, ever. We respect your privacy.
              </p>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">
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
      </div>
    </div>
  );
};

export default WelcomeScreen;