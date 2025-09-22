"use client"
import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui';

const ProductDeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productName = "Product",
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] bg-black/10 flex items-center justify-center z-[9999] transition-all duration-300">
      <div className="bg-gradient-to-br from-[rgb(var(--color-bg-primary))] to-[rgb(var(--color-bg-secondary))] rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-2xl max-w-md w-full mx-4 transform transition-all duration-500">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                  Delete Product
                </h2>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-6">
            <p className="text-[rgb(var(--color-text-primary))] mb-2">
              Are you sure you want to delete this product?
            </p>
            <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 border border-[rgb(var(--color-border-primary))]">
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                "{productName}"
              </p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                This product will be permanently removed from your store
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 text-sm font-semibold border-2 border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              variant="danger"
              onClick={onConfirm}
              className="flex-1 h-10 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
              leftIcon={Trash2}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Product'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] rounded-b-2xl">
          <p className="text-xs text-[rgb(var(--color-text-tertiary))] text-center">
            This action will permanently delete the product and all its data
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDeleteConfirmModal;
