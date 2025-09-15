import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="animate-slide-in transition-all duration-700 ease-in-out">
      {/* Progress Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-500 mx-2"></div>
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="w-16 h-1 bg-gray-200 mx-2"></div>
            <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">Step 2 of 3</p>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center">
        Secure your account, {firstName}! 🔒
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center">
        Choose a strong password to keep your data safe
      </p>

      <div className="space-y-4 sm:space-y-6">
        {/* Password Input */}
        <div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => onUpdate('password', e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`w-full pl-14 pr-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                password && passwordStrength.strength === 'strong' ? 'border-green-500 bg-green-50' :
                password && passwordStrength.strength === 'weak' ? 'border-red-500 bg-red-50' :
                'border-gray-200 focus:border-blue-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-all duration-500 ease-in-out cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Password strength</span>
                <span className={`text-sm font-semibold capitalize ${
                  passwordStrength.color === 'red' ? 'text-red-500' :
                  passwordStrength.color === 'yellow' ? 'text-yellow-500' :
                  passwordStrength.color === 'blue' ? 'text-blue-500' :
                  'text-green-500'
                }`}>
                  {passwordStrength.strength}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-blue-500 mr-2" />
              <span className="font-semibold text-blue-700">Security Tips:</span>
            </div>
            <div className="space-y-2">
              {strengthChecks.map((check, index) => (
                <div key={index} className="flex items-center">
                  {check.valid ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className={`text-sm ${check.valid ? 'text-green-700' : 'text-gray-600'}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6 sm:mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-500 ease-in-out cursor-pointer"
        >
          ← Back
        </button>
        
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-500 ease-in-out w-full sm:w-auto ${
            isValid
              ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default PasswordStep;