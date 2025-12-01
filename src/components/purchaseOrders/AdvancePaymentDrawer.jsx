"use client"
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { paymentService } from '@/service/retailer';
import SideDrawer from '@/components/ui/SideDrawer';
import {
    IndianRupee,
    Save,
    Building2,
    FileText,
    Plus,
    Trash2
} from 'lucide-react';
import { Button, Input, Select, Textarea, Card, AddActionButton } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui';

const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CHEQUE', label: 'Cheque' }
];

const AdvancePaymentDrawer = ({ isOpen, onClose, purchaseOrder, onSuccess }) => {
    const { selectedStore } = useAppSelector((state) => state.profile);
    const { toasts, showSuccess, showError, removeToast } = useToast();

    const [formData, setFormData] = useState({
        supplierId: '',
        paymentType: 'ADVANCE_PAYMENT',
        notes: '',
        paymentMethods: [
            {
                amount: 0,
                method: 'CASH',
                reference: '',
                bankName: '',
                accountNumber: '',
                ifscCode: '',
                holderName: '',
                upiId: '',
                transactionId: '',
                chequeNumber: '',
                chequeDate: '',
                chequeBankName: '',
                chequeBranchName: ''
            }
        ]
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Reset form when drawer opens
    useEffect(() => {
        if (isOpen && purchaseOrder) {
            // Initialize form with purchase order data
            setFormData(prev => ({
                ...prev,
                supplierId: purchaseOrder.supplier?._id || purchaseOrder.supplier?.id || purchaseOrder.supplier || '',
                notes: `Advance payment for PO: ${purchaseOrder.poNumber || purchaseOrder.billNumber || ''}`,
                paymentMethods: [{
                    amount: 0,
                    method: 'CASH',
                    reference: '',
                    bankName: '',
                    accountNumber: '',
                    ifscCode: '',
                    holderName: '',
                    upiId: '',
                    transactionId: '',
                    chequeNumber: '',
                    chequeDate: '',
                    chequeBankName: '',
                    chequeBranchName: ''
                }]
            }));
            setErrors({});
        }
    }, [isOpen, purchaseOrder]);

    // Handle input change
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Handle payment method change
    const handlePaymentMethodChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            paymentMethods: prev.paymentMethods.map((method, i) =>
                i === index ? { ...method, [field]: value } : method
            )
        }));

        // Clear errors for this payment method
        if (errors[`paymentMethods[${index}].${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`paymentMethods[${index}].${field}`];
                return newErrors;
            });
        }
    };

    // Add payment method
    const addPaymentMethod = () => {
        setFormData(prev => ({
            ...prev,
            paymentMethods: [
                ...prev.paymentMethods,
                {
                    amount: 0,
                    method: 'CASH',
                    reference: '',
                    bankName: '',
                    accountNumber: '',
                    ifscCode: '',
                    holderName: '',
                    upiId: '',
                    transactionId: '',
                    chequeNumber: '',
                    chequeDate: '',
                    chequeBankName: '',
                    chequeBranchName: ''
                }
            ]
        }));
    };

    // Remove payment method
    const removePaymentMethod = (index) => {
        if (formData.paymentMethods.length > 1) {
            setFormData(prev => ({
                ...prev,
                paymentMethods: prev.paymentMethods.filter((_, i) => i !== index)
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.supplierId) {
            newErrors.supplierId = 'Supplier is required';
        }

        if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
            newErrors.paymentMethods = 'At least one payment method is required';
        }

        formData.paymentMethods.forEach((method, index) => {
            if (!method.amount || parseFloat(method.amount) <= 0) {
                newErrors[`paymentMethods[${index}].amount`] = 'Amount must be greater than 0';
            }

            if (!method.method) {
                newErrors[`paymentMethods[${index}].method`] = 'Payment method is required';
            }

            // Validate method-specific fields
            if (method.method === 'BANK_TRANSFER') {
                if (!method.bankName) {
                    newErrors[`paymentMethods[${index}].bankName`] = 'Bank name is required';
                }
                if (!method.ifscCode) {
                    newErrors[`paymentMethods[${index}].ifscCode`] = 'IFSC code is required';
                }
                if (!method.accountNumber) {
                    newErrors[`paymentMethods[${index}].accountNumber`] = 'Account number is required';
                }
            }

            if (method.method === 'UPI') {
                if (!method.upiId) {
                    newErrors[`paymentMethods[${index}].upiId`] = 'UPI ID is required';
                }
            }

            if (method.method === 'CHEQUE') {
                if (!method.chequeNumber) {
                    newErrors[`paymentMethods[${index}].chequeNumber`] = 'Cheque number is required';
                }
                if (!method.chequeDate) {
                    newErrors[`paymentMethods[${index}].chequeDate`] = 'Cheque date is required';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setErrors({});

            // Transform payment methods to match service format (service expects lowercase method names and flat properties)
            const transformedPaymentMethods = formData.paymentMethods.map(method => {
                const methodLower = method.method.toLowerCase();
                const transformed = {
                    amount: parseFloat(method.amount) || 0,
                    method: methodLower === 'bank_transfer' ? 'bank_transfer' : methodLower, // Service expects lowercase
                    reference: method.reference || ''
                };

                // Add method-specific details as flat properties (service will transform to nested objects)
                if (method.method === 'BANK_TRANSFER' || methodLower === 'bank_transfer') {
                    transformed.bankName = method.bankName || '';
                    transformed.ifscCode = method.ifscCode || '';
                    transformed.accountNumber = method.accountNumber || '';
                    transformed.holderName = method.holderName || '';
                } else if (method.method === 'UPI' || methodLower === 'upi') {
                    transformed.upiId = method.upiId || '';
                    transformed.transactionId = method.transactionId || '';
                } else if (method.method === 'CHEQUE' || methodLower === 'cheque') {
                    transformed.chequeNumber = method.chequeNumber || '';
                    transformed.chequeDate = method.chequeDate || '';
                    transformed.chequeBankName = method.chequeBankName || '';
                    transformed.chequeBranchName = method.chequeBranchName || '';
                }

                return transformed;
            });

            // Pass data in format expected by payment service (it expects paymentMethods array with flat properties)
            const paymentData = {
                supplierId: formData.supplierId,
                paymentType: 'ADVANCE_PAYMENT',
                purchaseOrder: purchaseOrder._id || purchaseOrder.id || purchaseOrder, // Optional
                paymentMethods: transformedPaymentMethods, // Service expects paymentMethods array
                notes: formData.notes || '',
                store: selectedStore?.storeId || selectedStore?._id || selectedStore?.id
            };

            const result = await paymentService.createPayment(paymentData);

            if (result.success) {
                showSuccess('Advance payment created successfully!');
                onSuccess && onSuccess();
                onClose();
            } else {
                setErrors({ general: result.message || 'Failed to create advance payment' });
                showError(result.message || 'Failed to create advance payment');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create advance payment. Please try again.';
            setErrors({ general: errorMessage });
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Calculate total amount
    const calculateTotal = () => {
        return formData.paymentMethods.reduce((sum, method) => {
            return sum + (parseFloat(method.amount) || 0);
        }, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (!isOpen || !purchaseOrder) return null;

    return (
        <>
            <SideDrawer 
                isOpen={isOpen} 
                onClose={onClose} 
                title="Advance Payment" 
                icon={IndianRupee}
                description={`Add advance payment for PO: ${purchaseOrder.poNumber || purchaseOrder.billNumber || ''}`}
                width="w-full sm:w-5/6 md:w-2/3 lg:w-1/2 xl:w-2/5" 
            >
                <div className="p-3 sm:p-4 md:p-6 h-full">
                    <div className="flex flex-col h-full">
                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
                            {/* Error message */}
                            {errors.general && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-600 dark:text-red-400">
                                    {errors.general}
                                </div>
                            )}

                            {/* Purchase Order Details */}
                            <Card className="p-4 shadow-none border-0 bg-[rgb(var(--color-bg-secondary))]">
                                <div className="flex items-center mb-3">
                                    <FileText className="w-4 h-4 mr-2 text-[rgb(var(--color-text-secondary))]" />
                                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Purchase Order Details</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[rgb(var(--color-text-secondary))]">PO Number:</span>
                                        <span className="font-semibold text-[rgb(var(--color-text-primary))]">{purchaseOrder?.poNumber || purchaseOrder?.billNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[rgb(var(--color-text-secondary))]">Items Ordered:</span>
                                        <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                            {(purchaseOrder?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[rgb(var(--color-text-secondary))]">Supplier:</span>
                                        <span className="font-semibold text-[rgb(var(--color-text-primary))] truncate ml-2">{purchaseOrder?.supplier?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[rgb(var(--color-text-secondary))]">Advance Paid:</span>
                                        <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                            {formatCurrency(purchaseOrder?.advanceAmount || purchaseOrder?.paidAmount || 0)}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Payment Methods */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                                        <IndianRupee className="w-5 h-5 mr-2 text-[rgb(var(--color-success))]" />
                                        Payment Methods
                                    </h3>
                                    <AddActionButton
                                        onClick={addPaymentMethod}
                                        label="Add Method"
                                        Icon={Plus}
                                        size="sm"
                                        variant="success"
                                    />
                                </div>

                                {formData.paymentMethods.map((method, index) => (
                                    <div key={index} className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 sm:p-4 mb-4 group">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Payment Method {index + 1}</h4>
                                            {formData.paymentMethods.length > 1 && (
                                                <button
                                                    onClick={() => removePaymentMethod(index)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[rgba(var(--color-danger),0.1)] rounded-lg transition-all cursor-pointer"
                                                    title="Remove Payment Method"
                                                >
                                                    <Trash2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-danger))] transition-colors" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                    Amount *
                                                </label>
                                                <Input
                                                    size="sm"
                                                    type="number"
                                                    value={method.amount}
                                                    onChange={(value) => handlePaymentMethodChange(index, 'amount', value || '')}
                                                    placeholder="Enter amount"
                                                    error={errors[`paymentMethods[${index}].amount`]}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                    Payment Method *
                                                </label>
                                                <Select
                                                    size="sm"
                                                    value={method.method}
                                                    onChange={(value) => handlePaymentMethodChange(index, 'method', value)}
                                                    options={PAYMENT_METHODS}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                    Reference
                                                </label>
                                                <Input
                                                    size="sm"
                                                    value={method.reference}
                                                    onChange={(value) => handlePaymentMethodChange(index, 'reference', value)}
                                                    placeholder="Transaction reference"
                                                />
                                            </div>

                                            {/* Bank Transfer fields */}
                                            {method.method === 'BANK_TRANSFER' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            Bank Name *
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            value={method.bankName}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'bankName', value)}
                                                            placeholder="Bank name"
                                                            error={errors[`paymentMethods[${index}].bankName`]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            IFSC Code *
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            value={method.ifscCode}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'ifscCode', value)}
                                                            placeholder="IFSC code"
                                                            error={errors[`paymentMethods[${index}].ifscCode`]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            Account Number *
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            value={method.accountNumber}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'accountNumber', value)}
                                                            placeholder="Account number"
                                                            error={errors[`paymentMethods[${index}].accountNumber`]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            Account Holder Name
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            value={method.holderName}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'holderName', value)}
                                                            placeholder="Holder name"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* UPI fields */}
                                            {method.method === 'UPI' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            UPI ID *
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            value={method.upiId}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'upiId', value)}
                                                            placeholder="supplier@paytm"
                                                            error={errors[`paymentMethods[${index}].upiId`]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            Transaction ID
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            value={method.transactionId}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'transactionId', value)}
                                                            placeholder="Transaction ID"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* Cheque fields */}
                                            {method.method === 'CHEQUE' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            Cheque Number *
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            value={method.chequeNumber}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'chequeNumber', value)}
                                                            placeholder="Cheque number"
                                                            error={errors[`paymentMethods[${index}].chequeNumber`]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            Cheque Date *
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            type="date"
                                                            value={method.chequeDate}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'chequeDate', value)}
                                                            error={errors[`paymentMethods[${index}].chequeDate`]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            Bank Name
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            value={method.chequeBankName}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'chequeBankName', value)}
                                                            placeholder="Bank name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                            Branch Name
                                                        </label>
                                                        <Input
                                                            size="sm"
                                                            value={method.chequeBranchName}
                                                            onChange={(value) => handlePaymentMethodChange(index, 'chequeBranchName', value)}
                                                            placeholder="Branch name"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Amount */}
                            <Card className="p-4 shadow-none border-0 bg-[rgb(var(--color-bg-secondary))]">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Total Amount:</span>
                                    <span className="text-xl font-bold text-[rgb(var(--color-primary))]">
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </Card>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                    Notes
                                </label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(value) => handleInputChange('notes', value)}
                                    placeholder="Add any additional notes..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Footer - Action Buttons */}
                        <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
                            <Button
                                variant="success"
                                onClick={handleSubmit}
                                disabled={loading}
                                loading={loading}
                                leftIcon={Save}
                                className="w-full sm:w-auto"
                                size="sm"
                            >
                                Create Payment
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={onClose}
                                disabled={loading}
                                className="w-full sm:w-auto"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </SideDrawer>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

export default AdvancePaymentDrawer;

