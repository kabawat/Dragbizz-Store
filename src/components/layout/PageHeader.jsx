"use client"
import React from 'react';
import { Button } from '../ui';
import { Plus, ArrowLeft } from 'lucide-react';

const PageHeader = ({
  title,
  subtitle,
  primaryAction,
  secondaryActions = [],
  breadcrumbs = [],
  showBackButton = false,
  onBack,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-8 ${className}`} {...props}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-[rgb(var(--color-text-secondary))]">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-[rgb(var(--color-text-tertiary))]">/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-[rgb(var(--color-primary))] transition-colors duration-200"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={index === breadcrumbs.length - 1 ? 'text-[rgb(var(--color-text-primary))] font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Title and Subtitle */}
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-[rgb(var(--color-text-secondary))]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Secondary Actions */}
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={action.size || 'md'}
              onClick={action.onClick}
              disabled={action.disabled}
              leftIcon={action.icon}
              className={action.className}
            >
              {action.label}
            </Button>
          ))}
          
          {/* Primary Action */}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'primary'}
              size={primaryAction.size || 'md'}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              leftIcon={primaryAction.icon || Plus}
              className={primaryAction.className}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
