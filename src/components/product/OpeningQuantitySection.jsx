"use client"
import React from 'react';
import { NumberInput, Input } from '../ui';
import { Package, DollarSign, Calculator } from 'lucide-react';

const OpeningQuantitySection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const handleFieldChange = (field, value) => {
    console.log('OpeningQuantitySection - Field:', field, 'Value:', value);
    onChange(field, value);
  };

  // Calculate total opening value
  const calculateOpeningValue = () => {
    const quantity = parseFloat(formData.openingStock?.openingQuantity) || 0;
    const purchasePrice = parseFloat(formData.openingStock?.openingPurchasePrice) || 0;
    return quantity * purchasePrice;
  };

  const openingValue = calculateOpeningValue();

  return (
    <>
      {/* Opening Quantity Information */}
      <div className="mb-8">
        

        {/* Opening Quantity and Purchase Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Opening Quantity */}
          <div>
            <NumberInput
              label="Opening Quantity"
              placeholder="0"
              value={formData.openingStock?.openingQuantity || ''}
              onChange={(value) => handleFieldChange('openingStock.openingQuantity', value)}
              error={errors.openingQuantity}
              errorMessage={errors.openingQuantity}
              leftIcon={Package}
              min={0}
              step={1}
              precision={0}
              helperText="Initial stock quantity for this product"
              className="transition-all duration-200 group-hover:shadow-sm"
            />
          </div>

          {/* Opening Purchase Price */}
          <div>
            <NumberInput
              label="Opening Purchase Price"
              placeholder="0.00"
              value={formData.openingStock?.openingPurchasePrice || ''}
              onChange={(value) => handleFieldChange('openingStock.openingPurchasePrice', value)}
              error={errors.openingPurchasePrice}
              errorMessage={errors.openingPurchasePrice}
              leftIcon={() => <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-lg">₹</span>}
              min={0}
              step={0.01}
              precision={2}
              helperText="Cost price per unit for opening stock"
              className="transition-all duration-200 group-hover:shadow-sm"
            />
          </div>
        </div>

        {/* Opening Stock Summary */}
        {(formData.openingStock?.openingQuantity || formData.openingStock?.openingPurchasePrice) && (
          <div className="p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                Opening Stock Summary
              </h4>
              <div className="text-xs text-[rgb(var(--color-text-tertiary))] bg-[rgb(var(--color-bg-primary))] px-2 py-1 rounded-full">
                Live Preview
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Opening Quantity */}
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Opening Quantity:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  {formData.openingStock?.openingQuantity || 0} {formData.uom || 'PCS'}
                </span>
              </div>
              
              {/* Purchase Price */}
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Purchase Price:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  ₹{parseFloat(formData.openingStock?.openingPurchasePrice || 0).toFixed(2)}
                </span>
              </div>
              
              {/* Total Value */}
              <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]">
                <span className="text-sm font-medium text-white">Total Value:</span>
                <span className="text-sm font-bold text-white">
                  ₹{openingValue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-4 p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                💡 This represents your initial inventory investment for this product. 
                The total value will be used for inventory valuation and cost tracking.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OpeningQuantitySection;
