"use client"
import React from 'react';
import { Toggle, Select, Input } from '../ui';
import { Calculator, Hash } from 'lucide-react';
import { GST_RATE_OPTIONS } from '@/data';

const GSTSection = ({
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
  // GST Type options
  const gstTypeOptions = [
    { value: 'CGST_SGST', label: 'CGST + SGST', description: 'Central GST + State GST' },
    { value: 'IGST', label: 'IGST', description: 'Integrated GST (Inter-state)' },
    { value: 'UTGST', label: 'UTGST', description: 'Union Territory GST' }
  ];

  // Calculate total GST amount
  const calculateGSTAmount = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstRate = parseFloat(formData.gstRate) || 0;
    return (sellingPrice * gstRate) / 100;
  };

  const gstAmount = calculateGSTAmount();

  return (
    <>
      {/* GST Applicable Toggle */}
      <div className="mb-6">
        <Toggle
          label="GST Applicable"
          checked={formData.gstApplicable || false}
          onChange={(checked) => handleFieldChange('gstApplicable', checked)}
          helperText="Enable if GST is applicable to this product"
        />
      </div>

      {/* GST Fields - Only show if GST is applicable */}
      {formData.gstApplicable && (
        <>
          {/* GST Rate */}
          <div className="mb-6">
            <Select
              label="GST Rate"
              options={GST_RATE_OPTIONS}
              value={formData.gstRate || ''}
              onChange={(value) => handleFieldChange('gstRate', value)}
              error={errors.gstRate}
              errorMessage={errors.gstRate}
              required
              leftIcon={Calculator}
              searchable
              placeholder="Select GST rate"
            />
          </div>

          {/* GST Type */}
          <div className="mb-6">
            <Select
              label="GST Type"
              options={gstTypeOptions}
              value={formData.gstType || 'CGST_SGST'}
              onChange={(value) => handleFieldChange('gstType', value)}
              error={errors.gstType}
              errorMessage={errors.gstType}
              required
              searchable
              placeholder="Select GST type"
              helperText="Choose the appropriate GST type based on transaction"
            />
          </div>

          {/* HSN Code */}
          <div className="mb-6">
            <Input
              label="HSN Code"
              placeholder="Enter HSN code (e.g., 85171200)"
              value={formData.hsnCode || ''}
              onChange={(value) => handleFieldChange('hsnCode', value)}
              error={errors.hsnCode}
              errorMessage={errors.hsnCode}
              leftIcon={Hash}
              maxLength={8}
              helperText="Harmonized System of Nomenclature code for product classification"
            />
          </div>

          {/* GST Summary */}
          {formData.gstRate && formData.sellingPrice && (
            <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
              <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">GST Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">Selling Price:</span>
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    ₹{parseFloat(formData.sellingPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">GST Rate:</span>
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    {parseFloat(formData.gstRate).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">GST Type:</span>
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    {gstTypeOptions.find(type => type.value === formData.gstType)?.label || formData.gstType}
                  </span>
                </div>
                {formData.hsnCode && (
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">HSN Code:</span>
                    <span className="font-medium text-[rgb(var(--color-text-primary))]">
                      {formData.hsnCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">GST Amount:</span>
                  <span className="font-medium text-[rgb(var(--color-primary))]">
                    ₹{gstAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[rgb(var(--color-border-primary))] pt-2">
                  <span className="text-[rgb(var(--color-text-secondary))] font-medium">Total Price:</span>
                  <span className="font-bold text-[rgb(var(--color-primary))]">
                    ₹{(parseFloat(formData.sellingPrice) + gstAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default GSTSection;
