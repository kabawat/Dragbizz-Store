"use client"
import { Store, Phone, Mail, MapPin, Building2 } from 'lucide-react';
import { Input, Select } from '@/components/ui';

const StoreEditForm = ({ form, onChange, errors = {} }) => {
  // Handle Input component onChange (receives value directly)
  const handleInputChange = (name, value) => {
    const event = {
      target: { name, value }
    };
    onChange(event);
  };

  // Handle nested address fields
  const handleAddressChange = (field, value) => {
    const event = {
      target: {
        name: `address.${field}`,
        value: value
      }
    };
    onChange(event);
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

  return (
    <div className="space-y-6">
      {/* Store Name */}
      <Input
        label="Store Name"
        name="name"
        type="text"
        value={form.name || ''}
        onChange={(value) => handleInputChange('name', value)}
        placeholder="Enter store name"
        leftIcon={Store}
        error={errors.name}
      />

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={form.phone || ''}
          onChange={(value) => handleInputChange('phone', value)}
          placeholder="Enter phone number"
          leftIcon={Phone}
          error={errors.phone}
        />

        <Input
          label="Email (Optional)"
          name="email"
          type="email"
          value={form.email || ''}
          onChange={(value) => handleInputChange('email', value)}
          placeholder="Enter email address"
          leftIcon={Mail}
          error={errors.email}
        />
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Address Information
        </h3>

        {/* Street Address */}
        <Input
          label="Street Address (Optional)"
          name="address.street"
          type="text"
          value={form.address?.street || form.address?.line1 || ''}
          onChange={(value) => handleAddressChange('street', value)}
          placeholder="Enter street address"
          leftIcon={MapPin}
          error={errors['address.street'] || errors['address.line1']}
        />

        {/* City, State, Pincode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="City"
            name="address.city"
            type="text"
            value={form.address?.city || ''}
            onChange={(value) => handleAddressChange('city', value)}
            placeholder="Enter city"
            leftIcon={MapPin}
            error={errors['address.city']}
          />

          <Input
            label="State (Optional)"
            name="address.state"
            type="text"
            value={form.address?.state || ''}
            onChange={(value) => handleAddressChange('state', value)}
            placeholder="Enter state"
            leftIcon={MapPin}
            error={errors['address.state']}
          />

          <Input
            label="Pincode (Optional)"
            name="address.pincode"
            type="text"
            value={form.address?.pincode || ''}
            onChange={(value) => handleAddressChange('pincode', value)}
            placeholder="Enter pincode"
            leftIcon={MapPin}
            error={errors['address.pincode']}
          />
        </div>

        {/* Landmark */}
        <Input
          label="Landmark (Optional)"
          name="address.landmark"
          type="text"
          value={form.address?.landmark || ''}
          onChange={(value) => handleAddressChange('landmark', value)}
          placeholder="Enter landmark"
          leftIcon={MapPin}
          error={errors['address.landmark']}
        />
      </div>

      {/* Business Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
          Business Information
        </h3>

        {/* Store Category */}
        <Select
          label="Store Category (Optional)"
          name="category"
          value={form.category || ''}
          onChange={(value) => handleInputChange('category', value)}
          options={storeCategories}
          placeholder="Select store category"
          searchable={true}
        />

        {/* GST & PAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="GST Number (Optional)"
            name="gst"
            type="text"
            value={form.gst || ''}
            onChange={(value) => handleInputChange('gst', value)}
            placeholder="Enter GST number"
            leftIcon={Building2}
            error={errors.gst}
          />

          <Input
            label="PAN Number (Optional)"
            name="pan"
            type="text"
            value={form.pan || ''}
            onChange={(value) => handleInputChange('pan', value)}
            placeholder="Enter PAN number"
            leftIcon={Building2}
            error={errors.pan}
          />
        </div>
      </div>
    </div>
  );
};

export default StoreEditForm;
