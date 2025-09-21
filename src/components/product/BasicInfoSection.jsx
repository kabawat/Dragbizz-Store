"use client"
import React from 'react';
import { Input, Textarea, TagInput } from '../ui';
import { Package, Tag, Barcode } from 'lucide-react';
import CategorySelector from './CategorySelector';
import { SectionCard } from '../layout';

const BasicInfoSection = ({
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

  return (
    <>
          {/* Product Name */}
          <div className="mb-1">
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
          <div className="mb-6">
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

          {/* Category Selection */}
          <CategorySelector
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
          />

          {/* Barcode */}
          <div className="mb-6">
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

          {/* Product Highlights */}
          <div className="mb-6">
            <TagInput
              label="Product Highlights"
              placeholder="Add highlights..."
              value={formData.highlights || []}
              onChange={(value) => handleFieldChange('highlights', value)}
              error={errors.highlights}
              errorMessage={errors.highlights}
              maxTags={8}
              maxTagLength={30}
              helperText="Add selling points and highlights"
            />
          </div>
    </>
  );
};

export default BasicInfoSection;
