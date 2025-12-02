"use client"
import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit, Copy, Trash2, Eye, FileText, Calendar, IndianRupee, User, Settings, Printer, CheckCircle } from 'lucide-react';
import { renderStatusBadge } from '@/utils/statusBadge';

const InvoiceTable = ({
  invoices = [],
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onPrint,
  onRelease,
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

  // Calculate selection states
  const isAllSelected = selectedInvoices.length === invoices.length && invoices.length > 0;
  const isIndeterminate = selectedInvoices.length > 0 && selectedInvoices.length < invoices.length;

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectAll?.(invoices.map(i => i.id || i._id));
    } else {
      onSelectAll?.([]);
    }
  };

  const handleInvoiceSelect = (invoiceId, checked) => {
    if (checked) {
      onSelect?.([...selectedInvoices, invoiceId]);
    } else {
      onSelect?.(selectedInvoices.filter(id => id !== invoiceId));
    }
  };

  const handleMenuToggle = (invoiceId) => {
    setOpenMenuId(openMenuId === invoiceId ? null : invoiceId);
  };

  const handleMenuAction = (invoiceId, action) => {
    setOpenMenuId(null);
    action.onClick();
  };

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
      value: 'print',
      label: 'Print Invoice',
      icon: Printer,
      onClick: () => onPrint?.(invoice.id || invoice._id)
    },
    {
      value: 'release',
      label: 'Release Invoice',
      icon: CheckCircle,
      onClick: () => onRelease?.(invoice.id || invoice._id),
      disabled: invoice.invoiceStatus !== 'DRAFT',
      className: 'text-green-600 hover:text-green-700 cursor-pointer'
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
      className: 'text-red-600 hover:text-red-700 cursor-pointer'
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
    if (!amount) return '₹ 0';
    return `₹ ${amount.toLocaleString('en-IN')}`;
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
    <div className={`h-full ${className}`} {...props}>
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
        <table className="w-full min-w-[800px] table-fixed">
          <thead>
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
                    Invoice
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Amount & GST
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Status
              </th>
              <th className="w-24 px-6 py-4 text-center">
                <div className="flex items-center justify-center">
                  <div className="p-2">
                    <svg className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-auto min-h-[calc(100vh-400px)]">
        <table className="w-full min-w-[800px] table-fixed">
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
            {invoices.map((invoice, index) => {
              const invoiceId = invoice.id || invoice._id;
              const isSelected = selectedInvoices.includes(invoiceId);
              const isHovered = hoveredRow === index;
              const isMenuOpen = openMenuId === invoiceId;

              return (
                <tr
                  key={`${invoiceId}-${index}`}
                  className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${isSelected ? 'bg-[rgb(var(--color-bg-tertiary))] border-l-4 border-l-[rgb(var(--color-primary))]' : ''
                    } ${hoveredRow === index ? 'bg-[rgb(var(--color-bg-tertiary))]' : ''}`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Invoice Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleInvoiceSelect(invoiceId, e.target.checked)}
                        className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                      />

                      {/* Invoice Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-[rgb(var(--color-border-primary))]">
                        <FileText className="w-6 h-6 text-[rgb(var(--color-text-tertiary))]" />
                      </div>

                      {/* Invoice Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[rgb(var(--color-text-primary))] text-sm truncate">
                          {invoice.invoiceNumber || `INV-${invoiceId?.slice(-6)}`}
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[rgb(var(--color-text-tertiary))]">Created: {formatDate(invoice.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Customer Column */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-[rgb(var(--color-text-primary))]">
                      {invoice.customer?.name || 'Walk-in Customer'}
                    </div>
                    {invoice.customer?.phone ? (
                      <div className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                        {invoice.customer.phone}
                      </div>
                    ) : invoice.customer?.email ? (
                      <div className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                        {invoice.customer.email}
                      </div>
                    ) : null}
                  </td>

                   {/* Date Column */}
                   <td className="px-6 py-4">
                     <div className="text-sm text-[rgb(var(--color-text-primary))]">
                       {formatDate(invoice.createdAt)}
                     </div>
                     <div className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                       Due: {formatDate(invoice.dueDate || invoice.createdAt)}
                     </div>
                   </td>

                   {/* Amount & GST Column */}
                   <td className="px-6 py-4">
                     <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                       {formatCurrency(invoice.subtotal || invoice.totalAmount)}
                     </div>
                     <div className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                       GST: {formatCurrency(invoice.gstAmount || 0)}
                     </div>
                     {invoice.totalDiscount > 0 && (
                       <div className="text-xs text-[rgb(var(--color-danger))] mt-1">
                         Discount: -{formatCurrency(invoice.totalDiscount)}
                       </div>
                     )}
                   </td>

                   {/* Total Amount Column */}
                   <td className="px-6 py-4 text-center">
                     <div className="text-sm font-semibold text-[rgb(var(--color-primary))]">
                       {formatCurrency(invoice.totalAmount)}
                     </div>
                   </td>

                   {/* Items Column */}
                   <td className="px-6 py-4 text-center">
                     <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                       {invoice.items?.length || 0}
                     </div>
                   </td>

                  {/* Status Column */}
                  <td className="px-6 py-4 text-center">
                    {renderStatusBadge(invoice.invoiceStatus, 'invoice')}
                  </td>

                  {/* Actions Column */}
                  <td className="w-24 px-6 py-4 text-center">
                    <div className="relative flex justify-center" ref={(el) => (menuRefs.current[invoiceId] = el)}>
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : invoiceId)}
                        className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                        title="More Actions"
                      >
                        <svg className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-50">
                          <div className="py-1">
                            {actionMenuItems(invoice).map((item) => (
                              <button
                                key={item.value}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  item.onClick();
                                }}
                                disabled={item.disabled}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200 ${item.disabled
                                    ? 'text-[rgb(var(--color-text-tertiary))] cursor-not-allowed'
                                    : item.className || 'text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]'
                                  }`}
                              >
                                <item.icon className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
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

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more invoices...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceTable;
