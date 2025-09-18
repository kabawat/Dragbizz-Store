"use client"
import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { Input, Button, Card, AnimatedBackground, Select } from '@/components/ui';
// API integration removed for now
import { useRouter } from 'next/navigation';

export default function StoreCreation() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    agency: '',
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    category: '',
    subCategories: [],
    tags: [],
    gst: '',
    pan: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [createdAgency, setCreatedAgency] = useState(null);

  // Load created agency data
  useEffect(() => {
    const agencyData = localStorage.getItem('created_agency');
    if (agencyData) {
      const agency = JSON.parse(agencyData);
      setCreatedAgency(agency);
      setFormData(prev => ({ ...prev, agency: agency.id }));
    } else {
      // If no agency data, redirect to agency creation
      router.push('/onboarding/agency');
    }
  }, [router]);

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(formData.phone) || cleanPhone.length < 10) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst)) {
      newErrors.gst = 'Please enter a valid GST number';
    }

    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = 'Please enter a valid PAN number';
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
      console.log('Store data:', formData);
      
      // Clear onboarding data and redirect to dashboard
      localStorage.removeItem('created_agency');
      setIsLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  const handleBack = () => {
    router.push('/onboarding/agency');
  };

  const storeCategories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'books', label: 'Books & Stationery' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'other', label: 'Other' }
  ];

  if (!createdAgency) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[rgb(var(--color-text-secondary))]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
      <AnimatedBackground variant="register" />
      
      <div className="relative w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
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
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Step 2 of 2</p>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[rgb(var(--color-bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-[rgb(var(--color-primary))]" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
              Create Your Store 🏪
            </h1>
            
            <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))] mb-2">
              Now let's set up your first store
            </p>
            
            <div className="flex items-center justify-center mb-2">
              <Building2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))] mr-2" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                Agency: <span className="font-semibold text-[rgb(var(--color-text-primary))]">{createdAgency.name}</span>
              </span>
            </div>
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
            {/* Store Name */}
            <div>
              <Input
                type="text"
                placeholder="Enter store name"
                value={formData.name}
                onChange={(value) => updateFormData('name', value)}
                leftIcon={Store}
                error={errors.name}
              />
              {errors.name && (
                <p className="text-red-500 text-sm flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(value) => updateFormData('phone', value)}
                  leftIcon={Phone}
                  error={errors.phone}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm flex items-center mt-2">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Enter email (optional)"
                  value={formData.email}
                  onChange={(value) => updateFormData('email', value)}
                  leftIcon={Mail}
                  error={errors.email}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center mt-2">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Address Information
              </h3>
              
              {/* Row 1: Street Address */}
              <div>
                <Input
                  type="text"
                  placeholder="Enter street address (optional)"
                  value={formData.address.street}
                  onChange={(value) => updateFormData('address.street', value)}
                  leftIcon={MapPin}
                  error={errors['address.street']}
                />
              </div>

              {/* Row 2: City, State, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter city"
                    value={formData.address.city}
                    onChange={(value) => updateFormData('address.city', value)}
                    leftIcon={MapPin}
                    error={errors['address.city']}
                  />
                  {errors['address.city'] && (
                    <p className="text-red-500 text-sm flex items-center mt-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors['address.city']}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    type="text"
                    placeholder="Enter state (optional)"
                    value={formData.address.state}
                    onChange={(value) => updateFormData('address.state', value)}
                    leftIcon={MapPin}
                    error={errors['address.state']}
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    placeholder="Enter pincode (optional)"
                    value={formData.address.pincode}
                    onChange={(value) => updateFormData('address.pincode', value)}
                    leftIcon={MapPin}
                    error={errors['address.pincode']}
                  />
                </div>
              </div>

              {/* Row 3: Landmark */}
              <div>
                <Input
                  type="text"
                  placeholder="Enter landmark (optional)"
                  value={formData.address.landmark}
                  onChange={(value) => updateFormData('address.landmark', value)}
                  leftIcon={MapPin}
                  error={errors['address.landmark']}
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                Business Information
              </h3>
              
              {/* Row 1: Store Category */}
              <div>
                <Select
                  placeholder="Select store category (optional)"
                  value={formData.category}
                  onChange={(value) => updateFormData('category', value)}
                  options={storeCategories}
                />
              </div>

              {/* Row 2: GST & PAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter GST number (optional)"
                    value={formData.gst}
                    onChange={(value) => updateFormData('gst', value)}
                    leftIcon={Building2}
                    error={errors.gst}
                  />
                  {errors.gst && (
                    <p className="text-red-500 text-sm flex items-center mt-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.gst}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    type="text"
                    placeholder="Enter PAN number (optional)"
                    value={formData.pan}
                    onChange={(value) => updateFormData('pan', value)}
                    leftIcon={Building2}
                    error={errors.pan}
                  />
                  {errors.pan && (
                    <p className="text-red-500 text-sm flex items-center mt-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.pan}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-[rgb(var(--color-primary))] mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                    Almost there!
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                    Once you create your store, you'll have access to the full dashboard with inventory management, customer tracking, and more.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                leftIcon={ArrowLeft}
                className="w-full sm:w-auto sm:min-w-[120px]"
              >
                Back
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !formData.name.trim() || !formData.phone.trim() || !formData.address.city.trim()}
                rightIcon={ArrowRight}
                loading={isLoading}
                className="w-full sm:w-auto sm:min-w-[160px]"
              >
                {isLoading ? 'Creating Store...' : 'Create Store'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
