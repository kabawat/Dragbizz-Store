"use client"
import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, Copy, Trash2, Eye, Building } from 'lucide-react';

const SupplierTable = ({
  suppliers = [],
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onSelect,
  selectedSuppliers = [],
  onSelectAll,
  loading = false,
  emptyMessage = 'No suppliers found',
  className = '',
  // Infinite scroll props
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  ...props
}) => {
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
  
  const actionMenuItems = (supplier) => [
    {
      value: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => onViewDetails?.(supplier.id)
    },
    {
      value: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: () => onEdit?.(supplier.id)
    },
    {
      value: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDelete?.(supplier.id)
    }
  ];
  
  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectAll?.(suppliers.map(s => s.id));
    } else {
      onSelectAll?.([]);
    }
  };
  
  const handleSupplierSelect = (supplierId, checked) => {
    if (checked) {
      onSelect?.([...selectedSuppliers, supplierId]);
    } else {
      onSelect?.(selectedSuppliers.filter(id => id !== supplierId));
    }
  };
  
  const handleMenuToggle = (supplierId) => {
    setOpenMenuId(openMenuId === supplierId ? null : supplierId);
  };
  
  const handleMenuAction = (supplierId, action) => {
    setOpenMenuId(null);
    switch (action) {
      case 'view':
        onViewDetails?.(supplierId);
        break;
      case 'edit':
        onEdit?.(supplierId);
        break;
      case 'delete':
        onDelete?.(supplierId);
        break;
      default:
        break;
    }
  };
  
  const isAllSelected = suppliers.length > 0 && selectedSuppliers.length === suppliers.length;
  const isIndeterminate = selectedSuppliers.length > 0 && selectedSuppliers.length < suppliers.length;
  
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
    <div className={`${className}`} {...props}>
      <div className="relative">
        <table className="w-full min-w-[800px]">
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
                  Supplier
                </span>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Agency
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Status
            </th>
            <th className="w-24 px-6 py-4 text-center">
              <MoreVertical className="w-4 h-4 mx-auto" />
            </th>
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
          {suppliers.map((supplier, index) => {
            const isSelected = selectedSuppliers.includes(supplier.id);
            
            return (
              <tr
                key={supplier.id}
                className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${
                  isSelected ? 'bg-[rgb(var(--color-bg-tertiary))] border-l-4 border-l-[rgb(var(--color-primary))]' : ''
                } ${hoveredRow === index ? 'bg-[rgb(var(--color-bg-tertiary))]' : ''}`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Supplier Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSupplierSelect(supplier.id, e.target.checked)}
                      className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                    />
                    
                    {/* Supplier Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-[rgb(var(--color-border-primary))]">
                      <Building className="w-6 h-6 text-[rgb(var(--color-text-tertiary))]" />
                    </div>
                    
                    {/* Supplier Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[rgb(var(--color-text-primary))] text-sm truncate">
                        {supplier.name || 'N/A'}
                      </h3>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))] font-medium">
                        GST: {supplier.gstNumber || 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[rgb(var(--color-text-tertiary))]">Added: {new Date(supplier.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Agency Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                      {supplier.agency || 'N/A'}
                    </span>
                  </div>
                </td>
                
                {/* Phone Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-sm text-[rgb(var(--color-text-primary))]">
                      {supplier.phone || 'N/A'}
                    </span>
                  </div>
                </td>
                
                {/* Email Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-sm text-[rgb(var(--color-text-primary))] truncate max-w-[200px]">
                      {supplier.email || 'N/A'}
                    </span>
                  </div>
                </td>
                
                {/* Status Column */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-500/10 text-green-600 border-green-500/20">
                    Active
                  </span>
                </td>
                
                {/* Actions Column */}
                <td className="w-24 px-6 py-4 text-center">
                  <div className="relative inline-block" ref={(el) => menuRefs.current[supplier.id] = el}>
                    <button
                      onClick={() => handleMenuToggle(supplier.id)}
                      className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                      title="More Actions"
                    >
                      <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                    </button>
                    
                    {/* Popup Menu */}
                    {openMenuId === supplier.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                        <button
                          onClick={() => handleMenuAction(supplier.id, 'view')}
                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                        >
                          <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleMenuAction(supplier.id, 'edit')}
                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                        >
                          <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          Edit
                        </button>
                        <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                        <button
                          onClick={() => handleMenuAction(supplier.id, 'delete')}
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
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more suppliers...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierTable;