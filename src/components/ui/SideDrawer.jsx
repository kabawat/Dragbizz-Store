"use client"
import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import Button from './Button';

const SideDrawer = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  description,
  children,
  width = 'w-2/3',
  showDownloadButton = false,
  onDownload = null
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] overflow-hidden">
      {/* Glass Effect Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300" />

      {/* Drawer */}
      <div className={`absolute right-0 top-0 h-full ${width} max-w-full bg-[rgb(var(--color-bg-primary))] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col z-[9999]`}>
        {/* Header */}
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-[rgb(var(--color-border-primary))] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {Icon && (
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-primary))]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[rgb(var(--color-text-primary))] truncate">{title}</h2>
                {description && (
                  <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] truncate mt-0.5">{description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
            {showDownloadButton && onDownload && (
              <Button 
                onClick={onDownload} 
                variant="primary"
                size="sm"
                className="hidden sm:flex"
                leftIcon={Download}
              >
                <span className="hidden md:inline">Download Purchase Order</span>
                <span className="md:hidden">Download</span>
              </Button>
            )}
            <button onClick={onClose} className="p-1.5 sm:p-2 cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors" >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-text-secondary))]" />
            </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SideDrawer;
