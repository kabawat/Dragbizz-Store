"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Edit, Copy, Trash2, CheckCircle, IndianRupee, Tag, Calendar, Eye, Star, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock, BarChart3, FileText, Hash, Barcode, Building2, MapPin, ShoppingCart, Package2, Scale, Percent, Globe, Shield, Zap } from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground, Badge } from '@/components/ui';
import { productService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

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
          console.log('Product data:', result.data);
          setProductData(result.data);
        } else {
          setError(result.message || 'Failed to fetch product data');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
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
      console.error('Error deleting product:', error);
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
    const statusConfig = {
      ACTIVE: { variant: 'success', text: 'Active', icon: CheckCircle2 },
      INACTIVE: { variant: 'secondary', text: 'Inactive', icon: XCircle },
      DRAFT: { variant: 'warning', text: 'Draft', icon: Clock },
      OUT_OF_STOCK: { variant: 'danger', text: 'Out of Stock', icon: AlertTriangle },
      LOW_STOCK: { variant: 'warning', text: 'Low Stock', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: Package };
    const IconComponent = config.icon;
    
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
        <AnimatedBackground variant="default" />
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
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
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
      <AnimatedBackground variant="default" />
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
                      <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-3">
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
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">Product Information</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Basic product details</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(productData.status)}
                          {getVisibilityBadge(productData.visibility)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Product Name</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Package className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.name || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Brand */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Brand</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Building2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.brand || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Category</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Tag className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.category?.name || productData.category || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* SKU */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">SKU</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Hash className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.sku || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Barcode */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Barcode</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Barcode className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.barcode || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* UOM */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Unit of Measure</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Scale className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.uom || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Information Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                          <IndianRupee className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">Pricing Information</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Product pricing details</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Base Price */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Base Price</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <IndianRupee className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.basePrice && productData.basePrice !== '' ? `${productData.currency || '₹'}${productData.basePrice}` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* MRP */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">MRP</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Tag className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.mrp ? `${productData.currency || '₹'}${productData.mrp}` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Selling Price */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Selling Price</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <ShoppingCart className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.sellingPrice ? `${productData.currency || '₹'}${productData.sellingPrice}` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Discount */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Discount</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Percent className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.discount && productData.discount !== '' ? `${productData.discount}%` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* GST Information Card */}
                    {productData.gstInfo && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">GST Information</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Tax and compliance details</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* GST Applicable */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">GST Applicable</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <Shield className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                {productData.gstInfo.isGstApplicable ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>

                          {/* GST Rate */}
                          {productData.gstInfo.isGstApplicable && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">GST Rate</label>
                              <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <Percent className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                  {productData.gstInfo.gstRate ? `${productData.gstInfo.gstRate}%` : 'N/A'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* GST Type */}
                          {productData.gstInfo.isGstApplicable && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">GST Type</label>
                              <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <FileText className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                  {productData.gstInfo.gstType || 'N/A'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* HSN Code */}
                          {productData.gstInfo.isGstApplicable && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">HSN Code</label>
                              <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <Hash className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                  {productData.gstInfo.hsnCode || 'N/A'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Product Features Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">Product Features</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Special product attributes</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Featured */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Featured</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Star className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.featured ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>

                        {/* Best Seller */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Best Seller</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <TrendingUp className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.bestSeller ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>

                        {/* New Arrival */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">New Arrival</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Package2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {productData.newArrival ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Description Card */}
                    {productData.content && (productData.content.shortDescription || productData.content.longDescription) && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-orange-500" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">Product Description</h2>
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

                  </div>
                </div>

                {/* Right Side - Quick Actions */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 sticky top-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Quick Actions</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Manage this product</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleEditProduct}
                        leftIcon={Edit}
                      >
                        Edit Product
                      </Button>

                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={handleDeleteProduct}
                        leftIcon={Trash2}
                      >
                        Delete Product
                      </Button>
                    </div>

                    {/* Product Stats */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Product Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Stock:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {productData.stock || 'N/A'} units
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
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Last Updated:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {productData.updatedAt ? moment(productData.updatedAt).format('MMM DD, YYYY') : 'Never'}
                          </span>
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
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
