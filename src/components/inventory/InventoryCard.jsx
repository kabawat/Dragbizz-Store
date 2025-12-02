"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Dropdown } from '../ui';
import { MoreVertical, Edit, Copy, Trash2, Eye, Package, TrendingUp, TrendingDown, AlertTriangle, IndianRupee, Calendar, Building2, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '../../contexts/ThemeContext';
import { getStatusBadge as getCommonStatusBadge } from '@/utils/statusBadge';

const InventoryCard = ({
  inventory,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onStockIn,
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
  
  const getStatusBadge = (inventory) => {
    let status = 'INACTIVE';
    if (inventory.status?.isOutOfStock) {
      status = 'OUT_OF_STOCK';
    } else if (inventory.status?.isLowStock) {
      status = 'LOW_STOCK';
    } else if (inventory.status?.isActive) {
      status = 'ACTIVE';
    }
    
    const config = getCommonStatusBadge(status, 'general');
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };
  
  const getPaymentStatusBadge = (paymentStatus) => {
    const config = getCommonStatusBadge(paymentStatus, 'bill');
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };
  
  const getStockStatus = () => {
    const availableStock = inventory.stockSummary?.availableQuantity || 0;
    
    if (availableStock === 0) return { status: 'out', color: 'danger', text: 'Out of Stock' };
    if (availableStock <= 10) return { status: 'low', color: 'warning', text: 'Low Stock' };
    if (availableStock <= 50) return { status: 'medium', color: 'secondary', text: 'Medium Stock' };
    return { status: 'good', color: 'success', text: 'Good Stock' };
  };
  
  const stockStatus = getStockStatus();
  const profitMargin = inventory.pricingSummary?.profitMargin || 0;
  const totalValue = inventory.pricingSummary?.totalSellingValue || 0;
  
  const actionMenuItems = [
    {
      value: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => onViewDetails?.(inventory.id)
    },
    {
      value: 'stock-in',
      label: 'Add Stock',
      icon: TrendingUp,
      onClick: () => onStockIn?.(inventory.id),
      className: 'text-green-600 hover:text-green-700'
    },
    {
      value: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: () => onEdit?.(inventory.id)
    },
    {
      value: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: () => onDuplicate?.(inventory.id)
    },
    {
      value: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDelete?.(inventory.id)
    }
  ];
  
  const handleMenuToggle = (inventoryId) => {
    setOpenMenuId(openMenuId === inventoryId ? null : inventoryId);
  };
  
  const handleMenuAction = (inventoryId, action) => {
    setOpenMenuId(null);
    switch (action) {
      case 'view':
        onViewDetails?.(inventoryId);
        break;
      case 'stock-in':
        onStockIn?.(inventoryId);
        break;
      case 'edit':
        onEdit?.(inventoryId);
        break;
      case 'duplicate':
        onDuplicate?.(inventoryId);
        break;
      case 'delete':
        onDelete?.(inventoryId);
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
            onChange={(e) => onSelect(inventory.id, e.target.checked)}
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
          {inventory.product?.image && !imageError ? (
            <Image
              src={inventory.product.image}
              alt={inventory.product.name}
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
              onClick={() => handleMenuToggle(inventory.id)}
              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors duration-200 group/btn cursor-pointer shadow-sm"
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
            </button>
            
            {/* Popup Menu */}
            {openMenuId === inventory.id && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-[9999]">
                <button
                  onClick={() => handleMenuAction(inventory.id, 'view')}
                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                >
                  <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  View Details
                </button>
                <button
                  onClick={() => handleMenuAction(inventory.id, 'stock-in')}
                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-green-500/10"
                >
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Add Stock
                </button>
                <button
                  onClick={() => handleMenuAction(inventory.id, 'edit')}
                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                >
                  <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  Edit
                </button>
                <button
                  onClick={() => handleMenuAction(inventory.id, 'duplicate')}
                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                >
                  <Copy className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  Duplicate
                </button>
                <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                <button
                  onClick={() => handleMenuAction(inventory.id, 'delete')}
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
          {getStatusBadge(inventory)}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
        {/* Product Name */}
        <div>
          <h3 className="font-bold text-md sm:text-xl mb-1" style={{ color: themeConfig.text }}>
            {inventory.product?.name || 'Unknown Product'}
          </h3>
          <p className="text-xs sm:text-sm font-medium" style={{ color: themeConfig.textSecondary }}>
            {inventory.product?.brand || 'Unknown Brand'}
          </p>
        </div>
        
        {/* Category */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <span 
            className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white'
            }}
          >
            {inventory.product?.category || 'No Category'}
          </span>
        </div>
        
        {/* Stock Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            <span className="font-medium">Available:</span> {inventory.stockSummary?.availableQuantity || 0}
          </div>
          <div className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            <span className="font-medium">Total:</span> {inventory.stockSummary?.totalQuantity || 0}
          </div>
        </div>
        
        {/* Batches Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            <span className="font-medium">Batches:</span> {inventory.batchSummary?.totalBatches || 0}
          </div>
          <div className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
            <span className="font-medium">Active:</span> {inventory.batchSummary?.activeBatches || 0}
          </div>
        </div>
        
        {/* Pricing Section */}
        <div className="rounded-lg p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-1.5 md:space-y-2 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>Selling Price</span>
            <span className="text-sm sm:text-base md:text-lg font-bold" style={{ color: themeConfig.text }}>
              ₹{inventory.pricingSummary?.averageSellingPrice?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>Cost Price</span>
            <span className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>
              ₹{inventory.pricingSummary?.averagePurchasePrice?.toLocaleString() || '0'}
            </span>
          </div>
          {profitMargin > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-green-500 font-medium">Profit Margin</span>
              <span className="text-xs sm:text-sm text-green-500 font-medium">
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Payment Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>Payment Status:</span>
          {getPaymentStatusBadge(inventory.paymentSummary?.paymentStatus)}
        </div>
        
        {/* Total Value */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm" style={{ color: themeConfig.textSecondary }}>Total Value:</span>
          <span className="text-sm font-bold text-green-600">
            ₹{totalValue.toLocaleString()}
          </span>
        </div>
        
        {/* Last Updated */}
        <div 
          className="text-xs text-center pt-1.5 border-t" 
          style={{ 
            color: themeConfig.textSecondary,
            borderColor: themeConfig.border
          }}
        >
          Last updated: {inventory.lastUpdated ? new Date(inventory.lastUpdated).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;
