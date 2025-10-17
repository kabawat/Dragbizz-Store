"use client"
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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
      <div 
        className="absolute inset-0 backdrop-blur-[1px] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`absolute right-0 top-0 h-full ${width} bg-white shadow-xl transform transition-transform duration-300 ease-in-out`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          
          {showDownloadButton && onDownload && (
            <button
              onClick={onDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Purchase Order
            </button>
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
