"use client"
import React, { useState } from 'react';
import { Building2, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Input, Button, Card, AnimatedBackground } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createAgency } from '@/store/slices/profileSlice';
import { useRouter } from 'next/navigation';

export default function AgencyCreation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, agency, stores } = useAppSelector((state) => state.profile);
  
  const [formData, setFormData] = useState({
    name: ''
  });
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Agency name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Agency name must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrors({});

    try {
      const result = await dispatch(createAgency(formData));
      
      if (createAgency.fulfilled.match(result)) {
        router.push('/onboarding/store');
      } else if (createAgency.rejected.match(result)) {
        setErrors({ general: result.payload?.message || 'Failed to create agency' });
      }
    } catch (error) {
      console.error('Agency creation error:', error);
      setErrors({ general: 'An error occurred while creating agency. Please try again.' });
    }
  };

  const handleBack = () => {
    router.push('/register');
  };

  const handleContinueToStore = () => {
    router.push('/onboarding/store');
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  // If agency already exists, show different UI
  if (agency) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
        <AnimatedBackground variant="register" />
        
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
          <Card className="relative bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-6 sm:p-8 shadow-lg backdrop-blur-sm">
            
            {/* Progress Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <div className="w-16 h-1 bg-green-500 mx-2"></div>
                  <div className="w-8 h-8 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">Step 1 of 2 - Completed</p>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-green-500" />
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                Agency Already Created! ✅
              </h1>
              
              <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))] mb-2">
                Your agency <span className="font-semibold text-[rgb(var(--color-primary))]">{agency.agencyName}</span> is already set up
              </p>
              
              <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
                You can now proceed to create stores or go to your dashboard
              </p>
            </div>

            {/* Agency Info */}
            <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                    Agency Details
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                    Agency Name: <span className="font-semibold">{agency.agencyName}</span>
                  </p>
                  {stores && stores.length > 0 && (
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                      Stores: <span className="font-semibold">{stores.length} store(s) created</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                leftIcon={ArrowLeft}
                className="w-full sm:w-auto"
              >
                Back
              </Button>

              <div className="flex flex-col sm:flex-row gap-2">
                {stores && stores.length > 0 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleGoToDashboard}
                    rightIcon={ArrowRight}
                    className="w-full sm:w-auto"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleContinueToStore}
                    rightIcon={ArrowRight}
                    className="w-full sm:w-auto"
                  >
                    Create Store
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
      <AnimatedBackground variant="register" />
      
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
        <Card className="relative bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-6 sm:p-8 shadow-lg backdrop-blur-sm">
          
          {/* Progress Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div className="w-16 h-1 bg-[rgb(var(--color-border-primary))] mx-2"></div>
                <div className="w-8 h-8 bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
              </div>
            </div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Step 1 of 2</p>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[rgb(var(--color-bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-[rgb(var(--color-primary))]" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
              Create Your Agency 🏢
            </h1>
            
            <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))] mb-2">
              Let's set up your agency first
            </p>
            
            <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
              This will be the parent organization for your stores
            </p>
          </div>

          {/* Error Display */}
          {(errors.general || error) && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{errors.general || error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Agency Name */}
            <div>
              <Input
                type="text"
                placeholder="Enter agency name"
                value={formData.name}
                onChange={(value) => updateFormData('name', value)}
                leftIcon={Building2}
                error={errors.name}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-red-500 text-sm flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>


            {/* Info Box */}
            <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[rgb(var(--color-primary))] mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                    Why create an agency?
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                    An agency helps you organize multiple stores under one umbrella. You can manage inventory, staff, and operations centrally.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                leftIcon={ArrowLeft}
                className="w-full sm:w-auto"
              >
                Back
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !formData.name.trim()}
                rightIcon={ArrowRight}
                loading={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Creating Agency...' : 'Create Agency'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
