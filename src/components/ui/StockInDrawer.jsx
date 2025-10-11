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
  item, // Can be product or inventory
  onSuccess,
  type = 'product' // 'product' or 'inventory'
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

      // Determine product ID based on type
      const productId = type === 'product' 
        ? item?.id 
        : item?.product?.id;

      const apiPayload = {
        productId: productId,
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
    value: supplier.id || supplier._id,
    label: supplier.name || supplier.companyName || 'Unknown Supplier'
  }));

  // Get product information based on type
  const getProductInfo = () => {
    if (type === 'product') {
      return {
        name: item?.name || 'Unknown Product',
        brand: item?.brand || 'Unknown Brand',
        currentStock: item?.stock || 0
      };
    } else {
      return {
        name: item?.product?.name || 'Unknown Product',
        brand: item?.product?.brand || 'Unknown Brand',
        currentStock: item?.stockSummary?.totalQuantity || 0
      };
    }
  };

  const productInfo = getProductInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-[9999]">
      <div className="w-full max-w-md h-full bg-[rgb(var(--color-bg-primary))] shadow-2xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                Add Stock
              </h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {productInfo.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info */}
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4">
              <h3 className="font-medium text-[rgb(var(--color-text-primary))] mb-2">
                Product Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">Name:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {productInfo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">Brand:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {productInfo.brand}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">Current Stock:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    {productInfo.currentStock} units
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleQuantityChange('decrement')}
                  className="p-2 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                </button>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(value) => handleInputChange('quantity', value)}
                  placeholder="Enter quantity"
                  error={errors.quantity}
                  className="flex-1 text-center"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange('increment')}
                  className="p-2 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                </button>
              </div>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                Purchase Price (per unit) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(value) => handleInputChange('purchasePrice', value)}
                placeholder="Enter purchase price per unit"
                error={errors.purchasePrice}
                helperText="Price paid to supplier per unit"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                Supplier <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.supplier}
                onChange={handleSupplierChange}
                options={formattedSuppliers}
                placeholder="Select supplier"
                error={errors.supplier}
                loading={suppliersLoading}
                helperText="Choose the supplier for this stock"
              />
            </div>

            {/* Total Calculation */}
            {formData.quantity && formData.purchasePrice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">Total Value:</span>
                  <span className="text-lg font-bold text-green-800">
                    ₹{(parseInt(formData.quantity) * parseFloat(formData.purchasePrice)).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {formData.quantity} units × ₹{formData.purchasePrice} per unit
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Adding Stock...' : 'Add Stock'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInDrawer;
