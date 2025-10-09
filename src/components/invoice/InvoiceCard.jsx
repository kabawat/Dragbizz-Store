"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Dropdown } from '../ui';
import { MoreHorizontal, Edit, Copy, Trash2, Eye, FileText, Phone, Mail, Calendar, DollarSign, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const InvoiceCard = ({
  invoice,
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
      DRAFT: { variant: 'warning', text: 'Draft' },
      RELEASED: { variant: 'success', text: 'Released' },
      CANCELLED: { variant: 'danger', text: 'Cancelled' }
    };
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };


  const actionMenuItems = [
    {
      value: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => onViewDetails?.(invoice.id || invoice._id)
    },
    {
      value: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: () => onEdit?.(invoice.id || invoice._id),
      disabled: invoice.status !== 'DRAFT'
    },
    {
      value: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: () => onDuplicate?.(invoice.id || invoice._id)
    },
    {
      value: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDelete?.(invoice.id || invoice._id),
      className: 'text-red-600 hover:text-red-700'
    }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const invoiceId = invoice.id || invoice._id;

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-lg ${selected
          ? 'ring-2 ring-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5'
          : 'hover:shadow-md'
        } ${className}`}
      {...props}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect?.(invoiceId)}
          className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
        />
      </div>

      {/* Action Menu */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={() => setOpenMenuId(openMenuId ? null : invoiceId)}
          className="p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-md transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {openMenuId === invoiceId && (
          <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-50">
            <div className="py-1">
              {actionMenuItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setOpenMenuId(null);
                    item.onClick();
                  }}
                  disabled={item.disabled}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${item.disabled
                      ? 'text-[rgb(var(--color-text-tertiary))] cursor-not-allowed'
                      : item.className || 'text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))]'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 pt-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-6 h-6 text-[rgb(var(--color-text-secondary))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                {invoice.invoiceNumber || `INV-${invoiceId?.slice(-6)}`}
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                Invoice #{invoiceId?.slice(-8)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex gap-2 mb-4">
          {getStatusBadge(invoice.status)}
        </div>

        {/* Customer Info */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-[rgb(var(--color-text-secondary))] mb-1">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">Customer</span>
          </div>
          <p className="text-sm text-[rgb(var(--color-text-primary))] ml-6">
            {invoice.customer?.name || 'Walk-in Customer'}
          </p>
        </div>

        {/* Invoice Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-[rgb(var(--color-text-secondary))]">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Date</span>
            </div>
            <span className="text-[rgb(var(--color-text-primary))] font-medium">
              {formatDate(invoice.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-[rgb(var(--color-text-secondary))]">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>Amount</span>
            </div>
            <span className="text-[rgb(var(--color-text-primary))] font-semibold text-lg">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>

          {invoice.items && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-[rgb(var(--color-text-secondary))]">
                <FileText className="w-4 h-4 mr-2" />
                <span>Items</span>
              </div>
              <span className="text-[rgb(var(--color-text-primary))] font-medium">
                {invoice.items.length} item(s)
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-[rgb(var(--color-border-primary))]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(invoiceId)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          {invoice.status === 'DRAFT' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onEdit?.(invoiceId)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default InvoiceCard;
