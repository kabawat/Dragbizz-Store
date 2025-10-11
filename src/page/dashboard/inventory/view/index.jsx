"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, TrendingUp, TrendingDown, AlertTriangle, IndianRupee, Calendar, Building2, BarChart3 } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

// Import services
import inventoryService from '@/service/retailer/inventory.service';

const ViewInventoryPage = ({ inventoryId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || '';

  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch inventory details
  useEffect(() => {
    const fetchInventory = async () => {
      if (!inventoryId || !storeId) return;
      
      try {
        setLoading(true);
        const response = await inventoryService.getInventoryById(inventoryId, storeId);
        
        if (response.success) {
          setInventory(response.data?.inventory);
        } else {
          setError('Failed to fetch inventory details');
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('Error loading inventory details');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [inventoryId, storeId]);

  const handleEdit = () => {
    router.push(`/dashboard/stock/edit/${inventoryId}`);
  };

  const handleAddStock = () => {
    router.push(`/dashboard/stock/add?productId=${inventory?.product?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-primary))] via-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))]">
        <AnimatedBackground />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--color-primary))]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !inventory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-primary))] via-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))]">
        <AnimatedBackground />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto flex items-center justify-center">
              <div className="text-center">
                <Package className="w-16 h-16 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                  {error || 'Inventory not found'}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                  The inventory you're looking for doesn't exist or has been removed.
                </p>
                <Link href="/dashboard/stock">
                  <Button className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Stock
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-primary))] via-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))]">
      <AnimatedBackground />
      
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/stock">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] flex items-center gap-3">
                      <Package className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                      {inventory.product?.name || 'Inventory Details'}
                    </h1>
                    <p className="text-[rgb(var(--color-text-secondary))] mt-1">
                      {inventory.product?.brand} • {inventory.product?.category}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleAddStock}
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Add Stock
                  </Button>
                  <Button
                    onClick={handleEdit}
                    className="flex items-center gap-2"
                  >
                    Edit Stock
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">Available Stock</p>
                      <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                        {inventory.stockSummary?.availableQuantity || 0}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">Total Batches</p>
                      <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                        {inventory.batchSummary?.totalBatches || 0}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">Profit Margin</p>
                      <p className="text-2xl font-bold text-green-500">
                        {inventory.pricingSummary?.profitMargin?.toFixed(1) || 0}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">Total Value</p>
                      <p className="text-2xl font-bold text-purple-500">
                        ₹{inventory.pricingSummary?.totalSellingValue?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <IndianRupee className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Information */}
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                    Product Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Product Name:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        {inventory.product?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Brand:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        {inventory.product?.brand || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Category:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        {inventory.product?.category || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">SKU:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        {inventory.product?.sku || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                    Stock Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Total Quantity:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        {inventory.stockSummary?.totalQuantity || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Available:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        {inventory.stockSummary?.availableQuantity || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Reserved:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        {inventory.stockSummary?.reservedQuantity || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Sold:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        {inventory.stockSummary?.soldQuantity || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                    Pricing Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Avg Purchase Price:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        ₹{inventory.pricingSummary?.averagePurchasePrice?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Avg Selling Price:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        ₹{inventory.pricingSummary?.averageSellingPrice?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Total Purchase Value:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        ₹{inventory.pricingSummary?.totalPurchaseValue?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Total Profit:</span>
                      <span className="text-green-600 font-medium">
                        ₹{inventory.pricingSummary?.totalProfit?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Payment Status:</span>
                      <span className={`font-medium ${
                        inventory.paymentSummary?.paymentStatus === 'PAID' ? 'text-green-600' :
                        inventory.paymentSummary?.paymentStatus === 'UNPAID' ? 'text-red-600' :
                        inventory.paymentSummary?.paymentStatus === 'PARTIAL' ? 'text-yellow-600' :
                        'text-[rgb(var(--color-text-primary))]'
                      }`}>
                        {inventory.paymentSummary?.paymentStatus || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Total Paid:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        ₹{inventory.paymentSummary?.totalPaidAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Total Due:</span>
                      <span className="text-[rgb(var(--color-text-primary))] font-medium">
                        ₹{inventory.paymentSummary?.totalDueAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Batches Information */}
              {inventory.batches && inventory.batches.length > 0 && (
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                    Batch Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[rgb(var(--color-border-primary))]">
                          <th className="text-left py-2 text-[rgb(var(--color-text-secondary))]">Batch No</th>
                          <th className="text-left py-2 text-[rgb(var(--color-text-secondary))]">Quantity</th>
                          <th className="text-left py-2 text-[rgb(var(--color-text-secondary))]">Purchase Price</th>
                          <th className="text-left py-2 text-[rgb(var(--color-text-secondary))]">Supplier</th>
                          <th className="text-left py-2 text-[rgb(var(--color-text-secondary))]">Expiry Date</th>
                          <th className="text-left py-2 text-[rgb(var(--color-text-secondary))]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.batches.map((batch, index) => (
                          <tr key={batch.id || index} className="border-b border-[rgb(var(--color-border-primary))]">
                            <td className="py-2 text-[rgb(var(--color-text-primary))]">
                              {batch.batchNo || 'N/A'}
                            </td>
                            <td className="py-2 text-[rgb(var(--color-text-primary))]">
                              {batch.quantity || 0}
                            </td>
                            <td className="py-2 text-[rgb(var(--color-text-primary))]">
                              ₹{batch.purchasePrice?.toLocaleString() || '0'}
                            </td>
                            <td className="py-2 text-[rgb(var(--color-text-primary))]">
                              {batch.supplier?.name || 'N/A'}
                            </td>
                            <td className="py-2 text-[rgb(var(--color-text-primary))]">
                              {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                batch.isActive ? 'bg-green-100 text-green-800' :
                                batch.isExpired ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {batch.isExpired ? 'Expired' : batch.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInventoryPage;
