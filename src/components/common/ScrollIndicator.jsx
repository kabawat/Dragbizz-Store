"use client"
import React from 'react';

const ScrollIndicator = () => {
  return (
    <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
      <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-[rgb(var(--color-primary))] rounded-full flex justify-center">
        <div className="w-1 h-3 sm:w-1.5 sm:h-4 bg-[rgb(var(--color-primary))] rounded-full mt-1.5 sm:mt-2 animate-pulse" />
      </div>
    </div>
  );
};

export default ScrollIndicator;

