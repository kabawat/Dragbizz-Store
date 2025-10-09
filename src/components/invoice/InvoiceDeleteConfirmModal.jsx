"use client"
import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../ui';

const InvoiceDeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  invoiceNumber,
  isLoading = false,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 mt-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Delete Invoice
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {invoiceNumber ? (
              <>Are you sure you want to delete invoice <span className="font-semibold text-[rgb(var(--color-text-primary))]">"{invoiceNumber}"</span>? This action cannot be undone.</>
            ) : (
              'Are you sure you want to delete this invoice? This action cannot be undone.'
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm} loading={isLoading}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDeleteConfirmModal;
