"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, ArrowLeft, Info, Package, TrendingUp, Users, BarChart3, Star, ShoppingCart } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground, StepProgress } from '@/components/ui';
import { ProductForm, ProductAddSuccessModal, ProductInfoModal } from '@/components/product';
import { productService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const AddProductPage = () => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
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

            {/* Key Points Section - Bottom */}
            <div className="mt-8">
              <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Why Add Product Details?</h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">Complete information helps in better sales and management</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Sales Benefits */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Boost Sales</h4>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">Detailed product info helps customers make informed decisions</p>
                    </div>
                  </div>

                  {/* Customer Experience */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Better Customer Experience</h4>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">Clear descriptions and specifications improve customer satisfaction</p>
                    </div>
                  </div>

                  {/* Inventory Management */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Inventory Tracking</h4>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">Proper categorization helps in stock management and analytics</p>
                    </div>
                  </div>

                  {/* SEO Benefits */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">SEO Optimization</h4>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">Rich content helps your products rank better in search results</p>
                    </div>
                  </div>

                  {/* Order Management */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Order Processing</h4>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">Complete details ensure smooth order fulfillment</p>
                    </div>
                  </div>

                  {/* Business Growth */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Business Growth</h4>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">Well-documented products help scale your business efficiently</p>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                  <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">💡 Pro Tips</h4>
                  <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                    <li>• Use high-quality product images for better appeal</li>
                    <li>• Set competitive pricing to attract customers</li>
                    <li>• Add detailed specifications for technical products</li>
                    <li>• Use relevant tags for better searchability</li>
                    <li>• Keep inventory levels updated regularly</li>
                  </ul>
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

      {/* Info Modal */}
      <ProductInfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
    </div>
  );
};

export default AddProductPage;
