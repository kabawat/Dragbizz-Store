"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, ArrowLeft } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
import { CustomerForm, CustomerAddSuccessModal } from '@/components/customer';
import { customerService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const AddCustomerPage = () => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedCustomerName, setAddedCustomerName] = useState('');

  // Initial form data
  const getInitialFormData = () => ({
    store: storeId,
    name: '',
    phone: '',
    email: '',
    address: ''
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

    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
  };

  // Handle save and publish
  const handleSaveAndPublish = async () => {
    try {
      setLoading(true);
      setFieldErrors({});
      
      // Call customer service to create customer
      const result = await customerService.createCustomer(formData);

      if (result.success) {
        // Show success modal instead of direct redirect
        setAddedCustomerName(formData.name || 'Customer');
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
    <div className="flex h-screen relative overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Add New Customer"
          description="Create a new customer profile for your store"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/customers" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Customers</span>
              </Link>
            </div>

            {/* Form Container - Scrollable */}
            <div className="overflow-hidden">
              <div className="h-[calc(100vh-260px)] overflow-y-auto pe-3">
                <CustomerForm
                  formData={formData}
                  onChange={handleFormDataChange}
                  fieldErrors={fieldErrors}
                />
              </div>

              {/* Fixed Action Bar */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
                <div className="flex items-center justify-end space-x-3">
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
    </div>
  );
};

export default AddCustomerPage;
