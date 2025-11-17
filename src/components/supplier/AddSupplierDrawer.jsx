"use client"
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { supplierService } from '@/service';
import { useToast } from '@/hooks/useToast';
import { extractFieldErrors } from '@/utils/validationErrorHandler';
import { SideDrawer, ToastContainer, ErrorModal, Button } from '@/components/ui';
import { SupplierForm } from '@/components/supplier';
import { Save, Building2 } from 'lucide-react';

const AddSupplierDrawer = ({ isOpen, onClose, onSuccess }) => {
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';

  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toasts, showSuccess, showError, removeToast } = useToast();

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

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setFieldErrors({});
    }
  }, [isOpen, storeId]);

  // Update store ID when selectedStore changes
  useEffect(() => {
    if (storeId && isOpen) {
      setFormData(prevData => ({
        ...prevData,
        store: storeId
      }));
    }
  }, [storeId, isOpen]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
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
        // Show success toast
        showSuccess('Supplier created successfully!');
        // Reset form
        setFormData(getInitialFormData());
        setFieldErrors({});
        // Close drawer
        onClose();
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        // Handle validation errors
        const errorData = result?.error || result;
        const fieldErrors = extractFieldErrors(errorData);
        
        // Extract general errors from validationErrors array
        const generalErrors = [];
        const validationErrors = errorData?.data?.validationErrors || errorData?.validationErrors || [];
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((error) => {
            if (error.field === 'general' && error.message) {
              generalErrors.push(error.message);
            }
          });
        }
        
        // Set field-specific errors
        if (Object.keys(fieldErrors).length > 0) {
          setFieldErrors(fieldErrors);
        }
        
        // Show general errors in toast
        if (generalErrors.length > 0) {
          generalErrors.forEach((errorMsg) => {
            showError(errorMsg);
          });
        } else if (Object.keys(fieldErrors).length === 0) {
          // If no field errors and no general errors, show message in toast
          showError(result.message || 'Failed to create supplier. Please try again.');
        }
      }
    } catch (error) {
      // Handle validation errors
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const fieldErrors = extractFieldErrors(errorData);
        
        // Extract general errors from validationErrors array
        const generalErrors = [];
        const validationErrors = errorData?.validationErrors || [];
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((error) => {
            if (error.field === 'general' && error.message) {
              generalErrors.push(error.message);
            }
          });
        }
        
        // Set field-specific errors
        if (Object.keys(fieldErrors).length > 0) {
          setFieldErrors(fieldErrors);
        }
        
        // Show general errors in toast
        if (generalErrors.length > 0) {
          generalErrors.forEach((errorMsg) => {
            showError(errorMsg);
          });
        } else if (Object.keys(fieldErrors).length === 0) {
          // If no field errors and no general errors, show message in toast
          showError(errorData.message || 'An error occurred while creating the supplier. Please try again.');
        }
      } else {
        showError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(getInitialFormData());
    setFieldErrors({});
    onClose();
  };

  return (
    <>
      <SideDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title="Add New Supplier"
        icon={Building2}
        description="Add a new supplier to your vendor list"
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-3 sm:p-4 md:p-6 h-full">
          <div className="flex flex-col h-full">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
              <SupplierForm
                formData={formData}
                onChange={handleFormDataChange}
                fieldErrors={fieldErrors}
                mode="drawer"
              />
            </div>

            {/* Footer - Action Buttons */}
            <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
              <Button
                variant="success"
                onClick={handleSaveAndPublish}
                disabled={loading}
                loading={loading}
                leftIcon={Save}
                className="w-full sm:w-auto"
                size="sm"
              >
                Save Supplier
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SideDrawer>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
      />
    </>
  );
};

export default AddSupplierDrawer;

