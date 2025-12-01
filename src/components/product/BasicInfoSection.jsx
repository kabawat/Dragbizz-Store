"use client"
import React, { useState } from 'react';
import { Input, Textarea, TagInput, Select } from '../ui';
import { Package, Tag, Barcode } from 'lucide-react';
import { PRODUCT_CATEGORY_OPTIONS } from '@/data';

const BasicInfoSection = ({
  formData,
  onChange,
  errors = {},
  onAddCategoryClick,
  apiCategories = [],
  categoriesLoading = false,
  ...props
}) => {  
  const [customCategories, setCustomCategories] = useState([]);

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  const handleCategoryChange = (value) => {
    if (value === 'add-new-category') {
      onAddCategoryClick && onAddCategoryClick();
    } else {
      handleFieldChange('category', value);
    }
  };

  // Combine API categories with custom ones and add "Add New Category" option
  const allCategories = [
    ...apiCategories,
    ...customCategories,
    { value: 'add-new-category', label: '+ Add New Category', isAddOption: true }
  ];

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
            placeholder={categoriesLoading ? "Loading categories..." : "Select a category"}
            value={formData.category || ''}
            onChange={handleCategoryChange}
            error={errors.category}
            errorMessage={errors.category}
            searchable={true}
            options={allCategories}
            required
            disabled={categoriesLoading}
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

    </>
  );
};

export default BasicInfoSection;
