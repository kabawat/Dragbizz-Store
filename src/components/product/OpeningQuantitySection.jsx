"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NumberInput, Input, Select } from '../ui';
import { Package, IndianRupee, Calculator, Truck } from 'lucide-react';
import { supplierService } from '@/service/retailer';

const OpeningQuantitySection = ({
  formData,
  onChange,
  errors = {},
  storeId = null,
  ...props
}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  
  // Ref to prevent duplicate API calls
  const hasFetchedSuppliers = useRef(false);

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  // Fetch suppliers from API
  const fetchSuppliers = useCallback(async () => {
    if (!storeId || hasFetchedSuppliers.current) return;
    
    hasFetchedSuppliers.current = true;
    
    try {
      setSuppliersLoading(true);
      const result = await supplierService.getSuppliers({ 
        limit: 100, 
        lightweight: true, 
        store: storeId 
      });
      if (result.success) {
        setSuppliers(result.data?.data || result.data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching suppliers:', error);
      hasFetchedSuppliers.current = false; // Reset on error
    } finally {
      setSuppliersLoading(false);
    }
  }, [storeId]);

  // Fetch suppliers on component mount and when storeId changes
  useEffect(() => {
    if (storeId) {
      fetchSuppliers();
    }
  }, [storeId, fetchSuppliers]);

  // Format supplier options for dropdown
  const supplierOptions = [
    { value: '', label: 'No supplier selected' },
    ...(suppliers || []).map(s => ({
      value: s.id || s._id,
      label: s.name || s.companyName || 'Unknown'
    }))
  ];

  // Calculate total opening value
  const calculateOpeningValue = () => {
    const quantity = parseFloat(formData.openingStock?.quantity) || 0;
    const purchasePrice = parseFloat(formData.openingStock?.purchasePrice) || 0;
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
              value={formData.openingStock?.quantity || ''}
              onChange={(value) => handleFieldChange('openingStock.quantity', value)}
              error={errors.quantity}
              errorMessage={errors.quantity}
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
              value={formData.openingStock?.purchasePrice || ''}
              onChange={(value) => handleFieldChange('openingStock.purchasePrice', value)}
              error={errors.purchasePrice}
              errorMessage={errors.purchasePrice}
              leftIcon={() => <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-md">₹</span>}
              min={0}
              step={0.01}
              precision={2}
              helperText="Cost price per unit for opening stock"
              className="transition-all duration-200 group-hover:shadow-sm"
            />
          </div>
        </div>

        {/* Supplier Selection */}
        <div className="mb-6">
          <Select
            label="Supplier"
            placeholder={suppliersLoading ? "Loading suppliers..." : "Select supplier (optional)"}
            value={formData.openingStock?.supplier || ''}
            onChange={(value) => handleFieldChange('openingStock.supplier', value)}
            error={errors.supplier}
            errorMessage={errors.supplier}
            leftIcon={Truck}
            searchable={true}
            options={supplierOptions}
            disabled={suppliersLoading}
            helperText="Select the supplier for this opening stock (optional)"
          />
        </div>

        {/* Expiry Date */}
        <div className="mb-6">
          <Input
            label="Expiry Date"
            type="date"
            placeholder="Select expiry date (optional)"
            value={formData.openingStock?.expiryDate || ''}
            onChange={(value) => handleFieldChange('openingStock.expiryDate', value)}
            error={errors.expiryDate}
            errorMessage={errors.expiryDate}
            helperText="Optional: add for medical, food, and perishable items"
          />
        </div>

        {/* Opening Stock Summary */}
        {(formData.openingStock?.quantity || formData.openingStock?.purchasePrice) ? (
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
                  {formData.openingStock?.quantity || 0} {formData.uom || 'PCS'}
                </span>
              </div>
              
              {/* Purchase Price */}
              <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Purchase Price:</span>
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  ₹{parseFloat(formData.openingStock?.purchasePrice || 0).toFixed(2)}
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
        ):<></>}
      </div>
    </>
  );
};

export default OpeningQuantitySection;
