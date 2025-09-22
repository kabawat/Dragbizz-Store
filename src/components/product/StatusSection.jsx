"use client"
import React from 'react';
import { Select, Toggle } from '../ui';
import { Star, Award, Sparkles } from 'lucide-react';
import { PRODUCT_STATUS_OPTIONS, PRODUCT_VISIBILITY_OPTIONS, getProductStatusColor } from '@/data';

const StatusSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const handleFieldChange = (field, value) => {
    console.log('StatusSection - Field:', field, 'Value:', value);
    onChange(field, value);
  };

  // Use imported options from data constants
  const statusOptions = PRODUCT_STATUS_OPTIONS;
  const visibilityOptions = PRODUCT_VISIBILITY_OPTIONS;

  return (
    <>
      {/* Product Status */}
      <div className="mb-6">
        <Select
          label="Product Status"
          options={statusOptions}
          value={formData.status || 'DRAFT'}
          onChange={(value) => handleFieldChange('status', value)}
          error={errors.status}
          errorMessage={errors.status}
          required
          helperText="Current status of the product"
          searchable
          placeholder="Select product status"
        />
      </div>

      {/* Visibility */}
      <div className="mb-6">
        <Select
          label="Visibility"
          options={visibilityOptions}
          value={formData.visibility || 'PUBLIC'}
          onChange={(value) => handleFieldChange('visibility', value)}
          error={errors.visibility}
          errorMessage={errors.visibility}
          required
          helperText="Who can see this product"
          searchable
          placeholder="Select visibility"
        />
      </div>

      {/* Product Flags */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Product Flags</h4>
        
        <div className="space-y-4">
          <Toggle
            label="Featured Product"
            checked={formData.featured || false}
            onChange={(checked) => handleFieldChange('featured', checked)}
            helperText="Show this product prominently on the homepage"
          />
          
          <Toggle
            label="Best Seller"
            checked={formData.bestSeller || false}
            onChange={(checked) => handleFieldChange('bestSeller', checked)}
            helperText="Mark as a best-selling product"
          />
          
          <Toggle
            label="New Arrival"
            checked={formData.newArrival || false}
            onChange={(checked) => handleFieldChange('newArrival', checked)}
            helperText="Mark as a new arrival product"
          />
        </div>
      </div>

      {/* Status Summary */}
      <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Product Status Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[rgb(var(--color-text-secondary))]">Status:</span>
            <span className={`font-medium ${getProductStatusColor(formData.status)}`}>
              {statusOptions.find(s => s.value === formData.status)?.label || formData.status}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-[rgb(var(--color-text-secondary))]">Visibility:</span>
            <span className="font-medium text-[rgb(var(--color-text-primary))]">
              {visibilityOptions.find(v => v.value === formData.visibility)?.label || formData.visibility}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-[rgb(var(--color-text-secondary))]">Flags:</span>
            <div className="flex space-x-2">
              {formData.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
              {formData.bestSeller && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Award className="w-3 h-3 mr-1" />
                  Best Seller
                </span>
              )}
              {formData.newArrival && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  New Arrival
                </span>
              )}
              {!formData.featured && !formData.bestSeller && !formData.newArrival && (
                <span className="text-[rgb(var(--color-text-tertiary))]">None</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusSection;
