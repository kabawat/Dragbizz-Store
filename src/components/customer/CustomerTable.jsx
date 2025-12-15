"use client"
import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, Copy, Trash2, Eye, Users } from 'lucide-react';

const CustomerTable = ({
  customers = [],
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  loading = false,
  emptyMessage = 'No customers found',
  className = '',
  // Infinite scroll props
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
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
  
  const actionMenuItems = (customer) => [
    {
      value: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => onViewDetails?.(customer.id)
    },
    {
      value: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: () => onEdit?.(customer.id)
    },
    {
      value: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDelete?.(customer.id)
    }
  ];
  
  const handleMenuToggle = (customerId) => {
    setOpenMenuId(openMenuId === customerId ? null : customerId);
  };
  
  const handleMenuAction = (customerId, action) => {
    setOpenMenuId(null);
    switch (action) {
      case 'view':
        onViewDetails?.(customerId);
        break;
      case 'edit':
        onEdit?.(customerId);
        break;
      case 'delete':
        onDelete?.(customerId);
        break;
      default:
        break;
    }
  };
  
  if (loading) {
    return (
      <div className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm overflow-hidden ${className}`}>
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
    <div className={`${className}`}>
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
        <table className="w-full min-w-[600px] table-fixed">
          <thead>
            <tr>
              <th className="w-1/3 px-6 py-4 text-left">
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  Customer
                </span>
              </th>
              <th className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Phone
              </th>
              <th className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Email
              </th>
              <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Status
              </th>
              <th className="w-24 px-6 py-4 text-center">
                <MoreVertical className="w-4 h-4 mx-auto" />
              </th>
            </tr>
          </thead>
        </table>
      </div>
      
      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] table-fixed">
        <tbody className="divide-y divide-gray-100">
          {customers.map((customer, index) => {
            return (
              <tr
                key={customer.id}
                className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${
                  hoveredRow === index ? 'bg-[rgb(var(--color-bg-tertiary))]' : ''
                }`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Customer Column */}
                <td className="w-1/3 px-6 py-4 relative">
                  <div className="flex items-center gap-4">
                    {/* Customer Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-[rgb(var(--color-primary))]/20">
                      <Users className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                    </div>
                    
                    {/* Customer Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {customer.name || 'N/A'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[rgb(var(--color-text-secondary))]">Added: {new Date(customer.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Phone Column */}
                <td className="w-1/4 px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                      {customer.phone || 'N/A'}
                    </span>
                  </div>
                </td>
                
                {/* Email Column */}
                <td className="w-1/4 px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-sm text-[rgb(var(--color-text-primary))]">
                      {customer.email || 'N/A'}
                    </span>
                  </div>
                </td>
                
                {/* Status Column */}
                <td className="w-1/6 px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-500/10 text-green-600 border-green-500/20">
                    Active
                  </span>
                </td>
                
                {/* Actions Column */}
                <td className="w-24 px-6 py-4 text-center">
                  <div className="relative inline-block" ref={(el) => menuRefs.current[customer.id] = el}>
                    <button
                      onClick={() => handleMenuToggle(customer.id)}
                      className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                      title="More Actions"
                    >
                      <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                    </button>
                    
                    {/* Popup Menu */}
                    {openMenuId === customer.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                        <button
                          onClick={() => handleMenuAction(customer.id, 'view')}
                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                        >
                          <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleMenuAction(customer.id, 'edit')}
                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                        >
                          <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          Edit
                        </button>
                        <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                        <button
                          onClick={() => handleMenuAction(customer.id, 'delete')}
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
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more customers...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
