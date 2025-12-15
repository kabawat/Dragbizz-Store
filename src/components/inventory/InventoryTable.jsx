"use client"
import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, Copy, Trash2, Eye, Package, TrendingUp, TrendingDown, AlertTriangle, IndianRupee, Calendar, Building2 } from 'lucide-react';
import Image from 'next/image';
import { getStatusBadge as getCommonStatusBadge, renderStatusBadge } from '@/utils/statusBadge';

const InventoryTable = ({
  inventories = [],
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onStockIn,
  loading = false,
  emptyMessage = 'No inventory found',
  className = '',
  // Infinite scroll props
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
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
  
  const getInventoryStatusBadge = (inventory) => {
    let status = 'INACTIVE';
    if (inventory.status?.isOutOfStock) {
      status = 'OUT_OF_STOCK';
    } else if (inventory.status?.isLowStock) {
      status = 'LOW_STOCK';
    } else if (inventory.status?.isActive) {
      status = 'ACTIVE';
    }

    return renderStatusBadge(status, 'general');
  };
  
  const getPaymentStatusBadge = (paymentStatus) => {
    if (!paymentStatus) return null;
    return renderStatusBadge(paymentStatus, 'bill');
  };
  
  const actionMenuItems = (inventory) => [
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
  
  if (loading) {
    return (
      <div className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm overflow-hidden ${className}`} {...props}>
        <div className="animate-pulse">
          <div className="h-16 bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-20 border-b border-[rgb(var(--color-border-primary))]">
              <div className="flex items-center h-full px-6">
                <div className="w-4 h-4 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg mr-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/4"></div>
                  <div className="h-3 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/6"></div>
                </div>
                <div className="w-20 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-16 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-20 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-24 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${className}`}>
      <div className="relative">
        <table className="w-full min-w-[1200px]">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Batches
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Pricing
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-4 w-24 text-center text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
            {inventories.map((inventory, index) => {
              return (
                <tr
                  key={inventory.id}
                  className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${
                    hoveredRow === index ? 'bg-[rgb(var(--color-bg-tertiary))]' : ''
                  }`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Product Column */}
                  <td className="px-6 py-4 relative">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-[rgb(var(--color-border-primary))]">
                        {inventory.product?.image && !imageError[inventory.id] ? (
                          <Image
                            src={inventory.product.image}
                            alt={inventory.product.name}
                            width={48}
                            height={48}
                            className="object-cover"
                            onError={() => setImageError(prev => ({ ...prev, [inventory.id]: true }))}
                          />
                        ) : (
                          <Package className="w-6 h-6 text-[rgb(var(--color-text-tertiary))]" />
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[rgb(var(--color-text-primary))] text-sm truncate">
                          {inventory.product?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] font-medium">
                          {inventory.product?.brand || 'Unknown Brand'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            {inventory.product?.category || 'No Category'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Stock Column */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                          {inventory.stockSummary?.availableQuantity || 0}
                        </span>
                        <span className="text-xs text-[rgb(var(--color-text-tertiary))] ml-1">available</span>
                      </div>
                      <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                        Total: {inventory.stockSummary?.totalQuantity || 0}
                      </div>
                    </div>
                  </td>
                  
                  {/* Status Column */}
                  <td className="px-6 py-4">
                    {getInventoryStatusBadge(inventory)}
                  </td>
                  
                  {/* Batches Column */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                        {inventory.batchSummary?.totalBatches || 0} batches
                      </div>
                      <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {inventory.batchSummary?.activeBatches || 0} active
                      </div>
                    </div>
                  </td>
                  
                  {/* Pricing Column */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                        ₹{inventory.pricingSummary?.averageSellingPrice?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                        Cost: ₹{inventory.pricingSummary?.averagePurchasePrice?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </td>
                  
                  {/* Payment Column */}
                  <td className="px-6 py-4">
                    {getPaymentStatusBadge(inventory.paymentSummary?.paymentStatus)}
                  </td>
                  
                  {/* Actions Column */}
                  <td className="px-4 py-4 w-24 text-start">
                    <div className="relative" ref={(el) => menuRefs.current[inventory.id] = el}>
                      <button
                        onClick={() => handleMenuToggle(inventory.id)}
                        className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                        title="More Actions"
                      >
                        <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                      </button>
                      
                      {/* Popup Menu */}
                      {openMenuId === inventory.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                          <button
                            onClick={() => handleMenuAction(inventory.id, 'view')}
                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                          >
                            <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleMenuAction(inventory.id, 'stock-in')}
                            className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-500/10 dark:hover:bg-green-500/20 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-green-500/10 dark:focus:bg-green-500/20"
                          >
                            <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
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
                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10 dark:focus:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
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
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more inventory...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
