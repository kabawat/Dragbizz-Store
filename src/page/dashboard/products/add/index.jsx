"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { ProductForm } from '@/components/product';
import { QuotaExceededModal } from '@/components/common';
import QuotaProgressBar from '@/components/product/QuotaProgressBar';
import { productService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import { useUsageQuota } from '@/hooks/useUsageQuota';
import { useGlobalToast } from '@/contexts/ToastContext';
import { extractFieldErrors } from '@/utils/validationErrorHandler';
import Link from 'next/link';
import { useRef } from 'react';

const AddProductPage = () => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';
  const quotaRefreshRef = useRef(null);

  // Get quota information for frontend validation
  const { quota, isLoading: quotaLoading } = useUsageQuota('product_management');

  const [loading, setLoading] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaError, setQuotaError] = useState(null);
  const { showSuccess, showError } = useGlobalToast();

  // Check if quota is available
  const isQuotaAvailable = () => {
    if (!quota || quotaLoading) return true; // Allow if quota not loaded yet
    if (quota.remaining === -1 || quota.limit === -1) return true; // Unlimited
    return quota.remaining > 0 && quota.hasAccess !== false;
  };

  const quotaExceeded = !isQuotaAvailable();

  // Initial form data
  const getInitialFormData = () => ({
    store: storeId,
    name: '',
    brand: '',
    category: '',
    barcode: '',
    basePrice: '',
    mrp: '',
    sellingPrice: '',
    currency: 'INR',
    uom: 'PCS',
    gstInfo: {
      isGstApplicable: false,
      gstRate: '',
      gstType: 'CGST_SGST',
      hsnCode: '',
      isGstIncluded: false
    },
    content: {
      shortDescription: '',
      tags: [],
      features: [],
      specifications: []
    },
    openingStock: {
      quantity: 0,
      purchasePrice: 0,
      supplier: '',
      expiryDate: ''
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
    // Frontend validation: Check quota before making API call
    if (!isQuotaAvailable()) {
      // Show quota exceeded modal
      const quotaData = quota || {};
      setQuotaError({
        message: quota.remaining === 0 
          ? `Daily limit reached. You have used all ${quota.limit} products for today. Please try again tomorrow or upgrade your plan.`
          : 'Quota exceeded. Please upgrade your plan to continue.',
        quota: quotaData,
        resetTime: quota.usageType === 'DAILY_FIXED' 
          ? 'tomorrow' 
          : quota.usageType === 'MONTHLY_TOTAL' 
            ? 'next month' 
            : null,
        canUpgrade: true
      });
      setShowQuotaModal(true);
      return; // Prevent API call
    }

    try {
      setLoading(true);
      setFieldErrors({});
      setQuotaError(null);
      setShowQuotaModal(false);
      
      const result = await productService.createProduct(formData);

      if (result.success) {
        // Refresh quota after successful product creation
        if (quotaRefreshRef.current) {
          quotaRefreshRef.current();
        }
        // Show success toast
        showSuccess('Product created successfully!');
        // Reset form and redirect after a short delay
        setTimeout(() => {
          setFormData(getInitialFormData());
          setFieldErrors({});
          router.push('/dashboard/products');
        }, 1500);
      } else {
        // Check if it's a quota exceeded error (403)
        const errorData = result?.error || {};
        const isQuotaError = 
          result?.statusCode === 403 || 
          errorData.error === 'Quota Exceeded' || 
          errorData.error === 'Forbidden' ||
          result.message?.includes('Quota exceeded') || 
          result.message?.includes('limit reached') ||
          result.message?.includes('Quota Exceeded');
        
        if (isQuotaError) {
          const quotaData = errorData.data || errorData || {};
          setQuotaError({
            message: result.message || errorData.message || 'Quota exceeded',
            quota: quotaData.quota || quotaData,
            resetTime: quotaData.resetTime || null,
            canUpgrade: quotaData.canUpgrade !== false
          });
          setShowQuotaModal(true);
        } else {
          // Handle validation errors
          const fieldErrors = extractFieldErrors(result?.error || result);
          if (Object.keys(fieldErrors).length > 0) {
            setFieldErrors(fieldErrors);
            showError('Please fix the validation errors in the form.');
          } else {
            // Show error toast for general errors
            showError(result.message || 'Failed to create product. Please try again.');
          }
        }
      }

    } catch (error) {
      // Handle API error response
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Check for quota exceeded error (403)
        if (error.response.status === 403 && (errorData.error === 'Quota Exceeded' || errorData.error === 'Forbidden')) {
          const quotaData = errorData.data || {};
          setQuotaError({
            message: errorData.message || 'Quota exceeded',
            quota: quotaData.quota || quotaData,
            resetTime: quotaData.resetTime || null,
            canUpgrade: quotaData.canUpgrade !== false
          });
          setShowQuotaModal(true);
        } else {
          // Handle validation errors
          const fieldErrors = extractFieldErrors(errorData);
          if (Object.keys(fieldErrors).length > 0) {
            setFieldErrors(fieldErrors);
          } else {
            // Show error modal for general errors
            setErrorMessage(errorData.message || 'An error occurred while creating the product. Please try again.');
            setShowErrorModal(true);
          }
        }
      } else {
        // Handle other types of errors
        setErrorMessage('An unexpected error occurred. Please try again.');
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/products');
  };


  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <Header title="Add New Product" description="Create a new product for your store inventory" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button with Quota Progress Bar */}
            <div className="mb-6 flex items-center justify-between">
              <Link href="/dashboard/products" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Products</span>
              </Link>
              <QuotaProgressBar 
                featureKey="product_management"
                onRefreshRef={(refreshFn) => {
                  quotaRefreshRef.current = refreshFn;
                }}
              />
            </div>

            {/* Form Container - Scrollable */}
            <div className="overflow-hidden">
              <div className="h-[calc(100vh-210px)] overflow-y-auto pe-3">
                <ProductForm
                  formData={formData}
                  onChange={handleFormDataChange}
                  fieldErrors={fieldErrors}
                  storeId={storeId}
                />
              </div>

              {/* Fixed Action Bar - Only show when store is loaded and available */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
                <div className="flex items-center justify-between">
                  {/* Quota exceeded warning message */}
                  {quotaExceeded && !quotaLoading && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <span>⚠️ Quota exceeded. Please upgrade your plan to create more products.</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 ml-auto">
                    <Button variant="outline" onClick={handleCancel} disabled={loading} > Cancel </Button>
                    <Button
                      variant="success"
                      onClick={() => handleSaveAndPublish(formData)}
                      disabled={loading || quotaExceeded || quotaLoading}
                      loading={loading}
                      leftIcon={Save}
                      title={quotaExceeded ? 'Quota exceeded. Please upgrade your plan.' : ''}
                    >
                      Save & Publish
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quota Exceeded Modal */}
      <QuotaExceededModal
        isOpen={showQuotaModal}
        onClose={() => {
          setShowQuotaModal(false);
          setQuotaError(null);
        }}
        message={quotaError?.message || 'Quota exceeded. Please upgrade your plan to continue.'}
        quota={quotaError?.quota || null}
        resetTime={quotaError?.resetTime || null}
        canUpgrade={quotaError?.canUpgrade !== false}
      />

    </div>
  );
};

export default AddProductPage;
