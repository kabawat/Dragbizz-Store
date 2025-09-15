import React from 'react';

const AnimatedBackground = ({ variant = 'default' }) => {
  const backgrounds = {
    default: (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-float-reverse"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-200 rounded-full opacity-25 animate-drift"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-pink-200 rounded-full opacity-35 animate-drift-slow"></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-60 left-1/4 w-8 h-8 bg-blue-300 rotate-45 opacity-20 animate-pulse-glow"></div>
        <div className="absolute top-80 right-1/3 w-6 h-6 bg-purple-300 rotate-12 opacity-30 animate-float"></div>
        <div className="absolute bottom-60 left-1/3 w-10 h-10 bg-green-300 rotate-45 opacity-25 animate-drift"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-10 animate-pulse-glow blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-green-200 to-blue-200 rounded-full opacity-15 animate-drift-slow blur-lg"></div>
      </div>
    ),
    
    login: (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Login specific animations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-300 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-300 rounded-full opacity-30 animate-float-reverse"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-cyan-300 rounded-full opacity-25 animate-drift"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-blue-400 rounded-full opacity-35 animate-drift-slow"></div>
        
        {/* Lock and Security themed shapes */}
        <div className="absolute top-60 left-1/4 w-8 h-8 bg-blue-400 rotate-45 opacity-20 animate-pulse-glow"></div>
        <div className="absolute top-80 right-1/3 w-6 h-6 bg-indigo-400 rotate-12 opacity-30 animate-float"></div>
        <div className="absolute bottom-60 left-1/3 w-10 h-10 bg-cyan-400 rotate-45 opacity-25 animate-drift"></div>
        
        {/* Security gradient orbs */}
        <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full opacity-10 animate-pulse-glow blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full opacity-15 animate-drift-slow blur-lg"></div>
      </div>
    ),
    
    register: (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Registration specific animations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-300 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-300 rounded-full opacity-30 animate-float-reverse"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-teal-300 rounded-full opacity-25 animate-drift"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-green-400 rounded-full opacity-35 animate-drift-slow"></div>
        
        {/* Welcome themed shapes */}
        <div className="absolute top-60 left-1/4 w-8 h-8 bg-green-400 rotate-45 opacity-20 animate-pulse-glow"></div>
        <div className="absolute top-80 right-1/3 w-6 h-6 bg-emerald-400 rotate-12 opacity-30 animate-float"></div>
        <div className="absolute bottom-60 left-1/3 w-10 h-10 bg-teal-400 rotate-45 opacity-25 animate-drift"></div>
        
        {/* Welcome gradient orbs */}
        <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-10 animate-pulse-glow blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-teal-300 to-green-300 rounded-full opacity-15 animate-drift-slow blur-lg"></div>
      </div>
    ),
    
    success: (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Success celebration animations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-orange-300 rounded-full opacity-30 animate-float-reverse"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-300 rounded-full opacity-25 animate-drift"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-yellow-400 rounded-full opacity-35 animate-drift-slow"></div>
        
        {/* Celebration shapes */}
        <div className="absolute top-60 left-1/4 w-8 h-8 bg-yellow-400 rotate-45 opacity-20 animate-pulse-glow"></div>
        <div className="absolute top-80 right-1/3 w-6 h-6 bg-orange-400 rotate-12 opacity-30 animate-float"></div>
        <div className="absolute bottom-60 left-1/3 w-10 h-10 bg-green-400 rotate-45 opacity-25 animate-drift"></div>
        
        {/* Celebration gradient orbs */}
        <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full opacity-10 animate-pulse-glow blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-green-300 to-yellow-300 rounded-full opacity-15 animate-drift-slow blur-lg"></div>
        
        {/* Confetti-like elements */}
        <div className="absolute top-10 left-1/3 w-2 h-2 bg-yellow-400 rotate-45 opacity-60 animate-confetti"></div>
        <div className="absolute top-20 right-1/3 w-2 h-2 bg-orange-400 rotate-45 opacity-60 animate-confetti" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-30 left-1/2 w-2 h-2 bg-green-400 rotate-45 opacity-60 animate-confetti" style={{animationDelay: '1s'}}></div>
      </div>
    )
  };

  return backgrounds[variant] || backgrounds.default;
};

export default AnimatedBackground;
