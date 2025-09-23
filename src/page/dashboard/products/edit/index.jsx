"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
import { ProductForm, ProductAddSuccessModal } from '@/components/product';
import { productService } from '@/service';
import { useAppSelector } from '@/store/hooks';

const UpdateProductPage = ({ productId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedProductName, setUpdatedProductName] = useState('');
  const [productNotFound, setProductNotFound] = useState(false);

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
    currency: 'INR',
    uom: 'PCS',
    status: 'DRAFT',
    visibility: 'PUBLIC',
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
      specifications: []
    }
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setInitialLoading(true);
        const params = {
          store: storeId,
          id: productId
        };
        const result = await productService.getProducts(params);
        console.log('API Response:', result);

        if (result.success && result.data) {
          const product = result.data;

          // Transform API data to form data structure based on the actual response format
          const transformedData = {
            store: storeId,
            name: product.name || '',
            brand: product.brand || '',
            category: product.category || '',
            barcode: product.barcode || '',
            sku: product.sku || '',
            // Pricing data from nested pricing object
            basePrice: product.pricing?.basePrice || '',
            mrp: product.pricing?.mrp || '',
            sellingPrice: product.pricing?.sellingPrice || '',
            discount: product.pricing?.discount || '',
            currency: product.pricing?.currency || 'INR',
            uom: product.pricing?.uom || 'PCS',
            // Status and visibility
            status: product.status || 'DRAFT',
            visibility: product.visibility || 'PUBLIC',
            featured: product.featured || false,
            bestSeller: product.bestSeller || false,
            newArrival: product.newArrival || false,
            // GST info from nested gstInfo object
            gstInfo: {
              isGstApplicable: product.gstInfo?.isGstApplicable || false,
              gstRate: product.gstInfo?.gstRate || '',
              gstType: product.gstInfo?.gstType || 'CGST_SGST',
              hsnCode: product.gstInfo?.hsnCode || ''
            },
            // Content data (if available in API)
            content: {
              shortDescription: product.content?.shortDescription || product.shortDescription || '',
              longDescription: product.content?.longDescription || product.longDescription || '',
              tags: product.content?.tags || product.tags || [],
              specifications: product.content?.specifications || product.specifications || []
            },
            features: product.features || []
          };

          console.log('Transformed Data:', transformedData);

          setFormData(transformedData);
        } else {
          setProductNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProductNotFound(true);
      } finally {
        setInitialLoading(false);
      }
    };
    if (productId && storeId) {
      fetchProductData();
    }
  }, [productId, storeId]);

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

  // Handle save and update
  const handleSaveAndUpdate = async () => {
    try {
      setLoading(true);
      setFieldErrors({});

      const updateData = {
        ...formData,
        pricing: {
          basePrice: formData.basePrice,
          mrp: formData.mrp,
          sellingPrice: formData.sellingPrice,
          discount: formData.discount,
          currency: formData.currency,
          uom: formData.uom
        }
      };

      console.log('Sending update data:', updateData);
      const result = await productService.updateProduct(productId, updateData, storeId);

      if (result.success) {
        // Show success modal instead of direct redirect
        setUpdatedProductName(formData.name || 'Product');
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

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />

        <div className="flex-1 min-h-screen flex flex-col">
          <Header />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-16 h-16 text-[rgb(var(--color-primary))] animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Product...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch the product details
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

  // Product not found state
  if (productNotFound) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />

        <div className="flex-1 min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Product Not Found
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                      The product you're looking for doesn't exist or you don't have permission to edit it.
                    </p>
                    <Button variant="outline" onClick={handleCancel} leftIcon={ArrowLeft}>
                      Back to Products
                    </Button>
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
    <div className="flex h-screen relative overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    leftIcon={ArrowLeft}
                    className="flex-shrink-0"
                  >
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                      Edit Product
                    </h1>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Update product information and settings
                    </p>
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

              {/* Fixed Action Bar */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
                <div className="flex items-center justify-end space-x-3">
                  <Button variant="outline" onClick={handleCancel} disabled={loading} >
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handleSaveAndUpdate(formData)}
                    disabled={loading}
                    loading={loading}
                    leftIcon={Save}
                  >
                    Update Product
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
        productName={updatedProductName}
        title="Product Updated Successfully!"
        continueText="Back to Products"
      />
    </div>
  );
};

export default UpdateProductPage;
