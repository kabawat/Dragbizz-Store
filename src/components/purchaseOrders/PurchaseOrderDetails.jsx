"use client"
import React from 'react';
import { Calendar, Building2, FileText, IndianRupee, Phone, Mail, Barcode } from 'lucide-react';
import { getStatusBadge as getCommonStatusBadge } from '@/utils/statusBadge';
import { useTranslation } from '@/hooks/useTranslation';

const PurchaseOrderDetails = ({ purchaseOrder }) => {
  const { t } = useTranslation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = getCommonStatusBadge(status, 'purchase-order');
    // Convert to color class format for compatibility
    const getColorClass = (variant) => {
      switch (variant) {
        case 'success': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
        case 'danger': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
        case 'primary': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
        default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
      }
    };

    return {
      text: config.text,
      color: getColorClass(config.variant)
    };
  };

  const statusBadge = getStatusBadge(purchaseOrder.approvalStatus || purchaseOrder.status);

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="border-b border-[rgb(var(--color-border-primary))] mb-6">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-[rgb(var(--color-primary))] py-2 px-1 text-sm font-medium text-[rgb(var(--color-primary))]">
            Details
          </button>
        </nav>
      </div>

      {/* Purchase Order Summary Card */}
      <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-semibold">
                {purchaseOrder.store?.name?.charAt(0)?.toUpperCase() || 'PO'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                {purchaseOrder.store?.name || t('common.retailManager')}
              </h3>
              <div className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                <span>Purchase Order Date {formatDate(purchaseOrder.poDate || purchaseOrder.billDate)}</span>
                <span className="mx-2">•</span>
                <span>Due Date {formatDate(purchaseOrder.expectedDeliveryDate || purchaseOrder.dueDate)}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-[rgb(var(--color-text-secondary))] mb-2 flex items-center justify-end">
              <Phone className="w-4 h-4 mr-1" />
              Contact Information
            </div>
            <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))] flex items-center justify-end mb-1">
              <Phone className="w-4 h-4 mr-2 text-[rgb(var(--color-primary))]" />
              {purchaseOrder.store?.phone || 'N/A'}
            </div>
            <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))] flex items-center justify-end">
              <Mail className="w-4 h-4 mr-2 text-[rgb(var(--color-primary))]" />
              {purchaseOrder.store?.email || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Table */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">Product Details</h4>
        <div className="overflow-x-auto max-h-64 overflow-y-auto border border-[rgb(var(--color-border-primary))] rounded-lg">
          <table className="min-w-full divide-y divide-[rgb(var(--color-border-primary))]">
            <thead className="bg-[rgb(var(--color-bg-secondary))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="bg-[rgb(var(--color-bg-primary))] divide-y divide-[rgb(var(--color-border-primary))]">
              {purchaseOrder.items?.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                        {item.name || `Item ${index + 1}`}
                      </div>
                      {item.barcode && (
                        <div className="text-xs text-[rgb(var(--color-text-secondary))] flex items-center mt-1">
                          <Barcode className="w-3 h-3 mr-1" />
                          {item.barcode}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[rgb(var(--color-text-primary))]">
                    {item.quantity || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Notes Section */}
      {purchaseOrder.notes && (
        <div className="mt-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))]">
          <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-[rgb(var(--color-primary))]" />
            Notes
          </h4>
          <div className="max-h-32 overflow-y-auto">
            <p className="text-[rgb(var(--color-text-secondary))] text-sm">
              {purchaseOrder.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetails;
