import React from 'react';

const SVGBackground = ({ variant = 'default' }) => {
  const backgrounds = {
    default: (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          {/* Floating geometric shapes */}
          <circle cx="200" cy="200" r="50" fill="url(#gradient1)" opacity="0.1" className="animate-float">
            <animateTransform attributeName="transform" type="rotate" values="0 200 200;360 200 200" dur="20s" repeatCount="indefinite"/>
          </circle>
          <circle cx="800" cy="300" r="30" fill="url(#gradient2)" opacity="0.15" className="animate-float-reverse">
            <animateTransform attributeName="transform" type="rotate" values="360 800 300;0 800 300" dur="25s" repeatCount="indefinite"/>
          </circle>
          <circle cx="300" cy="700" r="40" fill="url(#gradient3)" opacity="0.12" className="animate-drift">
            <animateTransform attributeName="transform" type="rotate" values="0 300 700;360 300 700" dur="30s" repeatCount="indefinite"/>
          </circle>
          <circle cx="700" cy="800" r="25" fill="url(#gradient4)" opacity="0.18" className="animate-drift-slow">
            <animateTransform attributeName="transform" type="rotate" values="360 700 800;0 700 800" dur="35s" repeatCount="indefinite"/>
          </circle>
          
          {/* Floating squares */}
          <rect x="100" y="400" width="40" height="40" fill="url(#gradient5)" opacity="0.1" className="animate-pulse-glow">
            <animateTransform attributeName="transform" type="rotate" values="0 120 420;360 120 420" dur="15s" repeatCount="indefinite"/>
          </rect>
          <rect x="900" y="600" width="30" height="30" fill="url(#gradient6)" opacity="0.15" className="animate-float">
            <animateTransform attributeName="transform" type="rotate" values="360 915 615;0 915 615" dur="18s" repeatCount="indefinite"/>
          </rect>
          
          {/* Floating triangles */}
          <polygon points="500,100 520,140 480,140" fill="url(#gradient7)" opacity="0.12" className="animate-drift">
            <animateTransform attributeName="transform" type="rotate" values="0 500 120;360 500 120" dur="22s" repeatCount="indefinite"/>
          </polygon>
          <polygon points="600,900 620,940 580,940" fill="url(#gradient8)" opacity="0.16" className="animate-float-reverse">
            <animateTransform attributeName="transform" type="rotate" values="360 600 920;0 600 920" dur="28s" repeatCount="indefinite"/>
          </polygon>
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981"/>
              <stop offset="100%" stopColor="#3B82F6"/>
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B"/>
              <stop offset="100%" stopColor="#EF4444"/>
            </linearGradient>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6"/>
              <stop offset="100%" stopColor="#EC4899"/>
            </linearGradient>
            <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4"/>
              <stop offset="100%" stopColor="#3B82F6"/>
            </linearGradient>
            <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84CC16"/>
              <stop offset="100%" stopColor="#10B981"/>
            </linearGradient>
            <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316"/>
              <stop offset="100%" stopColor="#F59E0B"/>
            </linearGradient>
            <linearGradient id="gradient8" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    
    waves: (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          {/* Animated wave paths */}
          <path d="M0,300 Q250,200 500,300 T1000,300 L1000,1000 L0,1000 Z" fill="url(#waveGradient1)" opacity="0.1">
            <animateTransform attributeName="transform" type="translate" values="0,0; -100,0; 0,0" dur="20s" repeatCount="indefinite"/>
          </path>
          <path d="M0,500 Q250,400 500,500 T1000,500 L1000,1000 L0,1000 Z" fill="url(#waveGradient2)" opacity="0.08">
            <animateTransform attributeName="transform" type="translate" values="0,0; 100,0; 0,0" dur="25s" repeatCount="indefinite"/>
          </path>
          <path d="M0,700 Q250,600 500,700 T1000,700 L1000,1000 L0,1000 Z" fill="url(#waveGradient3)" opacity="0.12">
            <animateTransform attributeName="transform" type="translate" values="0,0; -150,0; 0,0" dur="30s" repeatCount="indefinite"/>
          </path>
          
          {/* Floating particles */}
          <circle cx="150" cy="200" r="3" fill="#3B82F6" opacity="0.3" className="animate-pulse-glow">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-20; 0,0" dur="4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="850" cy="300" r="2" fill="#10B981" opacity="0.4" className="animate-pulse-glow">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-15; 0,0" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="300" cy="150" r="4" fill="#F59E0B" opacity="0.25" className="animate-pulse-glow">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-25; 0,0" dur="5s" repeatCount="indefinite"/>
          </circle>
          
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981"/>
              <stop offset="100%" stopColor="#06B6D4"/>
            </linearGradient>
            <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B"/>
              <stop offset="100%" stopColor="#EF4444"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    )
  };

  return backgrounds[variant] || backgrounds.default;
};

export default SVGBackground;
