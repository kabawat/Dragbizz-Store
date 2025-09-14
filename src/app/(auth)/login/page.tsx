"use client"
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Github, Chrome } from 'lucide-react';
import { Input } from '@/components/common';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle login logic here
      console.log('Login data:', formData);
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Handle social login logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl transition-all duration-700 ease-in-out">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-500 ease-in-out hover:bg-gray-50 cursor-pointer"
          >
            <Chrome className="w-5 h-5 mr-3 text-red-500" />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>
          
          <button
            onClick={() => handleSocialLogin('github')}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-500 ease-in-out hover:bg-gray-50 cursor-pointer"
          >
            <Github className="w-5 h-5 mr-3 text-gray-800" />
            <span className="font-medium text-gray-700">Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Email */}
          <div>
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              leftIcon={Mail}
              error={errors.email}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              leftIcon={Lock}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              error={errors.password}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-blue-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-all duration-500 ease-in-out cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-500 ease-in-out ${
              isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105 active:scale-95 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200 cursor-pointer"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
