"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Dropdown } from '../ui';
import { MoreHorizontal, Edit, Copy, Trash2, Eye, Package, Tag, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '../../contexts/ThemeContext';

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onSelect,
  selected = false,
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const { currentVariant, themeConfig } = useTheme();
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { variant: 'success', text: 'Active' },
      INACTIVE: { variant: 'secondary', text: 'Inactive' },
      DRAFT: { variant: 'warning', text: 'Draft' },
      OUT_OF_STOCK: { variant: 'danger', text: 'Out of Stock' },
      LOW_STOCK: { variant: 'warning', text: 'Low Stock' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };
  
  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <Badge variant="danger">Out of Stock</Badge>;
    } else if (stock < 10) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">{stock} in stock</Badge>;
    }
  };
  
  const calculateDiscount = (sellingPrice, mrp) => {
    if (!mrp || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };
  
  const discount = calculateDiscount(product.sellingPrice, product.mrp);
  
  const getCategoryBadgeStyle = (color) => {
    if (currentVariant === 'dark') {
      return {
        backgroundColor: `${color}20`,
        color: `${color}CC`,
        border: `1px solid ${color}50`
      };
    } else {
      return {
        backgroundColor: `${color}20`,
        color: `${color}CC`
      };
    }
  };
  
  const actionMenuItems = [
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
  
  // Grid view - Modern Card Design
  return (
    <div className={`w-full max-w-sm mx-auto rounded-xl border border-[rgb(var(--color-border-primary))] shadow-lg hover:shadow-xl transition-all duration-300 ease-out group overflow-hidden ${selected ? 'ring-2 ring-blue-500' : ''} ${className}`} {...props}>
      {/* Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(product.id, e.target.checked)}
            className="w-4 h-4 rounded focus:ring-blue-500"
            style={{
              color: themeConfig.primary,
              borderColor: themeConfig.border,
              backgroundColor: themeConfig.background
            }}
          />
        </div>
      )}
      
      {/* Product Image with Gradient Overlay */}
      <div 
        className="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br relative">
        <div className="w-full h-full overflow-hidden rounded-t-xl">
          {product.image && !imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: themeConfig.textSecondary }}>
              <Package className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" style={{ color: themeConfig.textSecondary }} />
            </div>
          )}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl"></div>
        
        {/* Action Menu */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => handleMenuToggle(product.id)}
              className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer backdrop-blur-sm bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))]"
              title="More Actions"
            >
              <svg className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {/* Popup Menu */}
            {openMenuId === product.id && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-[9999]">
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
        </div>
        
        {/* Status Badge */}
        <div className="absolute bottom-4 left-4">
          {product.status === 'ACTIVE' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
              Active
            </span>
          ) : product.status === 'LOW_STOCK' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white shadow-sm">
              Low Stock
            </span>
          ) : product.status === 'OUT_OF_STOCK' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm">
              Out of Stock
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white shadow-sm">
              {product.status}
            </span>
          )}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
        {/* Product Name */}
        <div>
          <h3 className="font-bold text-lg sm:text-xl mb-1" style={{ color: themeConfig.text }}>
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm font-medium" style={{ color: themeConfig.textSecondary }}>
            {product.brand}
          </p>
        </div>
        
        {/* Category Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <span 
            className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium"
            style={getCategoryBadgeStyle('#8b5cf6')}
          >
            {product.category.split(' > ')[0]}
          </span>
          {product.category.split(' > ')[1] && (
            <span 
              className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium"
              style={getCategoryBadgeStyle('#3b82f6')}
            >
              {product.category.split(' > ')[1]}
            </span>
          )}
        </div>
        
        {/* Stock Info */}
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            <span className="font-medium">Stock:</span> {product.stock} units
          </div>
          <div className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            <span className="font-medium">SKU:</span> {product.sku}
          </div>
        </div>
        
        {/* Pricing Section */}
        <div className="rounded-lg p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-1.5 md:space-y-2 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>Selling Price</span>
            <span className="text-sm sm:text-base md:text-lg font-bold" style={{ color: themeConfig.text }}>
              ₹{product.sellingPrice.toLocaleString()}
            </span>
          </div>
          {product.mrp > product.sellingPrice && (
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>MRP</span>
              <span className="text-xs sm:text-sm line-through" style={{ color: themeConfig.textSecondary }}>
                ₹{product.mrp.toLocaleString()}
              </span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-green-500 font-medium">Discount</span>
              <span className="text-xs sm:text-sm text-green-500 font-medium">
                {discount}% off
              </span>
            </div>
          )}
        </div>
        
        {/* Last Updated */}
        <div 
          className="text-xs text-center pt-1.5 border-t" 
          style={{ 
            color: themeConfig.textSecondary,
            borderColor: themeConfig.border
          }}
        >
          Last updated: {product.lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
