"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Grid3X3, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  getProducts, 
  deleteProduct,
  setSelectedProducts, 
  toggleProductSelection, 
  selectAllProducts, 
  deselectAllProducts,
  updateFilters,
  clearFilters,
  setViewMode,
  addMoreProducts
} from '@/store/slices/productsSlice';
import { transformProductsArray } from '@/utils/productUtils';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground, SettingsPanel } from '@/components/ui';

// Import UI components
import { Button } from '@/components/ui';

// Import product components
import { ProductTable, ProductGrid, ProductDeleteConfirmModal, ProductDeleteSuccessModal, ProductErrorModal } from '@/components/product';

const ProductsPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { 
    products, 
    selectedProducts, 
    isLoading, 
    error, 
    pagination, 
    filters, 
    viewMode 
  } = useAppSelector((state) => state.products);
  
  const { selectedStore } = useAppSelector((state) => state.profile);
  
  // Local state
  const [searchValue, setSearchValue] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedProductName, setDeletedProductName] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const scrollRef = useRef(null);

  // Transform products data for components
  const transformedProducts = transformProductsArray(products);
  
  // Handle error display
  useEffect(() => {
    if (error) {
      setErrorDetails({
        title: 'Error loading products',
        message: error,
        details: 'Please check your connection and try again'
      });
      setShowErrorModal(true);
    }
  }, [error]);
  
  useEffect(() => {
    const savedViewMode = localStorage.getItem('products-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  // Fetch products on component mount and when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      const params = {
        store: selectedStore?.storeId || selectedStore?._id || selectedStore?.id,
        ...filters,
        search: searchValue,
        limit: 20,
        cursor: null // Start from beginning
      };
      
      await dispatch(getProducts(params));
    };

    if (selectedStore) {
      fetchProducts();
    }
  }, [dispatch, selectedStore, filters, searchValue]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore || !pagination.hasNextPage) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 100; // Load more when 100px from bottom

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        handleLoadMore();
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [isLoadingMore, pagination.hasNextPage]);

  const handleStoreChange = (storeObject) => {
    // Store change is handled by Redux, no need for local state
  };

  // Check if there are active filters
  const hasActiveFilters = searchValue || filters.status || filters.category || filters.brand || filters.priceRange.min || filters.priceRange.max;

  // Event handlers
  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleFilterChange = (key, value) => {
    dispatch(updateFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    setSearchValue('');
    dispatch(clearFilters());
  };

  const handleAddProduct = () => {
    // Navigate to add product page
    router.push('/dashboard/products/add');
  };

  const handleExport = () => {
    console.log('Export products');
  };

  const handleImport = () => {
    console.log('Import products');
  };

  // ProductTable event handlers
  const handleProductSelect = (productIds) => {
    // Ensure productIds is always an array
    const idsArray = Array.isArray(productIds) ? productIds : [productIds];
    dispatch(setSelectedProducts(idsArray));
  };

  const handleCardSelect = (productId) => {
    dispatch(toggleProductSelection(productId));
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      dispatch(selectAllProducts());
    } else {
      dispatch(deselectAllProducts());
    }
  };

  const handleEditProduct = (productId) => {
    console.log('Edit product:', productId);
    // Add your edit logic here
  };

  const handleDeleteProduct = (productId) => {
    const product = transformedProducts.find(p => p.id === productId);
    setProductToDelete({ id: productId, name: product?.name || 'Product' });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
      const result = await dispatch(deleteProduct({ 
        productId: productToDelete.id, 
        storeId: storeId 
      }));
      
      if (result.payload?.success) {
        // Show success modal
        setDeletedProductName(productToDelete.name);
        setShowDeleteSuccessModal(true);
      }
      
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleDuplicateProduct = (productId) => {
    console.log('Duplicate product:', productId);
    // Add your duplicate logic here
  };

  const handleViewProductDetails = (productId) => {
    console.log('View product details:', productId);
    // Add your view details logic here
  };

  // Save view mode to localStorage
  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
    localStorage.setItem('products-view-mode', mode);
  };

  // Infinite scroll logic - load more products
  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasNextPage) return;

    setIsLoadingMore(true);

    try {
      const params = {
        store: selectedStore?.storeId || selectedStore?._id || selectedStore?.id,
        ...filters,
        search: searchValue,
        limit: 20,
        cursor: pagination.nextCursor
      };
      
      const result = await dispatch(getProducts(params));
      
      if (result.payload?.success && result.payload?.data?.data) {
        // Add new products to existing list
        dispatch(addMoreProducts(result.payload.data.data));
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <AnimatedBackground variant="default" />
      <Sidebar onStoreChange={handleStoreChange} />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header selectedStore={selectedStore} />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Loading State */}
            {isLoading && transformedProducts.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Products...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch your products
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Search and Filter Card */}
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6 mb-6 shadow-sm">
              {/* Top Row - Search and Action Buttons */}
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products by name, SKU, or barcode..."
                      value={searchValue}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] text-sm"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="relative"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {hasActiveFilters && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[rgb(var(--color-primary))] text-white text-xs rounded-full flex items-center justify-center">
                        1
                      </span>
                    )}
                  </Button>
                  {/* View Toggle */}
                  <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg ">
                    <button
                      onClick={() => handleViewModeChange('table')}
                      className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'table'
                          ? 'bg-[rgb(var(--color-primary))] text-white'
                          : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                        }`}
                    >
                      <List className="w-4 h-4" />
                      Table
                    </button>
                    <button
                      onClick={() => handleViewModeChange('card')}
                      className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'card'
                          ? 'bg-[rgb(var(--color-primary))] text-white'
                          : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                        }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Cards
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleAddProduct}
                    leftIcon={Plus}
                  >
                    Add Product
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleExport}
                    leftIcon={() => (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  >
                    Export
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleImport}
                    leftIcon={() => (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                  >
                    Import
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Display */}
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm overflow-hidden">
              {viewMode === 'table' ? (
                <div className="h-[calc(100vh-320px)] overflow-y-auto" ref={scrollRef}>
                  <ProductTable
                    products={transformedProducts}
                    selectedProducts={selectedProducts}
                    onSelect={handleProductSelect}
                    onSelectAll={handleSelectAll}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onDuplicate={handleDuplicateProduct}
                    onViewDetails={handleViewProductDetails}
                    loading={isLoading}
                    emptyMessage="No products found"
                    hasMore={pagination.hasNextPage}
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
                  />
                </div>
              ) : (
                <div className="h-[calc(100vh-320px)] overflow-y-auto" ref={scrollRef}>
                  <ProductGrid
                    products={transformedProducts}
                    selectedProducts={selectedProducts}
                    onSelect={handleProductSelect}
                    onSelectAll={handleSelectAll}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onDuplicate={handleDuplicateProduct}
                    onViewDetails={handleViewProductDetails}
                    loading={isLoading}
                    emptyMessage="No products found"
                    hasMore={pagination.hasNextPage}
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
                  />
                </div>
              )}

              {/* Fixed Footer */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{transformedProducts.length}</span> of <span className="font-semibold text-[rgb(var(--color-text-primary))]">{pagination.total}</span> products
                  </div>
                  <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {selectedProducts.length > 0 && (
                      <span className="font-semibold text-[rgb(var(--color-primary))]">
                        {selectedProducts.length} selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <SettingsPanel />

      {/* Delete Confirmation Modal */}
      <ProductDeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        isLoading={isDeleting}
      />

      {/* Delete Success Modal */}
      <ProductDeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        onClose={() => setShowDeleteSuccessModal(false)}
        productName={deletedProductName}
      />

      {/* Error Modal */}
      <ProductErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorDetails?.title}
        message={errorDetails?.message}
        details={errorDetails?.details}
      />
    </div>
  );
};

export default ProductsPage;
