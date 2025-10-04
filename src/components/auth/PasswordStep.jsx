"use client"
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '../ui';

const PasswordStep = ({
  password,
  onUpdate,
  onNext,
  onBack,
  firstName,
  isLoading = false,
  errors = {}
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
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
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
        <div className="relative bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-6 sm:p-8 shadow-lg backdrop-blur-sm">
          {/* Progress Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <div className="w-16 h-1 bg-green-500 mx-2"></div>
                <div className="w-8 h-8 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div className="w-16 h-1 bg-[rgb(var(--color-border-primary))] mx-2"></div>
                <div className="w-8 h-8 bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
              </div>
            </div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Step 2 of 3</p>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2 text-center">
            Secure your account, {firstName}! 🔒
          </h2>
          <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))] mb-6 text-center">
            Choose a strong password to keep your data safe
          </p>

      {/* Error Display */}
      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{errors.general}</span>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Password Input */}
        <div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] w-5 h-5 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => onUpdate('password', e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`w-full pl-14 pr-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] ${
                password && passwordStrength.strength === 'strong' ? 'border-green-500 bg-green-50' :
                password && passwordStrength.strength === 'weak' ? 'border-red-500 bg-red-50' :
                'border-[rgb(var(--color-border-primary))] focus:border-[rgb(var(--color-primary))]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded p-1 transition-all duration-500 ease-in-out cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[rgb(var(--color-text-secondary))]">Password strength</span>
                <span className={`text-sm font-semibold capitalize ${
                  passwordStrength.color === 'red' ? 'text-red-500' :
                  passwordStrength.color === 'yellow' ? 'text-yellow-500' :
                  passwordStrength.color === 'blue' ? 'text-blue-500' :
                  'text-green-500'
                }`}>
                  {passwordStrength.strength}
                </span>
              </div>
              <div className="w-full bg-[rgb(var(--color-bg-tertiary))] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.color === 'red' ? 'bg-red-500' :
                    passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                    passwordStrength.color === 'blue' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${passwordStrength.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Password Requirements */}
        {(focused || password) && (
          <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-4 animate-fade-in">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-[rgb(var(--color-primary))] mr-2" />
              <span className="font-semibold text-[rgb(var(--color-text-primary))]">Security Tips:</span>
            </div>
            <div className="space-y-2">
              {strengthChecks.map((check, index) => (
                <div key={index} className="flex items-center">
                  {check.valid ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] mr-2" />
                  )}
                  <span className={`text-sm ${check.valid ? 'text-green-700' : 'text-[rgb(var(--color-text-secondary))]'}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-all duration-500 ease-in-out cursor-pointer flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={!isValid || isLoading}
          className={`px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-500 ease-in-out w-full sm:w-auto flex items-center justify-center bg-[rgb(var(--color-primary))] text-white ${
            isValid && !isLoading
              ? 'hover:opacity-90 hover:shadow-lg cursor-pointer'
              : 'opacity-70 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Account...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStep;