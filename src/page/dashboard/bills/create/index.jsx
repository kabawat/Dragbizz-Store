"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { createBill } from '@/store/slices/billsSlice';
import { supplierService, productService } from '@/service/retailer';
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
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { Button, Input, Select, Textarea, Card, Modal } from '@/components/ui';
import Link from 'next/link';

const CreateBill = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isCreating, error } = useAppSelector((state) => state.bills);
  const { selectedStore } = useAppSelector((state) => state.profile);
  
  // Local state for suppliers
  const [suppliers, setSuppliers] = useState([
    { id: '1', name: 'Test Supplier 1' },
    { id: '2', name: 'Test Supplier 2' },
    { id: '3', name: 'Test Supplier 3' }
  ]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // Local state for products
  const [products, setProducts] = useState([
    { id: '1', name: 'Test Product 1', price: 100 },
    { id: '2', name: 'Test Product 2', price: 200 },
    { id: '3', name: 'Test Product 3', price: 300 }
  ]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    receivedDate: new Date().toISOString().split('T')[0],
    paymentTerms: '30',
    notes: '',
    items: [
      {
        id: 1,
        productId: '',
        productName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0
      }
    ],
    subtotal: 0,
    discount: 0,
    taxRate: 18,
    taxAmount: 0,
    totalAmount: 0
  });

  const [errors, setErrors] = useState({});
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBillNumber, setCreatedBillNumber] = useState('');

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

  // Fetch products from API
  const fetchProducts = async () => {
    console.log('Fetching products for store:', selectedStore?.storeId);
    if (!selectedStore?.storeId) return;
    try {
      setProductsLoading(true);
      const result = await productService.getProducts({ 
        limit: 100, 
        store: selectedStore.storeId 
      });
      console.log('Fetched products:', result);
      if (result.success) {
        const productsData = result.data?.data || result.data || [];
        console.log('Fetched products:', productsData);
        setProducts(productsData);
      } else {
        console.error('Failed to fetch products:', result.message);
        // Set some mock data for testing if API fails
        setProducts([
          { id: '1', name: 'Product 1', price: 100 },
          { id: '2', name: 'Product 2', price: 200 },
          { id: '3', name: 'Product 3', price: 300 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set some mock data for testing if API fails
      setProducts([
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 },
        { id: '3', name: 'Product 3', price: 300 }
      ]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch suppliers and products on component mount and when selectedStore changes
  useEffect(() => {
    console.log('useEffect triggered - selectedStore:', selectedStore);
    if (selectedStore?.storeId) {
      fetchSuppliers();
      fetchProducts();
    } else {
      // If no store selected, set some default data for testing
      console.log('No store selected, setting default data');
      setSuppliers([
        { id: '1', name: 'Default Supplier 1' },
        { id: '2', name: 'Default Supplier 2' },
        { id: '3', name: 'Default Supplier 3' }
      ]);
      setProducts([
        { id: '1', name: 'Default Product 1', price: 100 },
        { id: '2', name: 'Default Product 2', price: 200 },
        { id: '3', name: 'Default Product 3', price: 300 }
      ]);
    }
  }, [selectedStore?.storeId]);

  // Debug suppliers and products state
  useEffect(() => {
    console.log('Suppliers state changed:', suppliers);
    console.log('Suppliers length:', suppliers.length);
  }, [suppliers]);

  useEffect(() => {
    console.log('Products state changed:', products);
    console.log('Products length:', products.length);
  }, [products]);

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * formData.taxRate) / 100;
    const totalAmount = taxableAmount + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount
    }));
  }, [formData.items, formData.discount, formData.taxRate]);

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
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // If product is selected, auto-fill the unit price
    if (field === 'productId') {
      const selectedProduct = products.find(p => (p.id || p._id) === value);
      if (selectedProduct) {
        updatedItems[index].productName = selectedProduct.name || selectedProduct.productName;
        updatedItems[index].unitPrice = selectedProduct.price || selectedProduct.sellingPrice || 0;
      }
    }

    // Calculate total price for the item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Add new item
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplierId) {
      newErrors.supplierId = 'Supplier is required';
    }

    if (!formData.billNumber) {
      newErrors.billNumber = 'Bill number is required';
    }

    if (!formData.billDate) {
      newErrors.billDate = 'Bill date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_productId`] = 'Product is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Valid quantity is required';
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = 'Valid unit price is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (isDraft = false) => {
    if (!validateForm() && !isDraft) {
      return;
    }

    try {
      const billData = {
        ...formData,
        status: isDraft ? 'draft' : 'pending',
        storeId: selectedStore?.id
      };

      const result = await dispatch(createBill(billData));
      
      if (result.type === 'bills/createBill/fulfilled') {
        setCreatedBillNumber(formData.billNumber || 'Bill');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

  // Handle save draft
  const handleSaveDraft = () => {
    setShowSaveDraftModal(true);
  };

  // Confirm save draft
  const confirmSaveDraft = () => {
    handleSubmit(true);
    setShowSaveDraftModal(false);
  };

  // Success modal handlers
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/bills');
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    // Reset form data
    setFormData({
      supplierId: '',
      billNumber: '',
      billDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      receivedDate: new Date().toISOString().split('T')[0],
      paymentTerms: '30',
      notes: '',
      items: [
        {
          id: 1,
          productId: '',
          productName: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0
        }
      ],
      subtotal: 0,
      discount: 0,
      taxRate: 18,
      taxAmount: 0,
      totalAmount: 0
    });
    setErrors({});
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header title="Create New Bill" description="Create a new supplier bill" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/bills" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Bills</span>
              </Link>
            </div>

            {/* Form Container - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-260px)]">
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* Bill Information */}
              <Card className="mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Receipt className="w-5 h-5 mr-2" />
                    Bill Information
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
                        Bill Number *
                      </label>
                      <Input
                        value={formData.billNumber}
                        onChange={(value) => handleInputChange('billNumber', value)}
                        placeholder="Enter bill number"
                        error={errors.billNumber}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bill Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.billDate}
                        onChange={(value) => handleInputChange('billDate', value)}
                        error={errors.billDate}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(value) => handleInputChange('dueDate', value)}
                        error={errors.dueDate}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Received Date
                      </label>
                      <Input
                        type="date"
                        value={formData.receivedDate}
                        onChange={(value) => handleInputChange('receivedDate', value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Terms (Days)
                      </label>
                      <Input
                        type="number"
                        value={formData.paymentTerms}
                        onChange={(value) => handleInputChange('paymentTerms', value)}
                        placeholder="30"
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

              {/* Bill Items */}
              <Card className="mb-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Bill Items
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={Plus}
                      onClick={addItem}
                    >
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              leftIcon={X}
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Product *
                            </label>
                            <Select
                              value={item.productId}
                              onChange={(value) => handleItemChange(index, 'productId', value)}
                              options={[
                                { value: '', label: productsLoading ? 'Loading products...' : 'Select Product' },
                                ...products.map(product => {
                                  console.log('Mapping product:', product);
                                  return {
                                    value: product.id || product._id,
                                    label: `${product.name || product.productName} - ₹${product.price || product.sellingPrice || 0}`
                                  };
                                })
                              ]}
                              error={errors[`item_${index}_productId`]}
                              disabled={productsLoading}
                            />
                            {/* Debug info */}
                            <div className="mt-2 text-xs text-gray-500">
                              Debug: {products.length} products loaded, Loading: {productsLoading ? 'Yes' : 'No'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantity *
                            </label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(value) => handleItemChange(index, 'quantity', value)}
                              placeholder="1"
                              min="0"
                              step="0.01"
                              error={errors[`item_${index}_quantity`]}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Unit Price *
                            </label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(value) => handleItemChange(index, 'unitPrice', value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              error={errors[`item_${index}_unitPrice`]}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Price
                            </label>
                            <Input
                              value={formatCurrency(item.totalPrice)}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Bill Summary */}
              <Card className="mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Bill Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount (%)
                        </label>
                        <Input
                          type="number"
                          value={formData.discount}
                          onChange={(value) => handleInputChange('discount', value)}
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax Rate (%)
                        </label>
                        <Input
                          type="number"
                          value={formData.taxRate}
                          onChange={(value) => handleInputChange('taxRate', value)}
                          placeholder="18"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(formData.subtotal)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency((formData.subtotal * formData.discount) / 100)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">{formatCurrency(formData.taxAmount)}</span>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total:</span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(formData.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

                  </form>
                </div>
                
                {/* Action Buttons - Fixed Bottom */}
                <div className="mt-6 flex items-center justify-end space-x-3 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4">
                  <Button variant="outline" onClick={() => router.push('/dashboard/bills')} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    leftIcon={Save}
                    onClick={handleSaveDraft}
                    disabled={isCreating}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isCreating}
                    loading={isCreating}
                    leftIcon={Receipt}
                  >
                    Create Bill
                  </Button>
                </div>
              </div>

              {/* Tips Section - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Bill Management Tips</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Best practices for efficient bill processing</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Bill Tracking */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm">📋</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Bill Tracking</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Keep track of all supplier bills and maintain clear records</p>
                        </div>
                      </div>

                      {/* Item Management */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm">📦</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Item Management</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Add detailed items with quantities and prices for accurate billing</p>
                        </div>
                      </div>

                      {/* Tax Calculation */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow-600 text-sm">🧮</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Tax Calculation</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Automatically calculate taxes and discounts for accurate totals</p>
                        </div>
                      </div>

                      {/* Payment Terms */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm">⏰</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Payment Terms</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Set clear payment terms and due dates for better cash flow</p>
                        </div>
                      </div>

                      {/* Supplier Relations */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 text-sm">🤝</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Supplier Relations</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Maintain good relationships with accurate and timely bill processing</p>
                        </div>
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">💡 Pro Tips</h4>
                      <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                        <li>• Always verify bill details before processing</li>
                        <li>• Keep bill references for easy tracking</li>
                        <li>• Set appropriate payment terms</li>
                        <li>• Regular bill processing improves supplier relationships</li>
                        <li>• Maintain backup of all bill records</li>
                      </ul>
                    </div>

                    {/* Bill Status Info */}
                    <div className="mt-4 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">📝 Bill Status</h4>
                      <div className="space-y-2 text-xs text-[rgb(var(--color-text-secondary))]">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Draft - Being prepared</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Pending - Awaiting approval</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Approved - Bill processed</span>
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
        title="Bill Created Successfully"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill Created Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your bill "{createdBillNumber}" has been created and is now pending approval.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleContinue}
            >
              Continue to Bills
            </Button>
            <Button
              variant="primary"
              onClick={handleAddMore}
            >
              Create Another Bill
            </Button>
          </div>
        </div>
      </Modal>

      {/* Save Draft Confirmation Modal */}
      <Modal
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
        title="Save as Draft"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to save this bill as a draft? You can continue editing it later.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSaveDraftModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmSaveDraft}
            >
              Save Draft
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateBill;