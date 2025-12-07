"use client"
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button, Select } from '@/components/ui';

const ReleaseInvoiceModal = ({ isOpen, onClose, onConfirm, invoiceNumber, paymentStatus, onPaymentStatusChange, isReleasing }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-[1px] bg-black/10 flex items-center justify-center z-[9999]">
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-[rgb(var(--color-success))]/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-[rgb(var(--color-success))]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Release Invoice</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">This will finalize the invoice</p>
                    </div>
                </div>
                <p className="text-[rgb(var(--color-text-primary))] mb-4">
                    Are you sure you want to release invoice <strong>{invoiceNumber}</strong>?
                    This will finalize the invoice and it cannot be edited afterwards.
                </p>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                        Payment Status
                    </label>
                    <Select
                        value={paymentStatus}
                        onChange={onPaymentStatusChange}
                        options={[
                            { value: 'UNPAID', label: 'Unpaid' },
                            { value: 'PAID', label: 'Paid' },
                            { value: 'PAY_LATTER', label: 'Pay Later' },
                            { value: 'CANCELLED', label: 'Cancelled' }
                        ]}
                        placeholder="Select payment status"
                    />
                </div>
                <div className="flex space-x-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                        disabled={isReleasing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="flex-1"
                        disabled={isReleasing}
                    >
                        {isReleasing ? 'Releasing...' : 'Release Invoice'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReleaseInvoiceModal;

