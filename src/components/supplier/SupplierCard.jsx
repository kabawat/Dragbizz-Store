"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Dropdown } from '../ui';
import { MoreVertical, Edit, Copy, Trash2, Eye, Building, Phone, Mail, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SupplierCard = ({
  supplier,
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

  // Grid view - Modern Card Design
  return (
    <div className={`w-full max-w-sm mx-auto rounded-xl border border-[rgb(var(--color-border-primary))] shadow-lg hover:shadow-xl transition-all duration-300 ease-out group overflow-hidden ${selected ? 'ring-2 ring-blue-500' : ''} ${className}`} {...props}>
      {/* Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(supplier.id, e.target.checked)}
            className="w-4 h-4 rounded focus:ring-blue-500"
            style={{
              color: themeConfig.primary,
              borderColor: themeConfig.border,
              backgroundColor: themeConfig.background
            }}
          />
        </div>
      )}

      {/* Supplier Avatar Section with Gradient Background */}
      <div 
        className="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br relative">
        <div className="w-full h-full overflow-hidden rounded-t-xl">
          {/* Supplier Avatar */}
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-primary))]/10 via-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-bg-secondary))]">
            <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center border-4 border-[rgb(var(--color-primary))]/20 shadow-lg">
              <Building className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 text-[rgb(var(--color-primary))]" />
            </div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

        {/* Action Menu */}
        <div className="absolute top-4 right-4">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => handleMenuToggle(supplier.id)}
              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors duration-200 group/btn cursor-pointer shadow-sm"
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
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
            Active
          </span>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
        {/* Supplier Name */}
        <div>
          <h3 className="font-bold text-md sm:text-xl mb-1" style={{ color: themeConfig.text }}>
            {supplier.name || 'N/A'}
          </h3>
          <p className="text-xs sm:text-sm font-medium" style={{ color: themeConfig.textSecondary }}>
            GST Number: {supplier.gstNumber || 'N/A'}
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
                {supplier.phone || 'N/A'}
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
                {supplier.email || 'N/A'}
              </p>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Email Address
              </p>
            </div>
          </div>

          {/* Agency */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Building className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: themeConfig.text }}>
                {supplier.agency || 'N/A'}
              </p>
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Agency Name
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Stats Section */}
        <div className="rounded-lg p-4 space-y-2 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: themeConfig.textSecondary }}>Status</span>
            <span className="text-sm font-medium text-green-600">
              Active Supplier
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: themeConfig.textSecondary }}>Member Since</span>
            <span className="text-sm font-medium" style={{ color: themeConfig.text }}>
              {new Date(supplier.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
          
          {/* Account Summary */}
          {supplier.account && (
            <>
              <div className="border-t border-[rgb(var(--color-border-primary))] pt-2 mt-2"></div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: themeConfig.textSecondary }}>Total Paid</span>
                  <span className="text-sm font-semibold text-green-600">
                    ₹{(supplier.account?.totalPaid || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: themeConfig.textSecondary }}>Total Due</span>
                  <span className="text-sm font-semibold text-red-600">
                    ₹{(supplier.account?.totalDue || supplier.account?.dueAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </>
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
          Last updated: {new Date(supplier.updatedAt || Date.now()).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default SupplierCard;