"use client"
import React from 'react';
import { Toggle, Select, NumberInput, Input } from '../ui';
import { Receipt, Calculator, Hash } from 'lucide-react';

const GSTSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const handleFieldChange = (field, value) => {
    const newData = {
      ...formData,
      [field]: value
    };

    // Auto-calculate CGST/SGST/IGST rates when GST rate changes
    if (field === 'gstRate' && formData.gstType) {
      const gstRate = parseFloat(value) || 0;
      const halfRate = gstRate / 2;
      
      if (formData.gstType === 'CGST_SGST') {
        newData.cgstRate = halfRate;
        newData.sgstRate = halfRate;
        newData.igstRate = 0;
        newData.utgstRate = 0;
      } else if (formData.gstType === 'IGST') {
        newData.igstRate = gstRate;
        newData.cgstRate = 0;
        newData.sgstRate = 0;
        newData.utgstRate = 0;
      } else if (formData.gstType === 'UTGST') {
        newData.utgstRate = halfRate;
        newData.cgstRate = halfRate;
        newData.sgstRate = 0;
        newData.igstRate = 0;
      }
    }

    // Auto-calculate rates when GST type changes
    if (field === 'gstType' && formData.gstRate) {
      const gstRate = parseFloat(formData.gstRate) || 0;
      const halfRate = gstRate / 2;
      
      if (value === 'CGST_SGST') {
        newData.cgstRate = halfRate;
        newData.sgstRate = halfRate;
        newData.igstRate = 0;
        newData.utgstRate = 0;
      } else if (value === 'IGST') {
        newData.igstRate = gstRate;
        newData.cgstRate = 0;
        newData.sgstRate = 0;
        newData.utgstRate = 0;
      } else if (value === 'UTGST') {
        newData.utgstRate = halfRate;
        newData.cgstRate = halfRate;
        newData.sgstRate = 0;
        newData.igstRate = 0;
      }
    }

    onChange(newData);
  };

  // GST Rate options
  const gstRateOptions = [
    { value: 0, label: '0% - Exempt' },
    { value: 0.25, label: '0.25% - Gold' },
    { value: 3, label: '3% - Gold Jewellery' },
    { value: 5, label: '5% - Essential Items' },
    { value: 12, label: '12% - Standard Rate' },
    { value: 18, label: '18% - Standard Rate' },
    { value: 28, label: '28% - Luxury Items' }
  ];

  // GST Type options
  const gstTypeOptions = [
    { value: 'CGST_SGST', label: 'CGST + SGST (Intra-state)' },
    { value: 'IGST', label: 'IGST (Inter-state)' },
    { value: 'UTGST', label: 'CGST + UTGST (Union Territory)' }
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
              options={gstRateOptions}
              value={formData.gstRate || ''}
              onChange={(value) => handleFieldChange('gstRate', value)}
              error={errors.gstRate}
              errorMessage={errors.gstRate}
              required
              leftIcon={Calculator}
            />
          </div>

          {/* GST Type */}
          <div className="mb-6">
            <Select
              label="GST Type"
              options={gstTypeOptions}
              value={formData.gstType || ''}
              onChange={(value) => handleFieldChange('gstType', value)}
              error={errors.gstType}
              errorMessage={errors.gstType}
              required
              leftIcon={Receipt}
            />
          </div>

          {/* HSN Code */}
          <div className="mb-6">
            <Input
              label="HSN Code"
              placeholder="Enter HSN code"
              value={formData.hsnCode || ''}
              onChange={(value) => handleFieldChange('hsnCode', value)}
              error={errors.hsnCode}
              errorMessage={errors.hsnCode}
              leftIcon={Hash}
              helperText="Harmonized System of Nomenclature code"
            />
          </div>

          {/* SAC Code */}
          <div className="mb-6">
            <Input
              label="SAC Code"
              placeholder="Enter SAC code (for services)"
              value={formData.sacCode || ''}
              onChange={(value) => handleFieldChange('sacCode', value)}
              error={errors.sacCode}
              errorMessage={errors.sacCode}
              leftIcon={Hash}
              helperText="Service Accounting Code (only for services)"
            />
          </div>

          {/* GST Rate Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <NumberInput
              label="CGST Rate"
              placeholder="0"
              value={formData.cgstRate || ''}
              onChange={(value) => handleFieldChange('cgstRate', value)}
              error={errors.cgstRate}
              errorMessage={errors.cgstRate}
              min={0}
              max={100}
              step={0.01}
              precision={2}
              helperText="Central GST Rate (%)"
            />
            
            <NumberInput
              label="SGST Rate"
              placeholder="0"
              value={formData.sgstRate || ''}
              onChange={(value) => handleFieldChange('sgstRate', value)}
              error={errors.sgstRate}
              errorMessage={errors.sgstRate}
              min={0}
              max={100}
              step={0.01}
              precision={2}
              helperText="State GST Rate (%)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <NumberInput
              label="IGST Rate"
              placeholder="0"
              value={formData.igstRate || ''}
              onChange={(value) => handleFieldChange('igstRate', value)}
              error={errors.igstRate}
              errorMessage={errors.igstRate}
              min={0}
              max={100}
              step={0.01}
              precision={2}
              helperText="Integrated GST Rate (%)"
            />
            
            <NumberInput
              label="UTGST Rate"
              placeholder="0"
              value={formData.utgstRate || ''}
              onChange={(value) => handleFieldChange('utgstRate', value)}
              error={errors.utgstRate}
              errorMessage={errors.utgstRate}
              min={0}
              max={100}
              step={0.01}
              precision={2}
              helperText="Union Territory GST Rate (%)"
            />
          </div>

          {/* CESS Rate */}
          <div className="mb-6">
            <NumberInput
              label="CESS Rate"
              placeholder="0"
              value={formData.cessRate || ''}
              onChange={(value) => handleFieldChange('cessRate', value)}
              error={errors.cessRate}
              errorMessage={errors.cessRate}
              min={0}
              max={100}
              step={0.01}
              precision={2}
              helperText="Compensation CESS Rate (%) - Optional"
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
