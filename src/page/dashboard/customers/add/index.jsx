"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, ArrowLeft, User } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
import { CustomerForm, CustomerAddSuccessModal } from '@/components/customer';
import { QuotaExceededModal } from '@/components/common';
import { customerService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import { useUsageQuota } from '@/hooks/useUsageQuota';
import Link from 'next/link';

const AddCustomerPage = () => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';
  const quotaRefreshRef = useRef(null);

  // Get quota information for frontend validation
  const { quota, isLoading: quotaLoading, refresh: refreshQuota } = useUsageQuota('customer_management');

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedCustomerName, setAddedCustomerName] = useState('');
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaError, setQuotaError] = useState(null);

  // Check if quota is available
  const isQuotaAvailable = () => {
    if (!quota || quotaLoading) return true; // Allow if quota not loaded yet
    if (quota.remaining === -1 || quota.limit === -1) return true; // Unlimited
    return quota.remaining > 0 && quota.hasAccess !== false;
  };

  const quotaExceeded = !isQuotaAvailable();

  // Set quota refresh ref
  useEffect(() => {
    quotaRefreshRef.current = refreshQuota;
  }, [refreshQuota]);

  // Initial form data
  const getInitialFormData = () => ({
    store: storeId,
    name: '',
    phone: '',
    email: '',
    address: '',
    companyDetails: {
      gstin: '',
      companyName: ''
    },
    addresses: null
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
    // Handle special clearError command
    if (fieldName === 'clearError') {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[value];
        console.log(`Cleared error for: ${value}`);
        return newErrors;
      });
      return;
    }

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

    // Handle nested field errors (like companyDetails.gstin)
    if (fieldName === 'companyDetails') {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('companyDetails.')) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }

    // Handle addresses field errors
    if (fieldName === 'addresses') {
      // Clear any addresses related errors
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('addresses.')) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }

    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
  };

  // Handle save and publish
  const handleSaveAndPublish = async () => {
    // Frontend validation: Check quota before making API call
    if (!isQuotaAvailable()) {
      // Show quota exceeded modal
      const quotaData = quota || {};
      setQuotaError({
        message: quota.remaining === 0 
          ? `Daily limit reached. You have used all ${quota.limit} customers for today. Please try again tomorrow or upgrade your plan.`
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
      
      // Prepare payload: make companyDetails optional (omit when empty)
      const payload = (() => {
        const data = { ...formData };
        const gstin = data?.companyDetails?.gstin?.trim?.() || '';
        const companyName = data?.companyDetails?.companyName?.trim?.() || '';
        if (!gstin && !companyName) {
          // Remove companyDetails entirely when both fields are empty
          const { companyDetails, ...rest } = data;
          return rest;
        }
        return data;
      })();

      // Call customer service to create customer
      const result = await customerService.createCustomer(payload);

      if (result.success) {
        // Refresh quota after successful customer creation
        if (quotaRefreshRef.current) {
          quotaRefreshRef.current();
        }
        // Show success modal instead of direct redirect
        setAddedCustomerName(formData.name || 'Customer');
        setShowSuccessModal(true);
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
          // Extract quota data from backend response structure
          const quotaData = errorData.data || errorData || {};
          setQuotaError({
            message: result.message || errorData.message || 'Quota exceeded',
            quota: quotaData.quota || quotaData,
            resetTime: quotaData.resetTime || null,
            canUpgrade: quotaData.canUpgrade !== false
          });
          setShowQuotaModal(true);
        } else if (result?.error && result?.error?.data) {
          const errorFields = result?.error?.data?.fields || {};
          const convertedErrors = {};
          Object.keys(errorFields).forEach(key => {
            const convertedKey = key.replace(/\[(\d+)\]/g, '.$1');
            convertedErrors[convertedKey] = errorFields[key];
          });
          
          // Set converted error fields
          setFieldErrors(convertedErrors);
        }
      }

    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Check if it's a quota exceeded error (403)
        const isQuotaError =
          error.response.status === 403 ||
          errorData.error === 'Quota Exceeded' ||
          errorData.error === 'Forbidden' ||
          errorData.message?.includes('Quota exceeded') ||
          errorData.message?.includes('limit reached');

        if (isQuotaError) {
          const quotaData = errorData.data || errorData || {};
          setQuotaError({
            message: errorData.message || 'Quota exceeded',
            quota: quotaData.quota || quotaData,
            resetTime: quotaData.resetTime || null,
            canUpgrade: quotaData.canUpgrade !== false
          });
          setShowQuotaModal(true);
        } else {
          // Process error response data
          if (errorData.data && errorData.data.fields) {
            const errorFields = errorData.data.fields;
            const convertedErrors = {};
            Object.keys(errorFields).forEach(key => {
              // Convert addresses[0].pincode to addresses.0.pincode
              const convertedKey = key.replace(/\[(\d+)\]/g, '.$1');
              convertedErrors[convertedKey] = errorFields[key];
            });
            
            // Set converted error fields
            setFieldErrors(convertedErrors);
          } else if (errorData.fields) {
            const convertedErrors = {};
            Object.keys(errorData.fields).forEach(key => {
              // Convert addresses[0].pincode to addresses.0.pincode
              const convertedKey = key.replace(/\[(\d+)\]/g, '.$1');
              convertedErrors[convertedKey] = errorData.fields[key];
            });
            
            // Set converted error fields
            setFieldErrors(convertedErrors);
          }
        }
      } else {
        // Handle other types of errors
        console.error('Unexpected error format:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/customers');
  };

  // Success modal handlers
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/customers');
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    // Reset form data
    setFormData(getInitialFormData());
    setFieldErrors({});
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header title="Add New Customer" description="Create a new customer profile for your store" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-4">
              <Link href="/dashboard/customers" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Customers</span>
              </Link>
            </div>

            {/* Form Container - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-228px)] min-h-[calc(100vh-228px)]">
                  <CustomerForm
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
                    Save Customer
                  </Button>
                </div>
              </div>

              {/* Tips Section - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Why Add Customer Details?</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Complete information helps in better service</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Marketing Benefits */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm">📧</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Marketing & Communication</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Send targeted promotions, newsletters, and product updates to increase sales</p>
                        </div>
                      </div>

                      {/* Notification Benefits */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm">🔔</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Smart Notifications</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Get notified about order updates, payment reminders, and important announcements</p>
                        </div>
                      </div>

                      {/* Fraud Prevention */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-red-600 text-sm">🛡️</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Fraud Prevention</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Verify customer identity and prevent fraudulent transactions</p>
                        </div>
                      </div>

                      {/* Customer Service */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm">🎯</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Better Service</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Provide personalized service and faster order processing</p>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 text-sm">📊</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Customer Analytics</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Track customer behavior and preferences for better business decisions</p>
                        </div>
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">💡 Pro Tips</h4>
                      <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                        <li>• Always verify phone numbers for SMS notifications</li>
                        <li>• Email helps in sending receipts and updates</li>
                        <li>• Address is useful for delivery and billing</li>
                        <li>• Complete details improve customer trust</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <CustomerAddSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={handleContinue}
        onAddMore={handleAddMore}
        customerName={addedCustomerName}
      />

      {/* Quota Exceeded Modal */}
      <QuotaExceededModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        message={quotaError?.message || 'Quota exceeded'}
        quota={quotaError?.quota || null}
        resetTime={quotaError?.resetTime || null}
        canUpgrade={quotaError?.canUpgrade !== false}
      />
    </div>
  );
};

export default AddCustomerPage;