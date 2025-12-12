"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button, Select, Input } from '@/components/ui';
import { invoiceService } from '@/service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getInvoices } from '@/store/slices/invoicesSlice';
import { useGlobalToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

const ReleaseInvoiceModal = ({ 
    onClose, 
    invoice
}) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const { showError, showSuccess } = useGlobalToast();
    const [paymentStatus, setPaymentStatus] = useState('PAID');
    const [paidAmount, setPaidAmount] = useState('');
    const [errors, setErrors] = useState({});
    const [isReleasing, setIsReleasing] = useState(false);

    const totalAmount = invoice?.totalAmount || 0;
    const invoiceNumber = invoice?.invoiceNumber || invoice?.name || `INV-${(invoice?.id || invoice?._id)?.slice(-6)}`;

    useEffect(() => {
        if (invoice) {
            // Set default payment status and paidAmount
            setPaymentStatus(invoice?.paymentStatus || 'PAID');
            setPaidAmount(totalAmount ? totalAmount.toString() : '');
            setErrors({});
        }
    }, [invoice, totalAmount]);

    if (!invoice) return null;

    const handlePaymentStatusChange = (value) => {
        setPaymentStatus(value);
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

    const handleConfirm = async () => {
        // Validate if PAY_LATTER or PAID with paidAmount
        if ((paymentStatus === 'PAY_LATTER' || paymentStatus === 'PAID') && paidAmount) {
            const numPaidAmount = parseFloat(paidAmount);
            if (isNaN(numPaidAmount) || numPaidAmount < 0) {
                setErrors({ paidAmount: 'Paid amount must be a valid number >= 0' });
                return;
            }
        }

        if (!invoice) return;

        setIsReleasing(true);
        try {
            const invoiceId = invoice.id || invoice._id;
            const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
            
            if (!storeId) {
                showError('Store ID is missing. Please select a store.');
                setIsReleasing(false);
                return;
            }

            const result = await invoiceService.releaseInvoice(
                invoiceId,
                paymentStatus,
                storeId,
                paidAmount ? parseFloat(paidAmount) : null
            );

            if (result.success) {
                showSuccess('Invoice released successfully');
                const refreshParams = {
                    store: storeId,
                    limit: 20,
                    cursor: null,
                    isFreshLoad: true
                };
                await dispatch(getInvoices(refreshParams));

                onClose();

                // Auto-redirect to view invoice page after successful release
                router.push(`/dashboard/invoices/view/${invoiceId}`);
            } else {
                showError(result.message || 'Failed to release invoice. Please try again.');
            }
        } catch (error) {
            showError('An error occurred while releasing the invoice. Please try again.');
        } finally {
            setIsReleasing(false);
        }
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
                            onChange={(value) => handlePaidAmountChange(value)}
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
