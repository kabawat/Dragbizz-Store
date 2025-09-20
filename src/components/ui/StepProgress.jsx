"use client"
import React from 'react';
import { Check, Circle, ArrowRight } from 'lucide-react';

const StepProgress = ({
  steps = [],
  currentStep = 0,
  completedSteps = [],
  className = '',
  orientation = 'horizontal', // 'horizontal' or 'vertical'
  showLabels = true,
  showIcons = true,
  size = 'md', // 'sm', 'md', 'lg'
  ...props
}) => {
  const getStepStatus = (stepIndex) => {
    if (completedSteps.includes(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    if (stepIndex < currentStep) return 'completed';
    return 'upcoming';
  };

  const getStepIcon = (stepIndex, status) => {
    if (!showIcons) return null;
    
    switch (status) {
      case 'completed':
        return (
          <div className="relative">
            <Check className="w-3 h-3 text-white drop-shadow-sm" strokeWidth={3} />
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
          </div>
        );
      case 'current':
        return (
          <div className="relative">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
          </div>
        );
      default:
        return <div className="w-2 h-2 bg-[rgb(var(--color-text-tertiary))] rounded-full"></div>;
    }
  };

  const getStepClasses = (status, size) => {
    const baseClasses = 'flex items-center justify-center rounded-full border-2 transition-all duration-500 shadow-lg backdrop-blur-sm';
    const sizeClasses = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-11 h-11'
    };
    
    switch (status) {
      case 'completed':
        return `${baseClasses} ${sizeClasses[size]} bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500 shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-105`;
      case 'current':
        return `${baseClasses} ${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 shadow-blue-500/40 ring-4 ring-blue-500/20 hover:shadow-blue-500/50 hover:scale-110`;
      default:
        return `${baseClasses} ${sizeClasses[size]} bg-white/80 border-gray-300 text-gray-400 shadow-gray-200/50 hover:border-gray-400 hover:bg-white/90`;
    }
  };

  const getLabelClasses = (status) => {
    const baseClasses = 'text-xs font-bold transition-all duration-300';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} text-emerald-700 dark:text-emerald-400`;
      case 'current':
        return `${baseClasses} text-blue-700 dark:text-blue-400`;
      default:
        return `${baseClasses} text-gray-500 dark:text-gray-400`;
    }
  };

  const getConnectorClasses = (status) => {
    const baseClasses = 'transition-all duration-500 ease-out';
    
    if (status === 'completed') {
      return `${baseClasses} bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm`;
    }
    return `${baseClasses} bg-gradient-to-r from-gray-200 to-gray-300`;
  };

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`} {...props}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={index} className="flex items-start space-x-4">
              {/* Step Icon */}
              <div className="flex flex-col items-center">
                <div className={getStepClasses(status, size)}>
                  {getStepIcon(index, status)}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-8 mt-2 ${getConnectorClasses(status)}`} />
                )}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 pb-4">
                {showLabels && (
                  <div className="space-y-1">
                    <h4 className={getLabelClasses(status)}>
                      {step.title}
                    </h4>
                    {step.description && (
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                        {step.description}
                      </p>
                    )}
                    {step.details && (
                      <div className="text-xs text-[rgb(var(--color-text-tertiary))] space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center space-x-2">
                            <div className={`w-1 h-1 rounded-full ${
                              detail.completed ? 'bg-[rgb(var(--color-primary))]' : 'bg-[rgb(var(--color-border-primary))]'
                            }`} />
                            <span className={detail.completed ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-tertiary))]'}>
                              {detail.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={`flex items-center ${className}`} {...props}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;
        
        return (
          <React.Fragment key={index}>
            {/* Step */}
            <div className="flex items-center space-x-3 group">
              {/* Step Icon */}
              <div className={`${getStepClasses(status, size)} group-hover:shadow-xl flex-shrink-0`}>
                {getStepIcon(index, status)}
              </div>
              
              {/* Step Label */}
              {showLabels && (
                <div className="text-left min-w-0 flex-1">
                  <h4 className={`${getLabelClasses(status)} group-hover:scale-105 transition-transform duration-200`}>
                    {step.title}
                  </h4>
                  {step.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200 whitespace-nowrap">
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Connector */}
            {!isLast && (
              <div className="flex-1 flex items-center justify-center px-2">
                <div className={`h-1 w-full rounded-full ${getConnectorClasses(status)} shadow-sm`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepProgress;
