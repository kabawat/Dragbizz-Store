"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Grid3X3, List, Package, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getProducts,
  deleteProduct,
  setSelectedProducts,
  toggleProductSelection,
  selectAllProducts,
  deselectAllProducts,
  setViewMode,
  addMoreProducts
} from '@/store/slices/productsSlice';
import { transformProductsArray } from '@/utils/productUtils';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground, Input, SettingsPanel } from '@/components/ui';

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
    viewMode
  } = useAppSelector((state) => state.products);

  const { selectedStore } = useAppSelector((state) => state.profile);

  // Local state
  const [searchValue, setSearchValue] = useState('');
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

  // Fetch products on component mount and when search changes
  // Prevent double API call by using a ref to track last fetch params
  const lastFetchRef = useRef({ storeId: null, searchValue: null });

  useEffect(() => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    // Only fetch if selectedStore exists and has a valid ID
    if (!storeId) return;

    // Prevent duplicate fetch if params haven't changed
    if (
      lastFetchRef.current.storeId === storeId &&
      lastFetchRef.current.searchValue === searchValue
    ) {
      return;
    }

    lastFetchRef.current = { storeId, searchValue };

    const fetchProducts = async () => {
      const params = {
        store: storeId,
        search: searchValue,
        limit: 20,
        cursor: null 
      };
      // console.log("params : ",params)
      await dispatch(getProducts(params));
    };

    fetchProducts();
  }, [dispatch, selectedStore, searchValue]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore || !pagination.hasNextPage) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 100;

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

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
  };


  const handleAddProduct = () => {
    // Navigate to add product page
    router.push('/dashboard/products/add');
  };

  const handleEditProduct = (productId) => {
    // Navigate to edit product page
    router.push(`/dashboard/products/edit/${productId}`);
  };


  // ProductTable event handlers
  const handleProductSelect = (productIds) => {
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
        search: searchValue,
        limit: 20,
        cursor: pagination.nextCursor
      };

      const result = await dispatch(getProducts(params));

      if (result.payload?.success && result.payload?.data?.data) {
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
        <Header
          title="Products"
          description="Manage your store inventory and product catalog"
        />

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
            {
              transformedProducts.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center lg:flex-row gap-4 mb-4">
                    {/* Search */}
                    <div className="w-100 bg-red">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        leftIcon={Search}
                        className="w-100"
                        // size="sm"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {/* View Toggle */}
                      <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg ">
                        <button onClick={() => handleViewModeChange('table')} className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'table' ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'}`} >
                          <List className="w-4 h-4" />
                          Table
                        </button>
                        <button onClick={() => handleViewModeChange('card')} className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2  ${viewMode === 'card' ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'}`}>
                          <Grid3X3 className="w-4 h-4" />
                          Cards
                        </button>
                      </div>

                      <Button variant="primary" onClick={handleAddProduct} leftIcon={Plus} >
                        Add Product
                      </Button>
                    </div>
                  </div>
                </div>
              )
            }

            {
              !isLoading && transformedProducts.length === 0 && (
                <div className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]`}>
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      {"No products found"}
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                      No products match your current criteria. Try adjusting your search or filter settings.
                    </p>
                    <div className="pt-4">
                      <Button variant="primary" onClick={handleAddProduct} leftIcon={Plus} >
                        Add Product
                      </Button>
                    </div>
                  </div>
                </div>
              )
            }

            {
              transformedProducts.length > 0 && (
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                  <div className="h-[calc(100vh-260px)] overflow-y-auto" ref={scrollRef}>
                    {viewMode === 'table' ? (
                      <div className="overflow-x-auto h-full">
                        <ProductTable
                          products={transformedProducts}
                          selectedProducts={selectedProducts}
                          onSelect={handleProductSelect}
                          onSelectAll={handleSelectAll}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          loading={isLoading}
                          emptyMessage="No products found"
                          hasMore={pagination.hasNextPage}
                          onLoadMore={handleLoadMore}
                          isLoadingMore={isLoadingMore}
                        />
                      </div>

                    ) : (
                      <ProductGrid
                        products={transformedProducts}
                        selectedProducts={selectedProducts}
                        onSelect={handleProductSelect}
                        onSelectAll={handleSelectAll}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        loading={isLoading}
                        emptyMessage="No products found"
                        hasMore={pagination.hasNextPage}
                        onLoadMore={handleLoadMore}
                        isLoadingMore={isLoadingMore}
                      />
                    )}
                  </div>

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
              )
            }
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
