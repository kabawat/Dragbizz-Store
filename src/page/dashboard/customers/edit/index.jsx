"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, User } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
import { CustomerForm, CustomerAddSuccessModal } from '@/components/customer';
import { customerService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const EditCustomerPage = ({ customerId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedCustomerName, setUpdatedCustomerName] = useState('');

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
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const result = await customerService.getCustomers({ id: customerId, store: storeId });
        if (result.success && result.data) {
          const customerData = result.data;
          setFormData({
            store: storeId,
            name: customerData.name || '',
            phone: customerData.phone || '',
            email: customerData.email || '',
            address: customerData.address || ''
          });
        } else {
          setError(result.message || 'Failed to fetch customer data');
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        setError('Failed to fetch customer data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchCustomerData();
  }, [customerId, storeId]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
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

  // Handle save and update
  const handleSaveAndUpdate = async () => {
    try {
      setLoading(true);
      setFieldErrors({});
      setError(null);

      const result = await customerService.updateCustomer(customerId, formData, storeId);

      if (result.success) {
        setUpdatedCustomerName(formData.name || 'Customer');
        setShowSuccessModal(true);
      } else {
        if (result?.error && result?.error?.data) {
          setFieldErrors(result?.error?.data?.fields || {});
        } else {
          setError(result.message || 'Failed to update customer');
        }
      }

    } catch (error) {
      console.error('Error updating customer:', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.data && errorData.data.fields) {
          setFieldErrors(errorData.data.fields);
        } else {
          setError(errorData.message || 'Failed to update customer');
        }
      } else {
        setError('Failed to update customer. Please try again.');
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

  const handleEditMore = () => {
    setShowSuccessModal(false);
  };

  // Loading state while fetching customer data
  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="Edit Customer"
            description="Update customer information"
          />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Customer Data...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch the customer information
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


  return (
    <div className="flex h-screen relative w-full  overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title="Edit Customer"
          description="Update customer information and details"
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

            {/* Error State - Full Page */}
            {error && (
              <div className="w-full">
                <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <User className="w-10 h-10 text-red-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-3">
                        Customer Not Found
                      </h2>
                      <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                        The customer you're looking for doesn't exist or has been removed. Please check the customer ID and try again.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          variant="outline" 
                          onClick={() => router.push('/dashboard/customers')}
                          className="px-6 py-3"
                        >
                          Back to Customers
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={() => window.location.reload()}
                          className="px-6 py-3"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Container - Scrollable - Only show when no error */}
            {!error && (
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
                      onClick={handleSaveAndUpdate}
                      disabled={loading}
                      loading={loading}
                      leftIcon={Save}
                    >
                      Update Customer
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <CustomerAddSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={handleContinue}
        onAddMore={handleEditMore}
        customerName={updatedCustomerName}
        isEditMode={true}
      />
    </div>
  );
};

export default EditCustomerPage;
