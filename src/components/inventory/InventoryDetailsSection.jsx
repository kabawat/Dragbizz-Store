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

      {/* Batch Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Warehouse className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Batch Information</h3>
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
              helperText="Enter the quantity for this batch"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Expiry Date
            </label>
            <Input
              type="date"
              value={formData.batchData?.expiryDate || ''}
              onChange={(value) => onChange('batchData.expiryDate', value)}
              helperText="Optional: For perishable items"
            />
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Pricing Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Discount (%)
            </label>
            <Input
              type="number"
              value={formData.batchData?.discount || ''}
              onChange={(value) => onChange('batchData.discount', value)}
              placeholder="Enter discount percentage"
              helperText="Discount percentage on MRP"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Payment Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Payment Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.batchData?.paymentStatus || 'UNPAID'}
              onChange={(value) => onChange('batchData.paymentStatus', value)}
              options={[
                { value: 'UNPAID', label: 'Unpaid' },
                { value: 'PARTIAL', label: 'Partially Paid' },
                { value: 'PAID', label: 'Fully Paid' },
                { value: 'OVERDUE', label: 'Overdue' }
              ]}
              placeholder="Select payment status"
              error={errors['batchData.paymentStatus']}
              helperText="Current payment status for this batch"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.batchData?.paymentMethod || 'CASH'}
              onChange={(value) => onChange('batchData.paymentMethod', value)}
              options={[
                { value: 'CASH', label: 'Cash' },
                { value: 'CHEQUE', label: 'Cheque' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                { value: 'UPI', label: 'UPI' },
                { value: 'CREDIT_CARD', label: 'Credit Card' },
                { value: 'DEBIT_CARD', label: 'Debit Card' },
                { value: 'ONLINE', label: 'Online Payment' }
              ]}
              placeholder="Select payment method"
              error={errors['batchData.paymentMethod']}
              helperText="Method of payment used"
            />
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Paid Amount
            </label>
            <Input
              type="number"
              value={formData.batchData?.paidAmount || ''}
              onChange={(value) => onChange('batchData.paidAmount', value)}
              placeholder="Enter paid amount"
              helperText="Amount already paid for this batch"
            />
          </div>

          {/* Supplier */}
          <div>
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

      {/* Summary Cards */}
      {(formData.batchData?.quantity || formData.batchData?.purchasePrice) && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Summary</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock Status */}
            {formData.batchData?.quantity && (
              <Card className="border-2 border-[rgb(var(--color-border-primary))]">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stockStatus.status === 'out' ? 'bg-red-100' :
                          stockStatus.status === 'low' ? 'bg-yellow-100' :
                            stockStatus.status === 'medium' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                        {stockStatus.status === 'out' ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : stockStatus.status === 'low' ? (
                          <TrendingDown className="w-5 h-5 text-yellow-600" />
                        ) : stockStatus.status === 'medium' ? (
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-[rgb(var(--color-text-primary))]">
                          Stock Status
                        </h3>
                        <Badge variant={stockStatus.color} className="mt-1">
                          {stockStatus.text}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">Total Value</p>
                      <p className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                        ₹{calculateTotalValue().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Pricing Summary */}
            {formData.batchData?.purchasePrice && (
              <Card className="border-2 border-[rgb(var(--color-border-primary))]">
                <CardBody className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <Calculator className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[rgb(var(--color-text-primary))]">
                          Cost Summary
                        </h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                          Total cost analysis
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Total Cost */}
                      <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <IndianRupee className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                            Total Cost
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-purple-600">
                          ₹{totalCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDetailsSection;
