"use client"
import React from 'react';
import { NumberInput, Toggle } from '../ui';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { SectionCard } from '../layout';

const InventorySection = ({
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

  // Calculate stock value
  const calculateStockValue = () => {
    const stock = parseFloat(formData.initialStock) || 0;
    const basePrice = parseFloat(formData.basePrice) || 0;
    return stock * basePrice;
  };

  // Get stock status
  const getStockStatus = () => {
    const stock = parseFloat(formData.initialStock) || 0;
    const minStock = parseFloat(formData.minStock) || 0;
    const reorderPoint = parseFloat(formData.reorderPoint) || 0;

    if (stock <= 0) return { status: 'out', color: 'text-red-500', icon: TrendingDown };
    if (stock <= reorderPoint) return { status: 'low', color: 'text-yellow-500', icon: AlertTriangle };
    if (stock <= minStock) return { status: 'warning', color: 'text-orange-500', icon: AlertTriangle };
    return { status: 'good', color: 'text-green-500', icon: TrendingUp };
  };

  const stockStatus = getStockStatus();
  const stockValue = calculateStockValue();

  return (
    <>
      {/* Initial Stock Quantity */}
      <div className="mb-6">
        <NumberInput
          label="Initial Stock Quantity"
          placeholder="0"
          value={formData.initialStock || ''}
          onChange={(value) => handleFieldChange('initialStock', value)}
          error={errors.initialStock}
          errorMessage={errors.initialStock}
          required
          leftIcon={Package}
          min={0}
          step={1}
          helperText="Current stock quantity"
        />
      </div>

      {/* Stock Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <NumberInput
          label="Minimum Stock Level"
          placeholder="0"
          value={formData.minStock || ''}
          onChange={(value) => handleFieldChange('minStock', value)}
          error={errors.minStock}
          errorMessage={errors.minStock}
          leftIcon={AlertTriangle}
          min={0}
          step={1}
          helperText="Minimum stock before alert"
        />
        
        <NumberInput
          label="Maximum Stock Level"
          placeholder="0"
          value={formData.maxStock || ''}
          onChange={(value) => handleFieldChange('maxStock', value)}
          error={errors.maxStock}
          errorMessage={errors.maxStock}
          leftIcon={TrendingUp}
          min={0}
          step={1}
          helperText="Maximum stock capacity"
        />
      </div>

      {/* Reorder Point */}
      <div className="mb-6">
        <NumberInput
          label="Reorder Point"
          placeholder="0"
          value={formData.reorderPoint || ''}
          onChange={(value) => handleFieldChange('reorderPoint', value)}
          error={errors.reorderPoint}
          errorMessage={errors.reorderPoint}
          leftIcon={AlertTriangle}
          min={0}
          step={1}
          helperText="Stock level to trigger reorder"
        />
      </div>

      {/* Stock Alert Toggle */}
      <div className="mb-6">
        <Toggle
          label="Enable Stock Alerts"
          checked={formData.stockAlert || false}
          onChange={(checked) => handleFieldChange('stockAlert', checked)}
          helperText="Get notified when stock levels are low"
        />
      </div>

      {/* Stock Summary */}
      {(formData.initialStock || formData.minStock || formData.maxStock || formData.reorderPoint) && (
        <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Stock Summary</h4>
          <div className="space-y-3">
            {/* Current Stock Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Current Stock:</span>
              <div className="flex items-center space-x-2">
                <stockStatus.icon className={`w-4 h-4 ${stockStatus.color}`} />
                <span className={`text-sm font-medium ${stockStatus.color}`}>
                  {formData.initialStock || 0} units
                </span>
              </div>
            </div>

            {/* Stock Value */}
            {stockValue > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-[rgb(var(--color-text-secondary))]">Stock Value:</span>
                <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                  ₹{stockValue.toFixed(2)}
                </span>
              </div>
            )}

            {/* Stock Levels */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[rgb(var(--color-text-tertiary))]">Min Level:</span>
                <span className="ml-2 font-medium text-[rgb(var(--color-text-primary))]">
                  {formData.minStock || 0}
                </span>
              </div>
              <div>
                <span className="text-[rgb(var(--color-text-tertiary))]">Max Level:</span>
                <span className="ml-2 font-medium text-[rgb(var(--color-text-primary))]">
                  {formData.maxStock || 0}
                </span>
              </div>
              <div>
                <span className="text-[rgb(var(--color-text-tertiary))]">Reorder Point:</span>
                <span className="ml-2 font-medium text-[rgb(var(--color-text-primary))]">
                  {formData.reorderPoint || 0}
                </span>
              </div>
              <div>
                <span className="text-[rgb(var(--color-text-tertiary))]">Alert Status:</span>
                <span className={`ml-2 font-medium ${stockStatus.color}`}>
                  {stockStatus.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InventorySection;
