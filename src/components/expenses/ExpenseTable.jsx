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
import { useTranslation } from '@/hooks/useTranslation';

const ExpenseTable = ({
  expenses = [],
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  sortBy,
  sortOrder,
  onSort,
  onDuplicate,
  loading = false,
  emptyMessage,
  className = '',
}) => {
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  
  const defaultEmptyMessage = emptyMessage || t('expenses.noExpenses');

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

  
  if (isLoading || loading) {
    return (
      <div className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm overflow-hidden ${className}`}>
        <div className="animate-pulse">
          <div className="h-16 bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-20 border-b border-[rgb(var(--color-border-primary))]">
              <div className="flex items-center h-full px-6">
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
      <div className={`${className}`}>
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {defaultEmptyMessage}
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))]">
              {t('expenses.startAddingExpense')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="relative">
        <table className="w-full min-w-[800px]">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  {t('expenses.expenseTitle')}
                </span>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t('common.date')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t('expenses.category')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t('common.amount')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t('expenses.paymentMethod')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t('expenses.vendor')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t('common.status')}
              </th>
              <th className="w-24 px-6 py-4 text-center">
                <MoreVertical className="w-4 h-4 mx-auto" />
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
            {expenses.map((expense, index) => {
              return (
                <tr
                  key={expense.id}
                  className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${
                    hoveredRow === index ? 'bg-[rgb(var(--color-bg-tertiary))]' : ''
                  }`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium text-[rgb(var(--color-text-primary))]">
                          {expense.title}
                        </div>
                        <div className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                          {expense.billNumber || t('expenses.noBillNumber')}
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
                        title={t('common.actions')}
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
                            {t('common.viewDetails')}
                          </button>
                          <button
                            onClick={() => handleMenuAction(expense.id, 'edit')}
                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                          >
                            <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                            {t('common.edit')}
                          </button>
                          <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                          <button
                            onClick={() => handleMenuAction(expense.id, 'delete')}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            {t('common.delete')}
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
