"use client"
import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Building2, FileText, Plus, Trash2 } from 'lucide-react';
import { Input, Button, Select } from '@/components/ui';

const CustomerForm = ({ formData, onChange, fieldErrors = {} }) => {
  const [showBillingAddress, setShowBillingAddress] = useState(false);
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Show addresses if they exist in formData
  useEffect(() => {
    if (formData.addresses) {
      if (formData.addresses.billing) {
        setShowBillingAddress(true);
      }
      if (formData.addresses.shipping) {
        setShowShippingAddress(true);
      }
    }
  }, [formData.addresses]);

  // Get user's current location
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
            
            // Get address from coordinates using reverse geocoding
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
              .then(response => response.json())
              .then(data => {
                if (data.city && data.principalSubdivision && data.postcode) {
                  setUserLocation(prev => ({
                    ...prev,
                    city: data.city,
                    state: data.principalSubdivision,
                    pincode: data.postcode,
                    country: data.countryName || 'India',
                    addressLine1: data.locality || data.city
                  }));
                }
              })
              .catch(error => {
                console.log('Reverse geocoding failed:', error);
                // Don't show error to user as this is optional
              });
          },
          (error) => {
            console.log('Geolocation error:', error);
            // Handle different geolocation errors
            switch(error.code) {
              case error.PERMISSION_DENIED:
                console.log('User denied geolocation permission');
                break;
              case error.POSITION_UNAVAILABLE:
                console.log('Location information unavailable');
                break;
              case error.TIMEOUT:
                console.log('Location request timed out');
                break;
              default:
                console.log('Unknown geolocation error');
                break;
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        console.log('Geolocation is not supported by this browser');
      }
    };

    getUserLocation();
  }, []);

  const handleInputChange = (fieldName, value) => {
    onChange(fieldName, value);
  };

  const handleCompanyDetailsChange = (fieldName, value) => {    
    onChange('companyDetails', {
      ...formData.companyDetails,
      [fieldName]: value
    });
  };

  const handleBillingAddressChange = (fieldName, value) => {
    // Clear error for this field when user starts typing
    const errorKey = `addresses.billing.${fieldName}`;
    if (fieldErrors[errorKey]) {
      onChange('clearError', errorKey);
    }
    
    const currentAddresses = formData.addresses || {};
    onChange('addresses', {
      ...currentAddresses,
      billing: {
        ...currentAddresses.billing,
        [fieldName]: value
      }
    });
  };

  const handleShippingAddressChange = (fieldName, value) => {
    // Clear error for this field when user starts typing
    const errorKey = `addresses.shipping.${fieldName}`;
    if (fieldErrors[errorKey]) {
      onChange('clearError', errorKey);
    }
    
    const currentAddresses = formData.addresses || {};
    onChange('addresses', {
      ...currentAddresses,
      shipping: {
        ...currentAddresses.shipping,
        [fieldName]: value
      }
    });
  };

  const addBillingAddress = () => {
    setShowBillingAddress(true);
    // Initialize billing address with user location if available
    const billingAddress = {
      label: 'Home Address',
      addressLine1: userLocation?.addressLine1 || '',
      city: userLocation?.city || '',
      state: userLocation?.state || '',
      pincode: userLocation?.pincode || '',
      country: userLocation?.country || 'India',
      coordinates: {
        latitude: userLocation?.latitude || '0',
        longitude: userLocation?.longitude || '0'
      }
    };

    if (!formData.addresses) {
      onChange('addresses', {
        billing: billingAddress
      });
    } else {
      onChange('addresses', {
        ...formData.addresses,
        billing: billingAddress
      });
    }
  };

  const addShippingAddress = () => {
    setShowShippingAddress(true);
    // Initialize shipping address with user location if available
    const shippingAddress = {
      label: 'Office Address',
      addressLine1: userLocation?.addressLine1 || '',
      city: userLocation?.city || '',
      state: userLocation?.state || '',
      pincode: userLocation?.pincode || '',
      country: userLocation?.country || 'India',
      coordinates: {
        latitude: userLocation?.latitude || '',
        longitude: userLocation?.longitude || ''
      }
    };

    if (!formData.addresses) {
      onChange('addresses', {
        shipping: shippingAddress
      });
    } else {
      // Update existing addresses with shipping
      onChange('addresses', {
        ...formData.addresses,
        shipping: shippingAddress
      });
    }
  };

  const removeBillingAddress = () => {
    setShowBillingAddress(false);
    const currentAddresses = formData.addresses || {};
    const { billing, ...remainingAddresses } = currentAddresses;
    
    // If no addresses left, set to null
    if (Object.keys(remainingAddresses).length === 0) {
      onChange('addresses', null);
    } else {
      onChange('addresses', remainingAddresses);
    }
  };

  const removeShippingAddress = () => {
    setShowShippingAddress(false);
    const currentAddresses = formData.addresses || {};
    const { shipping, ...remainingAddresses } = currentAddresses;
    
    // If no addresses left, set to null
    if (Object.keys(remainingAddresses).length === 0) {
      onChange('addresses', null);
    } else {
      onChange('addresses', remainingAddresses);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Customer Information</h2>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Enter the basic details of the customer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {/* Customer Name */}
          <Input
            type="text"
            label="Customer Name"
            placeholder="Enter customer name"
            value={formData.name || ''}
            onChange={(value) => handleInputChange('name', value)}
            error={!!fieldErrors.name}
            errorMessage={fieldErrors.name}
            required
            leftIcon={User}
            size="sm"
          />

          {/* Phone Number */}
          <Input
            type="tel"
            label="Phone Number"
            placeholder="Enter phone number"
            value={formData.phone || ''}
            onChange={(value) => handleInputChange('phone', value)}
            error={!!fieldErrors.phone}
            errorMessage={fieldErrors.phone}
            required
            leftIcon={Phone}
            size="sm"
          />

          {/* Email Address */}
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter email address"
            value={formData.email || ''}
            onChange={(value) => handleInputChange('email', value)}
            error={!!fieldErrors.email}
            errorMessage={fieldErrors.email}
            leftIcon={Mail}
            size="sm"
          />
        </div>
      </div>

      {/* Company Details Section */}
      <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Company Details</h2>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Enter company information (optional)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <Input
            type="text"
            label="Company Name"
            placeholder="Enter company name"
            value={formData.companyDetails?.companyName || ''}
            onChange={(value) => handleCompanyDetailsChange('companyName', value)}
            error={!!fieldErrors['companyDetails.companyName']}
            errorMessage={fieldErrors['companyDetails.companyName']}
            leftIcon={Building2}
            size="sm"
          />

          {/* GSTIN */}
          <Input
            type="text"
            label="GSTIN"
            placeholder="Enter GSTIN number"
            value={formData.companyDetails?.gstin || ''}
            onChange={(value) => handleCompanyDetailsChange('gstin', value)}
            error={!!fieldErrors['companyDetails.gstin']}
            errorMessage={fieldErrors['companyDetails.gstin']}
            leftIcon={FileText}
            size="sm"
          />
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Addresses</h2>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Add billing and shipping addresses</p>
            {userLocation && (
              <p className="text-xs text-green-600 mt-1">
                📍 Location detected: {userLocation.city}, {userLocation.state} - Will auto-fill addresses
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Add Address Buttons */}
          <div className="flex flex-wrap gap-3">
            {!showBillingAddress && (
              <Button
                variant="outline"
                size="sm"
                onClick={addBillingAddress}
                leftIcon={Plus}
              >
                Add Billing Address
              </Button>
            )}
            {!showShippingAddress && (
              <Button
                variant="outline"
                size="sm"
                onClick={addShippingAddress}
                leftIcon={Plus}
              >
                Add Shipping Address
              </Button>
            )}
          </div>

          {/* Billing Address */}
          {showBillingAddress && (
            <div className="border border-[rgb(var(--color-border-primary))]/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">Billing Address</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeBillingAddress}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address Line 1 */}
                <Input
                  type="text"
                  label="Address Line 1"
                  placeholder="Enter address line 1"
                  value={formData.addresses?.billing?.addressLine1 || ''}
                  onChange={(value) => handleBillingAddressChange('addressLine1', value)}
                  error={!!fieldErrors['addresses.billing.addressLine1']}
                  errorMessage={fieldErrors['addresses.billing.addressLine1']}
                  className="md:col-span-2"
                  size="sm"
                />

                {/* City */}
                <Input
                  type="text"
                  label="City"
                  placeholder="Enter city"
                  value={formData.addresses?.billing?.city || ''}
                  onChange={(value) => handleBillingAddressChange('city', value)}
                  error={!!fieldErrors['addresses.billing.city']}
                  errorMessage={fieldErrors['addresses.billing.city']}
                  size="sm"
                />

                {/* State */}
                <Input
                  type="text"
                  label="State"
                  placeholder="Enter state"
                  value={formData.addresses?.billing?.state || ''}
                  onChange={(value) => handleBillingAddressChange('state', value)}
                  error={!!fieldErrors['addresses.billing.state']}
                  errorMessage={fieldErrors['addresses.billing.state']}
                  size="sm"
                />

                {/* Pincode */}
                <Input
                  type="text"
                  label="Pincode"
                  placeholder="Enter pincode"
                  value={formData.addresses?.billing?.pincode || ''}
                  onChange={(value) => handleBillingAddressChange('pincode', value)}
                  error={!!fieldErrors['addresses.billing.pincode']}
                  errorMessage={fieldErrors['addresses.billing.pincode']}
                  size="sm"
                />

                {/* Country */}
                <Input
                  type="text"
                  label="Country"
                  placeholder="Enter country"
                  value={formData.addresses?.billing?.country || ''}
                  onChange={(value) => handleBillingAddressChange('country', value)}
                  error={!!fieldErrors['addresses.billing.country']}
                  errorMessage={fieldErrors['addresses.billing.country']}
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {showShippingAddress && (
            <div className="border border-[rgb(var(--color-border-primary))]/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">Shipping Address</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeShippingAddress}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address Line 1 */}
                <Input
                  type="text"
                  label="Address Line 1"
                  placeholder="Enter address line 1"
                  value={formData.addresses?.shipping?.addressLine1 || ''}
                  onChange={(value) => handleShippingAddressChange('addressLine1', value)}
                  error={!!fieldErrors['addresses.shipping.addressLine1']}
                  errorMessage={fieldErrors['addresses.shipping.addressLine1']}
                  className="md:col-span-2"
                  size="sm"
                />

                {/* City */}
                <Input
                  type="text"
                  label="City"
                  placeholder="Enter city"
                  value={formData.addresses?.shipping?.city || ''}
                  onChange={(value) => handleShippingAddressChange('city', value)}
                  error={!!fieldErrors['addresses.shipping.city']}
                  errorMessage={fieldErrors['addresses.shipping.city']}
                  size="sm"
                />

                {/* State */}
                <Input
                  type="text"
                  label="State"
                  placeholder="Enter state"
                  value={formData.addresses?.shipping?.state || ''}
                  onChange={(value) => handleShippingAddressChange('state', value)}
                  error={!!fieldErrors['addresses.shipping.state']}
                  errorMessage={fieldErrors['addresses.shipping.state']}
                  size="sm"
                />

                {/* Pincode */}
                <Input
                  type="text"
                  label="Pincode"
                  placeholder="Enter pincode"
                  value={formData.addresses?.shipping?.pincode || ''}
                  onChange={(value) => handleShippingAddressChange('pincode', value)}
                  error={!!fieldErrors['addresses.shipping.pincode']}
                  errorMessage={fieldErrors['addresses.shipping.pincode']}
                  size="sm"
                />

                {/* Country */}
                <Input
                  type="text"
                  label="Country"
                  placeholder="Enter country"
                  value={formData.addresses?.shipping?.country || ''}
                  onChange={(value) => handleShippingAddressChange('country', value)}
                  error={!!fieldErrors['addresses.shipping.country']}
                  errorMessage={fieldErrors['addresses.shipping.country']}
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
