"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, ArrowLeft } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
import { SupplierForm, SupplierAddSuccessModal } from '@/components/supplier';
import { supplierService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const AddSupplierPage = () => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedSupplierName, setAddedSupplierName] = useState('');

  // Initial form data
  const getInitialFormData = () => ({
    store: storeId,
    name: '',
    agency: '',
    gstNumber: '',
    phone: '',
    email: ''
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

      // Client-side validation: At least one contact method required
      if (!formData.phone && !formData.email) {
        setFieldErrors({
          phone: 'Phone or email is required',
          email: 'Phone or email is required'
        });
        setLoading(false);
        return;
      }

      // Call supplier service to create supplier
      const result = await supplierService.createSupplier(formData);

      if (result.success) {
        // Show success modal instead of direct redirect
        setAddedSupplierName(formData.name || 'Supplier');
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
    router.push('/dashboard/suppliers');
  };

  // Success modal handlers
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/suppliers');
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    // Reset form data
    setFormData(getInitialFormData());
    setFieldErrors({});
  };

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header title="Add New Supplier" description="Create a new supplier profile for your business" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-4">
              <Link href="/dashboard/suppliers" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Suppliers</span>
              </Link>
            </div>
            {/* Form Container - Scrollable */}
            <div className="overflow-hidden">
              <div className="h-[calc(100vh-240px)] overflow-y-auto pe-3">
                <SupplierForm
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
                  <Button variant="success" onClick={handleSaveAndPublish} disabled={loading} loading={loading} leftIcon={Save} >
                    Save Supplier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SupplierAddSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={handleContinue}
        onAddMore={handleAddMore}
        supplierName={addedSupplierName}
      />
    </div>
  );
};

export default AddSupplierPage;
