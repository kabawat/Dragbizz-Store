"use client"
import React from 'react';
import {
  Receipt,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { renderStatusBadge } from '@/utils/statusBadge';

const BillCard = ({
  bill,
  onEdit,
  onDelete,
  onViewDetails,
  openMenuId,
  onMenuToggle,
  onMenuAction,
  menuRefs,
  formatCurrency,
  formatDate
}) => {
  // Determine status for renderStatusBadge
  let status = bill.paymentStatus || 'UNPAID';
  if (new Date(bill.dueDate) < new Date() && bill.dueAmount > 0) {
    status = 'OVERDUE';
  }
  
  // Map icons for bills
  const iconMap = {
    'PAID': CheckCircle,
    'PARTIAL': Clock,
    'UNPAID': Clock,
    'OVERDUE': AlertTriangle
  };
  const StatusIcon = iconMap[status] || Clock;

  return (
    <div className="w-full max-w-sm mx-auto rounded-xl border border-[rgb(var(--color-border-primary))] transition-all duration-300 ease-out group overflow-hidden" >
      {/* Bill Header with Gradient Background */}
      <div className="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 relative">
        <div className="w-full h-full flex items-center justify-center">
          <Receipt className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[rgb(var(--color-primary))]" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl"></div>

        {/* Action Menu */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative" ref={(el) => menuRefs.current[bill._id || bill.id] = el}>
            <button
              onClick={() => onMenuToggle(bill._id || bill.id)}
              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors duration-200 group/btn cursor-pointer shadow-sm"
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
            </button>

            {/* Popup Menu */}
            {openMenuId === (bill._id || bill.id) && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                <button
                  onClick={() => onMenuAction(bill._id || bill.id, 'view')}
                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                >
                  <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  View Details
                </button>
                <button
                  onClick={() => onMenuAction(bill._id || bill.id, 'edit')}
                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                >
                  <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  Edit
                </button>
                <button onClick={() => onMenuAction(bill._id || bill.id, 'payment')} className="w-full px-4 py-2 text-left text-sm text-green-700 dark:text-green-500 hover:bg-green-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-green-500/10">
                  <CreditCard className="w-4 h-4 text-green-700 dark:text-green-500" />
                  Pay Bill
                </button>
                <button onClick={() => onMenuAction(bill._id || bill.id, 'delete')} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
        {/* Bill Info */}
        <div>
          <h3 className="font-bold text-md sm:text-lg xl:text-lg mb-1 text-[rgb(var(--color-text-primary))] line-clamp-1">{bill.billNumber}</h3>
          <p className="text-xs sm:text-sm font-medium text-[rgb(var(--color-text-secondary))]">
            {bill.supplier?.name || 'N/A'}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {renderStatusBadge(status, 'bill', StatusIcon)}
        </div>

        {/* Bill Details */}
        <div className="space-y-2">
          <div className="flex items-center text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Date: {formatDate(bill.billDate)}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Due: {formatDate(bill.dueDate)}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
            <span className="font-medium">Amount:</span>
          </div>
          <div className="text-lg sm:text-lg xl:text-lg font-bold text-[rgb(var(--color-text-primary))]">
            {formatCurrency(bill.totalAmount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillCard;
