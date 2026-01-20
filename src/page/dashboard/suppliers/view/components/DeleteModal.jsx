"use client";
import React from 'react';
import { Button } from '@/components/ui';

const DeleteModal = ({ 
  isOpen, 
  supplierName, 
  onCancel, 
  onConfirm, 
  isDeleting 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
          Delete Supplier
        </h3>
        <p className="text-[rgb(var(--color-text-secondary))] mb-6">
          Are you sure you want to delete "{supplierName || "Supplier"}"? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;

