"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, TrendingUp, Edit, Trash2, Hash, Building2, Tag, IndianRupee, BarChart3, Wallet, CheckCircle, AlertCircle, Calendar, ShoppingCart, Percent, FileText } from 'lucide-react';
import moment from 'moment';

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
      <div className="flex w-full h-screen relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header title="View Stock" description="Stock information and details" />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Stock Data...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch the stock information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title="View Stock"
          description="Stock information and details"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/stock" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Stock</span>
              </Link>
            </div>

            {/* Error State - Full Page */}
            {error && (
              <div className="w-full">
                <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-red-600" />
                      </div>
                      <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                        Stock Not Found
                      </h2>
                      <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                        The stock you're looking for doesn't exist or has been removed. Please check the stock ID and try again.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push('/dashboard/stock')}
                          className="px-6 py-3"
                        >
                          Back to Stock
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => window.location.reload()}
                          className="px-6 py-3"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Details - Only show when no error */}
            {!error && inventory && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ height: 'calc(100vh - 300px)' }}>
                {/* Left Side - Stock Info */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <div className="overflow-y-auto pe-3 space-y-6" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Available Stock */}
                      <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                        <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                        <div className="relative z-10">
                          <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Available Stock</p>
                          <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                            {inventory.stockSummary?.availableQuantity || 0}
                          </p>
                        </div>
                      </div>

                      {/* Total Batches */}
                      <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-lg overflow-hidden">
                        <BarChart3 className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                        <div className="relative z-10">
                          <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Batches</p>
                          <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                            {inventory.batchSummary?.totalBatches || 0}
                          </p>
                        </div>
                      </div>

                      {/* Profit Margin */}
                      <div className="relative p-4 bg-gradient-to-br from-emerald-50/15 to-emerald-100/10 dark:from-emerald-900/5 dark:to-emerald-800/3 rounded-lg overflow-hidden">
                        <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500/35 dark:!text-emerald-400 dark:opacity-40" />
                        <div className="relative z-10">
                          <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Profit Margin</p>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {inventory.pricingSummary?.profitMargin?.toFixed(1) || 0}%
                          </p>
                        </div>
                      </div>

                      {/* Total Value */}
                      <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-lg overflow-hidden">
                        <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                        <div className="relative z-10">
                          <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Value</p>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            ₹{inventory.pricingSummary?.totalSellingValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Product Information Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Product Information</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Basic product details</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Product Name */}
                        <div className="relative p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-primary))]/10 dark:from-[rgb(var(--color-primary))]/5 dark:to-[rgb(var(--color-primary))]/3 rounded-lg overflow-hidden">
                          <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-[rgb(var(--color-primary))]/35 dark:!text-[rgb(var(--color-primary))] dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Product Name</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {inventory.product?.name || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Brand */}
                        <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                          <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Brand</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {inventory.product?.brand || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-lg overflow-hidden">
                          <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Category</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {inventory.product?.category || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* SKU */}
                        {inventory.product?.sku && (
                          <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-lg overflow-hidden">
                            <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">SKU</p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] font-mono">
                                {inventory.product.sku || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock Information Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Stock Information</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Stock quantity details</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Quantity */}
                        <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                          <BarChart3 className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Quantity</p>
                            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                              {inventory.stockSummary?.totalQuantity || 0}
                            </p>
                          </div>
                        </div>

                        {/* Available */}
                        <div className="relative p-4 bg-gradient-to-br from-emerald-50/15 to-emerald-100/10 dark:from-emerald-900/5 dark:to-emerald-800/3 rounded-lg overflow-hidden">
                          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500/35 dark:!text-emerald-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Available</p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {inventory.stockSummary?.availableQuantity || 0}
                            </p>
                          </div>
                        </div>

                        {/* Reserved */}
                        <div className="relative p-4 bg-gradient-to-br from-yellow-50/15 to-yellow-100/10 dark:from-yellow-900/5 dark:to-yellow-800/3 rounded-lg overflow-hidden">
                          <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-yellow-500/35 dark:!text-yellow-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Reserved</p>
                            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                              {inventory.stockSummary?.reservedQuantity || 0}
                            </p>
                          </div>
                        </div>

                        {/* Sold */}
                        <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-lg overflow-hidden">
                          <ShoppingCart className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Sold</p>
                            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                              {inventory.stockSummary?.soldQuantity || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Information Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                          <IndianRupee className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Pricing Information</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Pricing and profit details</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Avg Purchase Price */}
                        <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                          <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Avg Purchase Price</p>
                            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                              ₹{inventory.pricingSummary?.averagePurchasePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                            </p>
                          </div>
                        </div>

                        {/* Avg Selling Price */}
                        <div className="relative p-4 bg-gradient-to-br from-emerald-50/15 to-emerald-100/10 dark:from-emerald-900/5 dark:to-emerald-800/3 rounded-lg overflow-hidden">
                          <ShoppingCart className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500/35 dark:!text-emerald-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Avg Selling Price</p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{inventory.pricingSummary?.averageSellingPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                            </p>
                          </div>
                        </div>

                        {/* Total Purchase Value */}
                        <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-lg overflow-hidden">
                          <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Purchase Value</p>
                            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                              ₹{inventory.pricingSummary?.totalPurchaseValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                            </p>
                          </div>
                        </div>

                        {/* Total Profit */}
                        <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-lg overflow-hidden">
                          <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Profit</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              ₹{inventory.pricingSummary?.totalProfit?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information Card */}
                    {inventory.paymentSummary && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-purple-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Payment Information</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Payment status and details</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Payment Status */}
                          <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                              <div className={`w-6 h-6 rounded-full ${
                                inventory.paymentSummary?.paymentStatus === 'PAID' ? 'bg-green-500/35 dark:!bg-green-400 dark:opacity-40' :
                                inventory.paymentSummary?.paymentStatus === 'UNPAID' ? 'bg-red-500/35 dark:!bg-red-400 dark:opacity-40' :
                                inventory.paymentSummary?.paymentStatus === 'PARTIAL' ? 'bg-yellow-500/35 dark:!bg-yellow-400 dark:opacity-40' :
                                'bg-gray-500/35 dark:!bg-gray-400 dark:opacity-40'
                              }`}></div>
                            </div>
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Payment Status</p>
                              <p className={`text-base font-semibold ${
                                inventory.paymentSummary?.paymentStatus === 'PAID' ? 'text-green-600 dark:text-green-400' :
                                inventory.paymentSummary?.paymentStatus === 'UNPAID' ? 'text-red-600 dark:text-red-400' :
                                inventory.paymentSummary?.paymentStatus === 'PARTIAL' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-[rgb(var(--color-text-primary))]'
                              }`}>
                                {inventory.paymentSummary?.paymentStatus || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Total Paid */}
                          <div className="relative p-4 bg-gradient-to-br from-emerald-50/15 to-emerald-100/10 dark:from-emerald-900/5 dark:to-emerald-800/3 rounded-lg overflow-hidden">
                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500/35 dark:!text-emerald-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Paid</p>
                              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                ₹{inventory.paymentSummary?.totalPaidAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                              </p>
                            </div>
                          </div>

                          {/* Total Due */}
                          <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-lg overflow-hidden">
                            <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Due</p>
                              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                ₹{inventory.paymentSummary?.totalDueAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Batches Information */}
                    {inventory.batches && inventory.batches.length > 0 && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-indigo-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Batch Details</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Stock batch information</p>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[rgb(var(--color-border-primary))]">
                                <th className="text-left py-2 text-[rgb(var(--color-text-secondary))] text-sm font-medium">Batch No</th>
                                <th className="text-left py-2 text-[rgb(var(--color-text-secondary))] text-sm font-medium">Quantity</th>
                                <th className="text-left py-2 text-[rgb(var(--color-text-secondary))] text-sm font-medium">Purchase Price</th>
                                <th className="text-left py-2 text-[rgb(var(--color-text-secondary))] text-sm font-medium">Supplier</th>
                                <th className="text-left py-2 text-[rgb(var(--color-text-secondary))] text-sm font-medium">Expiry Date</th>
                                <th className="text-left py-2 text-[rgb(var(--color-text-secondary))] text-sm font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventory.batches.map((batch, index) => (
                                <tr key={batch.id || index} className="border-b border-[rgb(var(--color-border-primary))]">
                                  <td className="py-3 text-[rgb(var(--color-text-primary))]">
                                    {batch.batchNo || 'N/A'}
                                  </td>
                                  <td className="py-3 text-[rgb(var(--color-text-primary))]">
                                    {batch.quantity || 0}
                                  </td>
                                  <td className="py-3 text-[rgb(var(--color-text-primary))]">
                                    ₹{batch.purchasePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                                  </td>
                                  <td className="py-3 text-[rgb(var(--color-text-primary))]">
                                    {batch.supplier?.name || 'N/A'}
                                  </td>
                                  <td className="py-3 text-[rgb(var(--color-text-primary))]">
                                    {batch.expiryDate ? moment(batch.expiryDate).format('DD MMM YYYY') : 'N/A'}
                                  </td>
                                  <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      batch.isActive ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                                      batch.isExpired ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                                      'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20'
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

                {/* Right Side - Quick Actions */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Quick Actions</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Manage this stock</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={handleEdit}
                        leftIcon={Edit}
                      >
                        Edit Stock
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleAddStock}
                        leftIcon={TrendingUp}
                      >
                        Add Stock
                      </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Quick Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Available:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {inventory.stockSummary?.availableQuantity || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Total Batches:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {inventory.batchSummary?.totalBatches || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Profit Margin:</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {inventory.pricingSummary?.profitMargin?.toFixed(1) || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Total Value:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            ₹{inventory.pricingSummary?.totalSellingValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInventoryPage;
