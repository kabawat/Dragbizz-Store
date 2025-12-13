"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, ArrowLeft, Info, Warehouse, TrendingUp, Users, BarChart3, Star, ShoppingCart, Package } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import InventoryForm from '@/components/inventory/InventoryForm';

const AddInventoryPage = () => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [addedInventoryName, setAddedInventoryName] = useState('');

  // Initial form data - Only required fields
  const getInitialFormData = () => ({
    productId: '',
    batchData: {
      quantity: '',
      purchasePrice: '',
      supplier: '',
      expiryDate: '',
      paymentStatus: 'UNPAID',
      paymentMethod: 'CASH',
      paidAmount: 0,
      discount: 0,
    }
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [fieldErrors, setFieldErrors] = useState({});

  // Update store ID when selectedStore changes
  useEffect(() => {
    if (storeId) {
      setFormData(prevData => ({
        ...prevData,
        store: storeId
      }));
    }
  }, [storeId]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    // Ensure fieldName is a string
    if (typeof fieldName !== 'string') {
      return;
    }

    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    setFormData(prevData => {
      const newData = { ...prevData };

      // Handle nested fields (e.g., 'batchData.batchNo', 'batchData.quantity')
      if (fieldName.includes('.')) {
        const [parent, child] = fieldName.split('.');
        if (!newData[parent]) {
          newData[parent] = {};
        }
        newData[parent] = {
          ...newData[parent],
          [child]: value
        };
      } else {
        // Handle top-level fields
        newData[fieldName] = value;
      }

      return newData;
    });
  };

  // Validate form data
  const validateFormData = () => {
    const errors = {};
    
    if (!formData.productId) {
      errors.productId = 'Product selection is required';
    }
    
    if (!formData.batchData?.quantity || formData.batchData?.quantity <= 0) {
      errors['batchData.quantity'] = 'Valid quantity is required';
    }
    
    if (!formData.batchData?.purchasePrice || formData.batchData?.purchasePrice <= 0) {
      errors['batchData.purchasePrice'] = 'Valid purchase price is required';
    }
    
    // Supplier is optional - no validation needed
    
    return errors;
  };

  // Handle save and publish
  const handleSaveAndPublish = async () => {
    try {
      setLoading(true);
      setFieldErrors({});
      
      // Validate form data
      const validationErrors = validateFormData();
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        return;
      }
      
      // Prepare data for API
      const apiData = {
        productId: formData.productId,
        store: storeId,
        batchData: {
          quantity: Number(formData.batchData.quantity),
          purchasePrice: Number(formData.batchData.purchasePrice),
          supplier: formData.batchData.supplier,
          expiryDate: formData.batchData.expiryDate || null,
          paymentStatus: formData.batchData.paymentStatus,
          paymentMethod: formData.batchData.paymentMethod,
          paidAmount: Number(formData.batchData.paidAmount || 0),
          discount: Number(formData.batchData.discount || 0),
        }
      };
      setAddedInventoryName('Inventory Item');
      setShowSuccessModal(true);

    } catch (error) {
      // Handle API error response
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.data && errorData.data.fields) {
          setFieldErrors(errorData.data.fields);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/inventory');
  };

  // Success modal handlers
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/inventory');
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    // Reset form data
    setFormData(getInitialFormData());
    setFieldErrors({});
  };

  return (
    <>
      <div className="flex h-screen relative overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 min-h-screen flex flex-col">
          {/* Header */}
          <Header
            title="Add New Inventory"
            description="Add new inventory items to your store with detailed tracking information"
          />

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              {/* Back Button */}
              <div className="mb-4">
                <Link href="/dashboard/inventory" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Inventory</span>
                </Link>
              </div>

              {/* Form Container - Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 88px)' }}>
                {/* Main Form - Left Side */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-260px)]">
                    <InventoryForm
                      formData={formData}
                      onChange={handleFormDataChange}
                      fieldErrors={fieldErrors}
                    />
                  </div>

                  {/* Action Buttons - Fixed Bottom */}
                  <div className="mt-6 flex items-center justify-end space-x-3 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4">
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                      Cancel
                    </Button>
                    <Button
                      variant="success"
                      onClick={handleSaveAndPublish}
                      disabled={loading}
                      loading={loading}
                      leftIcon={Save}
                    >
                      Save & Publish
                    </Button>
                  </div>
                </div>

                {/* Tips Section - Right Side */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 shadow-sm">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Why Add Inventory Details?</h3>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Complete information helps in better stock management</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Accurate Stock Levels</h4>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">Maintain precise counts to avoid stockouts</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Efficient Fulfillment</h4>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">Streamline order processing</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Financial Tracking</h4>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">Track costs and profits accurately</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Star className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Optimized Purchasing</h4>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">Make informed reorder decisions</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">💡 Pro Tips</h4>
                        <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                          <li>• Keep batch numbers updated for traceability</li>
                          <li>• Set realistic minimum stock levels</li>
                          <li>• Regularly reconcile physical stock</li>
                          <li>• Monitor expiry dates for perishables</li>
                          <li>• Implement quality control checks</li>
                        </ul>
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
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-[rgb(var(--color-border-primary))]">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Inventory Added Successfully!
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
                "{addedInventoryName}" has been added to your inventory.
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleAddMore} className="flex-1">
                  Add More
                </Button>
                <Button variant="primary" onClick={handleContinue} className="flex-1">
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

export default AddInventoryPage;
