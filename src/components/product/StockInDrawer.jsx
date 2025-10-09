"use client"
import React, { useState, useEffect } from 'react';
import { X, Package, Plus, Minus } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/store/hooks';
import { stockService, supplierService } from '@/service/retailer';

const StockInDrawer = ({
  isOpen,
  onClose,
  product,
  onSuccess
}) => {
  const { themeConfig } = useTheme();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const [formData, setFormData] = useState({
    quantity: '',
    purchasePrice: '',
    supplier: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        quantity: '',
        purchasePrice: '',
        supplier: ''
      });
      setErrors({});
      fetchSuppliers();
    }
  }, [isOpen]);

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) return;

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
      console.error('Error fetching suppliers:', error);
    } finally {
      setSuppliersLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (!formData.supplier) {
      newErrors.supplier = 'Please select a supplier';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

      if (!storeId) {
        throw new Error('Store not selected');
      }

      const apiPayload = {
        productId: product.id,
        store: storeId,
        batchData: {
          quantity: parseInt(formData.quantity),
          purchasePrice: parseFloat(formData.purchasePrice),
          supplier: formData.supplier
        }
      };

      const response = await stockService.addStock(apiPayload);

      if (response.success) {
        onClose();
        onSuccess?.('Stock added successfully!');

      } else {
        throw new Error(response.message || 'Failed to add stock');
      }

    } catch (error) {
      console.error('Error adding stock:', error);
      alert(`Error adding stock: ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (type) => {
    const currentQuantity = parseInt(formData.quantity) || 0;
    const newQuantity = type === 'increment' ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);
    handleInputChange('quantity', newQuantity.toString());
  };

  const handleSupplierChange = (value) => {
    handleInputChange('supplier', value);
  };

  // Format suppliers for Select component
  const formattedSuppliers = suppliers.map(supplier => ({
    value: supplier._id,
    label: supplier.name
  }));

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[28rem] bg-[rgb(var(--color-bg-primary))] shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  Stock In
                </h2>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Add inventory for {product?.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Info */}
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[rgb(var(--color-text-primary))]">
                      {product?.name}
                    </h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      SKU: {product?.sku} | Current Stock: {product?.stock || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  Quantity *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange('decrement')}
                    className="p-2 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg border border-[rgb(var(--color-border-primary))] transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  </button>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(value) => handleInputChange('quantity', value)}
                    placeholder="Enter quantity"
                    className="flex-1"
                    error={errors.quantity}
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange('increment')}
                    className="p-2 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg border border-[rgb(var(--color-border-primary))] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  </button>
                </div>
                {errors.quantity && (
                  <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
                )}
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  Purchase Price (₹) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(value) => handleInputChange('purchasePrice', value)}
                  placeholder="Enter purchase price"
                  error={errors.purchasePrice}
                />
                {errors.purchasePrice && (
                  <p className="text-sm text-red-500 mt-1">{errors.purchasePrice}</p>
                )}
              </div>

              {/* Supplier */}
              <div>
                <Select
                  label="Supplier"
                  placeholder="Select supplier"
                  value={formData.supplier || ''}
                  onChange={handleSupplierChange}
                  error={errors.supplier}
                  errorMessage={errors.supplier}
                  searchable={true}
                  options={formattedSuppliers}
                  loading={suppliersLoading}
                  required
                />
              </div>

              {/* Summary */}
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))]">
                <h4 className="font-medium text-[rgb(var(--color-text-primary))] mb-3">
                  Stock In Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Quantity:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                      {formData.quantity || 0} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Purchase Price:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                      ₹{formData.purchasePrice || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Total Value:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                      ₹{((parseFloat(formData.quantity) || 0) * (parseFloat(formData.purchasePrice) || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">New Stock:</span>
                    <span className="text-green-500 font-medium">
                      {(product?.stock || 0) + (parseInt(formData.quantity) || 0)} units
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[rgb(var(--color-border-primary))]">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={handleSubmit}
                className="flex-1"
                loading={isLoading}
                leftIcon={Package}
              >
                Add Stock
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockInDrawer;
