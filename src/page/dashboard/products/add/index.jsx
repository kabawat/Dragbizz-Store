"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, ArrowLeft } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground, StepProgress } from '@/components/ui';
import { ProductForm, ProductAddSuccessModal } from '@/components/product';
import { productService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const AddProductPage = () => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');

  // Initial form data
  const getInitialFormData = () => ({
    store: storeId,
    name: '',
    brand: '',
    category: '',
    basePrice: '',
    mrp: '',
    sellingPrice: '',
    discount: '',
    currency: '',
    uom: '',
    status: '',
    visibility: '',
    featured: false,
    bestSeller: false,
    newArrival: false,
    gstInfo: {
      isGstApplicable: false,
      gstRate: '',
      gstType: 'CGST_SGST',
      hsnCode: ''
    },
    content: {
      shortDescription: '',
      longDescription: '',
      tags: [],
      specifications: [],
      features: []
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
      console.error('fieldName must be a string:', fieldName);
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

      // Handle nested fields (e.g., 'content.specifications', 'gstInfo.gstRate')
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


  // Handle save and publish
  const handleSaveAndPublish = async () => {
    try {
      setLoading(true);
      setFieldErrors({});
      const result = await productService.createProduct(formData);

      if (result.success) {
        // Show success modal instead of direct redirect
        setAddedProductName(formData.name || 'Product');
        setShowSuccessModal(true);
      } else {
        if (result?.error && result?.error?.data) {
          setFieldErrors(result?.error?.data?.fields || {});
        }
      }

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
    router.push('/dashboard/products');
  };

  // Success modal handlers
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/products');
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    // Reset form data
    setFormData(getInitialFormData());
    setFieldErrors({});
    setStepCompletion([]);
    setCompletedSteps(0);
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Add New Product"
          description="Create a new product for your store inventory"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Form Completion Steps */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                {/* Back Button */}
                <Link href="/dashboard/products" className="flex-shrink-0 inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Products</span>
                </Link>

                {/* Progress Bar */}
                <div className="flex-1 bg-gradient-to-r from-[rgb(var(--color-bg-primary))] to-[rgb(var(--color-bg-secondary))] rounded-xl  px-4 py-1 ">
                  <div className="px-2">
                    <StepProgress
                      formData={formData}
                      orientation="horizontal"
                      size="sm"
                      showLabels={true}
                      showIcons={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Container - Scrollable */}
            <div className="overflow-hidden">
              <div className="h-[calc(100vh-260px)] overflow-y-auto pe-3">
                <ProductForm
                  formData={formData}
                  onChange={handleFormDataChange}
                  fieldErrors={fieldErrors}
                />
              </div>

              {/* Fixed Action Bar - Only show when store is loaded and available */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
                <div className="flex items-center justify-end space-x-3">
                  <Button variant="outline" onClick={handleCancel} disabled={loading} >
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handleSaveAndPublish(formData)}
                    disabled={loading}
                    loading={loading}
                    leftIcon={Save}
                  >
                    Save & Publish
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ProductAddSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={handleContinue}
        onAddMore={handleAddMore}
        productName={addedProductName}
      />
    </div>
  );
};

export default AddProductPage;
