"use client"
import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit, Copy, Trash2, Eye, Package } from 'lucide-react';
import Image from 'next/image';

const ProductTable = ({
  products = [],
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onSelect,
  selectedProducts = [],
  onSelectAll,
  loading = false,
  emptyMessage = 'No products found',
  className = '',
  // Infinite scroll props
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  ...props
}) => {
  const [imageError, setImageError] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);
  
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { variant: 'success', text: 'Active', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
      INACTIVE: { variant: 'secondary', text: 'Inactive', color: 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] border-[rgb(var(--color-border-primary))]' },
      DRAFT: { variant: 'warning', text: 'Draft', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      OUT_OF_STOCK: { variant: 'danger', text: 'Out of Stock', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
      LOW_STOCK: { variant: 'warning', text: 'Low Stock', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, color: 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] border-[rgb(var(--color-border-primary))]' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };
  
  const getVisibilityBadge = (visibility) => {
    const visibilityConfig = {
      VISIBLE: { variant: 'success', text: 'Visible', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
      HIDDEN: { variant: 'secondary', text: 'Hidden', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
      PRIVATE: { variant: 'warning', text: 'Private', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      PUBLIC: { variant: 'success', text: 'Public', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' }
    };
    
    const config = visibilityConfig[visibility] || { variant: 'secondary', text: visibility, color: 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] border-[rgb(var(--color-border-primary))]' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };
  
  
  const calculateDiscount = (sellingPrice, mrp) => {
    if (!mrp || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };
  
  const actionMenuItems = (product) => [
    {
      value: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => onViewDetails?.(product.id)
    },
    {
      value: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: () => onEdit?.(product.id)
    },
    {
      value: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: () => onDuplicate?.(product.id)
    },
    {
      value: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDelete?.(product.id)
    }
  ];
  
  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectAll?.(products.map(p => p.id));
    } else {
      onSelectAll?.([]);
    }
  };
  
  const handleProductSelect = (productId, checked) => {
    if (checked) {
      onSelect?.([...selectedProducts, productId]);
    } else {
      onSelect?.(selectedProducts.filter(id => id !== productId));
    }
  };
  
  const handleMenuToggle = (productId) => {
    setOpenMenuId(openMenuId === productId ? null : productId);
  };
  
  const handleMenuAction = (productId, action) => {
    setOpenMenuId(null);
    switch (action) {
      case 'view':
        onViewDetails?.(productId);
        break;
      case 'edit':
        onEdit?.(productId);
        break;
      case 'duplicate':
        onDuplicate?.(productId);
        break;
      case 'delete':
        onDelete?.(productId);
        break;
      default:
        break;
    }
  };
  
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;
  
  if (loading) {
    return (
      <div className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm overflow-hidden ${className}`} {...props}>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-50 border-b border-gray-200"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-20 border-b border-gray-100">
              <div className="flex items-center h-full px-6">
                <div className="w-4 h-4 bg-gray-200 rounded mr-4"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded mr-4"></div>
                <div className="w-16 h-6 bg-gray-200 rounded mr-4"></div>
                <div className="w-20 h-6 bg-gray-200 rounded mr-4"></div>
                <div className="w-24 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${className}`} {...props}>
      <div className="relative">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 text-left">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                />
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  Product
                </span>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Visibility
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Categories
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              GST
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="divide-y divide-gray-100">
          {products.map((product, index) => {
            const isSelected = selectedProducts.includes(product.id);
            
            return (
              <tr
                key={product.id}
                className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${
                  isSelected ? 'bg-[rgb(var(--color-bg-tertiary))] border-l-4 border-l-[rgb(var(--color-primary))]' : ''
                } ${hoveredRow === index ? 'bg-[rgb(var(--color-bg-tertiary))]' : ''}`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Product Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleProductSelect(product.id, e.target.checked)}
                      className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                    />
                    
                    {/* Product Image */}
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                      {product.image && !imageError[product.id] ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-cover"
                          onError={() => setImageError(prev => ({ ...prev, [product.id]: true }))}
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 font-medium">
                        {product.brand}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[rgb(var(--color-text-secondary))]">SKU: {product.sku}</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Stock Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                      <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                      {product.stock}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">units</span>
                  </div>
                </td>
                
                {/* Status Column */}
                <td className="px-6 py-4">
                  {getStatusBadge(product.status)}
                </td>
                
                {/* Visibility Column */}
                <td className="px-6 py-4">
                  {getVisibilityBadge(product.visibility)}
                </td>
                
                {/* Categories Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {product.category.split(' > ')[0]}
                    </span>
                    {product.category.split(' > ')[1] && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        {product.category.split(' > ')[1]}
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Price Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                    ₹{product.sellingPrice.toLocaleString()}
                  </span>
                </td>
                
                {/* GST Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-start h-full">
                    {product.isGstApplicable ? (
                      <div className="flex flex-col items-start">
                        <div className="flex gap-2 mb-1">
                          <span className="text-sm font-bold text-[rgb(var(--color-primary))]">
                            {product.gst || product.gstRate || 18}%
                          </span>
                          <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            GST
                          </span>
                        </div>
                        <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                          {product.gstType === 'CGST_SGST' ? 'CGST+SGST' : product.gstType || 'CGST+SGST'}
                        </div>
                        {(product.hsnCode || product.hsn) && (
                          <div className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1">
                            HSN: {product.hsnCode || product.hsn}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm text-[rgb(var(--color-text-tertiary))]">
                          No GST
                        </span>
                        <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                          Not Applicable
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                
                {/* Actions Column */}
                <td className="px-6 py-4">
                  <div className="relative" ref={(el) => menuRefs.current[product.id] = el}>
                    <button 
                      onClick={() => handleMenuToggle(product.id)}
                      className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                      title="More Actions"
                    >
                      <svg className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    
                    {/* Popup Menu */}
                    {openMenuId === product.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                        <button
                          onClick={() => handleMenuAction(product.id, 'view')}
                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                        >
                          <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleMenuAction(product.id, 'edit')}
                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                        >
                          <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleMenuAction(product.id, 'duplicate')}
                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                        >
                          <Copy className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          Duplicate
                        </button>
                        <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                        <button
                          onClick={() => handleMenuAction(product.id, 'delete')}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      
      {/* Infinite Scroll Loading */}
      {isLoadingMore && (
        <div className="bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more products...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
