"use client"
import React, { useState, useEffect } from 'react';
import { WifiOff, TriangleAlert } from 'lucide-react';

const NetworkError = ({ isVisible, onRetry, onDismiss }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center justify-center max-w-md mx-auto px-6">
        <div className="relative mb-8">
          <div className="w-24 h-24 flex items-center justify-center">
            <WifiOff className="w-20 h-20 text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2">
            <TriangleAlert className="w-10 h-10 text-orange-500" strokeWidth={2.5} fill="white" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          No Internet Connection
        </h2>

        <p className="text-gray-600 text-center mb-8 text-base">
          Please check your internet connection and try again.
        </p>

        <div className="flex gap-3 w-full">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkError;

