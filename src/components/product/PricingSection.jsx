"use client"
import React from 'react';
import { Input, NumberInput, Select } from '../ui';
import { DollarSign, Percent, Package } from 'lucide-react';
import { SectionCard } from '../layout';

const PricingSection = ({
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

    // Auto-calculate discount if MRP and selling price are provided
    if (field === 'mrp' || field === 'sellingPrice') {
      const mrp = parseFloat(newData.mrp) || 0;
      const sellingPrice = parseFloat(newData.sellingPrice) || 0;
      
      if (mrp > 0 && sellingPrice > 0) {
        const discount = ((mrp - sellingPrice) / mrp) * 100;
        newData.discount = Math.max(0, Math.round(discount * 100) / 100);
      }
    }

    onChange(newData);
  };

  // Currency options
  const currencyOptions = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' }
  ];

  // Unit of Measure options
  const uomOptions = [
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'oz', label: 'Ounce (oz)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'meter', label: 'Meter (m)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'inch', label: 'Inch (in)' },
    { value: 'ft', label: 'Foot (ft)' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' },
    { value: 'set', label: 'Set' },
    { value: 'pair', label: 'Pair' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'gross', label: 'Gross' },
    { value: 'ream', label: 'Ream' },
    { value: 'roll', label: 'Roll' },
    { value: 'sheet', label: 'Sheet' }
  ];

  return (
    <>
      {/* Price Input Fields */}
      <div className="space-y-6">
        {/* Base Price */}
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

        {/* MRP */}
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

        {/* Selling Price */}
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

        {/* Discount - Auto-calculated */}
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
            helperText="Auto-calculated from MRP and selling price"
            className="transition-all duration-200 group-hover:shadow-sm bg-[rgb(var(--color-bg-secondary))]"
            disabled={true}
          />
        </div>
      </div>

      {/* Currency and UOM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Select
            label="Currency"
            options={currencyOptions}
            value={formData.currency || 'INR'}
            onChange={(value) => handleFieldChange('currency', value)}
            error={errors.currency}
            errorMessage={errors.currency}
            required
          />
          <Select
            label="Unit of Measure"
            options={uomOptions}
            value={formData.uom || 'piece'}
            onChange={(value) => handleFieldChange('uom', value)}
            error={errors.uom}
            errorMessage={errors.uom}
            required
            leftIcon={Package}
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
              <div className="flex justify-between items-center p-3 rounded-lg" style={{
                backgroundColor: 'rgb(248 250 252)', // slate-50 - lighter than white
                border: '1px solid rgb(226 232 240)' // slate-200 border
              }}>
                <span className="text-sm font-medium" style={{color: 'rgb(71 85 105)'}}>Base Price:</span>
                <span className="text-sm font-semibold" style={{color: 'rgb(15 23 42)'}}>
                  ₹{parseFloat(formData.basePrice).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 rounded-lg opacity-50" style={{
                backgroundColor: 'rgb(248 250 252)', // slate-50
                border: '1px solid rgb(226 232 240)' // slate-200 border
              }}>
                <span className="text-sm font-medium" style={{color: 'rgb(107 114 128)'}}>Base Price:</span>
                <span className="text-sm font-semibold" style={{color: 'rgb(107 114 128)'}}>₹0.00</span>
              </div>
            )}
            
            {formData.mrp ? (
              <div className="flex justify-between items-center p-3 rounded-lg" style={{
                backgroundColor: 'rgb(248 250 252)', // slate-50 - lighter than white
                border: '1px solid rgb(226 232 240)' // slate-200 border
              }}>
                <span className="text-sm font-medium" style={{color: 'rgb(71 85 105)'}}>MRP:</span>
                <span className="text-sm font-semibold" style={{color: 'rgb(15 23 42)'}}>
                  ₹{parseFloat(formData.mrp).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 rounded-lg opacity-50" style={{
                backgroundColor: 'rgb(248 250 252)', // slate-50
                border: '1px solid rgb(226 232 240)' // slate-200 border
              }}>
                <span className="text-sm font-medium" style={{color: 'rgb(107 114 128)'}}>MRP:</span>
                <span className="text-sm font-semibold" style={{color: 'rgb(107 114 128)'}}>₹0.00</span>
              </div>
            )}
            
            {formData.sellingPrice ? (
              <div className="flex justify-between items-center p-3 rounded-lg border" style={{
                backgroundColor: 'rgb(59 130 246)', // blue-500
                borderColor: 'rgb(37 99 235)', // blue-600
                borderWidth: '1px'
              }}>
                <span className="text-sm font-medium text-white">Selling Price:</span>
                <span className="text-sm font-bold text-white">
                  ₹{parseFloat(formData.sellingPrice).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 rounded-lg border opacity-50" style={{
                backgroundColor: 'rgb(239 246 255)', // blue-50
                borderColor: 'rgb(191 219 254)', // blue-200
                borderWidth: '1px'
              }}>
                <span className="text-sm font-medium" style={{color: 'rgb(107 114 128)'}}>Selling Price:</span>
                <span className="text-sm font-bold" style={{color: 'rgb(107 114 128)'}}>₹0.00</span>
              </div>
            )}
          </div>
          
          {/* Right Column - Discount & Savings */}
          <div className="space-y-3">
            {formData.discount && parseFloat(formData.discount) > 0 ? (
              <div className="flex justify-between items-center p-3 rounded-lg border" style={{
                backgroundColor: 'rgb(240 253 244)', // green-50 equivalent
                borderColor: 'rgb(187 247 208)', // green-200 equivalent
                borderWidth: '1px'
              }}>
                <span className="text-sm font-medium" style={{color: 'rgb(22 101 52)'}}>Discount:</span>
                <span className="text-sm font-bold" style={{color: 'rgb(21 128 61)'}}>
                  {parseFloat(formData.discount).toFixed(2)}%
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg opacity-50">
                <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Discount:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">0%</span>
              </div>
            )}
            
            {formData.mrp && formData.sellingPrice && parseFloat(formData.mrp) > parseFloat(formData.sellingPrice) ? (
              <div className="flex justify-between items-center p-3 rounded-lg border" style={{
                backgroundColor: 'rgb(239 246 255)', // blue-50 equivalent
                borderColor: 'rgb(191 219 254)', // blue-200 equivalent
                borderWidth: '1px'
              }}>
                <span className="text-sm font-medium" style={{color: 'rgb(30 64 175)'}}>You Save:</span>
                <span className="text-sm font-bold" style={{color: 'rgb(29 78 216)'}}>
                  ₹{(parseFloat(formData.mrp) - parseFloat(formData.sellingPrice)).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg opacity-50">
                <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">You Save:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">₹0.00</span>
              </div>
            )}
            
            {formData.basePrice && formData.sellingPrice ? (
              <div className="flex justify-between items-center p-3 rounded-lg" style={{
                backgroundColor: 'rgb(248 250 252)', // slate-50 - lighter than white
                border: '1px solid rgb(226 232 240)' // slate-200 border
              }}>
                <span className="text-sm font-medium" style={{color: 'rgb(71 85 105)'}}>Profit Margin:</span>
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
              <div className="flex justify-between items-center p-3 rounded-lg opacity-50" style={{
                backgroundColor: 'rgb(248 250 252)', // slate-50
                border: '1px solid rgb(226 232 240)' // slate-200 border
              }}>
                <span className="text-sm font-medium" style={{color: 'rgb(107 114 128)'}}>Profit Margin:</span>
                <span className="text-sm font-semibold" style={{color: 'rgb(107 114 128)'}}>₹0.00</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingSection;