"use client"
import React, { useState, useEffect } from 'react';
import { Package, Warehouse, IndianRupee, TrendingUp, AlertTriangle, TrendingDown, Calculator } from 'lucide-react';
import { Input, Select, Card, CardBody, Badge } from '@/components/ui';
import { productService, supplierService } from '@/service/retailer';

const InventoryDetailsSection = ({ formData, onChange, errors }) => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products and suppliers on mount and when store changes
  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, [formData?.store]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const result = await productService.getProducts({ limit: 100, lightweight: true, store: formData?.store });
      if (result.success) {
        setProducts(result.data?.data || result.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const result = await supplierService.getSuppliers({ limit: 100, lightweight: true, store: formData?.store });
      if (result.success) {
        setSuppliers(result.data?.data || result.data || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleProductChange = (productId) => {
    onChange('productId', productId);
  };

  const handleSupplierChange = (supplierId) => {
    onChange('batchData.supplier', supplierId);
  };

  const productOptions = (products || []).map(p => ({
    value: p.id || p._id,
    label: p.name || p.title || (p.code ? `${p.code}` : 'Unknown')
  }));

  const supplierOptions = (suppliers || []).map(s => ({
    value: s.id || s._id,
    label: s.name || s.companyName || 'Unknown'
  }));

  // Calculations
  const calculateTotalValue = () => {
    const quantity = parseFloat(formData.batchData?.quantity || 0);
    const costPrice = parseFloat(formData.batchData?.purchasePrice || 0);
    return quantity * costPrice;
  };

  const calculateMargin = () => {
    // Margin calculation removed as sellingPrice is not part of API payload
    return 0;
  };

  const calculateProfit = () => {
    // Profit calculation removed as sellingPrice is not part of API payload
    return 0;
  };

  const calculateTotalCost = () => {
    const quantity = parseFloat(formData.batchData?.quantity || 0);
    const costPrice = parseFloat(formData.batchData?.purchasePrice || 0);

    return quantity * costPrice;
  };

  const getStockStatus = () => {
    const currentStock = parseFloat(formData.batchData?.quantity || 0);

    if (currentStock === 0) return { status: 'out', color: 'danger', text: 'Out of Stock' };
    if (currentStock <= 10) return { status: 'low', color: 'warning', text: 'Low Stock' };
    if (currentStock <= 50) return { status: 'medium', color: 'secondary', text: 'Medium Stock' };
    return { status: 'good', color: 'success', text: 'Good Stock' };
  };

  const stockStatus = getStockStatus();
  const margin = calculateMargin();
  const profit = calculateProfit();
  const totalCost = calculateTotalCost();

  return (
    <div className="space-y-8">
      {/* Product Selection */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-[rgb(var(--color-primary))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Product Selection</h3>
        </div>

        <div>
          <Select
            label={"Select Product"}
            required
            searchable
            clearable
            value={formData.productId || ''}
            onChange={handleProductChange}
            options={productOptions}
            placeholder={"Search and select product"}
            error={!!errors['productId']}
            errorMessage={errors['productId']}
            helperText={!errors['productId'] ? 'Type to search products' : undefined}
          />
        </div>
      </div>

      {/* Stock Information - Same as Product Table Stock In */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Warehouse className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Stock Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.batchData?.quantity || ''}
              onChange={(value) => onChange('batchData.quantity', value)}
              placeholder="Enter quantity"
              error={errors['batchData.quantity']}
              helperText="Enter the quantity to add"
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Purchase Price (per unit) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.batchData?.purchasePrice || ''}
              onChange={(value) => onChange('batchData.purchasePrice', value)}
              placeholder="Enter purchase price per unit"
              error={errors['batchData.purchasePrice']}
              helperText="Price paid to supplier per unit"
            />
          </div>

          {/* Supplier */}
          <div className="md:col-span-2">
            <Select
              label={"Supplier"}
              required
              searchable
              clearable
              value={formData.batchData?.supplier || ''}
              onChange={handleSupplierChange}
              options={supplierOptions}
              placeholder={"Search and select supplier"}
              error={!!errors['batchData.supplier']}
              errorMessage={errors['batchData.supplier']}
              helperText={!errors['batchData.supplier'] ? 'Type to search suppliers' : undefined}
            />
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {(formData.batchData?.quantity && formData.batchData?.purchasePrice) && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Summary</h3>
          </div>

          <Card className="border-2 border-[rgb(var(--color-border-primary))]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                      Stock Addition Summary
                    </h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {formData.batchData?.quantity} units × ₹{formData.batchData?.purchasePrice} per unit
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{calculateTotalValue().toLocaleString()}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InventoryDetailsSection;
