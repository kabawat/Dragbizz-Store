"use client"
import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit, Copy, Trash2, Eye, FileText, Calendar, DollarSign, User } from 'lucide-react';

const InvoiceTable = ({
  invoices = [],
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onSelect,
  selectedInvoices = [],
  onSelectAll,
  loading = false,
  emptyMessage = 'No invoices found',
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
  
  const actionMenuItems = (invoice) => [
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
      disabled: invoice.invoiceStatus !== 'DRAFT'
    },
    {
      value: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDelete?.(invoice.id || invoice._id),
      className: 'text-red-600 hover:text-red-700'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { className: 'bg-yellow-100 text-yellow-800', text: 'Draft' },
      RELEASED: { className: 'bg-green-100 text-green-800', text: 'Released' },
      CANCELLED: { className: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };
    const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.text}
      </span>
    );
  };


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

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Loading Invoices...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Please wait while we fetch your invoices
          </p>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FileText className="w-16 h-16 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            {emptyMessage}
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))]">
            No invoices match your current criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
            {invoices.map((invoice, index) => {
              const invoiceId = invoice.id || invoice._id;
              const isSelected = selectedInvoices.includes(invoiceId);
              const isHovered = hoveredRow === index;
              const isMenuOpen = openMenuId === invoiceId;

              return (
                <tr
                  key={invoiceId}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-[rgb(var(--color-primary))]/5 border-l-4 border-[rgb(var(--color-primary))]'
                      : isHovered
                      ? 'bg-[rgb(var(--color-bg-tertiary))]'
                      : 'bg-[rgb(var(--color-bg-primary))]'
                  }`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelect?.(invoiceId)}
                      className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                          {invoice.invoiceNumber || `INV-${invoiceId?.slice(-6)}`}
                        </div>
                        {invoice.items && (
                          <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                            {invoice.items.length} item(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-[rgb(var(--color-text-secondary))] mr-2" />
                      <div className="text-sm text-[rgb(var(--color-text-primary))]">
                        {invoice.customer?.name || 'Walk-in Customer'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-[rgb(var(--color-text-secondary))] mr-2" />
                      <div className="text-sm text-[rgb(var(--color-text-primary))]">
                        {formatDate(invoice.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-[rgb(var(--color-text-secondary))] mr-2" />
                      <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                        {formatCurrency(invoice.totalAmount)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(invoice.invoiceStatus)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative" ref={(el) => (menuRefs.current[invoiceId] = el)}>
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : invoiceId)}
                        className="p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-md transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-50">
                          <div className="py-1">
                            {actionMenuItems(invoice).map((item) => (
                              <button
                                key={item.value}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  item.onClick();
                                }}
                                disabled={item.disabled}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                                  item.disabled
                                    ? 'text-[rgb(var(--color-text-tertiary))] cursor-not-allowed'
                                    : item.className || 'text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] cursor-pointer'
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Infinite scroll loading */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4 border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
            <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more invoices...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
