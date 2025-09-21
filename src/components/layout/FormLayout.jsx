"use client"
import React from 'react';
import { Card } from '../ui';

const FormLayout = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`max-w-4xl mx-auto ${className}`} {...props}>
      {children}
    </div>
  );
};

const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
  collapsible = false,
  defaultExpanded = true,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  
  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };
  
  return (
    <Card
      className={`${className}`}
      {...props}
    >
      {/* Section Header */}
      <div
        className={`flex items-start justify-between ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={handleToggle}
      >
        <div className="flex items-start space-x-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-[rgb(var(--color-primary))] flex-shrink-0 mt-0.5">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] leading-tight" style={{color: 'rgb(var(--color-text-primary))'}}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1 leading-relaxed" style={{color: 'rgb(var(--color-text-secondary))'}}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {collapsible && (
          <button
            type="button"
            className="p-2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors duration-200 flex-shrink-0 mt-0.5"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Section Content */}
      {(!collapsible || isExpanded) && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </Card>
  );
};

const FieldGroup = ({
  children,
  className = '',
  columns = 2,
  ...props
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div
      className={`grid ${gridClasses[columns]} gap-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const ActionBar = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-between pt-6 mt-8 border-t border-[rgb(var(--color-border-primary))] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { FormLayout, SectionCard, FieldGroup, ActionBar };
export default FormLayout;
