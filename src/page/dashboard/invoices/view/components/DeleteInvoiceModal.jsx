"use client"
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';

const DeleteInvoiceModal = ({ isOpen, onClose, onConfirm, invoiceNumber, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-[rgb(var(--color-danger))]/10 rounded-full flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-[rgb(var(--color-danger))]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Delete Invoice</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">This action cannot be undone</p>
                    </div>
                </div>
                <p className="text-[rgb(var(--color-text-primary))] mb-6">
                    Are you sure you want to delete invoice <strong>{invoiceNumber}</strong>?
                    This will permanently remove the invoice and all its data.
                </p>
                <div className="flex space-x-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="flex-1 bg-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/90"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteInvoiceModal;

