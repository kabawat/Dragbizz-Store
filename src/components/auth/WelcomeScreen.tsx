import React from 'react';
import { Rocket, Users, Shield, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
        
        <div className="relative z-10">
          {/* Hero Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Rocket className="w-10 h-10 text-white" />
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Welcome! 👋
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            Create your account in
          </p>
          
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            less than a minute 🚀
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
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

          {/* CTA Button */}
          <button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 relative overflow-hidden group"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <p className="text-xs text-gray-500 mt-4">
            No spam, ever. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;