"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { supplierService, paymentService, billService } from '@/service/retailer';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import {
  CreditCard,
  Save,
  ArrowLeft,
  Building2,
  FileText,
  CheckCircle,
  Banknote,
  Smartphone,
  CreditCard as CardIcon,
  Plus,
  Trash2
} from 'lucide-react';
import { Input, Select, Textarea, Card, Modal, ToastContainer, ErrorModal } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { extractFieldErrors } from '@/utils/validationErrorHandler';
import Link from 'next/link';

const CreatePayment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // Local state for bills
  const [bills, setBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    paymentType: 'BILL_PAYMENT',
    billId: '',
    notes: '',
    // Payment methods array
    paymentMethods: [
      {
        amount: 0,
        method: 'cash',
        reference: '',
        // Bank transfer details
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        holderName: '',
        // UPI details
        upiId: '',
        transactionId: '',
        // Cheque details
        chequeNumber: '',
        chequeDate: '',
        chequeBankName: '',
        chequeBranchName: ''
      }
    ]
  });

  const [errors, setErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toasts, showSuccess, removeToast } = useToast();

  // Refs to prevent duplicate API calls
  const suppliersFetchedRef = useRef({ storeId: null, fetched: false });
  const billsFetchedRef = useRef({ storeId: null, supplierId: null, fetched: false });

  // Get stable storeId
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  // Get bill ID from URL params
  const billId = searchParams.get('billId');

  // Set bill ID in form data if provided in URL
  useEffect(() => {
    if (billId) {
      setFormData(prev => ({
        ...prev,
        billId: billId,
        paymentType: 'BILL_PAYMENT'
      }));
    }
  }, [billId]);

  const fetchSuppliers = async () => {
    if (!storeId) {
      setSuppliers([]);
      return;
    }

    // Prevent duplicate calls for the same store
    if (suppliersFetchedRef.current.storeId === storeId && suppliersFetchedRef.current.fetched) {
      return;
    }

    // Prevent call if already loading
    if (suppliersLoading) {
      return;
    }

    suppliersFetchedRef.current = { storeId, fetched: true };

    try {
      setSuppliersLoading(true);
      const result = await supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: storeId
      });

      if (result.success) {
        const suppliersData = result.data?.data || result.data || [];
        setSuppliers(suppliersData);
      } else {
        setSuppliers([
          { id: '1', name: 'Supplier 1' },
          { id: '2', name: 'Supplier 2' },
          { id: '3', name: 'Supplier 3' }
        ]);
      }
    } catch (error) {
      setSuppliers([
        { id: '1', name: 'Supplier 1' },
        { id: '2', name: 'Supplier 2' },
        { id: '3', name: 'Supplier 3' }
      ]);
    } finally {
      setSuppliersLoading(false);
    }
  };

  // Fetch bills from API
  const fetchBills = async (supplierId) => {
    if (!supplierId || !storeId) {
      setBills([]);
      return;
    }
    if (
      billsFetchedRef.current.storeId === storeId &&
      billsFetchedRef.current.supplierId === supplierId &&
      billsFetchedRef.current.fetched
    ) {
      return;
    }

    if (billsLoading) {
      return;
    }

    billsFetchedRef.current = { storeId, supplierId, fetched: true };

    try {
      setBillsLoading(true);
      const result = await billService.getBills({
        store: storeId,
        supplier: supplierId,
        lightweight: true,
        limit: 100
      });
      if (result.success) {
        const billsData = result.data?.data || result.data || [];
        setBills(billsData);
      } else {
        setBills([]);
      }
    } catch (error) {
      setBills([]);
    } finally {
      setBillsLoading(false);
    }
  };

  // Reset refs when storeId changes
  useEffect(() => {
    if (storeId && suppliersFetchedRef.current.storeId !== storeId) {
      suppliersFetchedRef.current = { storeId: null, fetched: false };
    }
    if (storeId && billsFetchedRef.current.storeId !== storeId) {
      billsFetchedRef.current = { storeId: null, supplierId: null, fetched: false };
    }
  }, [storeId]);

  // Fetch suppliers on component mount or store change (only once per store)
  useEffect(() => {
    fetchSuppliers();
  }, [storeId]);

  // Fetch available bills when supplier is selected
  useEffect(() => {
    if (formData.supplierId && storeId) {
      // Reset bills ref when supplier changes
      if (billsFetchedRef.current.supplierId !== formData.supplierId) {
        billsFetchedRef.current = { storeId: null, supplierId: null, fetched: false };
      }
      fetchBills(formData.supplierId);
    } else {
      setBills([]);
    }
  }, [formData.supplierId, storeId]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-fill amount when bill is selected
    if (field === 'billId' && value) {
      const selectedBill = bills.find(bill => bill._id === value);
      if (selectedBill && selectedBill.dueAmount) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          paymentMethods: (Array.isArray(prev.paymentMethods) ? prev.paymentMethods : []).map((method, index) =>
            index === 0 ? { ...method, amount: selectedBill.dueAmount } : method
          )
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle payment method changes
  const handlePaymentMethodChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: (Array.isArray(prev.paymentMethods) ? prev.paymentMethods : []).map((method, i) =>
        i === index ? { ...method, [field]: value } : method
      )
    }));

    // Clear error when user starts typing
    if (errors[`paymentMethod_${index}_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`paymentMethod_${index}_${field}`]: null
      }));
    }
  };

  // Add new payment method
  const addPaymentMethod = () => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: [
        ...((Array.isArray(prev.paymentMethods) ? prev.paymentMethods : [])),
        {
          amount: '',
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
        }
      ]
    }));
  };

  // Remove payment method
  const removePaymentMethod = (index) => {
    if (Array.isArray(formData.paymentMethods) && formData.paymentMethods.length > 1) {
      setFormData(prev => ({
        ...prev,
        paymentMethods: (Array.isArray(prev.paymentMethods) ? prev.paymentMethods : []).filter((_, i) => i !== index)
      }));
    }
  };

  // Calculate total amount
  const getTotalAmount = () => {
    const methods = Array.isArray(formData?.paymentMethods) ? formData.paymentMethods : [];
    return methods.reduce((total, method) => total + (parseFloat(method?.amount) || 0), 0);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.supplierId) {
      newErrors.supplierId = 'Supplier is required';
    }

    // Validate payment methods
    if (!Array.isArray(formData.paymentMethods) || formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'At least one payment method is required';
    }

    const totalAmount = getTotalAmount();
    if (totalAmount <= 0) {
      newErrors.totalAmount = 'Total payment amount must be greater than 0';
    }

    // Validate payment type specific requirements
    if (formData.paymentType === 'BILL_PAYMENT' && !formData.billId) {
      newErrors.billId = 'Please select a bill for bill payment';
    }

    // Validate each payment method
    (Array.isArray(formData.paymentMethods) ? formData.paymentMethods : []).forEach((method, index) => {
      if (!method.amount || method.amount <= 0) {
        newErrors[`paymentMethod_${index}_amount`] = 'Valid amount is required (minimum 0.01)';
      }

      if (!method.method) {
        newErrors[`paymentMethod_${index}_method`] = 'Payment method is required';
      }

      // Validate payment method specific details
      switch (method.method) {
        case 'bank_transfer':
          if (!method.bankName) {
            newErrors[`paymentMethod_${index}_bankName`] = 'Bank name is required';
          }
          if (!method.ifscCode) {
            newErrors[`paymentMethod_${index}_ifscCode`] = 'IFSC code is required';
          }
          if (!method.accountNumber) {
            newErrors[`paymentMethod_${index}_accountNumber`] = 'Account number is required';
          }
          if (!method.holderName) {
            newErrors[`paymentMethod_${index}_holderName`] = 'Account holder name is required';
          }
          break;

        case 'upi':
          if (!method.upiId) {
            newErrors[`paymentMethod_${index}_upiId`] = 'UPI ID is required';
          }
          if (!method.transactionId) {
            newErrors[`paymentMethod_${index}_transactionId`] = 'Transaction ID is required';
          }
          break;

        case 'cheque':
          if (!method.chequeNumber) {
            newErrors[`paymentMethod_${index}_chequeNumber`] = 'Cheque number is required';
          }
          if (!method.chequeDate) {
            newErrors[`paymentMethod_${index}_chequeDate`] = 'Cheque date is required';
          }
          if (!method.chequeBankName) {
            newErrors[`paymentMethod_${index}_chequeBankName`] = 'Bank name is required';
          }
          if (!method.chequeBranchName) {
            newErrors[`paymentMethod_${index}_chequeBranchName`] = 'Branch name is required';
          }
          break;

        case 'cash':
        case 'credit':
          // Only reference is optional for cash and credit
          break;
      }
    });

    // Validate notes length (max 500 characters)
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

      // Prepare payment data according to new API structure
      const paymentData = {
        ...formData,
        store: selectedStore?.storeId
      };

      // Call payment service directly
      const result = await paymentService.createPayment(paymentData);

      if (result.success) {
        // Show success toast
        showSuccess('Payment created successfully!');
        // Redirect after a short delay
        setTimeout(() => {
          if (billId) {
            router.push(`/dashboard/bills/${billId}`);
          } else {
            router.push('/dashboard/payments');
          }
        }, 1500);
      } else {
        // Handle validation errors
        const fieldErrors = extractFieldErrors(result?.error || result);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          // Show error modal for general errors
          setErrorMessage(result.message || 'Failed to create payment. Please try again.');
          setShowErrorModal(true);
        }
      }
    } catch (error) {
      // Handle validation errors
      if (error.response && error.response.data) {
        const fieldErrors = extractFieldErrors(error.response.data);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setErrorMessage(error.response.data.message || 'An error occurred while creating the payment. Please try again.');
          setShowErrorModal(true);
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/payments');
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header title="Create New Payment" description="Create a new supplier payment" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/payments" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Payments</span>
              </Link>
            </div>

            {/* Form Container - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-260px)]">
                  <form>
                    {/* Basic Details Section */}
                    <Card className="mb-6">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                          <Building2 className="w-5 h-5 mr-2" />
                          Basic Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                              Payment Type *
                            </label>
                            <Select
                              size="sm"
                              value={formData.paymentType}
                              onChange={(value) => handleInputChange('paymentType', value)}
                              options={[
                                { value: 'BILL_PAYMENT', label: 'Bill Payment' },
                                { value: 'ADVANCE_PAYMENT', label: 'Advance Payment' },
                                { value: 'ADJUSTMENT', label: 'Adjustment' },
                                { value: 'REFUND', label: 'Refund' }
                              ]}
                              error={errors.paymentType}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                              Supplier *
                            </label>
                            <Select
                              size="sm"
                              value={formData.supplierId}
                              onChange={(value) => handleInputChange('supplierId', value)}
                              options={[
                                { value: '', label: suppliersLoading ? 'Loading suppliers...' : 'Select Supplier' },
                                ...suppliers.map(supplier => ({
                                  value: supplier.id || supplier._id,
                                  label: supplier.name || supplier.supplierName
                                }))
                              ]}
                              error={errors.supplierId}
                              disabled={suppliersLoading}
                              searchable={true}
                              placeholder="Search and select supplier..."
                            />
                          </div>

                          {formData.paymentType === 'BILL_PAYMENT' && (
                            <div>
                              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                Select Bill *
                              </label>
                              <Select
                                size="sm"
                                value={formData.billId}
                                onChange={(value) => handleInputChange('billId', value)}
                                options={[
                                  {
                                    value: '', label: billsLoading ? 'Loading bills...' :
                                      (bills.length === 0 && formData.supplierId && !billsLoading) ? 'No pending bills found' : 'Select Bill'
                                  },
                                  ...bills.map(bill => ({
                                    value: bill._id,
                                    label: `₹${bill.dueAmount} - ${bill.supplier?.name || 'Supplier'}`
                                  }))
                                ]}
                                error={errors.billId}
                                disabled={billsLoading}
                              />
                              {billId && (
                                <div className="mt-1 text-xs text-green-600">
                                  Bill auto-selected from URL
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                            Notes
                          </label>
                          <Textarea
                            value={formData.notes}
                            onChange={(value) => handleInputChange('notes', value)}
                            placeholder="Additional notes..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Payment Methods Section */}
                    <Card className="mb-6">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                            <CreditCard className="w-5 h-5 mr-2" />
                            Payment Methods
                          </h3>
                          <button
                            type="button"
                            onClick={addPaymentMethod}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-500/10 dark:hover:bg-green-500/20 rounded-lg transition-colors duration-200"
                            title="Add new payment method"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Payment Method</span>
                          </button>
                        </div>

                        {/* Total Amount Display */}
                        <div className="mb-4 p-3 rounded-lg bg-[rgb(var(--color-primary))]/10">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Total Amount:</span>
                            <span className="text-lg font-bold text-[rgb(var(--color-text-primary))]">₹ {getTotalAmount().toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Payment Methods List */}
                        <div className="space-y-4">
                          {formData.paymentMethods.map((method, index) => (
                            <Card key={index} className="rounded-lg p-4 bg-[rgb(var(--color-bg-secondary))]">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-md font-medium text-[rgb(var(--color-text-primary))]">
                                  Payment Method {index + 1}
                                </h4>
                                {formData.paymentMethods.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removePaymentMethod(index)}
                                    className="p-2 cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                                    title="Remove payment method"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                    Amount *
                                  </label>
                                  <Input
                                    size="sm"
                                    type="number"
                                    value={method.amount}
                                    onChange={(value) => handlePaymentMethodChange(index, 'amount', value || '')}
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    error={errors[`paymentMethod_${index}_amount`]}
                                  />
                                </div>

                                <div className="relative z-30">
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                    Payment Method *
                                  </label>
                                  <Select
                                    size="sm"
                                    value={method.method}
                                    onChange={(value) => handlePaymentMethodChange(index, 'method', value)}
                                    options={[
                                      { value: 'cash', label: 'Cash' },
                                      { value: 'upi', label: 'UPI' },
                                      { value: 'bank_transfer', label: 'Bank Transfer' },
                                      { value: 'cheque', label: 'Cheque' },
                                      { value: 'credit', label: 'Credit' }
                                    ]}
                                    error={errors[`paymentMethod_${index}_method`]}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                    Reference
                                  </label>
                                  <Input
                                    size="sm"
                                    value={method.reference}
                                    onChange={(value) => handlePaymentMethodChange(index, 'reference', value)}
                                    placeholder="Payment reference"
                                  />
                                </div>
                              </div>

                              {/* Payment Method Specific Details */}
                              <div>
                                {method.method === 'bank_transfer' && (
                                  <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                                      <Building2 className="w-5 h-5 mr-2" />
                                      Bank Transfer Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          Bank Name *
                                        </label>
                                        <Input
                                          size="sm"
                                          value={method.bankName}
                                          onChange={(value) => handlePaymentMethodChange(index, 'bankName', value)}
                                          placeholder="Enter bank name"
                                          error={errors[`paymentMethod_${index}_bankName`]}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          IFSC Code *
                                        </label>
                                        <Input
                                          size="sm"
                                          value={method.ifscCode}
                                          onChange={(value) => handlePaymentMethodChange(index, 'ifscCode', value)}
                                          placeholder="Enter IFSC code"
                                          error={errors[`paymentMethod_${index}_ifscCode`]}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          Account Number *
                                        </label>
                                        <Input
                                          size="sm"
                                          value={method.accountNumber}
                                          onChange={(value) => handlePaymentMethodChange(index, 'accountNumber', value)}
                                          placeholder="Enter account number"
                                          error={errors[`paymentMethod_${index}_accountNumber`]}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          Account Holder Name *
                                        </label>
                                        <Input
                                          size="sm"
                                          value={method.holderName}
                                          onChange={(value) => handlePaymentMethodChange(index, 'holderName', value)}
                                          placeholder="Enter account holder name"
                                          error={errors[`paymentMethod_${index}_holderName`]}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* UPI Details */}
                                {(method.method === 'upi' || method.method === 'UPI') && (
                                  <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                                      <Smartphone className="w-5 h-5 mr-2" />
                                      UPI Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          UPI ID *
                                        </label>
                                        <Input
                                          size="sm"
                                          value={method.upiId}
                                          onChange={(value) => handlePaymentMethodChange(index, 'upiId', value)}
                                          placeholder="Enter UPI ID (e.g., user@paytm)"
                                          error={errors[`paymentMethod_${index}_upiId`]}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          Transaction ID *
                                        </label>
                                        <Input
                                          size="sm"
                                          value={method.transactionId}
                                          onChange={(value) => handlePaymentMethodChange(index, 'transactionId', value)}
                                          placeholder="Enter transaction ID"
                                          error={errors[`paymentMethod_${index}_transactionId`]}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Cheque Details */}
                                {method.method === 'cheque' && (
                                  <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                                      <FileText className="w-5 h-5 mr-2" />
                                      Cheque Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          Cheque Number *
                                        </label>
                                        <Input
                                          size="sm"
                                          value={method.chequeNumber}
                                          onChange={(value) => handlePaymentMethodChange(index, 'chequeNumber', value)}
                                          placeholder="Enter cheque number"
                                          error={errors[`paymentMethod_${index}_chequeNumber`]}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          Cheque Date *
                                        </label>
                                        <Input
                                          size="sm"
                                          type="date"
                                          value={method.chequeDate}
                                          onChange={(value) => handlePaymentMethodChange(index, 'chequeDate', value)}
                                          error={errors[`paymentMethod_${index}_chequeDate`]}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          Bank Name *
                                        </label>
                                        <Input
                                          size="sm"
                                          value={method.chequeBankName}
                                          onChange={(value) => handlePaymentMethodChange(index, 'chequeBankName', value)}
                                          placeholder="Enter bank name"
                                          error={errors[`paymentMethod_${index}_chequeBankName`]}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                          Branch Name *
                                        </label>
                                        <Input
                                          size="sm"
                                          value={method.chequeBranchName}
                                          onChange={(value) => handlePaymentMethodChange(index, 'chequeBranchName', value)}
                                          placeholder="Enter branch name"
                                          error={errors[`paymentMethod_${index}_chequeBranchName`]}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </form>
                </div>

                {/* Action Buttons - Fixed Bottom */}
                <div className="mt-6 flex items-center justify-end space-x-3 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4">
                  <Button variant="outline" onClick={handleCancel} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    disabled={loading}
                    loading={loading}
                    leftIcon={Save}
                  >
                    Create Payment
                  </Button>
                </div>
              </div>

              {/* Tips Section - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Payment Management Tips</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Best practices for efficient payment processing</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Payment Tracking */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm">💰</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Payment Tracking</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Keep track of all supplier payments and maintain clear records</p>
                        </div>
                      </div>


                      {/* Payment Methods */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow-600 text-sm">💳</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Payment Methods</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Choose the most convenient payment method for your business</p>
                        </div>
                      </div>

                      {/* Financial Records */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm">📊</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Financial Records</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Maintain accurate financial records for tax and audit purposes</p>
                        </div>
                      </div>

                      {/* Supplier Relations */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 text-sm">🤝</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Supplier Relations</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Timely payments help maintain good supplier relationships</p>
                        </div>
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">💡 Pro Tips</h4>
                      <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                        <li>• Always verify payment details before processing</li>
                        <li>• Keep payment references for easy tracking</li>
                        <li>• Allocate payments to specific bills when possible</li>
                        <li>• Regular payments improve supplier relationships</li>
                        <li>• Maintain backup of all payment records</li>
                      </ul>
                    </div>

                    {/* Payment Status Info */}
                    <div className="mt-4 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">📝 Payment Status</h4>
                      <div className="space-y-2 text-xs text-[rgb(var(--color-text-secondary))]">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Pending - Awaiting approval</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Approved - Payment processed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Rejected - Payment declined</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
      />

    </div>
  );
};

export default CreatePayment;