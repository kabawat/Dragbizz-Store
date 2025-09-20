"use client"
import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { Checkbox } from '../ui';
import { Package } from 'lucide-react';

const ProductGrid = ({
  products = [],
  viewMode = 'grid',
  onViewModeChange,
  selectedProducts = [],
  onProductSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  loading = false,
  emptyMessage = 'No products found',
  className = '',
  ...props
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Calculate which cards should be highlighted based on hovered card
  const getCardHighlightClass = (index) => {
    if (hoveredCard === null) return 'border-gray-200 hover:border-gray-300';
    if (hoveredCard === index) return 'border-blue-400 shadow-xl ring-2 ring-blue-100';
    
    // Highlight adjacent cards (left, right, top, bottom) - only for grid view
    const cols = 4; // Assuming 4 columns for xl screens
    const row = Math.floor(index / cols);
    const col = index % cols;
    const hoveredRow = Math.floor(hoveredCard / cols);
    const hoveredCol = hoveredCard % cols;
    
    const isAdjacent = (
      (Math.abs(row - hoveredRow) <= 1 && Math.abs(col - hoveredCol) <= 1) ||
      (row === hoveredRow && Math.abs(col - hoveredCol) === 1) ||
      (col === hoveredCol && Math.abs(row - hoveredRow) === 1)
    );
    
    if (isAdjacent) {
      return 'border-blue-200 shadow-md opacity-90';
    }
    
    return 'border-gray-100 opacity-50';
  };
  
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      onSelectAll?.(products.map(p => p.id));
    } else {
      onSelectAll?.([]);
    }
  };
  
  const handleProductSelect = (productId, checked) => {
    if (checked) {
      onProductSelect?.([...selectedProducts, productId]);
    } else {
      onProductSelect?.(selectedProducts.filter(id => id !== productId));
    }
  };
  
  // Update select all state when individual selections change
  useMemo(() => {
    if (products.length === 0) {
      setSelectAll(false);
    } else if (selectedProducts.length === products.length) {
      setSelectAll(true);
    } else if (selectedProducts.length > 0) {
      setSelectAll(false);
    } else {
      setSelectAll(false);
    }
  }, [selectedProducts, products]);
  
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`} {...props}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`} {...props}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          {viewMode === 'grid' 
            ? 'Try adjusting your search or filter criteria to find products.'
            : 'No products match your current filters. Try changing your search criteria.'
          }
        </p>
      </div>
    );
  }
  
  return (
    <div className={className} {...props}>
      {/* Select All Checkbox (for list view) */}
      {viewMode === 'list' && products.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectAll}
              onChange={handleSelectAll}
              label={`Select all ${products.length} products`}
            />
            {selectedProducts.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedProducts.length} selected
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          onMouseLeave={() => setHoveredCard(null)}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="relative"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <ProductCard
                product={product}
                viewMode={viewMode}
                selected={selectedProducts.includes(product.id)}
                onSelect={handleProductSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onViewDetails={onViewDetails}
                className={`
                  ${getCardHighlightClass(index)}
                  transition-all duration-300 ease-out transform
                `}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRODUCT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAST CHECKED</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PERFORMANCE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORIES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRICE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <ProductCard
                    product={product}
                    viewMode={viewMode}
                    selected={selectedProducts.includes(product.id)}
                    onSelect={handleProductSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onViewDetails={onViewDetails}
                    className={`
                      ${hoveredCard === index ? 'bg-blue-50' : ''}
                      transition-all duration-300 ease-out
                    `}
                  />
                </div>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
