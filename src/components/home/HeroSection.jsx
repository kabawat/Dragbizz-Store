"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Badge } from '@/components/ui';
import { StatsCard, ScrollIndicator } from '@/components/common';
import { ArrowRight, PlayCircle, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';

const HeroSection = ({ 
  heroFeatures = [
    { icon: Zap, text: 'Lightning Fast' },
    { icon: Shield, text: 'Secure' },
    { icon: TrendingUp, text: 'Scalable' },
    { icon: Sparkles, text: 'AI-Powered' }
  ],
  stats = []
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const squareImages = Array.from({ length: 14 }, (_, i) => `/images/3d/square_${String(i + 1).padStart(3, '0')}.png`);
  const rectangleImage = '/images/3d/rectangle_001.png';

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % squareImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14 sm:pt-16 md:pt-20">
      {/* Animated 3D Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary))]/5 via-transparent to-[rgb(var(--color-secondary))]/5" />
        
          {/* Floating 3D Images */}
          {squareImages.slice(0, 8).map((img, index) => (
            <div
              key={index}
              className={`absolute transition-all duration-3000 ease-in-out hidden sm:block w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[350px] md:h-[350px] ${
                index === currentImageIndex ? 'opacity-20' : 'opacity-5'
              }`}
              style={{
                top: `${15 + (index % 4) * 20}%`,
                left: `${10 + (index % 3) * 30}%`,
                transform: `rotate(${index * 20}deg) scale(${0.7 + (index % 3) * 0.15})`,
                filter: 'blur(50px)',
                zIndex: 1
              }}
            >
              <Image
                src={img}
                alt={`3D Background ${index + 1}`}
                fill
                className="object-contain"
                priority={index === currentImageIndex}
              />
            </div>
          ))}

        {/* Rectangle Image */}
        <div className="absolute top-1/3 right-2 sm:right-5 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] opacity-15 animate-float hidden sm:block">
          <Image
            src={rectangleImage}
            alt="3D Rectangle"
            fill
            className="object-contain"
            style={{ filter: 'blur(70px)' }}
          />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Content */}
      <div className={`relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-16 md:py-20 text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <Badge variant="primary" className="mb-4 sm:mb-6 animate-fade-in inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>All-in-One Retail Solution</span>
        </Badge>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight px-2">
          <span className="block mb-1 sm:mb-2">Manage Your</span>
          <span className="block gradient-text bg-gradient-to-r from-[rgb(var(--color-primary))] via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Retail Business
          </span>
          <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-1 sm:mt-2 text-[rgb(var(--color-text-secondary))]">
            Like Never Before
          </span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[rgb(var(--color-text-secondary))] mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
          Powerful, intuitive, and scalable retail management platform designed to help 
          businesses of all sizes streamline operations and boost profitability.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center mb-8 sm:mb-10 md:mb-12 px-4">
          <Button 
            variant="primary" 
            size="md"
            rightIcon={ArrowRight}
            className="text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 shadow-glow hover:scale-105 transition-transform w-full sm:w-auto"
            onClick={() => window.location.href = '/login'}
          >
            Get Started Free
          </Button>
          <Button 
            variant="outline" 
            size="md"
            leftIcon={PlayCircle}
            className="text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 hover:scale-105 transition-transform border-2 w-full sm:w-auto"
          >
            Watch Demo
          </Button>
        </div>

        {/* Quick Features */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-10 sm:mb-12 md:mb-16 px-4">
          {heroFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[rgb(var(--color-bg-secondary))]/50 backdrop-blur-sm rounded-full border border-[rgb(var(--color-border-primary))] animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-primary))]" />
              <span className="text-xs sm:text-sm font-medium text-[rgb(var(--color-text-primary))]">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto px-4">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                color={stat.color}
                delay={index * 0.1}
              />
            ))}
          </div>
        )}
      </div>

      <ScrollIndicator />
    </section>
  );
};

export default HeroSection;

