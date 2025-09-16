import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedBackground } from '../ui';
import confetti from 'canvas-confetti';

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground variant="success" />

      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl text-center relative z-10 transition-all duration-700 ease-in-out">

        {/* Success Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          You're all set, {firstName}!
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
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
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