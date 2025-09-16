import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedBackground } from '../ui';

const SuccessScreen = ({ firstName, onContinue }) => {
  const [countdown, setCountdown] = useState(3);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
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
  }, []);

  // Handle countdown completion
  useEffect(() => {
    if (countdown === 0) {
      onContinue();
    }
  }, [countdown, onContinue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground variant="success" />
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div
                className={`w-2 h-2 ${
                  ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][
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

      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl text-center relative z-10 transition-all duration-700 ease-in-out">
        {/* Success Icon with Animation */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          {/* Sparkle Effects */}
          <div className="absolute -top-2 -right-2 animate-pulse">
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-pulse" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          You're all set, {firstName}! 🎉
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 mb-2">
          Welcome aboard
        </p>
        
        <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 sm:mb-8">
          Account created successfully! 👋
        </p>

        {/* Features Preview */}
        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm">Account verified & secured</span>
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-sm">Profile setup complete</span>
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-sm">Ready to explore</span>
          </div>
        </div>

        {/* Auto-redirect Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-700 text-sm mb-2">
            🚀 <strong>Redirecting to dashboard in {countdown}s</strong>
          </p>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Manual Continue Button */}
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-500 ease-in-out hover:shadow-xl flex items-center justify-center cursor-pointer"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Thank you for joining our community! 💙
        </p>
      </div>
    </div>
  );
};

export default SuccessScreen;