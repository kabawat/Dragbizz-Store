"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Plus } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, AnimatedBackground, ProgressBar, StepProgress } from '@/components/ui';
import { ProductForm } from '@/components/product';

const AddProductPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedStore, setSelectedStore] = useState('Main Store');
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [stepCompletion, setStepCompletion] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(5);

  // Handle form data changes
  const handleFormDataChange = (newData) => {
    setFormData(newData);
    setIsDirty(true);

    // Update step completion data if available
    if (newData.stepCompletion) {
      setStepCompletion(newData.stepCompletion);
      setCompletionPercentage(newData.completionPercentage || 0);
      setCompletedSteps(newData.completedSteps || 0);
      setTotalSteps(newData.totalSteps || 5);
    }
  };

  // Handle save as draft
  const handleSaveDraft = async (apiPayload) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      setShowUnsavedChanges(false);
      setIsDirty(false);

    } catch (error) {
      console.error('❌ Error saving draft:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle save and publish
  const handleSaveAndPublish = async (apiPayload) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to products page
      router.push('/dashboard/products');
    } catch (error) {
      console.error('❌ Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isDirty) {
      setShowUnsavedChanges(true);
    } else {
      router.push('/dashboard/products');
    }
  };

  // Handle confirm cancel
  const handleConfirmCancel = () => {
    setShowUnsavedChanges(false);
    router.push('/dashboard/products');
  };

  // Handle preview
  const handlePreview = () => {
    setShowPreview(true);
  };


  const handleStoreChange = (storeName) => {
    setSelectedStore(storeName);
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar onStoreChange={handleStoreChange} />

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Form Completion Steps */}
            <div className="mb-4">
              <div className="bg-gradient-to-r from-[rgb(var(--color-bg-primary))] to-[rgb(var(--color-bg-secondary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-4 shadow-sm">
                {/* Step Progress */}
                <div className="px-2">
                  <StepProgress
                    steps={stepCompletion.map(step => ({
                      title: step.title,
                      description: step.description,
                      completed: step.completed
                    }))}
                    currentStep={completedSteps}
                    completedSteps={stepCompletion.map((step, index) => step.completed ? index : null).filter(i => i !== null)}
                    orientation="horizontal"
                    size="sm"
                    showLabels={true}
                    showIcons={true}
                  />
                </div>

              </div>
            </div>

            {/* Form Container - Scrollable */}
            <div className="overflow-hidden">
              <div className="h-[calc(100vh-260px)] overflow-y-auto pe-3">
                {/* Product Form */}
                <ProductForm
                  initialData={formData}
                  onSubmit={handleSaveAndPublish}
                  onSaveDraft={handleSaveDraft}
                  onCancel={handleCancel}
                  onChange={handleFormDataChange}
                  loading={loading}
                />
              </div>

              {/* Fixed Action Bar */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={handleCancel} disabled={loading} >
                      Cancel
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleSaveDraft(formData)}
                      disabled={loading}
                      loading={loading}
                      leftIcon={Save}
                    >
                      Save as Draft
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      disabled={loading}
                      leftIcon={Eye}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => handleSaveAndPublish(formData)}
                      disabled={loading}
                      loading={loading}
                      leftIcon={Plus}
                    >
                      Save & Publish
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <Modal
        isOpen={showUnsavedChanges}
        onClose={() => setShowUnsavedChanges(false)}
        size="md"
      >
        <ModalHeader>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            Unsaved Changes
          </h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-[rgb(var(--color-text-secondary))]">
            You have unsaved changes. Are you sure you want to leave without saving?
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowUnsavedChanges(false)}
            >
              Stay on Page
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
            >
              Leave Without Saving
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        size="xl"
      >
        <ModalHeader>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            Product Preview
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Alert variant="info">
              This is a preview of how your product will appear to customers.
            </Alert>

            {/* Preview Content */}
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6">
              <h4 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                {formData.name || 'Product Name'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-[rgb(var(--color-text-primary))] mb-2">Basic Information</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>Brand:</strong> {formData.brand || 'Not specified'}</div>
                    <div><strong>SKU:</strong> {formData.sku || 'Auto-generated'}</div>
                    <div><strong>Description:</strong> {formData.description || 'No description'}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-[rgb(var(--color-text-primary))] mb-2">Pricing</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>MRP:</strong> ₹{formData.mrp || '0.00'}</div>
                    <div><strong>Selling Price:</strong> ₹{formData.sellingPrice || '0.00'}</div>
                    <div><strong>Discount:</strong> {formData.discount || '0'}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => setShowPreview(false)}
          >
            Close Preview
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AddProductPage;