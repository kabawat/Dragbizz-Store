"use client"
import React, { useState, useEffect } from 'react';
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
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button, Input, Select, Textarea, Card, Modal } from '@/components/ui';
import Link from 'next/link';

const formInit = {
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
}
const CreateBill = () => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);

  // Local state for suppliers
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // Local state for products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Local state for bill creation
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [formData, setFormData] = useState(formInit);

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
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setSuppliersLoading(false);
    }
  };

  // Fetch products from API
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
        const productsData = result.data?.data || result.data || [];
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, [selectedStore]);

  // Auto-set due date as 30 days from bill date
  useEffect(() => {
    if (formData.billDate && !formData.dueDate) {
      const billDate = new Date(formData.billDate);
      billDate.setDate(billDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        dueDate: billDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.billDate]);

  const handleStoreChange = (storeObject) => {
    // Store change handled by Redux
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
        [field]: ''
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

    // Update product name when product is selected
    if (field === 'product') {
      const selectedProduct = products.find(p => (p.id || p._id) === value);
      if (selectedProduct) {
        updatedItems[index].productName = selectedProduct.name || selectedProduct.productName || '';
      }
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Clear item errors
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  // Add new item
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: '',
          productName: '',
          quantity: 1,
          purchasePrice: 0,
          expiryDate: ''
        }
      ]
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

    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }

    if (!formData.billDate) {
      newErrors.billDate = 'Bill date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.product) {
        newErrors[`item_${index}_product`] = 'Product is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Valid quantity is required';
      }
      if (!item.purchasePrice || item.purchasePrice <= 0) {
        newErrors[`item_${index}_purchasePrice`] = 'Valid purchase price is required';
      }
      if (item.expiryDate && new Date(item.expiryDate) < new Date(formData.billDate)) {
        newErrors[`item_${index}_expiryDate`] = 'Expiry date cannot be before bill date';
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
      setIsCreating(true);
      setCreateError(null);

      // Transform formData to match API payload structure
      const billData = {
        store: selectedStore.storeId,
        supplier: formData.supplier,
        billDate: formData.billDate,
        dueDate: formData.dueDate,
        notes: formData.notes,
        items: formData.items.map(item => ({
          product: item.product,
          quantity: parseInt(item.quantity),
          purchasePrice: parseFloat(item.purchasePrice),
          expiryDate: item.expiryDate
        })),
        status: isDraft ? 'draft' : 'pending'
      };

      const result = await billService.createBill(billData);

      if (result.success) {
        setCreatedBillNumber(result.data?.billNumber || `Bill-${Date.now()}`);
        setShowSuccessModal(true);
      } else {
        setCreateError(result.message || 'Failed to create bill');
        console.error('Bill creation failed:', result.message);
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      setCreateError('An unexpected error occurred while creating the bill');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle save draft
  const handleSaveDraft = () => {
    setShowSaveDraftModal(true);
  };

  const handleConfirmSaveDraft = () => {
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
    setFormData(formInit);
  };

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar onStoreChange={handleStoreChange} />

      {/* Main Content Area */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title="Create Bill"
          description="Add new purchase bill to track inventory purchases"
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
              {/* Main Form - Left Side */}
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
                              Bill Date *
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
                              Due Date *
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
                          </label>
                          <Textarea
                            value={formData.notes}
                            onChange={(value) => handleInputChange('notes', value)}
                            placeholder="Additional notes for this bill..."
                            rows={3}
                            leftIcon={FileText}
                          />
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
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addItem}
                            leftIcon={Plus}
                          >
                            Add Item
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {formData.items.map((item, index) => (
                            <div key={index} className="border border-[rgb(var(--color-border-primary))] rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                  Item {index + 1}
                                </span>
                                {formData.items.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removeItem(index)}
                                    leftIcon={X}
                                    className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1 text-xs">
                                    Product *
                                  </label>
                                  <Select
                                    value={item.product}
                                    onChange={(value) => handleItemChange(index, 'product', value)}
                                    options={[
                                      { value: '', label: productsLoading ? 'Loading...' : 'Select Product' },
                                      ...products.filter(product => product.name || product.productName).map(product => ({
                                        value: product.id || product._id,
                                        label: product.name || product.productName
                                      }))
                                    ]}
                                    error={errors[`item_${index}_product`]}
                                    disabled={productsLoading}
                                    leftIcon={Package}
                                    size="sm"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1 text-xs">
                                    Quantity *
                                  </label>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(value) => handleItemChange(index, 'quantity', value)}
                                    placeholder="1"
                                    min="1"
                                    step="1"
                                    error={errors[`item_${index}_quantity`]}
                                    leftIcon={Package}
                                    size="sm"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1 text-xs">
                                    Purchase Price *
                                  </label>
                                  <Input
                                    type="number"
                                    value={item.purchasePrice}
                                    onChange={(value) => handleItemChange(index, 'purchasePrice', value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    error={errors[`item_${index}_purchasePrice`]}
                                    leftIcon={DollarSign}
                                    size="sm"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1 text-xs">
                                    Expiry Date
                                  </label>
                                  <Input
                                    type="date"
                                    value={item.expiryDate}
                                    onChange={(value) => handleItemChange(index, 'expiryDate', value)}
                                    min={formData.billDate}
                                    error={errors[`item_${index}_expiryDate`]}
                                    leftIcon={Clock}
                                    size="sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Error Display */}
                    {createError && (
                      <Card className="mb-6">
                        <div className="p-6">
                          <div className="flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">{createError}</span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </form>
                </div>

                {/* Action Buttons */}
                <div className="bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3 rounded-b-lg">
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      leftIcon={Save}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={isCreating}
                      loading={isCreating}
                      leftIcon={Receipt}
                    >
                      Create Bill
                    </Button>
                  </div>
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
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-[rgb(var(--color-text-primary))] font-medium">Supplier Selection</p>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Always verify supplier information before creating bills</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-[rgb(var(--color-text-primary))] font-medium">Item Details</p>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Include expiry dates for perishable items</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-[rgb(var(--color-text-primary))] font-medium">Validation</p>
                          <p className="text-xs text-[rgb(var(--color-textSecondary))]">Expiry dates cannot be before bill date</p>
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

      {/* Save Draft Modal */}
      <Modal
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
            Save as Draft
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            This bill will be saved as a draft and can be completed later.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowSaveDraftModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSaveDraft}
              leftIcon={Save}
            >
              Save Draft
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Bill Created Successfully!
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {createdBillNumber} has been added to your bills.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleContinue}
            >
              View Bills
            </Button>
            <Button
              onClick={handleAddMore}
              leftIcon={Plus}
            >
              Create Another
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateBill;