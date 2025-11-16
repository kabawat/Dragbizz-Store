"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { supplierService, productService, purchaseOrderService } from '@/service/retailer';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import {
  FileText,
  Plus,
  Save,
  X,
  Building2,
  Package,
  IndianRupee,
  Calendar,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button, Input, Select, Textarea, Card, Modal, Toggle, AddActionButton } from '@/components/ui';
import Link from 'next/link';

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CASH', label: 'Cash' }
];

const formInit = {
  supplier: '',
  expectedDeliveryDate: '',
  paymentBy: '30_DAYS',
  reference: '',
  note: '',
  products: [],
  payment: []
}

const CreatePurchaseOrder = () => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [formData, setFormData] = useState(formInit);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [showAdvancePayment, setShowAdvancePayment] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPONumber, setCreatedPONumber] = useState('');
  const [createdPOId, setCreatedPOId] = useState('');
  const [tempProduct, setTempProduct] = useState('');
  const [tempQuantity, setTempQuantity] = useState(1);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    if (!selectedStore?.storeId) return;
    try {
      setSuppliersLoading(true);
      const result = await supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: selectedStore.storeId
      });
      if (result.success) {
        const data = result.data?.data || result.data || [];
        setSuppliers(data);
      }
    } finally {
      setSuppliersLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    if (!selectedStore?.storeId) return;
    try {
      setProductsLoading(true);
      const result = await productService.getProducts({
        limit: 100,
        lightweight: true,
        store: selectedStore.storeId
      });
      if (result.success) {
        const data = result.data?.data || result.data || [];
        setProducts(data);
      }
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, [selectedStore]);

  // No auto date rules required for provided payload

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.products];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'product') {
      const selected = products.find(p => (p.id || p._id) === value);
      if (selected) {
        updated[index].productName = selected.name || selected.productName || '';
      }
    }
    setFormData(prev => ({ ...prev, products: updated }));
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addItem = () => {
    if (!tempProduct) {
      setErrors(prev => ({ ...prev, add_product: 'Select a product' }));
      return;
    }
    if (!tempQuantity || Number(tempQuantity) <= 0 || !Number.isInteger(Number(tempQuantity))) {
      setErrors(prev => ({ ...prev, add_quantity: 'Enter a valid integer > 0' }));
      return;
    }
    const selected = products.find(p => (p.id || p._id) === tempProduct);
    const productName = selected ? (selected.name || selected.productName || '') : '';

    setFormData(prev => {
      const existingIndex = prev.products.findIndex(item => item.product === tempProduct);
      if (existingIndex !== -1) {
        const updated = [...prev.products];
        const existing = updated[existingIndex];
        const newQty = (parseInt(existing.quantity) || 0) + parseInt(tempQuantity);
        updated[existingIndex] = { ...existing, productName: existing.productName || productName, quantity: newQty };
        return { ...prev, products: updated };
      }
      return {
        ...prev,
        products: [
          ...prev.products,
          { product: tempProduct, productName, quantity: parseInt(tempQuantity) }
        ]
      };
    });
    setTempProduct('');
    setTempQuantity(1);
    setErrors(prev => ({ ...prev, add_product: '', add_quantity: '' }));
  };

  const removeItem = (index) => {
    const updated = formData.products.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, products: updated }));
  };

  const addPayment = () => {
    if (!paymentAmount || !paymentReference) return;

    const newPayment = {
      method: paymentMethod,
      amount: parseFloat(paymentAmount),
      reference: paymentReference,
      details: paymentDetails
    };

    setFormData(prev => ({
      ...prev,
      payment: [...prev.payment, newPayment]
    }));

    // Reset form
    setPaymentAmount('');
    setPaymentReference('');
    setPaymentDetails({});
  };

  const removePayment = (index) => {
    const updatedPayments = formData.payment.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, payment: updatedPayments }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentDetails({});
  };

  const updatePaymentDetails = (key, value) => {
    setPaymentDetails(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplier) newErrors.supplier = 'Supplier is required';
    if (formData.poDate && new Date(formData.poDate) > new Date()) newErrors.poDate = 'PO date cannot be in the future';
    if (formData.expectedDeliveryDate && formData.poDate && new Date(formData.expectedDeliveryDate) < new Date(formData.poDate)) newErrors.expectedDeliveryDate = 'Expected delivery cannot be before PO date';
    if (formData.validUntil && formData.poDate && new Date(formData.validUntil) < new Date(formData.poDate)) newErrors.validUntil = 'Valid until cannot be before PO date';
    if (formData.notes && formData.notes.length > 500) newErrors.notes = 'Notes cannot exceed 500 characters';

    if (!formData.products || formData.products.length === 0) newErrors.items = 'At least one product is required';
    formData.products.forEach((item, index) => {
      if (!item.product) newErrors[`item_${index}_product`] = 'Product is required';
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(Number(item.quantity))) newErrors[`item_${index}_quantity`] = 'Valid quantity (integer > 0) is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm() && !isDraft) return;
    try {
      setIsCreating(true);
      setCreateError(null);

      const poPayload = {
        store: selectedStore.storeId,
        supplier: formData.supplier,
        products: formData.products.map(item => ({
          product: item.product,
          quantity: parseInt(item.quantity)
        })),
        payment: formData.payment,
        paymentBy: formData.paymentBy,
        reference: formData.reference || undefined,
        note: formData.note || undefined,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined
      };

      const result = await purchaseOrderService.createPurchaseOrder(poPayload);
      if (result.success) {
        setCreatedPONumber(result.data?.poNumber || `PO-${Date.now()}`);
        setCreatedPOId(result.data?.id || result.data?._id || '');
        setShowSuccessModal(true);
      } else {
        setCreateError(result.message || 'Failed to create purchase order');
      }
    } catch (error) {
      setCreateError('An unexpected error occurred while creating the purchase order');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveDraft = () => {
    setShowSaveDraftModal(true);
  };

  const handleConfirmSaveDraft = () => {
    handleSubmit(true);
    setShowSaveDraftModal(false);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    if (createdPOId) {
      router.push(`/dashboard/purchase-orders/${createdPOId}`);
    } else {
      router.push('/dashboard/purchase-orders');
    }
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    setFormData(formInit);
  };

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar />

      <div className="min-h-screen w-full flex flex-col">
        <Header
          title="Create Purchase Order"
          description="Add a new purchase order for suppliers"
        />

        <div className="flex-1 p-6">
          <div className="w-full">
            {/* Breadcrumb */}
            <div className="mb-4 w-full mx-auto">
              <Link href="/dashboard/purchase-orders" className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-all duration-200 border border-transparent hover:border-[rgb(var(--color-border-primary))]">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Purchase Orders</span>
              </Link>
            </div>

            <div className="flex flex-col h-full" style={{ height: 'calc(100vh-208px)' }}>
              <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)]">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  {/* Main Form Container */}
                  <div className="w-full mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                      {/* Left Column - Main Form */}
                      <div className="space-y-6">

                        {/* Basic Information Card */}
                        <Card>
                          <div className="p-5">
                            <div className="flex items-center mb-6">
                              <div className="w-10 h-10 rounded-lg flex border border-[rgb(var(--color-border-primary))] items-center justify-center mr-3" style={{ backgroundColor: 'rgba(var(--color-primary), 0.1)' }}>
                                <FileText className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Basic Information</h3>
                                <p className="text-sm text-[rgb(var(--color-text-secondary))]">Essential details for the purchase order</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">Supplier *</label>
                                <Select
                                  value={formData.supplier}
                                  onChange={(value) => handleInputChange('supplier', value)}
                                  options={[
                                    { value: '', label: suppliersLoading ? 'Loading...' : 'Select Supplier' },
                                    ...suppliers.filter(s => s.name || s.supplierName).map(s => ({ value: s.id || s._id, label: s.name || s.supplierName }))
                                  ]}
                                  error={errors.supplier}
                                  disabled={suppliersLoading}
                                  leftIcon={Building2}
                                  size="sm"
                                  searchable={true}
                                  placeholder="Choose a supplier"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">Payment Due In</label>
                                <Select
                                  size="sm"
                                  value={formData.paymentBy}
                                  onChange={(value) => handleInputChange('paymentBy', value)}
                                  options={[
                                    { value: 'COD', label: 'Cash on Delivery' },
                                    { value: '7_DAYS', label: '7 Days' },
                                    { value: '15_DAYS', label: '15 Days' },
                                    { value: '30_DAYS', label: '30 Days' },
                                    { value: '45_DAYS', label: '45 Days' },
                                    { value: '60_DAYS', label: '60 Days' },
                                    { value: '90_DAYS', label: '90 Days' }
                                  ]}
                                  leftIcon={Calendar}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">Expected Delivery Date</label>
                                <Input
                                  type="date"
                                  size="sm"
                                  value={formData.expectedDeliveryDate}
                                  onChange={(value) => handleInputChange('expectedDeliveryDate', value)}
                                  error={errors.expectedDeliveryDate}
                                  leftIcon={Calendar}
                                  placeholder="Select delivery date"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">Reference Number</label>
                                <Input
                                  type="text"
                                  size="sm"
                                  value={formData.reference}
                                  onChange={(value) => handleInputChange('reference', value)}
                                  leftIcon={FileText}
                                  placeholder="Enter reference number"
                                />
                              </div>
                            </div>

                            <div className="mt-6">
                              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">Additional Notes</label>
                              <Textarea
                                value={formData.note}
                                onChange={(value) => handleInputChange('note', value)}
                                placeholder="Add any special instructions or notes for this purchase order..."
                                rows={3}
                                leftIcon={FileText}
                                maxLength={500}
                              />
                              {formData.note && (
                                <div className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2 text-right">{formData.note.length}/500 characters</div>
                              )}
                            </div>
                          </div>
                        </Card>

                        {/* Advance Payment Card */}
                        <Card>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 border border-[rgb(var(--color-border-primary))] rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(var(--color-primary), 0.1)' }}>
                                  <IndianRupee className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Advance Payment</h3>
                                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">Optional advance payments</p>
                                </div>
                              </div>

                              {/* Toggle Button */}
                              <Toggle
                                checked={showAdvancePayment}
                                onChange={setShowAdvancePayment}
                                label=""
                                size="sm"
                              />
                            </div>

                            {/* Payment Form */}
                            {showAdvancePayment && (
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Payment Method</label>
                                      <Select
                                        value={paymentMethod}
                                        onChange={handlePaymentMethodChange}
                                        options={PAYMENT_METHODS}
                                        size="sm"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Amount (₹)</label>
                                      <Input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={setPaymentAmount}
                                        placeholder="0.00"
                                        leftIcon={IndianRupee}
                                        size="sm"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Reference</label>
                                    <Input
                                      type="text"
                                      value={paymentReference}
                                      onChange={setPaymentReference}
                                      placeholder="Transaction reference"
                                      size="sm"
                                    />
                                  </div>

                                  {/* Payment Method Specific Details */}
                                  {paymentMethod === 'UPI' && (
                                    <div className="space-y-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-primary), 0.08)', border: '1px solid rgb(var(--color-border-primary))' }}>
                                      <h5 className="text-xs font-medium" style={{ color: 'rgb(var(--color-primary))' }}>UPI Details</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">UPI ID</label>
                                          <Input
                                            type="text"
                                            value={paymentDetails.upiId || ''}
                                            onChange={(value) => updatePaymentDetails('upiId', value)}
                                            placeholder="supplier@paytm"
                                            size="sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Transaction ID</label>
                                          <Input
                                            type="text"
                                            value={paymentDetails.transactionId || ''}
                                            onChange={(value) => updatePaymentDetails('transactionId', value)}
                                            placeholder="UPI123456789"
                                            size="sm"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {paymentMethod === 'BANK_TRANSFER' && (
                                    <div className="space-y-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-primary), 0.08)', border: '1px solid rgb(var(--color-border-primary))' }}>
                                      <h5 className="text-xs font-medium" style={{ color: 'rgb(var(--color-primary))' }}>Bank Transfer Details</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Bank Name</label>
                                          <Input
                                            type="text"
                                            value={paymentDetails.bankName || ''}
                                            onChange={(value) => updatePaymentDetails('bankName', value)}
                                            placeholder="State Bank of India"
                                            size="sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">IFSC Code</label>
                                          <Input
                                            type="text"
                                            value={paymentDetails.ifscCode || ''}
                                            onChange={(value) => updatePaymentDetails('ifscCode', value)}
                                            placeholder="SBIN0001234"
                                            size="sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Account Number</label>
                                          <Input
                                            type="text"
                                            value={paymentDetails.accountNumber || ''}
                                            onChange={(value) => updatePaymentDetails('accountNumber', value)}
                                            placeholder="1234567890"
                                            size="sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Account Holder Name</label>
                                          <Input
                                            type="text"
                                            value={paymentDetails.holderName || ''}
                                            onChange={(value) => updatePaymentDetails('holderName', value)}
                                            placeholder="ABC Suppliers"
                                            size="sm"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {paymentMethod === 'CHEQUE' && (
                                    <div className="space-y-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-primary), 0.08)', border: '1px solid rgb(var(--color-border-primary))' }}>
                                      <h5 className="text-xs font-medium" style={{ color: 'rgb(var(--color-primary))' }}>Cheque Details</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Cheque Number</label>
                                          <Input
                                            type="text"
                                            value={paymentDetails.chequeNumber || ''}
                                            onChange={(value) => updatePaymentDetails('chequeNumber', value)}
                                            placeholder="123456"
                                            size="sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Cheque Date</label>
                                          <Input
                                            type="date"
                                            value={paymentDetails.chequeDate || ''}
                                            onChange={(value) => updatePaymentDetails('chequeDate', value)}
                                            size="sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Bank Name</label>
                                          <Input
                                            type="text"
                                            value={paymentDetails.bankName || ''}
                                            onChange={(value) => updatePaymentDetails('bankName', value)}
                                            placeholder="HDFC Bank"
                                            size="sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Branch Name</label>
                                          <Input
                                            type="text"
                                            value={paymentDetails.branchName || ''}
                                            onChange={(value) => updatePaymentDetails('branchName', value)}
                                            placeholder="Main Branch"
                                            size="sm"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex justify-end">
                                    <Button
                                      type="button"
                                      variant="primary"
                                      size="sm"
                                      onClick={addPayment}
                                      disabled={!paymentAmount || !paymentReference}
                                      leftIcon={Plus}
                                    >
                                      Add Payment
                                    </Button>
                                  </div>
                                </div>

                                {/* Added Payments List */}
                                {formData.payment.length > 0 && (
                                  <div className="border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-secondary))]/30">
                                    <div className="px-3 py-2 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-tertiary))]/50">
                                      <h4 className="text-xs font-semibold text-[rgb(var(--color-text-primary))]">
                                        Added Payments ({formData.payment.length})
                                      </h4>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                      <div className="divide-y divide-[rgb(var(--color-border-primary))]">
                                        {formData.payment.map((payment, index) => (
                                          <div key={index} className="px-3 py-3 hover:bg-[rgb(var(--color-bg-secondary))]/30 transition-colors duration-200 group">
                                            <div className="flex items-center justify-between">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="text-xs font-medium text-[rgb(var(--color-text-primary))]">{payment.method}</span>
                                                  <span className="text-xs text-[rgb(var(--color-text-secondary))] bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                    ₹{payment.amount}
                                                  </span>
                                                </div>
                                                <span className="text-xs text-[rgb(var(--color-text-secondary))] truncate block">{payment.reference}</span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => removePayment(index)}
                                                className="flex-shrink-0 p-1.5 cursor-pointer text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgba(var(--color-danger),0.1)] rounded-md transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                title="Remove payment"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>

                        {/* Error Display */}
                        {createError && (
                          <Card>
                            <div className="p-6">
                              <div className="flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="text-sm font-medium">{createError}</span>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>

                      {/* Right Column - Products & Items Section */}
                      <div>
                        <Card className="sticky top-0">
                          <div className="p-4">
                            <div className="flex items-center mb-6">
                              <div className="w-10 h-10 border border-[rgb(var(--color-border-primary))] rounded-lg flex items-center justify-center mr-3">
                                <Package className="w-5 h-5" style={{ color: 'rgb(var(--color-success))' }} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Products & Items</h3>
                                <p className="text-sm text-[rgb(var(--color-text-secondary))]">Add products to your purchase order</p>
                              </div>
                            </div>

                            {/* Add Item Form */}
                            <div className="bg-[rgb(var(--color-bg-tertiary))]/50 rounded-lg p-4 mb-6">
                              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-4">Add New Item</h4>
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-7">
                                  <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Product *</label>
                                  <Select value={tempProduct}
                                    onChange={(value) => setTempProduct(value)}
                                    options={[
                                      { value: '', label: productsLoading ? 'Loading...' : 'Select Product' },
                                      ...products.filter(p => p.name || p.productName).map(p => ({ value: p.id || p._id, label: p.name || p.productName }))
                                    ]}
                                    error={errors.add_product}
                                    disabled={productsLoading}
                                    leftIcon={Package}
                                    size="sm"
                                    searchable={true}
                                    placeholder="Search and select product..."
                                  />
                                </div>

                                <div className="md:col-span-3">
                                  <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">Quantity *</label>
                                  <Input
                                    type="number"
                                    value={tempQuantity}
                                    onChange={(value) => setTempQuantity(value)}
                                    placeholder="1"
                                    min="1"
                                    step="1"
                                    error={errors.add_quantity}
                                    leftIcon={Package}
                                    size="sm"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <AddActionButton onClick={addItem} fullWidth label="Add" title="Add new item" />
                                </div>
                              </div>
                            </div>

                            {/* Items List */}
                            {formData.products.length > 0 ? (
                              <div className="bg-[rgb(var(--color-bg-tertiary))]/30 rounded-lg border border-[rgb(var(--color-border-primary))]">
                                <div className="px-4 py-3 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/50">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      Added Items ({formData.products.length})
                                    </h4>
                                    <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                                      Total: {formData.products.reduce((sum, item) => sum + (item.quantity || 0), 0)} items
                                    </div>
                                  </div>
                                </div>

                                <div className="divide-y divide-[rgb(var(--color-border-primary))]">
                                  {formData.products.map((item, index) => (
                                    <div key={index} className="px-4 py-4 hover:bg-[rgb(var(--color-bg-secondary))]/30 transition-colors duration-200 group">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(var(--color-primary), 0.1)' }}>
                                            <Package className="w-4 h-4" style={{ color: 'rgb(var(--color-primary))' }} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate block">
                                              {item.productName || 'Selected Product'}
                                            </span>
                                            <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                                              Product ID: {item.product}
                                            </span>
                                          </div>
                                          <div className="flex-shrink-0">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(var(--color-primary), 0.1)', color: 'rgb(var(--color-primary))' }}>
                                              Qty: {item.quantity}
                                            </span>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => removeItem(index)}
                                          className="flex-shrink-0 p-2 cursor-pointer text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgba(var(--color-danger),0.1)] rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                          title="Remove item"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-[rgb(var(--color-text-secondary))]">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No items added yet</p>
                                <p className="text-xs">Add products to create your purchase order</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>

                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
              <div className="flex items-center justify-between w-full mx-auto">
                <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {formData.products.length > 0 && (
                    <span>{formData.products.length} item{formData.products.length !== 1 ? 's' : ''} added</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveDraft} type="button" variant="outline" leftIcon={Save} size="sm" >
                    Save Draft
                  </Button>
                  <Button onClick={handleSubmit} disabled={isCreating} loading={isCreating} leftIcon={FileText} size="sm">
                    Create Purchase Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Draft Modal */}
      <Modal isOpen={showSaveDraftModal} onClose={() => setShowSaveDraftModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">Save as Draft</h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">This purchase order will be saved as a draft and can be completed later.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowSaveDraftModal(false)}>Cancel</Button>
            <Button onClick={handleConfirmSaveDraft} leftIcon={Save}>Save Draft</Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Purchase Order Created Successfully!">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(var(--color-success), 0.1)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: 'rgb(var(--color-success))' }} />
          </div>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {createdPONumber} has been created successfully.
            {createdPOId && (
              <span className="block mt-2 text-sm" style={{ color: 'rgb(var(--color-primary))' }}>You can now view the purchase order details.</span>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleContinue}>{createdPOId ? 'View Purchase Order' : 'View Purchase Orders'}</Button>
            <Button onClick={handleAddMore} leftIcon={Plus}>Create Another</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePurchaseOrder;

