"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Building } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { SupplierForm, SupplierAddSuccessModal } from '@/components/supplier';
import { supplierService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const EditSupplierPage = ({ supplierId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedSupplierName, setUpdatedSupplierName] = useState('');

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
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!supplierId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const result = await supplierService.getSuppliers({ id: supplierId, store: storeId });
        if (result.success && result.data) {
          const supplierData = result.data;
          setFormData({
            store: storeId,
            name: supplierData.name || '',
            agency: supplierData.agency || '',
            gstNumber: supplierData.gstNumber || '',
            phone: supplierData.phone || '',
            email: supplierData.email || ''
          });
        } else {
          setError(result.message || 'Failed to fetch supplier data');
        }
      } catch (error) {
        setError('Failed to fetch supplier data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchSupplierData();
  }, [supplierId, storeId]);

  // Update store ID when selectedStore changes
  useEffect(() => {
    if (selectedStore) {
      const newStoreId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
      if (newStoreId && newStoreId !== storeId) {
        setFormData(prevData => ({
          ...prevData,
          store: newStoreId
        }));
      }
    }
  }, [selectedStore, storeId]);

  // Handle form field changes
  const handleFieldChange = (fieldName, value) => {
    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: null
      }));
    }
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

      // Call supplier service to update supplier
      const result = await supplierService.updateSupplier(supplierId, formData, storeId);

      if (result.success) {
        // Show success modal instead of direct redirect
        setUpdatedSupplierName(formData.name || 'Supplier');
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

  // Handle success modal actions
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/suppliers');
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/suppliers/add');
  };

  if (fetching) {
    return (
      <div className="w-full flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <Sidebar />
        <div className="w-full flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          <Header title="Edit Supplier" description="Update supplier information and details" />
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Supplier...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch supplier data
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

  if (error) {
    return (
      <div className="w-full flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <Sidebar />
        <div className="w-full flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          <Header title="Edit Supplier" description="Update supplier information and details" />
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Error Loading Supplier
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                      {error}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        Retry
                      </Button>
                      <Button variant="primary" onClick={handleCancel}>
                        Back to Suppliers
                      </Button>
                    </div>
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
    <div className="w-full flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="w-full flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header title="Edit Supplier" description="Update supplier information and details" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
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
                  onChange={handleFieldChange}
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
      {showSuccessModal && (
        <SupplierAddSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onContinue={handleContinue}
          onAddMore={handleAddMore}
          supplierName={updatedSupplierName}
          title="🎉 Supplier Updated Successfully!"
          continueText="Back to Suppliers"
          addMoreText="Add More Suppliers"
          description="Your supplier information has been updated and saved"
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default EditSupplierPage;
