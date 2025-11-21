"use client"
import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const bgColor = type === 'success' 
    ? 'bg-green-500' 
    : type === 'error' 
    ? 'bg-red-500' 
    : 'bg-blue-500';

  const iconColor = type === 'success' 
    ? 'text-green-600' 
    : type === 'error' 
    ? 'text-red-600' 
    : 'text-blue-600';

  return (
    <div 
      className={`fixed top-4 right-4 z-[10000] transform transition-all duration-300 ease-out ${
        isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`
        min-w-[300px] max-w-md 
        ${bgColor}
        border border-[rgb(var(--color-border-primary))] 
        rounded-lg 
        shadow-2xl 
        p-4 
        flex items-center gap-3
      `}>
        {/* Icon */}
        <div className={`
          flex-shrink-0 
          w-8 h-8 
          rounded-full 
          bg-white 
          flex items-center justify-center
        `}>
          {type === 'success' && (
            <CheckCircle className={`w-5 h-5 ${iconColor}`} />
          )}
          {type === 'error' && (
            <X className={`w-5 h-5 ${iconColor}`} />
          )}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">
            {message.split('\n').map((line, index) => (
              <p key={index} className={index > 0 ? 'mt-1' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Close button (optional, can be hidden for auto-dismiss) */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

