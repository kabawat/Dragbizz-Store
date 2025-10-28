"use client"
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { paymentService } from '@/service/retailer';
import SideDrawer from '@/components/ui/SideDrawer';
import {
    CreditCard,
    Save,
    Building2,
    FileText,
    CheckCircle,
    Plus,
    Trash2
} from 'lucide-react';
import { Button, Input, Select, Textarea, Card, AddActionButton } from '@/components/ui';

const BillPaymentDrawer = ({ isOpen, onClose, bill, onSuccess }) => {
    const { selectedStore } = useAppSelector((state) => state.profile);

    const [formData, setFormData] = useState({
        supplierId: '',
        paymentType: 'BILL_PAYMENT',
        billId: '',
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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdPaymentNumber, setCreatedPaymentNumber] = useState('');

    // Reset form when drawer opens
    useEffect(() => {
        if (isOpen && bill) {
            // Initialize form with bill data
            setFormData(prev => ({
                ...prev,
                supplierId: bill.supplier?._id || bill.supplier?.id || '',
                billId: bill._id || bill.id || '',
                notes: `Payment for ${bill.billNumber || bill.bill_id}`,
                paymentMethods: [{
                    amount: bill.dueAmount || Math.max((bill.totalAmount || 0) - (bill.paidAmount || 0), 0),
                    method: 'cash',
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
    }, [isOpen, bill]);


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
    };

    // Add payment method
    const addPaymentMethod = () => {
        setFormData(prev => ({
            ...prev,
            paymentMethods: [...prev.paymentMethods, {
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
    };

    // Remove payment method
    const removePaymentMethod = (index) => {
        setFormData(prev => ({
            ...prev,
            paymentMethods: prev.paymentMethods.filter((_, i) => i !== index)
        }));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate payment methods
        if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
            newErrors.paymentMethods = 'At least one payment method is required';
        } else {
            formData.paymentMethods.forEach((method, index) => {
                // Validate amount
                if (!method.amount || method.amount <= 0) {
                    newErrors[`paymentMethods[${index}].amount`] = 'Amount must be greater than 0';
                }

                // Validate method-specific fields
                switch (method.method) {
                    case 'BANK_TRANSFER':
                        if (!method.bankName) {
                            newErrors[`paymentMethods[${index}].bankName`] = 'Bank name is required';
                        }
                        if (!method.accountNumber) {
                            newErrors[`paymentMethods[${index}].accountNumber`] = 'Account number is required';
                        }
                        if (!method.ifscCode) {
                            newErrors[`paymentMethods[${index}].ifscCode`] = 'IFSC code is required';
                        }
                        if (!method.holderName) {
                            newErrors[`paymentMethods[${index}].holderName`] = 'Holder name is required';
                        }
                        break;

                    case 'UPI':
                        if (!method.upiId) {
                            newErrors[`paymentMethods[${index}].upiId`] = 'UPI ID is required';
                        }
                        if (!method.transactionId) {
                            newErrors[`paymentMethods[${index}].transactionId`] = 'Transaction ID is required';
                        }
                        break;

                    case 'CHEQUE':
                        if (!method.chequeNumber) {
                            newErrors[`paymentMethods[${index}].chequeNumber`] = 'Cheque number is required';
                        }
                        if (!method.chequeDate) {
                            newErrors[`paymentMethods[${index}].chequeDate`] = 'Cheque date is required';
                        }
                        if (!method.chequeBankName) {
                            newErrors[`paymentMethods[${index}].chequeBankName`] = 'Bank name is required';
                        }
                        break;

                    case 'CASH':
                    case 'CREDIT':
                        break;
                }
            });
        }

        // Validate notes length
        if (formData.notes && formData.notes.length > 500) {
            newErrors.notes = 'Notes cannot exceed 500 characters';
        }

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

            const paymentData = {
                ...formData,
                store: selectedStore?.storeId || selectedStore?._id || selectedStore?.id
            };

            const result = await paymentService.createPayment(paymentData);

            if (result.success) {
                setCreatedPaymentNumber(result.data?.paymentNumber || 'Payment');
                setShowSuccessModal(true);
            } else {
                setErrors({ general: result.message || 'Failed to create payment' });
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            setErrors({ general: 'Failed to create payment. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        onClose();
    };

    // Success modal handlers
    const handleContinue = () => {
        setShowSuccessModal(false);
        onSuccess && onSuccess();
        onClose();
    };

    const handleAddMore = () => {
        setShowSuccessModal(false);
        // Reset form
        setFormData({
            supplierId: '',
            paymentType: 'BILL_PAYMENT',
            billId: '',
            notes: '',
            paymentMethods: [{
                amount: 0,
                method: 'cash',
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
        });
        setErrors({});
    };

    if (!isOpen) return null;

    return (
        <>
            <SideDrawer isOpen={isOpen && !showSuccessModal} onClose={handleCancel} title="Pay Bill" width="w-full sm:w-5/6 md:w-2/3 lg:w-1/2 xl:w-2/5" >
                <div className="flex flex-col h-full">
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Error message */}
                        {errors.general && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-600 dark:text-red-400">
                                {errors.general}
                            </div>
                        )}

                    {/* Bill Details - Compact Display */}
                    <div className="px-0 sm:px-2 py-3 sm:py-4 border-b border-[rgb(var(--color-border-primary))]">
                            <div className="flex items-center mb-3">
                                <Building2 className="w-4 h-4 mr-2 text-[rgb(var(--color-text-secondary))]" />
                                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Bill Details</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-secondary))]">Bill Number:</span>
                                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">{bill?.billNumber || bill?.bill_id || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-secondary))]">Total Amount:</span>
                                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(bill?.totalAmount || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-secondary))]">Supplier:</span>
                                    <span className="font-semibold text-[rgb(var(--color-text-primary))] truncate ml-2">{bill?.supplier?.name || 'N/A'}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-secondary))]">Due Amount:</span>
                                    <span className="font-bold text-[rgb(var(--color-danger))] text-base">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(bill?.dueAmount || Math.max((bill?.totalAmount || 0) - (bill?.paidAmount || 0), 0))}
                                    </span>
                                </div>
                            </div>
                        </div>

                    <div className="px-0 sm:px-2">
                        <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-[rgb(var(--color-success))]" />
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
                                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-rimary))]">Payment Method {index + 1}</h4>
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                options={[
                                                    { value: 'CASH', label: 'CASH' },
                                                    { value: 'UPI', label: 'UPI' },
                                                    { value: 'BANK_TRANSFER', label: 'BANK_TRANSFER' },
                                                    { value: 'CHEQUE', label: 'CHEQUE' },
                                                    { value: 'CREDIT', label: 'CREDIT' }
                                                ]}
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
                                                        placeholder="Enter bank name"
                                                        error={errors[`paymentMethods[${index}].bankName`]}
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
                                                        placeholder="Enter account number"
                                                        error={errors[`paymentMethods[${index}].accountNumber`]}
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
                                                        placeholder="Enter IFSC code"
                                                        error={errors[`paymentMethods[${index}].ifscCode`]}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                        Holder Name *
                                                    </label>
                                                    <Input
                                                        size="sm"
                                                        value={method.holderName}
                                                        onChange={(value) => handlePaymentMethodChange(index, 'holderName', value)}
                                                        placeholder="Enter holder name"
                                                        error={errors[`paymentMethods[${index}].holderName`]}
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
                                                        placeholder="Enter UPI ID"
                                                        error={errors[`paymentMethods[${index}].upiId`]}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                        Transaction ID *
                                                    </label>
                                                    <Input
                                                        size="sm"
                                                        value={method.transactionId}
                                                        onChange={(value) => handlePaymentMethodChange(index, 'transactionId', value)}
                                                        placeholder="Enter transaction ID"
                                                        error={errors[`paymentMethods[${index}].transactionId`]}
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
                                                        placeholder="Enter cheque number"
                                                        error={errors[`paymentMethods[${index}].chequeNumber`]}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                        Cheque Date *
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        size="sm"
                                                        value={method.chequeDate}
                                                        onChange={(value) => handlePaymentMethodChange(index, 'chequeDate', value)}
                                                        placeholder="Enter cheque date"
                                                        error={errors[`paymentMethods[${index}].chequeDate`]}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                        Bank Name *
                                                    </label>
                                                    <Input
                                                        size="sm"
                                                        value={method.chequeBankName}
                                                        onChange={(value) => handlePaymentMethodChange(index, 'chequeBankName', value)}
                                                        placeholder="Enter bank name"
                                                        error={errors[`paymentMethods[${index}].chequeBankName`]}
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
                                                        placeholder="Enter branch name"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Reference field for cash and credit */}
                                        {(method.method === 'CASH' || method.method === 'CREDIT') && (
                                            <div>
                                                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                                    Reference
                                                </label>
                                                <Input
                                                    size="sm"
                                                    value={method.reference}
                                                    onChange={(value) => handlePaymentMethodChange(index, 'reference', value)}
                                                    placeholder="Enter reference (optional)"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                    <div className="px-0 sm:px-2">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Additional Notes
                            </h3>
                            <Textarea
                                value={formData.notes}
                                onChange={(value) => handleInputChange('notes', value)}
                                placeholder="Add any additional notes..."
                                rows={4}
                                maxLength={500}
                                error={errors.notes}
                            />
                            <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
                                {formData.notes.length}/500 characters
                            </p>
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="flex items-center justify-start gap-3 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] flex-shrink-0">
                        <Button onClick={handleSubmit} variant="primary" disabled={loading} loading={loading} leftIcon={Save} size="sm" >
                            Save Payment
                        </Button>
                        <Button onClick={handleCancel} variant="outline" disabled={loading} size="sm" >
                            Cancel
                        </Button>
                    </div>
                </div>
            </SideDrawer>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[10000] overflow-hidden flex items-start justify-center pt-8 bg-black/50 backdrop-blur-[1px]">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                Payment Created Successfully!
                            </h3>
                            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                                Payment <span className="font-medium">{createdPaymentNumber}</span> has been created successfully.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleAddMore} className="flex-1" >
                                    Add Another Payment
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleContinue}
                                    className="flex-1"
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BillPaymentDrawer;