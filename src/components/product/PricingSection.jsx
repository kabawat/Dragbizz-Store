"use client"
import React from 'react';
import { Input, NumberInput, Select } from '../ui';
import { DollarSign, Percent, Package } from 'lucide-react';
import { FieldGroup } from '../layout';
import { CURRENCY_OPTIONS, UOM_OPTIONS } from '@/data';

const PricingSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const handleFieldChange = (field, value) => {
    console.log('PricingSection - Field:', field, 'Value:', value);
    
    // Auto-calculate discount if MRP and selling price are provided
    if (field === 'mrp' || field === 'sellingPrice') {
      const mrp = parseFloat(field === 'mrp' ? value : formData.mrp) || 0;
      const sellingPrice = parseFloat(field === 'sellingPrice' ? value : formData.sellingPrice) || 0;
      
      if (mrp > 0 && sellingPrice > 0) {
        const discount = ((mrp - sellingPrice) / mrp) * 100;
        const calculatedDiscount = Math.max(0, Math.round(discount * 100) / 100);
        
        // Update discount field
        onChange('discount', calculatedDiscount);
      }
    }

    onChange(field, value);
  };

  // Use imported options from data constants
  const currencyOptions = CURRENCY_OPTIONS;
  const uomOptions = UOM_OPTIONS;

  return (
    <>
      {/* Price Input Fields - Divided into 2 groups */}
      <FieldGroup columns={2} className="">
        {/* First Group: Base Price & MRP */}
        <div className="group">
          <NumberInput
            label="Base Price"
            placeholder="0.00"
            value={formData.basePrice || ''}
            onChange={(value) => handleFieldChange('basePrice', value)}
            error={errors.basePrice}
            errorMessage={errors.basePrice}
            required
            leftIcon={() => <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-lg">₹</span>}
            min={0}
            step={0.01}
            precision={2}
            helperText="Cost price or purchase price"
            className="transition-all duration-200 group-hover:shadow-sm"
          />
        </div>

        <div className="group">
          <NumberInput
            label="MRP (Maximum Retail Price)"
            placeholder="0.00"
            value={formData.mrp || ''}
            onChange={(value) => handleFieldChange('mrp', value)}
            error={errors.mrp}
            errorMessage={errors.mrp}
            required
            leftIcon={() => <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-lg">₹</span>}
            min={0}
            step={0.01}
            precision={2}
            helperText="Maximum retail price as per regulations"
            className="transition-all duration-200 group-hover:shadow-sm"
          />
        </div>

        {/* Second Group: Selling Price & Discount */}
        <div className="group">
          <NumberInput
            label="Selling Price"
            placeholder="0.00"
            value={formData.sellingPrice || ''}
            onChange={(value) => handleFieldChange('sellingPrice', value)}
            error={errors.sellingPrice}
            errorMessage={errors.sellingPrice}
            required
            leftIcon={() => <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-lg">₹</span>}
            min={0}
            step={0.01}
            precision={2}
            helperText="Actual selling price to customers"
            className="transition-all duration-200 group-hover:shadow-sm"
          />
        </div>

        <div className="group">
          <NumberInput
            label="Discount Percentage"
            placeholder="0"
            value={formData.discount || ''}
            onChange={(value) => handleFieldChange('discount', value)}
            error={errors.discount}
            errorMessage={errors.discount}
            leftIcon={Percent}
            min={0}
            max={100}
            step={0.01}
            precision={2}
            disabled={!formData.mrp || !formData.sellingPrice}
            helperText="Auto-calculated from MRP and selling price, or enter manually"
            className="transition-all duration-200 group-hover:shadow-sm bg-[rgb(var(--color-bg-secondary))]"
          />
        </div>
      </FieldGroup>

      {/* Currency and UOM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          <Select
            label="Currency"
            options={currencyOptions}
            value={formData.currency || 'INR'}
            onChange={(value) => handleFieldChange('currency', value)}
            error={errors.currency}
            errorMessage={errors.currency}
            required
          searchable
          placeholder="Select currency"
          />
          <Select
            label="Unit of Measure"
            options={uomOptions}
          value={formData.uom || 'PCS'}
            onChange={(value) => handleFieldChange('uom', value)}
            error={errors.uom}
            errorMessage={errors.uom}
            required
            leftIcon={Package}
          searchable
          placeholder="Select unit of measure"
          />
      </div>

      {/* Price Summary - Always Visible */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
            <span className="text-[rgb(var(--color-primary))] font-bold text-xl mr-2">₹</span>
            Price Summary
          </h4>
          <div className="text-xs text-[rgb(var(--color-text-tertiary))] bg-[rgb(var(--color-bg-primary))] px-2 py-1 rounded-full">
            Live Preview
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Prices */}
          <div className="space-y-3">
            {formData.basePrice ? (
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Base Price:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  ₹{parseFloat(formData.basePrice).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] opacity-50">
                <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Base Price:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">₹0.00</span>
              </div>
            )}
            
            {formData.mrp ? (
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">MRP:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  ₹{parseFloat(formData.mrp).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] opacity-50">
                <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">MRP:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">₹0.00</span>
              </div>
            )}
            
            {formData.sellingPrice ? (
              <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]">
                <span className="text-sm font-medium text-white">Selling Price:</span>
                <span className="text-sm font-bold text-white">
                  ₹{parseFloat(formData.sellingPrice).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] opacity-50">
                <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Selling Price:</span>
                <span className="text-sm font-bold text-[rgb(var(--color-text-tertiary))]">₹0.00</span>
              </div>
            )}
          </div>
          
          {/* Right Column - Discount & Savings */}
          <div className="space-y-3">
            {formData.discount && parseFloat(formData.discount) > 0 ? (
              <div className="flex justify-between items-center p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Discount:</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {parseFloat(formData.discount).toFixed(2)}%
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] opacity-50">
                <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Discount:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">0%</span>
              </div>
            )}
            
            {formData.mrp && formData.sellingPrice && parseFloat(formData.mrp) > parseFloat(formData.sellingPrice) ? (
              <div className="flex justify-between items-center p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">You Save:</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  ₹{(parseFloat(formData.mrp) - parseFloat(formData.sellingPrice)).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] opacity-50">
                <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">You Save:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">₹0.00</span>
              </div>
            )}
            
            {formData.basePrice && formData.sellingPrice ? (
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Profit Margin:</span>
                <span className={`text-sm font-semibold ${
                  parseFloat(formData.sellingPrice) > parseFloat(formData.basePrice) 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {parseFloat(formData.sellingPrice) > parseFloat(formData.basePrice) ? '+' : ''}
                  ₹{(parseFloat(formData.sellingPrice) - parseFloat(formData.basePrice)).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] opacity-50">
                <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Profit Margin:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">₹0.00</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingSection;