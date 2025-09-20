"use client"
import React, { useState } from 'react';
import { Input, Textarea, FileUpload, TagInput, Button } from '../ui';
import { Package, Tag, Barcode, Upload, FileText, Plus } from 'lucide-react';
import CategorySelector from './CategorySelector';
import { SectionCard } from '../layout';

const BasicInfoSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const [inputMethod, setInputMethod] = useState('manual'); // 'manual' or 'bulk'

  const handleFieldChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  const handleInputMethodChange = (method) => {
    setInputMethod(method);
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex gap-4">
          <Button
            variant={inputMethod === 'manual' ? 'primary' : 'outline'}
            onClick={() => handleInputMethodChange('manual')}
            leftIcon={Plus}
            className="flex-1"
          >
            Manual Entry
          </Button>

          <div className="flex items-center text-sm text-[rgb(var(--color-text-tertiary))]">
            or
          </div>

          <Button
            variant={inputMethod === 'bulk' ? 'primary' : 'outline'}
            onClick={() => handleInputMethodChange('bulk')}
            leftIcon={Upload}
            className="flex-1"
          >
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Manual Entry Method */}
      {inputMethod === 'manual' && (
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
              label="Product Description"
              placeholder="Describe your product..."
              value={formData.description || ''}
              onChange={(value) => handleFieldChange('description', value)}
              error={errors.description}
              errorMessage={errors.description}
              rows={4}
              showCharCount
              maxLength={1000}
            />
          </div>

          {/* Product Images */}
          <div className="mb-6">
            <FileUpload
              label="Product Images"
              value={formData.images || []}
              onChange={(value) => handleFieldChange('images', value)}
              accept="image/*"
              multiple
              maxFiles={10}
              maxSize={5 * 1024 * 1024} // 5MB
              error={errors.images}
              errorMessage={errors.images}
              helperText="Upload up to 10 images (max 5MB each)"
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
              maxTags={10}
              maxTagLength={20}
              helperText="Add tags to help customers find your product"
            />
          </div>
        </>
      )}

      {/* Bulk Import Method */}
      {inputMethod === 'bulk' && (
        <div className="space-y-6">
          <div className="p-6 border-2 border-dashed border-[rgb(var(--color-border-primary))] rounded-lg text-center">
            <Upload className="w-12 h-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              Bulk Import Products
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
              Upload a CSV or Excel file to import multiple products at once
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                leftIcon={FileText}
                onClick={() => console.log('Download template')}
              >
                Download Template
              </Button>
              <Button
                variant="primary"
                leftIcon={Upload}
                onClick={() => console.log('Upload file')}
              >
                Upload File
              </Button>
            </div>

            <div className="mt-4 text-xs text-[rgb(var(--color-text-tertiary))]">
              <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>

          <div className="text-sm text-[rgb(var(--color-text-secondary))] space-y-1">
            <p><strong>Bulk Import Features:</strong></p>
            <p>• Import up to 1000 products at once</p>
            <p>• Auto-generate SKUs for missing entries</p>
            <p>• Validate data before import</p>
            <p>• Preview changes before applying</p>
          </div>
        </div>
      )}
    </>
  );
};

export default BasicInfoSection;
