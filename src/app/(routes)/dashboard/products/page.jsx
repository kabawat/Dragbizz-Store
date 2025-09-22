"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Grid3X3, List, Package, Eye, Edit, Copy, Trash2, MoreVertical, CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Smartphone, Laptop, Headphones, Footprints, Camera, Gamepad2, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground, SettingsPanel } from '@/components/ui';

// Import UI components
import { Button } from '@/components/ui';

// Import product components
import { ProductTable, ProductGrid } from '@/components/product';

const ProductsPage = () => {
  const router = useRouter();
  // State management
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    brand: '',
    priceRange: { min: '', max: '' }
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const scrollRef = useRef(null);

  // Mock data
  const mockProducts = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      brand: 'Apple',
      sku: 'IPH15PM-256-TIT',
      barcode: '1234567890123',
      sellingPrice: 134900,
      purchasePrice: 120000,
      mrp: 149900,
      gst: 18,
      stock: 25,
      status: 'ACTIVE',
      category: 'Electronics > Mobile Phones',
      lastUpdated: '2 days ago',
      image: '/api/placeholder/300/300'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      sku: 'SGS24U-512-BLK',
      barcode: '1234567890124',
      sellingPrice: 124999,
      purchasePrice: 110000,
      mrp: 139999,
      gst: 18,
      stock: 18,
      status: 'ACTIVE',
      category: 'Electronics > Mobile Phones',
      lastUpdated: '1 day ago',
      image: '/api/placeholder/300/300'
    },
    {
      id: '3',
      name: 'MacBook Pro 16-inch',
      brand: 'Apple',
      sku: 'MBP16-M3-1TB-SLV',
      barcode: '1234567890125',
      sellingPrice: 249900,
      purchasePrice: 220000,
      mrp: 269900,
      gst: 18,
      stock: 8,
      status: 'ACTIVE',
      category: 'Electronics > Laptops',
      lastUpdated: '3 days ago',
      image: '/api/placeholder/300/300'
    },
    {
      id: '4',
      name: 'Sony WH-1000XM5 Headphones',
      brand: 'Sony',
      sku: 'SONY-WH1000XM5-BLK',
      barcode: '1234567890126',
      sellingPrice: 29990,
      purchasePrice: 26000,
      mrp: 34990,
      gst: 18,
      stock: 0,
      status: 'OUT_OF_STOCK',
      category: 'Electronics > Audio',
      lastUpdated: '5 days ago',
      image: '/api/placeholder/300/300'
    },
    {
      id: '5',
      name: 'Nike Air Max 270',
      brand: 'Nike',
      sku: 'NIKE-AM270-10-BLK',
      barcode: '1234567890127',
      sellingPrice: 12995,
      purchasePrice: 11000,
      mrp: 14995,
      gst: 18,
      stock: 5,
      status: 'LOW_STOCK',
      category: 'Clothing > Shoes',
      lastUpdated: '1 week ago',
      image: '/api/placeholder/300/300'
    },
    {
      id: '6',
      name: 'Adidas Ultraboost 22',
      brand: 'Adidas',
      sku: 'ADIDAS-UB22-9-WHT',
      barcode: '12345678',
      sellingPrice: 18995,
      purchasePrice: 16000,
      mrp: 21995,
      gst: 18,
      stock: 12,
      status: 'ACTIVE',
      category: 'Clothing > Shoes',
      lastUpdated: '4 days ago',
      image: '/api/placeholder/300/300'
    },
    {
      id: '7',
      name: 'Dell XPS 13',
      brand: 'Dell',
      sku: 'DELL-XPS13-I7-512-SLV',
      barcode: '1234567890129',
      sellingPrice: 129990,
      purchasePrice: 115000,
      mrp: 149990,
      gst: 18,
      stock: 15,
      status: 'ACTIVE',
      category: 'Electronics > Laptops',
      lastUpdated: '2 days ago',
      image: '/api/placeholder/300/300'
    },
    {
      id: '8',
      name: 'Canon EOS R5 Camera',
      brand: 'Canon',
      sku: 'CANON-EOSR5-BDY-BLK',
      barcode: '1234567890130',
      sellingPrice: 289990,
      purchasePrice: 260000,
      mrp: 319990,
      gst: 18,
      stock: 3,
      status: 'LOW_STOCK',
      category: 'Electronics > Cameras',
      lastUpdated: '6 days ago',
      image: '/api/placeholder/300/300'
    }
  ];

  // Load saved view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('products-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('products-view-mode', mode);
  };


  // Initialize displayed products
  useEffect(() => {
    const initialProducts = mockProducts.slice(0, pageSize);
    setDisplayedProducts(initialProducts);
    setCurrentPage(1);
    setHasMore(true); // Always has more since we're repeating data
  }, []);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore) return;

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
  }, [isLoadingMore]);

  const handleStoreChange = (storeObject) => {
    // Now handleStoreChange receives complete store object instead of just name
    setSelectedStore(storeObject);
  };

  // Check if there are active filters
  const hasActiveFilters = searchValue || filters.status || filters.category || filters.brand || filters.priceRange.min || filters.priceRange.max;

  // Event handlers
  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      category: '',
      brand: '',
      priceRange: { min: '', max: '' }
    });
    setSearchValue('');
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
    setSelectedProducts(idsArray);
  };

  const handleCardSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Select all products
      const allProductIds = displayedProducts.map(product => product.id);
      setSelectedProducts(allProductIds);
    } else {
      // Deselect all products
      setSelectedProducts([]);
    }
  };

  const handleEditProduct = (productId) => {
    console.log('Edit product:', productId);
    // Add your edit logic here
  };

  const handleDeleteProduct = (productId) => {
    console.log('Delete product:', productId);
    // Add your delete logic here
  };

  const handleDuplicateProduct = (productId) => {
    console.log('Duplicate product:', productId);
    // Add your duplicate logic here
  };

  const handleViewProductDetails = (productId) => {
    console.log('View product details:', productId);
    // Add your view details logic here
  };

  // Infinite scroll logic - repeat same data
  const handleLoadMore = () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);

    // Simulate API call delay
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      // Cycle through the same products by using modulo
      const newProducts = [];
      for (let i = startIndex; i < endIndex; i++) {
        const productIndex = i % mockProducts.length;
        const product = mockProducts[productIndex];
        // Create unique ID for repeated products using timestamp and index
        newProducts.push({
          ...product,
          id: `${product.id}_page_${nextPage}_item_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }

      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    }, 1000); // 1 second delay to simulate API call
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
                    products={displayedProducts}
                    selectedProducts={selectedProducts}
                    onSelect={handleProductSelect}
                    onSelectAll={handleSelectAll}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onDuplicate={handleDuplicateProduct}
                    onViewDetails={handleViewProductDetails}
                    loading={false}
                    emptyMessage="No products found"
                    hasMore={true}
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
                  />
                </div>
              ) : (
                <div className="h-[calc(100vh-320px)] overflow-y-auto" ref={scrollRef}>
                  <ProductGrid
                    products={displayedProducts}
                    selectedProducts={selectedProducts}
                    onSelect={handleProductSelect}
                    onSelectAll={handleSelectAll}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onDuplicate={handleDuplicateProduct}
                    onViewDetails={handleViewProductDetails}
                    loading={false}
                    emptyMessage="No products found"
                    hasMore={true}
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
                  />
                </div>
              )}

              {/* Fixed Footer */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{displayedProducts.length}</span> products
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
    </div>
  );
};

export default ProductsPage;
