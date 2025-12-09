"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button, Select, Input } from '@/components/ui';

const ReleaseInvoiceModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    invoiceNumber, 
    paymentStatus, 
    onPaymentStatusChange, 
    isReleasing,
    totalAmount = 0 
}) => {
    const [paidAmount, setPaidAmount] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            // Set default paidAmount to totalAmount
            setPaidAmount(totalAmount ? totalAmount.toString() : '');
            setErrors({});
        }
    }, [isOpen, totalAmount]);

    if (!isOpen) return null;

    const handlePaymentStatusChange = (value) => {
        if (onPaymentStatusChange) {
            onPaymentStatusChange(value);
        }
        setErrors({});
        if (value === 'UNPAID') {
            setPaidAmount('');
        } else if (value === 'PAID' || value === 'PAY_LATTER') {
            // Set default to totalAmount for PAID and PAY_LATTER
            setPaidAmount(totalAmount ? totalAmount.toString() : '');
        }
    };

    const handlePaidAmountChange = (value) => {
        const numValue = parseFloat(value) || 0;
        if (numValue < 0) {
            setErrors({ paidAmount: 'Paid amount cannot be negative' });
            return;
        }
        setPaidAmount(value);
        setErrors({});
    };

    const handleConfirm = () => {
        // Validate if PAY_LATTER or PAID with paidAmount
        if ((paymentStatus === 'PAY_LATTER' || paymentStatus === 'PAID') && paidAmount) {
            const numPaidAmount = parseFloat(paidAmount);
            if (isNaN(numPaidAmount) || numPaidAmount < 0) {
                setErrors({ paidAmount: 'Paid amount must be a valid number >= 0' });
                return;
            }
        }

        const payload = {
            paymentStatus,
            ...(paidAmount ? { paidAmount: parseFloat(paidAmount) } : {})
        };

        onConfirm(payload);
    };

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
                <div className="mb-4">
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                        Payment Status
                    </label>
                    <Select
                        value={paymentStatus}
                        onChange={handlePaymentStatusChange}
                        options={[
                            { value: 'PAID', label: 'Paid' },
                            { value: 'UNPAID', label: 'Unpaid' },
                            { value: 'PAY_LATTER', label: 'Pay Later' },
                            { value: 'CANCELLED', label: 'Cancelled' }
                        ]}
                        placeholder="Select payment status"
                    />
                </div>

                {(paymentStatus === 'PAY_LATTER' || paymentStatus === 'PAID') && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            Paid Amount {paymentStatus === 'PAY_LATTER' ? '(Optional)' : '(Optional)'}
                        </label>
                        <Input
                            type="number"
                            value={paidAmount}
                            onChange={(e) => handlePaidAmountChange(e.target.value)}
                            placeholder={`Enter paid amount (max ₹${totalAmount?.toLocaleString() || 0})`}
                            min="0"
                            step="0.01"
                            className={errors.paidAmount ? 'border-red-500' : ''}
                        />
                        {errors.paidAmount && (
                            <p className="text-red-500 text-xs mt-1">{errors.paidAmount}</p>
                        )}
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                            Total Invoice Amount: ₹{totalAmount?.toLocaleString() || 0}
                            {paymentStatus === 'PAY_LATTER' && ' • Leave empty for ₹0'}
                            {paymentStatus === 'PAID' && ' • Leave empty for full payment'}
                        </p>
                    </div>
                )}

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
                        onClick={handleConfirm}
                        className="flex-1"
                        disabled={isReleasing}
                        loading={isReleasing}
                    >
                        {isReleasing ? 'Releasing...' : 'Release Invoice'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReleaseInvoiceModal;
