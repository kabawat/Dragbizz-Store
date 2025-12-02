"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui';
import {
  Calendar,
  IndianRupee,
  CreditCard,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { getStatusBadge, renderStatusBadge } from '@/utils/statusBadge';
import {
  getCategoryLabel,
  getPaymentMethodLabel,
  getPaymentMethodIcon,
  getStatusLabel,
  getStatusColor
} from '@/data/constants/expenses';

const ExpenseTable = ({
  expenses = [],
  isLoading = false,
  selectedExpenses = [],
  onSelectExpense,
  onSelectAllExpenses,
  onEdit,
  onDelete,
  onView,
  sortBy,
  sortOrder,
  onSort,
  onDuplicate,
  loading = false,
  emptyMessage = 'No expenses found',
  className = '',
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

  const handleMenuToggle = (expenseId) => {
    setOpenMenuId(openMenuId === expenseId ? null : expenseId);
  };

  const handleSelectAll = (checked) => {
    onSelectAllExpenses?.(checked);
  };

  const handleExpenseSelect = (expenseId, checked) => {
    onSelectExpense?.(expenseId);
  };

  const handleMenuAction = (expenseId, action) => {
    setOpenMenuId(null);
    const expense = expenses.find(e => e.id === expenseId);
    switch (action) {
      case 'view':
        onView?.(expense);
        break;
      case 'edit':
        onEdit?.(expense);
        break;
      case 'delete':
        onDelete?.(expense);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadgeColor = (status) => {
    const config = getStatusBadge(status, 'general');
    // Map variant to color name for Badge component
    const colorMap = {
      'success': 'green',
      'warning': 'yellow',
      'danger': 'red',
      'secondary': 'gray',
      'primary': 'blue'
    };
    return colorMap[config.variant] || 'gray';
  };

  const isAllSelected = expenses.length > 0 && selectedExpenses.length === expenses.length;
  const isIndeterminate = selectedExpenses.length > 0 && selectedExpenses.length < expenses.length;
  
  if (isLoading || loading) {
    return (
      <div className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm overflow-hidden ${className}`} {...props}>
        <div className="animate-pulse">
          <div className="h-16 bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-20 border-b border-[rgb(var(--color-border-primary))]">
              <div className="flex items-center h-full px-6">
                <div className="w-4 h-4 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/4"></div>
                  <div className="h-3 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/6"></div>
                </div>
                <div className="w-20 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-16 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-20 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (expenses.length === 0) {
    return (
      <div className={`${className}`} {...props}>
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {emptyMessage}
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Start by adding your first expense to track your business costs.
            </p>
          </div>
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
                    className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                    Title
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Vendor
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
            {expenses.map((expense, index) => {
              const isSelected = selectedExpenses.includes(expense.id);
              
              return (
                <tr
                  key={expense.id}
                  className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${
                    isSelected ? 'bg-[rgb(var(--color-bg-tertiary))] border-l-4 border-l-[rgb(var(--color-primary))]' : ''
                  } ${hoveredRow === index ? 'bg-[rgb(var(--color-bg-tertiary))]' : ''}`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleExpenseSelect(expense.id, e.target.checked)}
                        className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2 cursor-pointer"
                      />
                      <div>
                        <div className="font-medium text-[rgb(var(--color-text-primary))]">
                          {expense.title}
                        </div>
                        <div className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                          {expense.billNumber || 'No bill number'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[rgb(var(--color-text-tertiary))]" />
                      <span className="text-sm text-[rgb(var(--color-text-primary))]">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-[rgb(var(--color-text-primary))]">
                      {getCategoryLabel(expense.category?.name || expense.category)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[rgb(var(--color-text-primary))]">
                      ₹{formatCurrency(expense.amount)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getPaymentMethodIcon(expense.paymentMethod)}</span>
                      <span className="text-sm text-[rgb(var(--color-text-primary))]">
                        {getPaymentMethodLabel(expense.paymentMethod)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-[rgb(var(--color-text-primary))]">
                      {expense.vendor?.name || expense.vendor || '-'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {renderStatusBadge(expense.status, 'general')}
                  </td>
                  
                  <td className="w-24 px-6 py-4 text-center">
                    <div className="relative inline-block" ref={(el) => menuRefs.current[expense.id] = el}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
                        className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                        title="More Actions"
                      >
                        <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                      </button>
                      
                      {/* Popup Menu */}
                      {openMenuId === expense.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                          <button
                            onClick={() => handleMenuAction(expense.id, 'view')}
                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                          >
                            <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleMenuAction(expense.id, 'edit')}
                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                          >
                            <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                            Edit
                          </button>
                          <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                          <button
                            onClick={() => handleMenuAction(expense.id, 'delete')}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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
    </div>
  );
};

export default ExpenseTable;
