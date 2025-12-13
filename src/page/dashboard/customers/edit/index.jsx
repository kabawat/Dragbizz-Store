"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, User } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { CustomerForm, CustomerAddSuccessModal } from '@/components/customer';
import { customerService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const EditCustomerPage = ({ customerId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

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
    address: '',
    companyDetails: {
      gstin: '',
      companyName: ''
    },
    addresses: null
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
          
          // Initialize addresses properly
          let addresses = null;
          if (customerData.addresses) {
            addresses = {
              billing: customerData.addresses.billing || null,
              shipping: customerData.addresses.shipping || null
            };
          }
          
          setFormData({
            store: storeId,
            name: customerData.name || '',
            phone: customerData.phone || '',
            email: customerData.email || '',
            address: customerData.address || '',
            companyDetails: customerData.companyDetails || {
              gstin: '',
              companyName: ''
            },
            addresses: addresses
          });
        } else {
          setError(result.message || 'Failed to fetch customer data');
        }
      } catch (error) {
        setError('Failed to fetch customer data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchCustomerData();
  }, [customerId, storeId]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    // Handle special clearError command
    if (fieldName === 'clearError') {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[value];
        return newErrors;
      });
      return;
    }

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
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
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
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header title="Edit Customer" description="Update customer information and details" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/customers" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Customers</span>
              </Link>
            </div>

            {/* Form Container - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-260px)]">
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
                    onClick={handleSaveAndUpdate}
                    disabled={loading}
                    loading={loading}
                    leftIcon={Save}
                  >
                    Update Customer
                  </Button>
                </div>
              </div>

              {/* Tips Section - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Why Update Customer Details?</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Keep information current for better service</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Data Accuracy */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm">📊</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Data Accuracy</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Ensure customer information is up-to-date for accurate billing and delivery</p>
                        </div>
                      </div>

                      {/* Better Service */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm">🎯</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Better Service</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Updated details help provide personalized and efficient customer service</p>
                        </div>
                      </div>

                      {/* Communication */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm">📞</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Communication</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Keep contact information current for order updates and notifications</p>
                        </div>
                      </div>

                      {/* Business Growth */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 text-sm">📈</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Business Growth</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Accurate customer data helps in business analytics and growth strategies</p>
                        </div>
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">💡 Pro Tips</h4>
                      <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                        <li>• Verify phone numbers for SMS notifications</li>
                        <li>• Update email for receipt delivery</li>
                        <li>• Keep addresses current for delivery</li>
                        <li>• Regular updates improve customer trust</li>
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
      {showSuccessModal && (
        <CustomerAddSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onContinue={handleContinue}
          onAddMore={handleEditMore}
          customerName={updatedCustomerName}
          title="🎉 Supplier Updated Successfully!"
          continueText="Back to Customers"
          addMoreText="Add More Customers"
          description="Your customer information has been updated and saved"
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default EditCustomerPage;
