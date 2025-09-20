"use client"
import React, { useState } from 'react';
import { Card, Badge, Button, Dropdown } from '../ui';
import { MoreHorizontal, Edit, Copy, Trash2, Eye, Package, Tag, Calendar } from 'lucide-react';
import Image from 'next/image';

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onSelect,
  selected = false,
  viewMode = 'grid',
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  
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
  
  if (viewMode === 'list') {
    return (
      <tr className={`bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${selected ? 'bg-blue-50' : ''} ${className}`} {...props}>
        {/* Checkbox */}
        <td className="px-4 py-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(product.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          )}
        </td>
        
        {/* Product Image & Info */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {product.image && !imageError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {product.name}
              </h3>
              <p className="text-xs text-gray-600">
                {product.brand}
              </p>
            </div>
          </div>
        </td>
        
        {/* Last Updated */}
        <td className="px-4 py-3">
          <span className="text-sm text-gray-900 font-medium">{product.lastUpdated}</span>
        </td>
        
        {/* Performance */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (product.stock / 25) * 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {Math.min(100, Math.round((product.stock / 25) * 100))}%
            </span>
          </div>
        </td>
        
        {/* Categories */}
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {product.category.split(' > ')[0]}
            </span>
            {product.category.split(' > ')[1] && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {product.category.split(' > ')[1]}
              </span>
            )}
            {product.stock > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Stock
              </span>
            )}
          </div>
        </td>
        
        {/* Price */}
        <td className="px-4 py-3 text-right">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-900">
              ₹{product.sellingPrice.toLocaleString()}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs text-gray-500 line-through">
                ₹{product.mrp.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs text-green-600 font-medium">
                {discount}% off
              </span>
            )}
          </div>
        </td>
        
        {/* Actions */}
        <td className="px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <Dropdown
              options={actionMenuItems}
              value=""
              onChange={(action) => {
                const item = actionMenuItems.find(item => item.value === action);
                item?.onClick();
              }}
              trigger={
                <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              }
            />
          </div>
        </td>
      </tr>
    );
  }
  
  // Grid view - Modern Card Design
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 ease-out group overflow-hidden ${selected ? 'ring-2 ring-blue-500' : ''} ${className}`} {...props}>
      {/* Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(product.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      )}
      
      {/* Product Image with Gradient Overlay */}
      <div className="w-full h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
        {product.image && !imageError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package className="w-20 h-20 text-orange-500" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Action Menu */}
        <div className="absolute top-4 right-4">
          <Dropdown
            options={actionMenuItems}
            value=""
            onChange={(action) => {
              const item = actionMenuItems.find(item => item.value === action);
              item?.onClick();
            }}
            trigger={
              <button className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 backdrop-blur-sm">
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </button>
            }
          />
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
      <div className="p-6 space-y-4">
        {/* Product Name */}
        <div>
          <h3 className="font-bold text-gray-900 text-xl mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            {product.brand}
          </p>
        </div>
        
        {/* Category Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {product.category.split(' > ')[0]}
          </span>
          {product.category.split(' > ')[1] && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {product.category.split(' > ')[1]}
            </span>
          )}
        </div>
        
        {/* Stock Info */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Stock:</span> {product.stock} units
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">SKU:</span> {product.sku}
          </div>
        </div>
        
        {/* Pricing Section */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Selling Price</span>
            <span className="text-lg font-bold text-gray-900">
              ₹{product.sellingPrice.toLocaleString()}
            </span>
          </div>
          {product.mrp > product.sellingPrice && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">MRP</span>
              <span className="text-sm text-gray-500 line-through">
                ₹{product.mrp.toLocaleString()}
              </span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 font-medium">Discount</span>
              <span className="text-sm text-green-600 font-medium">
                {discount}% off
              </span>
            </div>
          )}
        </div>
        
        {/* Last Updated */}
        <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200">
          Last updated: {product.lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
