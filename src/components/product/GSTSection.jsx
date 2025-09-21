"use client"
import React from 'react';
import { Toggle, Select } from '../ui';
import { Calculator } from 'lucide-react';
import { GST_RATE_OPTIONS } from '../../data';

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

  // Use imported GST rate options from data constants
  const gstRateOptions = GST_RATE_OPTIONS;

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
              options={gstRateOptions}
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
