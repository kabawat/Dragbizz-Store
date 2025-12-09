"use client"
import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { Button, Select, Input } from '@/components/ui';

const UpdatePaymentStatusModal = ({
    isOpen,
    onClose,
    onConfirm,
    invoiceNumber,
    currentPaymentStatus,
    totalAmount,
    isUpdating
}) => {
    const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus || 'UNPAID');
    const [paidAmount, setPaidAmount] = useState('');
    const [errors, setErrors] = useState({});

    // Reset form when modal opens/closes or currentPaymentStatus changes
    useEffect(() => {
        if (isOpen) {
            setPaymentStatus(currentPaymentStatus || 'UNPAID');
            // Set default paidAmount to totalAmount
            setPaidAmount(totalAmount ? totalAmount.toString() : '');
            setErrors({});
        }
    }, [isOpen, currentPaymentStatus, totalAmount]);

    if (!isOpen) return null;

    const handlePaymentStatusChange = (value) => {
        setPaymentStatus(value);
        setErrors({});
        if (value === 'UNPAID') {
            setPaidAmount('');
        }
    };

    const handlePaidAmountChange = (value) => {
        const numValue = parseFloat(value) || 0;
        if (numValue < 0) {
            setErrors({ paidAmount: 'Paid amount cannot be negative' });
            return;
        }
        if (paymentStatus === 'PAY_LATTER' && numValue > totalAmount) {
            setErrors({ paidAmount: `Paid amount cannot exceed total amount (₹${totalAmount.toLocaleString()})` });
            return;
        }
        setPaidAmount(value);
        setErrors({});
    };

    const handleConfirm = () => {
        // Validate
        const newErrors = {};
        if (paymentStatus === 'PAY_LATTER' && paidAmount && parseFloat(paidAmount) > totalAmount) {
            newErrors.paidAmount = `Paid amount cannot exceed total amount (₹${totalAmount.toLocaleString()})`;
        }
        if (paidAmount && (isNaN(parseFloat(paidAmount)) || parseFloat(paidAmount) < 0)) {
            newErrors.paidAmount = 'Paid amount must be a valid number >= 0';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
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
                    <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Update Payment Status</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Change payment status for released invoice</p>
                    </div>
                </div>

                <p className="text-[rgb(var(--color-text-primary))] mb-4">
                    Invoice: <strong>{invoiceNumber}</strong>
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
                            { value: 'PAY_LATTER', label: 'Pay Later' }
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
                            placeholder={
                                paymentStatus === 'PAY_LATTER'
                                    ? `Enter paid amount (max ₹${totalAmount?.toLocaleString() || 0})`
                                    : `Enter paid amount (defaults to ₹${totalAmount?.toLocaleString() || 0})`
                            }
                            min="0"
                            max={paymentStatus === 'PAY_LATTER' ? totalAmount : undefined}
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
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="flex-1"
                        disabled={isUpdating}
                        loading={isUpdating}
                    >
                        {isUpdating ? 'Updating...' : 'Update Status'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UpdatePaymentStatusModal;
