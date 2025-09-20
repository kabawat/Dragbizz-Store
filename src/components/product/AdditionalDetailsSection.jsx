"use client"
import React from 'react';
import { Input, Textarea, NumberInput, Select, TagInput } from '../ui';
import { Search, Weight, Ruler, Shield, MapPin, User } from 'lucide-react';

const AdditionalDetailsSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const handleFieldChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  const handleDimensionsChange = (dimension, value) => {
    onChange({
      ...formData,
      dimensions: {
        ...formData.dimensions,
        [dimension]: value
      }
    });
  };

  // Weight unit options
  const weightUnitOptions = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'oz', label: 'Ounces (oz)' }
  ];

  // Warranty unit options
  const warrantyUnitOptions = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' }
  ];

  // Country options (simplified list)
  const countryOptions = [
    { value: 'IN', label: 'India' },
    { value: 'US', label: 'United States' },
    { value: 'CN', label: 'China' },
    { value: 'JP', label: 'Japan' },
    { value: 'DE', label: 'Germany' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'BR', label: 'Brazil' },
    { value: 'KR', label: 'South Korea' },
    { value: 'MX', label: 'Mexico' },
    { value: 'RU', label: 'Russia' },
    { value: 'SG', label: 'Singapore' },
    { value: 'TH', label: 'Thailand' },
    { value: 'VN', label: 'Vietnam' },
    { value: 'MY', label: 'Malaysia' },
    { value: 'ID', label: 'Indonesia' },
    { value: 'PH', label: 'Philippines' }
  ];

  return (
    <>
      {/* SEO Title */}
      <div className="mb-6">
        <Input
          label="SEO Title"
          placeholder="Enter SEO title"
          value={formData.seoTitle || ''}
          onChange={(value) => handleFieldChange('seoTitle', value)}
          error={errors.seoTitle}
          errorMessage={errors.seoTitle}
          leftIcon={Search}
          maxLength={60}
          helperText="Title for search engines (max 60 characters)"
        />
      </div>

      {/* SEO Description */}
      <div className="mb-6">
        <Textarea
          label="SEO Description"
          placeholder="Enter SEO description"
          value={formData.seoDescription || ''}
          onChange={(value) => handleFieldChange('seoDescription', value)}
          error={errors.seoDescription}
          errorMessage={errors.seoDescription}
          rows={3}
          maxLength={160}
          showCharCount
          helperText="Description for search engines (max 160 characters)"
        />
      </div>

      {/* Product Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <NumberInput
          label="Product Weight"
          placeholder="0"
          value={formData.weight || ''}
          onChange={(value) => handleFieldChange('weight', value)}
          error={errors.weight}
          errorMessage={errors.weight}
          leftIcon={Weight}
          min={0}
          step={0.01}
          precision={2}
        />
        
        <Select
          label="Weight Unit"
          options={weightUnitOptions}
          value={formData.weightUnit || 'g'}
          onChange={(value) => handleFieldChange('weightUnit', value)}
          error={errors.weightUnit}
          errorMessage={errors.weightUnit}
        />
      </div>

      {/* Product Dimensions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Product Dimensions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberInput
            label="Length"
            placeholder="0"
            value={formData.dimensions?.length || ''}
            onChange={(value) => handleDimensionsChange('length', value)}
            error={errors.dimensions?.length}
            errorMessage={errors.dimensions?.length}
            leftIcon={Ruler}
            min={0}
            step={0.01}
            precision={2}
          />
          
          <NumberInput
            label="Width"
            placeholder="0"
            value={formData.dimensions?.width || ''}
            onChange={(value) => handleDimensionsChange('width', value)}
            error={errors.dimensions?.width}
            errorMessage={errors.dimensions?.width}
            leftIcon={Ruler}
            min={0}
            step={0.01}
            precision={2}
          />
          
          <NumberInput
            label="Height"
            placeholder="0"
            value={formData.dimensions?.height || ''}
            onChange={(value) => handleDimensionsChange('height', value)}
            error={errors.dimensions?.height}
            errorMessage={errors.dimensions?.height}
            leftIcon={Ruler}
            min={0}
            step={0.01}
            precision={2}
          />
        </div>
        <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-2">
          Dimensions in centimeters (cm)
        </p>
      </div>

      {/* Warranty Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <NumberInput
          label="Warranty Period"
          placeholder="0"
          value={formData.warranty || ''}
          onChange={(value) => handleFieldChange('warranty', value)}
          error={errors.warranty}
          errorMessage={errors.warranty}
          leftIcon={Shield}
          min={0}
          step={1}
        />
        
        <Select
          label="Warranty Unit"
          options={warrantyUnitOptions}
          value={formData.warrantyUnit || 'months'}
          onChange={(value) => handleFieldChange('warrantyUnit', value)}
          error={errors.warrantyUnit}
          errorMessage={errors.warrantyUnit}
        />
      </div>

      {/* Manufacturer Details */}
      <div className="mb-6">
        <Input
          label="Manufacturer Details"
          placeholder="Enter manufacturer name"
          value={formData.manufacturer || ''}
          onChange={(value) => handleFieldChange('manufacturer', value)}
          error={errors.manufacturer}
          errorMessage={errors.manufacturer}
          leftIcon={User}
          helperText="Name of the product manufacturer"
        />
      </div>

      {/* Country of Origin */}
      <div className="mb-6">
        <Select
          label="Country of Origin"
          options={countryOptions}
          value={formData.countryOfOrigin || ''}
          onChange={(value) => handleFieldChange('countryOfOrigin', value)}
          error={errors.countryOfOrigin}
          errorMessage={errors.countryOfOrigin}
          leftIcon={MapPin}
          searchable
          placeholder="Select country"
        />
      </div>

      {/* Product Tags */}
      <div className="mb-6">
        <TagInput
          label="Product Tags"
          placeholder="Add tags..."
          value={formData.tags || []}
          onChange={(value) => handleFieldChange('tags', value)}
          error={errors.tags}
          errorMessage={errors.tags}
          maxTags={15}
          maxTagLength={25}
          helperText="Add relevant tags to improve product discoverability"
        />
      </div>

      {/* Additional Information Summary */}
      {(formData.weight || formData.dimensions || formData.warranty || formData.manufacturer) && (
        <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Additional Information</h4>
          <div className="space-y-2 text-sm">
            {formData.weight && (
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Weight:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {formData.weight} {formData.weightUnit || 'g'}
                </span>
              </div>
            )}
            {formData.dimensions && (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) && (
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Dimensions:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {formData.dimensions.length || 0} × {formData.dimensions.width || 0} × {formData.dimensions.height || 0} cm
                </span>
              </div>
            )}
            {formData.warranty && (
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Warranty:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {formData.warranty} {formData.warrantyUnit || 'months'}
                </span>
              </div>
            )}
            {formData.manufacturer && (
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Manufacturer:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {formData.manufacturer}
                </span>
              </div>
            )}
            {formData.countryOfOrigin && (
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Country:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {countryOptions.find(c => c.value === formData.countryOfOrigin)?.label || formData.countryOfOrigin}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdditionalDetailsSection;
