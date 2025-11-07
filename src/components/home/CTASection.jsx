"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Card, Badge } from '@/components/ui';
import { ArrowRight, PlayCircle, Rocket, CheckCircle } from 'lucide-react';

const CTASection = ({
  badge = 'Ready to Transform Your Business?',
  title = 'Start Your Journey Today',
  description = 'Join thousands of successful retailers who have transformed their business operations with DragBizz. Get started in minutes, no credit card required.',
  primaryCTA = 'Start Free Trial',
  secondaryCTA = 'Schedule Demo',
  onPrimaryClick,
  onSecondaryClick,
  trustIndicators = [
    { text: '14-day free trial' },
    { text: 'No credit card required' },
    { text: 'Cancel anytime' }
  ]
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const squareImages = Array.from({ length: 14 }, (_, i) => `/images/3d/square_${String(i + 1).padStart(3, '0')}.png`);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % squareImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <section id="cta" className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary))]/20 via-purple-500/20 to-pink-500/20" />
        {squareImages.slice(0, 6).map((img, index) => (
          <div
            key={index}
            className="absolute opacity-15 hidden sm:block w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px]"
            style={{
              top: `${15 + (index % 3) * 30}%`,
              left: `${10 + (index % 2) * 45}%`,
              transform: `rotate(${index * 25}deg)`,
              filter: 'blur(60px)'
            }}
          >
            <Image src={img} alt="" fill className="object-contain" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <Card className="bg-[rgb(var(--color-bg-primary))]/95 backdrop-blur-xl border-2 border-[rgb(var(--color-primary))]/30 shadow-2xl overflow-hidden">
          <div className="text-center py-10 sm:py-12 md:py-16 px-4 sm:px-5 md:px-6">
            <div className="inline-block mb-4 sm:mb-5 md:mb-6">
              <Badge variant="primary" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                {badge}
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
              {title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[rgb(var(--color-text-secondary))] mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-4 sm:mb-5 md:mb-6">
              <Button 
                variant="primary" 
                size="md"
                rightIcon={ArrowRight}
                className="text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 shadow-glow hover:scale-105 transition-transform w-full sm:w-auto"
                onClick={handlePrimaryClick}
              >
                {primaryCTA}
              </Button>
              <Button 
                variant="outline" 
                size="md"
                leftIcon={PlayCircle}
                className="text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 border-2 hover:scale-105 transition-transform w-full sm:w-auto"
                onClick={onSecondaryClick}
              >
                {secondaryCTA}
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6 text-xs sm:text-sm text-[rgb(var(--color-text-tertiary))]">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span>{indicator.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;

