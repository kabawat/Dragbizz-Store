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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Glass Effect Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300" />

      {/* Drawer */}
      <div className={`absolute right-0 top-0 h-full ${width} bg-[rgb(var(--color-bg-primary))] shadow-2xl transform transition-transform duration-300 ease-in-out`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center">
            <button onClick={onClose} className="p-2 cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors mr-3" >
              <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            </button>
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">{title}</h2>
          </div>

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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SideDrawer;
