"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Edit, Copy, Trash2, CheckCircle, IndianRupee, Tag, Calendar, Eye, Star, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock, BarChart3, FileText, Hash, Barcode, Building2, MapPin, ShoppingCart, Package2, Scale, Percent, Globe, Shield, Zap } from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { productService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { getStatusBadge as getCommonStatusBadge } from '@/utils/statusBadge';

const ViewProductPage = ({ productId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedProductName, setDeletedProductName] = useState('');
  const hasFetched = useRef(false);

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const params = {
          store: storeId,
          id: productId
        };
        const result = await productService.getProducts(params);
        
        if (result.success && result.data) {
          setProductData(result.data);
        } else {
          setError(result.message || 'Failed to fetch product data');
        }
      } catch (error) {
        setError('Failed to fetch product data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchProductData();
  }, [productId, storeId]);

  // Handle edit product
  const handleEditProduct = () => {
    router.push(`/dashboard/products/edit/${productId}`);
  };

  // Handle delete product
  const handleDeleteProduct = () => {
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!productId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await productService.deleteProduct(productId, storeId);

      if (result.success) {
        setDeletedProductName(productData?.name || 'Product');
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        setError(result.message || 'Failed to delete product');
        setShowDeleteModal(false);
      }
    } catch (error) {
      setError('Failed to delete product. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    setShowDeleteSuccessModal(false);
    router.push('/dashboard/products');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = getCommonStatusBadge(status, 'general');
    // Map icons for products
    const iconMap = {
      'ACTIVE': CheckCircle2,
      'INACTIVE': XCircle,
      'DRAFT': Clock,
      'OUT_OF_STOCK': AlertTriangle,
      'LOW_STOCK': AlertTriangle
    };
    const IconComponent = iconMap[status] || Package;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  // Get visibility badge
  const getVisibilityBadge = (visibility) => {
    const visibilityConfig = {
      VISIBLE: { variant: 'success', text: 'Visible', icon: Eye },
      HIDDEN: { variant: 'secondary', text: 'Hidden', icon: XCircle },
      DRAFT: { variant: 'warning', text: 'Draft', icon: Clock }
    };
    
    const config = visibilityConfig[visibility] || { variant: 'secondary', text: visibility, icon: Eye };
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  // Loading state while fetching product data
  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="View Product"
            description="Product information and details"
          />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Product Data...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch the product information
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
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title="View Product"
          description="Product information and details"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/products" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Products</span>
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
                        Product Not Found
                      </h2>
                      <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                        The product you're looking for doesn't exist or has been removed. Please check the product ID and try again.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push('/dashboard/products')}
                          className="px-6 py-3"
                        >
                          Back to Products
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

            {/* Product Details - Only show when no error */}
            {!error && productData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ height: 'calc(100vh - 300px)' }}>
                {/* Left Side - Product Info */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <div className="overflow-y-auto pe-3 space-y-6" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
                    
                    {/* Basic Information Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Product Information</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Basic product details</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Product Name */}
                        <div className="relative p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-primary))]/10 dark:from-[rgb(var(--color-primary))]/5 dark:to-[rgb(var(--color-primary))]/3 rounded-lg overflow-hidden">
                          <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-[rgb(var(--color-primary))]/35 dark:!text-[rgb(var(--color-primary))] dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Product Name</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {productData.name || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Brand */}
                        <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                          <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Brand</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {productData.brand || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-lg overflow-hidden">
                          <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Category</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {productData.category?.name || productData.category || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* SKU */}
                        <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-lg overflow-hidden">
                          <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">SKU</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] font-mono">
                              {productData.sku || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Barcode */}
                        {productData.barcode && (
                          <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-lg overflow-hidden">
                            <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Barcode</p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] font-mono">
                                {productData.barcode || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* UOM */}
                        {productData.uom && (
                          <div className="relative p-4 bg-gradient-to-br from-teal-50/15 to-teal-100/10 dark:from-teal-900/5 dark:to-teal-800/3 rounded-lg overflow-hidden">
                            <Scale className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-teal-500/35 dark:!text-teal-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Unit of Measure</p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {productData.uom || 'N/A'}
                              </p>
                            </div>
                          </div>
                        )}
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
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Product pricing details</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Base Price */}
                        <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-lg overflow-hidden">
                          <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Base Price</p>
                            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                              {productData.basePrice && productData.basePrice !== '' ? `${productData.currency || '₹'}${productData.basePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* MRP */}
                        <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                          <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">MRP</p>
                            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                              {productData.mrp ? `${productData.currency || '₹'}${productData.mrp?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Selling Price */}
                        <div className="relative p-4 bg-gradient-to-br from-emerald-50/15 to-emerald-100/10 dark:from-emerald-900/5 dark:to-emerald-800/3 rounded-lg overflow-hidden">
                          <ShoppingCart className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500/35 dark:!text-emerald-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Selling Price</p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {productData.sellingPrice ? `${productData.currency || '₹'}${productData.sellingPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Discount */}
                        {productData.discount && productData.discount !== '' && (
                          <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-lg overflow-hidden">
                            <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Discount</p>
                              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                {productData.discount}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* GST Information Card */}
                    {productData.gstInfo && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">GST Information</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Tax and compliance details</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* GST Applicable */}
                          <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                            <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">GST Applicable</p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {productData.gstInfo.isGstApplicable ? 'Yes' : 'No'}
                              </p>
                            </div>
                          </div>

                          {/* GST Rate */}
                          {productData.gstInfo.isGstApplicable && productData.gstInfo.gstRate && (
                            <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-lg overflow-hidden">
                              <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">GST Rate</p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                  {productData.gstInfo.gstRate}%
                                </p>
                              </div>
                            </div>
                          )}

                          {/* GST Type */}
                          {productData.gstInfo.isGstApplicable && productData.gstInfo.gstType && (
                            <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-lg overflow-hidden">
                              <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">GST Type</p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                  {productData.gstInfo.gstType || 'N/A'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* HSN Code */}
                          {productData.gstInfo.isGstApplicable && productData.gstInfo.hsnCode && (
                            <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-lg overflow-hidden">
                              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">HSN Code</p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] font-mono">
                                  {productData.gstInfo.hsnCode || 'N/A'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Product Features Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Product Features</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Special product attributes</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Featured */}
                        <div className="relative p-4 bg-gradient-to-br from-yellow-50/15 to-yellow-100/10 dark:from-yellow-900/5 dark:to-yellow-800/3 rounded-lg overflow-hidden">
                          <Star className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-yellow-500/35 dark:!text-yellow-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Featured</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {productData.featured ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>

                        {/* Best Seller */}
                        <div className="relative p-4 bg-gradient-to-br from-emerald-50/15 to-emerald-100/10 dark:from-emerald-900/5 dark:to-emerald-800/3 rounded-lg overflow-hidden">
                          <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-emerald-500/35 dark:!text-emerald-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Best Seller</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {productData.bestSeller ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>

                        {/* New Arrival */}
                        <div className="relative p-4 bg-gradient-to-br from-pink-50/15 to-pink-100/10 dark:from-pink-900/5 dark:to-pink-800/3 rounded-lg overflow-hidden">
                          <Package2 className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-pink-500/35 dark:!text-pink-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">New Arrival</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {productData.newArrival ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Description Card */}
                    {productData.content && (productData.content.shortDescription || productData.content.longDescription) && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-orange-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Product Description</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Product content and details</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Short Description */}
                          {productData.content.shortDescription && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Short Description</label>
                              <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <p className="text-[rgb(var(--color-text-primary))] leading-relaxed">
                                  {productData.content.shortDescription}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Long Description */}
                          {productData.content.longDescription && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Long Description</label>
                              <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <p className="text-[rgb(var(--color-text-primary))] leading-relaxed">
                                  {productData.content.longDescription}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Information Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-500/20 to-gray-500/10 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Additional Information</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Product status and metadata</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status */}
                        <div>
                          <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Status</p>
                          {getStatusBadge(productData.status)}
                        </div>

                        {/* Visibility */}
                        <div>
                          <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Visibility</p>
                          {getVisibilityBadge(productData.visibility)}
                        </div>


                        {/* Created Date */}
                        {productData.createdAt && (
                          <div>
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Created Date</p>
                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                              {moment(productData.createdAt).format('DD MMM YYYY')}
                            </p>
                          </div>
                        )}

                        {/* Last Updated */}
                        {productData.updatedAt && (
                          <div>
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Last Updated</p>
                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                              {moment(productData.updatedAt).format('DD MMM YYYY')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

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
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Manage this product</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={handleEditProduct}
                        leftIcon={Edit}
                      >
                        Edit Product
                      </Button>

                      <Button
                        variant="danger"
                        className="flex-1"
                        onClick={handleDeleteProduct}
                        leftIcon={Trash2}
                      >
                        Delete Product
                      </Button>
                    </div>

                    {/* Product Stats */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Quick Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Stock:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {productData.stock || 0} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Total Sales:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Revenue:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">₹0</span>
                        </div>
                        {productData.updatedAt && (
                          <div className="flex justify-between">
                            <span className="text-[rgb(var(--color-text-secondary))]">Last Updated:</span>
                            <span className="font-medium text-[rgb(var(--color-text-primary))]">
                              {moment(productData.updatedAt).format('MMM DD, YYYY')}
                            </span>
                          </div>
                        )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              Delete Product
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Are you sure you want to delete "{productData?.name || 'Product'}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleCancelDelete} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} loading={isDeleting}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Product Deleted Successfully!
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                "{deletedProductName}" has been removed from your product list.
              </p>
              <Button variant="primary" onClick={handleDeleteSuccess}>
                Back to Products
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProductPage;
