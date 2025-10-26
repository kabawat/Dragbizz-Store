"use client"
import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import Button from './Button';

const SideDrawer = ({
  isOpen,
  onClose,
  title,
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
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-[rgb(var(--color-border-primary))] flex-shrink-0">
          <h2 className="text-sm sm:text-base font-semibold text-[rgb(var(--color-text-primary))] truncate">{title}</h2>

          <div className="flex items-center gap-2">
            {showDownloadButton && onDownload && (
              <Button 
                onClick={onDownload} 
                variant="primary"
                size="md"
                leftIcon={Download}
              >
                Download Purchase Order
              </Button>
            )}
            <button onClick={onClose} className="p-1.5 cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors" >
              <X className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SideDrawer;
