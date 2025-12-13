"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Info } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { ProductForm, ProductAddSuccessModal, ProductInfoModal } from '@/components/product';
import { productService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const UpdateProductPage = ({ productId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
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
    currency: '',
    uom: '',
    status: '',
    visibility: '',
    featured: false,
    bestSeller: false,
    newArrival: false,
    openingStock: {
      openingQuantity: 0,
      openingPurchasePrice: 0
    },
    stockQuantity: 0,
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

        if (result.success && result.data) {
          const product = result.data;

          // Transform API data to form data structure based on the actual response format
          const transformedData = {
            store: storeId,
            name: product.name || '',
            brand: product.brand || '',
            category: product.category?._id || product.category?.id || product.category || '',
            barcode: product.barcode || '',
            sku: product.sku || '',
            // Pricing data - directly from API response
            basePrice: product.basePrice || '',
            mrp: product.mrp || '',
            sellingPrice: product.sellingPrice || '',
            discount: product.discount || '',
            currency: product.currency || '',
            uom: product.uom || '',
            // Status and visibility
            status: product.status || '',
            visibility: product.visibility || '',
            featured: product.featured || false,
            bestSeller: product.bestSeller || false,
            newArrival: product.newArrival || false,
            // Stock data
            openingStock: {
              openingQuantity: product.openingStock?.openingQuantity || 0,
              openingPurchasePrice: product.openingStock?.openingPurchasePrice || 0
            },
            stockQuantity: product.stockQuantity || 0,
            // GST info from nested gstInfo object
            gstInfo: {
              isGstApplicable: product.gstInfo?.isGstApplicable || false,
              gstRate: product.gstInfo?.gstRate || '',
              gstType: product.gstInfo?.gstType || 'CGST_SGST',
              hsnCode: product.gstInfo?.hsnCode || '',
              isGstIncluded: product.gstInfo?.isGstIncluded || false
            },
            // Content data from nested content object
            content: {
              shortDescription: product.content?.shortDescription || '',
              longDescription: product.content?.longDescription || '',
              tags: product.content?.tags || [],
              specifications: product.content?.specifications || [],
              features: product.features || []
            },
          };


          setFormData(transformedData);
        } else {
          setProductNotFound(true);
        }
      } catch (error) {
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
        <Sidebar />

        <div className="flex-1 min-h-screen flex flex-col">
          <Header />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">

                    <Loader2 className="w-16 h-16 text-[rgb(var(--color-primary))] animate-spin mx-auto mb-4" />
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
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
        <Sidebar />

        <div className="flex-1 min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
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
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <Header title="Edit Product" description="Update product information and settings" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/products" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Products</span>
              </Link>
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

              {/* Fixed Action Bar */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowInfoModal(true)}
                    leftIcon={Info}
                    className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  >
                    Info
                  </Button>

                  <div className="flex items-center space-x-3">
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

      {/* Info Modal */}
      <ProductInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
};

export default UpdateProductPage;
