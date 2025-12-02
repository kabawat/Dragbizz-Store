"use client"
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  ...props
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Size variants
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div
        className={`fixed inset-0 backdrop-blur-[1px] bg-black/50 duration-300 ${overlayClassName}`}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div onClick={(e) => e.stopPropagation()} {...props} className={`relative bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all duration-300 animate-bounce-in border border-[rgb(var(--color-border-primary))] ${className}`}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border-primary))]">
              {title && (
                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors duration-200 p-1 rounded-md hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Header Component
const ModalHeader = ({ children, className = '', ...props }) => (
  <div className={`px-4 py-3 border-b border-[rgb(var(--color-border-primary))] ${className}`} {...props}>
    {children}
  </div>
);

// Modal Body Component
const ModalBody = ({ children, className = '', ...props }) => (
  <div className={`px-4 py-3 ${className}`} {...props}>
    {children}
  </div>
);

// Modal Footer Component
const ModalFooter = ({ children, className = '', ...props }) => (
  <div className={`px-4 py-3 border-t border-[rgb(var(--color-border-primary))] flex justify-end space-x-2 ${className}`} {...props}>
    {children}
  </div>
);

export { Modal, ModalHeader, ModalBody, ModalFooter };
export default Modal;
