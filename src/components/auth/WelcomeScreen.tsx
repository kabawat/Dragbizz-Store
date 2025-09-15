import React from 'react';
import { Rocket, Users, Shield, Zap, Github, Chrome } from 'lucide-react';
import Link from 'next/link';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSocialLogin?: (provider: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSocialLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl text-center relative overflow-hidden transition-all duration-700 ease-in-out">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
        
        <div className="relative z-10">
          {/* Hero Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Rocket className="w-10 h-10 text-white" />
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Welcome! 👋
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-2">
            Create your account in
          </p>
          
          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 sm:mb-8">
            less than a minute 🚀
          </p>

          {/* Features */}
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            <div className="flex items-center justify-center text-gray-600">
              <Users className="w-5 h-5 mr-3 text-blue-500" />
              <span className="text-sm">Join 10M+ happy users</span>
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <Shield className="w-5 h-5 mr-3 text-green-500" />
              <span className="text-sm">100% secure & private</span>
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <Zap className="w-5 h-5 mr-3 text-yellow-500" />
              <span className="text-sm">Quick & easy setup</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          {onSocialLogin && (
            <div className="space-y-3 mb-6">
              <button
                onClick={() => onSocialLogin('google')}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-500 ease-in-out hover:bg-gray-50 cursor-pointer"
              >
                <Chrome className="w-5 h-5 mr-3 text-red-500" />
                <span className="font-medium text-gray-700">Continue with Google</span>
              </button>
              
              <button
                onClick={() => onSocialLogin('github')}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-500 ease-in-out hover:bg-gray-50 cursor-pointer"
              >
                <Github className="w-5 h-5 mr-3 text-gray-800" />
                <span className="font-medium text-gray-700">Continue with GitHub</span>
              </button>
            </div>
          )}

          {/* Divider */}
          {onSocialLogin && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or create account with email</span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold text-base hover:from-blue-600 hover:to-purple-700 transition-all duration-500 ease-in-out hover:shadow-xl relative overflow-hidden group cursor-pointer"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
          </button>

          <p className="text-xs text-gray-500 mt-4">
            No spam, ever. We respect your privacy.
          </p>

          {/* Login Link */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200 cursor-pointer"
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