"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { supplierService, productService, billService } from '@/service/retailer';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import {
  Receipt,
  Plus,
  Minus,
  Save,
  X,
  Building2,
  Package,
  IndianRupee,
  Calendar,
  FileText,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { Button, Input, Select, Textarea, Card, Modal } from '@/components/ui';
import Link from 'next/link';

const EditBill = ({ billId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);

  // Local state for suppliers
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // Local state for products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Local state for bill editing
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [formData, setFormData] = useState({
    supplier: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    items: [
      {
        product: '',
        productName: '',
        quantity: 1,
        purchasePrice: 0,
        expiryDate: ''
      }
    ]
  });

  const [errors, setErrors] = useState({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedBillNumber, setUpdatedBillNumber] = useState('');
  const hasFetched = useRef(false);

  // Fetch bill data on component mount
  useEffect(() => {
    const fetchBillData = async () => {
      if (!billId || !selectedStore?.storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setFetchError(null);

        const params = {
          store: selectedStore.storeId,
          id: billId
        };
        const result = await billService.getBills(params);
        
        if (result.success && result.data) {
          console.log('Bill data for edit:', result.data);
          
          // Transform API data to form data
          const billData = result.data;
          
          // Create a map of product IDs to batches for expiry date lookup
          const batchMap = new Map();
          if (billData.batches && Array.isArray(billData.batches)) {
            billData.batches.forEach(batch => {
              // If batch has product reference, use it as key
              const productId = batch.product?._id || batch.product || null;
              if (productId) {
                batchMap.set(productId.toString(), batch);
              }
            });
          }
          
          // Map items from billData.items (primary source) or fallback to batches
          let mappedItems = [];
          if (billData.items && Array.isArray(billData.items) && billData.items.length > 0) {
            // Use items array (has product info and unitPrice)
            mappedItems = billData.items.map(item => {
              const productId = item.product?._id || item.product?._id?.toString() || item.product?.toString() || item.product || '';
              const productName = item.productName || item.product?.name || '';
              const batch = batchMap.get(productId.toString());
              
              return {
                product: productId.toString(),
                productName: productName,
                quantity: item.quantity || 1,
                purchasePrice: item.unitPrice || item.purchasePrice || 0,
                expiryDate: batch?.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : ''
              };
            });
          } else if (billData.batches && Array.isArray(billData.batches) && billData.batches.length > 0) {
            // Fallback to batches if items array is not available
            mappedItems = billData.batches.map(batch => {
              const productId = batch.product?._id || batch.product?.toString() || batch.product || '';
              return {
                product: productId.toString(),
                productName: batch.productName || batch.product?.name || '',
                quantity: batch.quantity || 1,
                purchasePrice: batch.purchasePrice || 0,
                expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : ''
              };
            });
          }
          
          // Ensure at least one empty item if no items found
          if (mappedItems.length === 0) {
            mappedItems = [{
              product: '',
              productName: '',
              quantity: 1,
              purchasePrice: 0,
              expiryDate: ''
            }];
          }
          
          setFormData({
            supplier: billData.supplier?._id || billData.supplier?.id || '',
            billDate: billData.billDate ? new Date(billData.billDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            dueDate: billData.dueDate ? new Date(billData.dueDate).toISOString().split('T')[0] : '',
            notes: billData.notes || '',
            items: mappedItems
          });
        } else {
          setFetchError(result.message || 'Failed to fetch bill data');
        }
      } catch (error) {
        console.error('Error fetching bill:', error);
        setFetchError('Failed to fetch bill data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchBillData();
  }, [billId, selectedStore]);

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    console.log('Fetching suppliers for store:', selectedStore?.storeId);
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
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setSuppliersLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    console.log('Fetching products for store:', selectedStore?.storeId);
    if (!selectedStore?.storeId) return;
    try {
      setProductsLoading(true);
      const result = await productService.getProducts({
        limit: 100,
        lightweight: true,
        store: selectedStore.storeId
      });
      console.log('Fetched products:', result);
      if (result.success) {
        const productsData = result.data?.data || result.data || [];
        console.log('Fetched products:', productsData);
        setProducts(productsData);
      } else {
        console.error('Failed to fetch products:', result.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load suppliers and products on component mount
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, [selectedStore]);

  // Handle store change
  const handleStoreChange = () => {
    fetchSuppliers();
    fetchProducts();
  };

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

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new item
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product: '',
        productName: '',
        quantity: 1,
        purchasePrice: 0,
        expiryDate: ''
      }]
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.purchasePrice));
    }, 0);
    
    return {
      subtotal: subtotal,
      discount: 0,
      total: subtotal
    };
  };

  const totals = calculateTotals();

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier) {
      newErrors.supplier = 'Please select a supplier';
    }

    if (!formData.billDate) {
      newErrors.billDate = 'Please select a bill date';
    }

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.product) {
        newErrors[`item_${index}_product`] = 'Please select a product';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Please enter a valid quantity';
      }
      if (!item.purchasePrice || item.purchasePrice <= 0) {
        newErrors[`item_${index}_purchasePrice`] = 'Please enter a valid purchase price';
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
      setIsUpdating(true);
      setUpdateError(null);

      // Transform formData to match API payload structure
      const billData = {
        store: selectedStore.storeId,
        supplier: formData.supplier,
        items: formData.items.map(item => ({
          product: item.product,
          quantity: parseInt(item.quantity),
          purchasePrice: parseFloat(item.purchasePrice),
          expiryDate: item.expiryDate || undefined
        })),
        
        billDate: formData.billDate || new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined
      };

      const result = await billService.updateBill(billId, billData, selectedStore.storeId);

      if (result.success) {
        setUpdatedBillNumber(result.data?.billNumber || `Bill-${Date.now()}`);
        setShowSuccessModal(true);
      } else {
        setUpdateError(result.message || 'Failed to update bill');
        console.error('Bill update failed:', result.message);
      }
    } catch (error) {
      console.error('Error updating bill:', error);
      setUpdateError('An unexpected error occurred while updating the bill');
    } finally {
      setIsUpdating(false);
    }
  };

  // Success modal handlers
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/bills');
  };

  const handleViewBill = () => {
    setShowSuccessModal(false);
    router.push(`/dashboard/bills/${billId}`);
  };

  // Loading state while fetching bill data
  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="Edit Bill"
            description="Update bill information and details"
          />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Bill Data...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch the bill information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="Edit Bill"
            description="Update bill information and details"
          />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Receipt className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                      Bill Not Found
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                      The bill you're trying to edit doesn't exist or has been removed. Please check the bill ID and try again.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/bills')}
                        className="px-6 py-3"
                      >
                        Back to Bills
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                        className="px-6 py-3"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar onStoreChange={handleStoreChange} />

      {/* Main Content Area */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title="Edit Bill"
          description="Update purchase bill information and details"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">

            {/* Back Button */}
            <div className="mb-4">
              <Link href="/dashboard/bills" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Bills</span>
              </Link>
            </div>

            {/* Form Container - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 204px)' }}>
              
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-204px)]">
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    {/* Bill Information */}
                    <Card className="mb-6">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                          <Receipt className="w-5 h-5 mr-2" />
                          Bill Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                              Supplier *
                            </label>
                            <Select
                              value={formData.supplier}
                              onChange={(value) => handleInputChange('supplier', value)}
                              options={[
                                { value: '', label: suppliersLoading ? 'Loading...' : 'Select Supplier' },
                                ...suppliers.filter(supplier => supplier.name || supplier.supplierName).map(supplier => ({
                                  value: supplier.id || supplier._id,
                                  label: supplier.name || supplier.supplierName
                                }))
                              ]}
                              error={errors.supplier}
                              disabled={suppliersLoading}
                              leftIcon={Building2}
                              size="md"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                              Bill Date
                              <span className="text-[rgb(var(--color-text-tertiary))] ml-1">(Optional - defaults to today)</span>
                            </label>
                            <Input
                              type="date"
                              value={formData.billDate}
                              onChange={(value) => handleInputChange('billDate', value)}
                              error={errors.billDate}
                              leftIcon={Calendar}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                              Due Date
                              <span className="text-[rgb(var(--color-text-tertiary))] ml-1">(Optional - defaults to +30 days)</span>
                            </label>
                            <Input
                              type="date"
                              value={formData.dueDate}
                              onChange={(value) => handleInputChange('dueDate', value)}
                              error={errors.dueDate}
                              leftIcon={Calendar}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            Notes
                            <span className="text-[rgb(var(--color-text-tertiary))] ml-1">(Optional - max 500 characters)</span>
                          </label>
                          <Textarea
                            value={formData.notes}
                            onChange={(value) => handleInputChange('notes', value)}
                            placeholder="Additional notes for this bill..."
                            rows={3}
                            leftIcon={FileText}
                            maxLength={500}
                          />
                          {formData.notes && (
                            <div className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1 text-right">
                              {formData.notes.length}/500 characters
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Items Section */}
                    <Card className="mb-6">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Items
                          </h3>
                          <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Add new item"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Item</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {formData.items.map((item, index) => (
                            <div key={index} className="border border-[rgb(var(--color-border-primary))] rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                  Item {index + 1}
                                </h4>
                                {formData.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="flex items-center gap-1 px-2 py-1 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span className="text-xs">Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                    Product *
                                  </label>
                                  <Select
                                    value={item.product}
                                    onChange={(value) => {
                                      const selectedProduct = products.find(p => (p.id || p._id) === value);
                                      handleItemChange(index, 'product', value);
                                      handleItemChange(index, 'productName', selectedProduct?.name || '');
                                    }}
                                    options={[
                                      { value: '', label: productsLoading ? 'Loading...' : 'Select Product' },
                                      ...products.map(product => ({
                                        value: product.id || product._id,
                                        label: product.name
                                      }))
                                    ]}
                                    error={errors[`item_${index}_product`]}
                                    disabled={productsLoading}
                                    leftIcon={Package}
                                    size="sm"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                    Quantity *
                                  </label>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(value) => handleItemChange(index, 'quantity', value)}
                                    error={errors[`item_${index}_quantity`]}
                                    leftIcon={Package}
                                    size="sm"
                                    min="1"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                    Purchase Price *
                                  </label>
                                  <Input
                                    type="number"
                                    value={item.purchasePrice}
                                    onChange={(value) => handleItemChange(index, 'purchasePrice', value)}
                                    error={errors[`item_${index}_purchasePrice`]}
                                    leftIcon={IndianRupee}
                                    size="sm"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                    Expiry Date
                                    <span className="text-[rgb(var(--color-text-tertiary))] ml-1">(Optional)</span>
                                  </label>
                                  <Input
                                    type="date"
                                    value={item.expiryDate}
                                    onChange={(value) => handleItemChange(index, 'expiryDate', value)}
                                    leftIcon={Calendar}
                                    size="sm"
                                  />
                                </div>
                              </div>

                              <div className="mt-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-[rgb(var(--color-text-secondary))]">Item Total:</span>
                                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    ₹{(parseFloat(item.quantity) * parseFloat(item.purchasePrice)).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Error Display */}
                    {updateError && (
                      <Card className="mb-6 border-red-200 bg-red-50">
                        <div className="p-4">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <span className="text-red-700 text-sm">{updateError}</span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </form>
                </div>
              </div>

              {/* Right Sidebar - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 sticky top-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Bill Summary</h3>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">Review before updating</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Financial Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Subtotal:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            ₹{totals.subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Discount:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            ₹{totals.discount.toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-[rgb(var(--color-border-primary))]/30 pt-2">
                          <div className="flex justify-between">
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">Total:</span>
                            <span className="font-bold text-[rgb(var(--color-text-primary))] text-lg">
                              ₹{totals.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Item Count</h4>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">
                          {formData.items.length}
                        </div>
                        <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                          {formData.items.length === 1 ? 'Item' : 'Items'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleSubmit}
                        loading={isUpdating}
                        leftIcon={Save}
                      >
                        Update Bill
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/dashboard/bills')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          size="md"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              Bill Updated Successfully!
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              "{updatedBillNumber}" has been updated successfully.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleContinue}>
                Back to Bills
              </Button>
              <Button variant="primary" onClick={handleViewBill}>
                View Bill
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EditBill;
