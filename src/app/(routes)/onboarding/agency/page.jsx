"use client"
import React, { useState } from 'react';
import { Building2, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Input, Button, Card, AnimatedBackground } from '@/components/ui';
// API integration removed for now
import { useRouter } from 'next/navigation';

export default function AgencyCreation() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    gstNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Please enter a valid GST number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // Simulate API call delay
    setTimeout(() => {
      console.log('Agency data:', formData);
      
      // Store agency data in localStorage for next step
      localStorage.setItem('created_agency', JSON.stringify({
        id: 'temp_agency_' + Date.now(),
        name: formData.name.trim(),
        registrationNumber: formData.registrationNumber.trim() || null,
        gstNumber: formData.gstNumber.trim() || null,
        createdAt: new Date().toISOString()
      }));
      
      setIsLoading(false);
      router.push('/onboarding/store');
    }, 1000);
  };

  const handleBack = () => {
    router.push('/register');
  };

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
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{errors.general}</span>
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

            {/* Registration Number */}
            <div>
              <Input
                type="text"
                placeholder="Enter registration number (optional)"
                value={formData.registrationNumber}
                onChange={(value) => updateFormData('registrationNumber', value)}
                leftIcon={Building2}
                error={errors.registrationNumber}
              />
              {errors.registrationNumber && (
                <p className="text-red-500 text-sm flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.registrationNumber}
                </p>
              )}
            </div>

            {/* GST Number */}
            <div>
              <Input
                type="text"
                placeholder="Enter GST number (optional)"
                value={formData.gstNumber}
                onChange={(value) => updateFormData('gstNumber', value)}
                leftIcon={Building2}
                error={errors.gstNumber}
              />
              {errors.gstNumber && (
                <p className="text-red-500 text-sm flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.gstNumber}
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
