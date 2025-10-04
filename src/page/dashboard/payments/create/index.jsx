"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { createPayment } from '@/store/slices/paymentsSlice';
import { getBillsForAllocation } from '@/store/slices/billsSlice';
import { supplierService } from '@/service/retailer';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground, Button } from '@/components/ui';
import { 
  CreditCard, 
  Save, 
  ArrowLeft,
  Building2,
  IndianRupee,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Receipt,
  Clock,
  Banknote,
  Smartphone,
  CreditCard as CardIcon,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Input, Select, Textarea, Card, Modal, Checkbox } from '@/components/ui';
import Link from 'next/link';

const CreatePayment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isCreating, error } = useAppSelector((state) => state.payments);
  const { selectedStore } = useAppSelector((state) => state.profile);
  
  // Local state for suppliers
  const [suppliers, setSuppliers] = useState([
    { id: '1', name: 'Test Supplier 1' },
    { id: '2', name: 'Test Supplier 2' },
    { id: '3', name: 'Test Supplier 3' }
  ]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    paymentNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMethod: 'cash',
    reference: '',
    transactionId: '',
    notes: '',
    status: 'pending',
    // Bank details for electronic payments
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    // Cheque details
    chequeNumber: '',
    chequeDate: '',
    chequeBankName: '',
    chequeBranchName: '',
    chequeStatus: 'pending'
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [availableBills, setAvailableBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const [allocationAmounts, setAllocationAmounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdPaymentNumber, setCreatedPaymentNumber] = useState('');

  // Get bill ID from URL params
  const billId = searchParams.get('billId');

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    console.log('Fetching suppliers for store:', selectedStore.storeId);
    if (!selectedStore?.storeId) return;
    try {
      setSuppliersLoading(true);
      const result = await supplierService.getSuppliers({ 
        limit: 100, 
        lightweight: true, 
        store: selectedStore.storeId 
      });
      console.log('Fetched suppliers:', result);
      if (result.success) {
        const suppliersData = result.data?.data || result.data || [];
        console.log('Fetched suppliers:', suppliersData);
        setSuppliers(suppliersData);
      } else {
        console.error('Failed to fetch suppliers:', result.message);
        // Set some mock data for testing if API fails
        setSuppliers([
          { id: '1', name: 'Supplier 1' },
          { id: '2', name: 'Supplier 2' },
          { id: '3', name: 'Supplier 3' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Set some mock data for testing if API fails
      setSuppliers([
        { id: '1', name: 'Supplier 1' },
        { id: '2', name: 'Supplier 2' },
        { id: '3', name: 'Supplier 3' }
      ]);
    } finally {
      setSuppliersLoading(false);
    }
  };

  // Fetch suppliers on component mount and when selectedStore changes
  useEffect(() => {
    console.log('useEffect triggered - selectedStore:', selectedStore);
    if (selectedStore?.storeId) {
      fetchSuppliers();
    } else {
      // If no store selected, set some default suppliers for testing
      console.log('No store selected, setting default suppliers');
      setSuppliers([
        { id: '1', name: 'Default Supplier 1' },
        { id: '2', name: 'Default Supplier 2' },
        { id: '3', name: 'Default Supplier 3' }
      ]);
    }
  }, [selectedStore?.storeId]);

  // Debug suppliers state
  useEffect(() => {
    console.log('Suppliers state changed:', suppliers);
    console.log('Suppliers length:', suppliers.length);
  }, [suppliers]);

  // Fetch available bills when supplier is selected
  useEffect(() => {
    if (formData.supplierId && selectedStore?.storeId) {
      // Implement fetch bills for allocation
      // dispatch(getBillsForAllocation(formData.supplierId, selectedStore.storeId));
    }
  }, [formData.supplierId, selectedStore]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplierId) {
      newErrors.supplierId = 'Supplier is required';
    }

    if (!formData.paymentNumber) {
      newErrors.paymentNumber = 'Payment number is required';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    // Validate bank details for electronic payments
    if (['bank_transfer', 'upi', 'card'].includes(formData.paymentMethod)) {
      if (!formData.bankName) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!formData.accountNumber) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!formData.ifscCode) {
        newErrors.ifscCode = 'IFSC code is required';
      }
    }

    // Validate cheque details
    if (formData.paymentMethod === 'cheque') {
      if (!formData.chequeNumber) {
        newErrors.chequeNumber = 'Cheque number is required';
      }
      if (!formData.chequeDate) {
        newErrors.chequeDate = 'Cheque date is required';
      }
      if (!formData.chequeBankName) {
        newErrors.chequeBankName = 'Cheque bank name is required';
      }
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
        status: 'pending',
        storeId: selectedStore?.storeId,
        allocations: selectedBills.map(billId => ({
          billId,
          amount: allocationAmounts[billId] || 0
        }))
      };

      const result = await dispatch(createPayment(paymentData));
      
      if (result.type === 'payments/createPayment/fulfilled') {
        setCreatedPaymentNumber(formData.paymentNumber || 'Payment');
        setShowSuccessModal(true);
      } else {
        if (result?.payload?.message) {
          setErrors({ general: result.payload.message });
        }
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
    router.push('/dashboard/payments');
  };

  // Success modal handlers
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/payments');
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    // Reset form data
    setFormData({
      supplierId: '',
      paymentNumber: '',
      paymentDate: new Date().toISOString().split('T')[0],
      amount: 0,
      paymentMethod: 'cash',
      reference: '',
      transactionId: '',
      notes: '',
      status: 'pending',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      chequeNumber: '',
      chequeDate: '',
      chequeBankName: '',
      chequeBranchName: '',
      chequeStatus: 'pending'
    });
    setErrors({});
    setSelectedBills([]);
    setAllocationAmounts({});
  };

  // Handle bill allocation
  const handleBillAllocation = () => {
    setShowAllocationModal(true);
  };

  // Handle bill selection for allocation
  const handleBillSelect = (billId, isSelected) => {
    if (isSelected) {
      setSelectedBills(prev => [...prev, billId]);
      setAllocationAmounts(prev => ({
        ...prev,
        [billId]: 0
      }));
    } else {
      setSelectedBills(prev => prev.filter(id => id !== billId));
      setAllocationAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[billId];
        return newAmounts;
      });
    }
  };

  // Handle allocation amount change
  const handleAllocationAmountChange = (billId, amount) => {
    setAllocationAmounts(prev => ({
      ...prev,
      [billId]: parseFloat(amount) || 0
    }));
  };

  // Calculate total allocated amount
  const totalAllocated = Object.values(allocationAmounts).reduce((sum, amount) => sum + amount, 0);
  const remainingAmount = formData.amount - totalAllocated;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return Banknote;
      case 'bank_transfer':
        return Building2;
      case 'cheque':
        return FileText;
      case 'upi':Payment
        return Smartphone;
      case 'card':
        return CardIcon;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
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
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  {/* Payment Information */}
                  <Card className="mb-6">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Payment Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Supplier *
                          </label>
                          <Select
                            value={formData.supplierId}
                            onChange={(value) => handleInputChange('supplierId', value)}
                            options={[
                              { value: '', label: suppliersLoading ? 'Loading suppliers...' : 'Select Supplier' },
                              ...suppliers.map(supplier => {
                                console.log('Mapping supplier:', supplier);
                                return {
                                  value: supplier.id || supplier._id,
                                  label: supplier.name || supplier.supplierName
                                };
                              })
                            ]}
                            error={errors.supplierId}
                            disabled={suppliersLoading}
                          />
                          {/* Debug info */}
                          <div className="mt-2 text-xs text-gray-500">
                            Debug: {suppliers.length} suppliers loaded, Loading: {suppliersLoading ? 'Yes' : 'No'}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Number *
                          </label>
                          <Input
                            value={formData.paymentNumber}
                            onChange={(value) => handleInputChange('paymentNumber', value)}
                            placeholder="Enter payment number"
                            error={errors.paymentNumber}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Date *
                          </label>
                          <Input
                            type="date"
                            value={formData.paymentDate}
                            onChange={(value) => handleInputChange('paymentDate', value)}
                            error={errors.paymentDate}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount *
                          </label>
                          <Input
                            type="number"
                            value={formData.amount}
                            onChange={(value) => handleInputChange('amount', parseFloat(value) || 0)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            error={errors.amount}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method *
                          </label>
                          <Select
                            value={formData.paymentMethod}
                            onChange={(value) => handleInputChange('paymentMethod', value)}
                            options={[
                              { value: 'cash', label: 'Cash' },
                              { value: 'bank_transfer', label: 'Bank Transfer' },
                              { value: 'cheque', label: 'Cheque' },
                              { value: 'upi', label: 'UPI' },
                              { value: 'card', label: 'Card' }
                            ]}
                            error={errors.paymentMethod}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reference
                          </label>
                          <Input
                            value={formData.reference}
                            onChange={(value) => handleInputChange('reference', value)}
                            placeholder="Payment reference"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction ID
                          </label>
                          <Input
                            value={formData.transactionId}
                            onChange={(value) => handleInputChange('transactionId', value)}
                            placeholder="Transaction ID (if applicable)"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Bank Details for Electronic Payments */}
              {['bank_transfer', 'upi', 'card'].includes(formData.paymentMethod) && (
                <Card className="mb-6">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Bank Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name *
                        </label>
                        <Input
                          value={formData.bankName}
                          onChange={(value) => handleInputChange('bankName', value)}
                          placeholder="Enter bank name"
                          error={errors.bankName}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number *
                        </label>
                        <Input
                          value={formData.accountNumber}
                          onChange={(value) => handleInputChange('accountNumber', value)}
                          placeholder="Enter account number"
                          error={errors.accountNumber}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IFSC Code *
                        </label>
                        <Input
                          value={formData.ifscCode}
                          onChange={(value) => handleInputChange('ifscCode', value)}
                          placeholder="Enter IFSC code"
                          error={errors.ifscCode}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branch Name
                        </label>
                        <Input
                          value={formData.branchName}
                          onChange={(value) => handleInputChange('branchName', value)}
                          placeholder="Enter branch name"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Cheque Details */}
              {formData.paymentMethod === 'cheque' && (
                <Card className="mb-6">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Cheque Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cheque Number *
                        </label>
                        <Input
                          value={formData.chequeNumber}
                          onChange={(value) => handleInputChange('chequeNumber', value)}
                          placeholder="Enter cheque number"
                          error={errors.chequeNumber}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cheque Date *
                        </label>
                        <Input
                          type="date"
                          value={formData.chequeDate}
                          onChange={(value) => handleInputChange('chequeDate', value)}
                          error={errors.chequeDate}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name *
                        </label>
                        <Input
                          value={formData.chequeBankName}
                          onChange={(value) => handleInputChange('chequeBankName', value)}
                          placeholder="Enter bank name"
                          error={errors.chequeBankName}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branch Name
                        </label>
                        <Input
                          value={formData.chequeBranchName}
                          onChange={(value) => handleInputChange('chequeBranchName', value)}
                          placeholder="Enter branch name"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Bill Allocation */}
              {formData.supplierId && (
                <Card className="mb-6">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <IndianRupee className="w-5 h-5 mr-2" />
                        Bill Allocation
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBillAllocation}
                      >
                        Allocate to Bills
                      </Button>
                    </div>

                    {selectedBills.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Total Allocated:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(totalAllocated)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Remaining Amount:</span>
                          <span className={`font-medium ${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(remainingAmount)}
                          </span>
                        </div>
                        {remainingAmount < 0 && (
                          <div className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Allocation amount exceeds payment amount
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No bills allocated yet. Click "Allocate to Bills" to select bills for this payment.</p>
                    )}
                  </div>
                </Card>
              )}

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

                      {/* Bill Allocation */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm">📋</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Bill Allocation</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Allocate payments to specific bills for better accounting</p>
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

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Payment Created Successfully"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Created Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your payment "{createdPaymentNumber}" has been created and is now pending approval.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleContinue}
            >
              Continue to Payments
            </Button>
            <Button
              variant="primary"
              onClick={handleAddMore}
            >
              Create Another Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bill Allocation Modal */}
      <Modal
        isOpen={showAllocationModal}
        onClose={() => setShowAllocationModal(false)}
        title="Allocate Payment to Bills"
        size="lg"
      >
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Payment Amount</h4>
                  <p className="text-xs text-blue-700">Available for allocation</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-900">{formatCurrency(formData.amount)}</span>
            </div>
          </div>

          {/* Bills List */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Select Bills to Allocate</h4>
            {availableBills.length > 0 ? (
              availableBills.map((bill) => (
                <div key={bill.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedBills.includes(bill.id)}
                        onChange={(checked) => handleBillSelect(bill.id, checked)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{bill.billNumber}</p>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Due: {new Date(bill.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Amount: <span className="font-medium">{formatCurrency(bill.dueAmount)}</span>
                        </p>
                      </div>
                    </div>
                    {selectedBills.includes(bill.id) && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={allocationAmounts[bill.id] || 0}
                          onChange={(value) => handleAllocationAmountChange(bill.id, value)}
                          placeholder="0.00"
                          min="0"
                          max={bill.dueAmount}
                          step="0.01"
                          className="w-32"
                        />
                        <span className="text-sm text-gray-500">/ {formatCurrency(bill.dueAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">No Bills Available</h4>
                <p className="text-sm text-gray-600">There are no pending bills for this supplier to allocate.</p>
              </div>
            )}
          </div>

          {/* Allocation Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Allocation Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Allocated:</span>
                <span className="font-medium text-gray-900">{formatCurrency(totalAllocated)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining Amount:</span>
                <span className={`font-medium ${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
              {remainingAmount < 0 && (
                <div className="text-xs text-red-600 mt-2">
                  ⚠️ Allocation exceeds payment amount
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowAllocationModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAllocationModal(false)}
              disabled={selectedBills.length === 0}
            >
              Confirm Allocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePayment;
