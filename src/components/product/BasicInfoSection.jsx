"use client"
import React from 'react';
import { Input, Textarea, TagInput, Select } from '../ui';
import { Package, Tag, Barcode } from 'lucide-react';
import { PRODUCT_CATEGORY_OPTIONS } from '@/data';

const BasicInfoSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {  
  const handleFieldChange = (field, value) => {
    console.log('Field:', field, 'Value:', value);
    onChange(field, value);
  };

  return (
    <>
      {/* First Section - Product Name & Brand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Product Name */}
        <div>
          <Input
            label="Product Name"
            placeholder="Enter product name"
            value={formData.name || ''}
            onChange={(value) => handleFieldChange('name', value)}
            error={errors.name}
            errorMessage={errors.name}
            required
            leftIcon={Package}
          />
        </div>

        {/* Brand */}
        <div>
          <Input
            label="Brand"
            placeholder="Enter brand name"
            value={formData.brand || ''}
            onChange={(value) => handleFieldChange('brand', value)}
            error={errors.brand}
            errorMessage={errors.brand}
            leftIcon={Tag}
          />
        </div>
      </div>

      {/* Second Section - Category & Barcode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category Selection */}
        <div>
          <Select
            label="Category"
            placeholder="Select a category"
            value={formData.category || ''}
            onChange={(value) => handleFieldChange('category', value)}
            error={errors.category}
            errorMessage={errors.category}
            searchable={true}
            options={PRODUCT_CATEGORY_OPTIONS}
            required
          />
        </div>

        {/* Barcode */}
        <div>
          <Input
            label="Barcode"
            placeholder="Enter barcode (optional)"
            value={formData.barcode || ''}
            onChange={(value) => handleFieldChange('barcode', value)}
            error={errors.barcode}
            errorMessage={errors.barcode}
            leftIcon={Barcode}
          />
        </div>
      </div>

          {/* Product Description */}
          <div className="mb-6">
            <Textarea
              label="Short Description"
              placeholder="Brief description of your product..."
              value={formData.shortDescription || ''}
              onChange={(value) => handleFieldChange('shortDescription', value)}
              error={errors.shortDescription}
              errorMessage={errors.shortDescription}
              rows={3}
              showCharCount
              maxLength={200}
              helperText="Short description for product listings (max 200 characters)"
            />
          </div>

          {/* Long Description */}
          <div className="mb-6">
            <Textarea
              label="Long Description"
              placeholder="Detailed description of your product..."
              value={formData.longDescription || ''}
              onChange={(value) => handleFieldChange('longDescription', value)}
              error={errors.longDescription}
              errorMessage={errors.longDescription}
              rows={5}
              showCharCount
              maxLength={2000}
              helperText="Detailed description for product page (max 2000 characters)"
            />
          </div>


          {/* Product Features */}
          <div className="mb-6">
            <TagInput
              label="Product Features"
              placeholder="Add key features..."
              value={formData.features || []}
              onChange={(value) => handleFieldChange('features', value)}
              error={errors.features}
              errorMessage={errors.features}
              maxTags={10}
              maxTagLength={50}
              helperText="Add key features that make your product special"
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
    </>
  );
};

export default BasicInfoSection;
