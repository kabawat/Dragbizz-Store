"use client"
import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import { Button } from '../ui';

const InvoiceAddSuccessModal = ({
  isOpen,
  onClose,
  invoiceNumber,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 mt-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Invoice Created Successfully!
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {invoiceNumber ? (
              <>Invoice <span className="font-semibold text-[rgb(var(--color-text-primary))]">"{invoiceNumber}"</span> has been created successfully.</>
            ) : (
              'Your invoice has been created successfully.'
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClose}>
              Continue
            </Button>
            <Button variant="primary" onClick={onClose}>
              View Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceAddSuccessModal;
