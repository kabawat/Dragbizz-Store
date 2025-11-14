"use client"
import React from 'react';
import { Select, Toggle, Input } from '../ui';
import { Package, Calculator, Hash, IndianRupee } from 'lucide-react';
import { CURRENCY_OPTIONS, UOM_OPTIONS, GST_RATE_OPTIONS } from '@/data';

const PricingGSTSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const handleFieldChange = (field, value) => {
    console.log('PricingGSTSection - Field:', field, 'Value:', value);
    onChange(field, value);
  };

  // GST Type options
  const gstTypeOptions = [
    { value: 'CGST_SGST', label: 'CGST + SGST', description: 'Central GST + State GST' },
    { value: 'IGST', label: 'IGST', description: 'Integrated GST (Inter-state)' },
    { value: 'UTGST', label: 'UTGST', description: 'Union Territory GST' }
  ];

  // Calculate GST amount based on include/exclude option
  const calculateGSTAmount = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstRate = parseFloat(formData.gstInfo?.gstRate) || 0;
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;
    
    if (isGstIncluded) {
      // If GST is included, calculate GST from the selling price
      // GST = (Selling Price * GST Rate) / (100 + GST Rate)
      return (sellingPrice * gstRate) / (100 + gstRate);
    } else {
      // If GST is excluded, calculate GST on top of selling price
      // GST = (Selling Price * GST Rate) / 100
      return (sellingPrice * gstRate) / 100;
    }
  };

  // Calculate base price (price without GST)
  const calculateBasePrice = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstAmount = calculateGSTAmount();
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;
    
    if (isGstIncluded) {
      // If GST is included, base price = selling price - GST
      return sellingPrice - gstAmount;
    } else {
      // If GST is excluded, base price = selling price
      return sellingPrice;
    }
  };

  // Calculate total price (selling price + GST if excluded)
  const calculateTotalPrice = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstAmount = calculateGSTAmount();
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;
    
    if (isGstIncluded) {
      // If GST is included, total = selling price
      return sellingPrice;
    } else {
      // If GST is excluded, total = selling price + GST
      return sellingPrice + gstAmount;
    }
  };

  const gstAmount = calculateGSTAmount();
  const basePrice = calculateBasePrice();
  const totalPrice = calculateTotalPrice();

  return (
    <>
      {/* Pricing Information */}
      <div className="mb-8">
        
        {/* Price Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* MRP */}
          <div>
            <Input
              type="number"
              label="MRP (Maximum Retail Price)"
              placeholder="0.00"
              value={formData.mrp || ''}
              onChange={(value) => handleFieldChange('mrp', value)}
              error={errors.mrp}
              errorMessage={errors.mrp}
              required
              leftIcon={() => <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-md">₹</span>}
              min={0}
              step={0.01}
              precision={2}
              helperText="Maximum retail price as per regulations"
              className="transition-all duration-200 group-hover:shadow-sm"
            />
          </div>

          {/* Selling Price */}
          <div>
            <Input
              type="number"
              label="Selling Price"
              placeholder="0.00"
              value={formData.sellingPrice || ''}
              onChange={(value) => handleFieldChange('sellingPrice', value)}
              error={errors.sellingPrice}
              errorMessage={errors.sellingPrice}
              required
              leftIcon={() => <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-md">₹</span>}
              min={0}
              step={0.01}
              precision={2}
              helperText="Actual selling price to customers"
              className="transition-all duration-200 group-hover:shadow-sm"
            />
          </div>
        </div>

        {/* Currency and UOM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Currency"
            options={CURRENCY_OPTIONS}
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
            options={UOM_OPTIONS}
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

        {/* Price Summary */}
        <div className="mt-6 p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
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
            
            {/* Right Column - Savings */}
            <div className="space-y-3">
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
              
              {formData.mrp && formData.sellingPrice && parseFloat(formData.mrp) > parseFloat(formData.sellingPrice) ? (
                <div className="flex justify-between items-center p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Discount:</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {Math.round(((parseFloat(formData.mrp) - parseFloat(formData.sellingPrice)) / parseFloat(formData.mrp)) * 100)}%
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] opacity-50">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Discount:</span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">0%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GST Information */}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
          GST Information
        </h3>

        {/* GST Applicable Toggle */}
        <div className="mb-6">
          <Toggle
            label="GST Applicable"
            checked={formData.gstInfo?.isGstApplicable || false}
            onChange={(checked) => handleFieldChange('gstInfo.isGstApplicable', checked)}
            helperText="Enable if GST is applicable to this product"
          />
        </div>

        {/* GST Fields - Only show if GST is applicable */}
        {formData.gstInfo?.isGstApplicable && (
          <>
            {/* GST Rate and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* GST Rate */}
              <div>
                <Select
                  label="GST Rate"
                  options={GST_RATE_OPTIONS}
                  value={formData.gstInfo?.gstRate || ''}
                  onChange={(value) => handleFieldChange('gstInfo.gstRate', value)}
                  error={errors.gstRate}
                  errorMessage={errors.gstRate}
                  required
                  leftIcon={Calculator}
                  searchable
                  placeholder="Select GST rate"
                />
              </div>

              {/* GST Type */}
              <div>
                <Select
                  label="GST Type"
                  options={gstTypeOptions}
                  value={formData.gstInfo?.gstType || 'CGST_SGST'}
                  onChange={(value) => handleFieldChange('gstInfo.gstType', value)}
                  error={errors.gstType}
                  errorMessage={errors.gstType}
                  required
                  searchable
                  placeholder="Select GST type"
                  helperText="Choose the appropriate GST type based on transaction"
                />
              </div>
            </div>

            {/* HSN Code */}
            <div className="mb-6">
              <Input
                label="HSN Code"
                placeholder="Enter HSN code (e.g., 85171200)"
                value={formData.gstInfo?.hsnCode || ''}
                onChange={(value) => handleFieldChange('gstInfo.hsnCode', value)}
                error={errors.hsnCode}
                errorMessage={errors.hsnCode}
                leftIcon={Hash}
                maxLength={8}
                helperText="Harmonized System of Nomenclature code for product classification"
              />
            </div>

            {/* GST Include/Exclude Option */}
            <div className="mb-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                  GST Pricing Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gstIncluded"
                      value="excluded"
                      checked={!formData.gstInfo?.isGstIncluded}
                      onChange={() => handleFieldChange('gstInfo.isGstIncluded', false)}
                      className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-[rgb(var(--color-text-primary))]">
                      <span className="font-medium">GST Excluded</span>
                      <span className="text-[rgb(var(--color-text-secondary))] ml-1">- GST will be added on top of selling price</span>
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gstIncluded"
                      value="included"
                      checked={formData.gstInfo?.isGstIncluded}
                      onChange={() => handleFieldChange('gstInfo.isGstIncluded', true)}
                      className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-[rgb(var(--color-text-primary))]">
                      <span className="font-medium">GST Included</span>
                      <span className="text-[rgb(var(--color-text-secondary))] ml-1">- Selling price already includes GST amount</span>
                    </span>
                  </label>
                </div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-2">
                  Choose how GST is calculated for this product
                </p>
              </div>
            </div>

            {/* GST Summary */}
            {formData.gstInfo?.gstRate && formData.sellingPrice && (
              <div className="p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm">
                <h4 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                  GST Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                      <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                        {formData.gstInfo?.isGstIncluded ? 'Selling Price (GST Included):' : 'Base Price:'}
                      </span>
                      <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        ₹{formData.gstInfo?.isGstIncluded ? parseFloat(formData.sellingPrice).toFixed(2) : basePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                      <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">GST Rate:</span>
                      <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        {parseFloat(formData.gstInfo?.gstRate).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                      <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">GST Type:</span>
                      <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        {gstTypeOptions.find(type => type.value === formData.gstInfo?.gstType)?.label || formData.gstInfo?.gstType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                      <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">GST Status:</span>
                      <span className="font-medium text-[rgb(var(--color-text-primary))]">
                        {formData.gstInfo?.isGstIncluded ? 'Included' : 'Excluded'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {formData.gstInfo?.hsnCode && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                        <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">HSN Code:</span>
                        <span className="font-medium text-[rgb(var(--color-text-primary))]">
                          {formData.gstInfo.hsnCode}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]">
                      <span className="text-sm font-medium text-white">GST Amount:</span>
                      <span className="font-bold text-white">
                        ₹{gstAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300 font-bold">Total Price:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PricingGSTSection;
