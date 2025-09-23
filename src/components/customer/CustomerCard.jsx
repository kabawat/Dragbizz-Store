"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Dropdown } from '../ui';
import { MoreHorizontal, Edit, Copy, Trash2, Eye, Users, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const CustomerCard = ({
  customer,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onSelect,
  selected = false,
  className = '',
  ...props
}) => {
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
      PENDING: { variant: 'warning', text: 'Pending' },
      BLOCKED: { variant: 'danger', text: 'Blocked' }
    };
    
    const config = statusConfig[status] || { variant: 'success', text: 'Active' };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };
  
  const actionMenuItems = [
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
      value: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: () => onDuplicate?.(customer.id)
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
      case 'duplicate':
        onDuplicate?.(customerId);
        break;
      case 'delete':
        onDelete?.(customerId);
        break;
      default:
        break;
    }
  };
  
  // Grid view - Modern Card Design
  return (
    <div className={`rounded-xl border border-[rgb(var(--color-border-primary))] shadow-lg hover:shadow-xl transition-all duration-300 ease-out group overflow-hidden ${selected ? 'ring-2 ring-blue-500' : ''} ${className}`} {...props}>
      {/* Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(customer.id, e.target.checked)}
            className="w-4 h-4 rounded focus:ring-blue-500"
            style={{
              color: themeConfig.primary,
              borderColor: themeConfig.border,
              backgroundColor: themeConfig.background
            }}
          />
        </div>
      )}
      
      {/* Customer Avatar Section with Gradient Background */}
      <div className="w-full h-56 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 via-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-bg-secondary))] overflow-hidden relative">
        {/* Customer Avatar */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center border-4 border-[rgb(var(--color-primary))]/20 shadow-lg">
            <Users className="w-12 h-12 text-[rgb(var(--color-primary))]" />
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        
        {/* Action Menu */}
        <div className="absolute top-4 right-4">
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => handleMenuToggle(customer.id)}
              className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer backdrop-blur-sm bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))]"
              title="More Actions"
            >
              <svg className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
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
                <button
                  onClick={() => handleMenuAction(customer.id, 'duplicate')}
                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                >
                  <Copy className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  Duplicate
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
        </div>
        
        {/* Status Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
            Active
          </span>
        </div>
      </div>
      
      {/* Customer Info */}
      <div className="p-6 space-y-4">
        {/* Customer Name */}
        <div>
          <h3 className="font-bold text-xl mb-1" style={{ color: themeConfig.text }}>
            {customer.name || 'N/A'}
          </h3>
          <p className="text-sm font-medium" style={{ color: themeConfig.textSecondary }}>
            Customer ID: {customer.id}
          </p>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-3">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: themeConfig.text }}>
                {customer.phone || 'N/A'}
              </p>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Phone Number
              </p>
            </div>
          </div>
          
          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: themeConfig.text }}>
                {customer.email || 'N/A'}
              </p>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Email Address
              </p>
            </div>
          </div>
          
          {/* Address */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: themeConfig.text }}>
                {customer.address || 'N/A'}
              </p>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Address
              </p>
            </div>
          </div>
        </div>
        
        {/* Customer Stats Section */}
        <div className="rounded-lg p-4 space-y-2 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: themeConfig.textSecondary }}>Status</span>
            <span className="text-sm font-medium text-green-600">
              Active Customer
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: themeConfig.textSecondary }}>Member Since</span>
            <span className="text-sm font-medium" style={{ color: themeConfig.text }}>
              {new Date(customer.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Last Updated */}
        <div 
          className="text-xs text-center pt-2 border-t" 
          style={{ 
            color: themeConfig.textSecondary,
            borderColor: themeConfig.border
          }}
        >
          Last updated: {new Date(customer.updatedAt || Date.now()).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
