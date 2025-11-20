"use client"
import React from 'react';
import {
  FileText,
  Calendar,
  Building2,
  Phone,
  Mail
} from 'lucide-react';
import { SendMenu, ActionMenu } from '@/components/ui';

const PurchaseOrderCard = ({
  purchaseOrder,
  onSelect,
  selected,
  onEdit,
  onDelete,
  onViewDetails,
  openMenuId,
  onMenuToggle,
  onMenuAction,
  menuRefs,
  getStatusBadge,
  formatCurrency,
  formatDate,
  enableSendMenu = true,
  getShareUrl
}) => {
  const statusBadge = getStatusBadge(purchaseOrder);
  const StatusIcon = statusBadge.icon;
  const poStatus = (purchaseOrder.status || '').toUpperCase();
  const isDeleted = poStatus === 'DELETED';
  
  // Check if advance payment has been made
  const advanceAmount = purchaseOrder.advanceAmount ?? purchaseOrder.paidAmount ?? 0;
  const hasAdvancePayments = (purchaseOrder.payments || []).some(
    payment => payment.paymentType === 'ADVANCE_PAYMENT'
  );
  const hasAdvancePayment = advanceAmount > 0 || hasAdvancePayments;
  
  // Build actions array conditionally
  const actions = ['view'];
  if (!hasAdvancePayment && !isDeleted) {
    actions.push('advancePayment');
  }
  if (!isDeleted) {
    actions.push('createBill', 'edit');
  }
  actions.push('delete');

  return (
    <div
      className={`w-full max-w-sm mx-auto rounded-xl border border-[rgb(var(--color-border-primary))] transition-all duration-300 ease-out group overflow-hidden ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(purchaseOrder._id || purchaseOrder.id)}
          className="w-4 h-4 rounded focus:ring-blue-500"
        />
      </div>

      {/* PO Header with Gradient Background */}
      <div className="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 relative">
        <div className="w-full h-full flex items-center justify-center">
          <FileText className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[rgb(var(--color-primary))]" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl"></div>

        {/* Action Menu */}
        <div className="absolute top-4 right-4 z-10">
          <ActionMenu
            item={purchaseOrder}
            onAction={onMenuAction}
            menuId={purchaseOrder._id || purchaseOrder.id}
            isOpen={openMenuId === (purchaseOrder._id || purchaseOrder.id)}
            onToggle={onMenuToggle}
            menuRef={(el) => menuRefs.current[purchaseOrder._id || purchaseOrder.id] = el}
            actions={actions}
            buttonClassName="bg-white/90 hover:bg-white shadow-sm"
          />
        </div>

        {/* Send Menu */}
        {enableSendMenu && (
          <div className="absolute top-4 right-16 z-10">
            <SendMenu
              item={purchaseOrder}
              onShare={(type, item) => {
                console.log(`Shared via ${type}:`, item);
              }}
              getShareUrl={getShareUrl}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              buttonClassName="bg-white/90 hover:bg-white"
            />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
        {/* PO Info */}
        <div>
          <h3 className="font-bold text-md sm:text-lg xl:text-lg mb-1 text-[rgb(var(--color-text-primary))] line-clamp-1">
            {purchaseOrder.billNumber || purchaseOrder.poNumber}
          </h3>
          <div className="flex items-start">
            <Building2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] mr-2 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                {purchaseOrder.supplier?.name || 'N/A'}
              </p>
              {(purchaseOrder.supplier?.phone || purchaseOrder.supplier?.email) && (
                <div className="text-xs mt-0.5 flex items-center gap-1.5">
                  {purchaseOrder.supplier?.phone ? (
                    <>
                      <Phone className="w-3.5 h-3.5" style={{ color: 'rgb(var(--color-success))' }} />
                      <span className="text-[rgb(var(--color-text-secondary))]">{purchaseOrder.supplier.phone}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" style={{ color: 'rgb(var(--color-primary))' }} />
                      <span className="text-[rgb(var(--color-text-secondary))]">{purchaseOrder.supplier?.email}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusBadge.text}
          </span>
        </div>

        {/* PO Details */}
        <div className="space-y-2">
          <div className="flex items-center text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
            <Calendar className="w-4 h-4 mr-2" />
            <span>PO Date: {formatDate(purchaseOrder.billDate)}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Expected Delivery: {formatDate(purchaseOrder.dueDate)}</span>
          </div>
        </div>

        {/* Amount Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
              <span className="font-medium">Total Amount:</span>
            </div>
            <div className="text-lg sm:text-lg xl:text-lg font-bold text-[rgb(var(--color-text-primary))]">
              {formatCurrency(purchaseOrder.totalAmount)}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
              <span className="font-medium">Advance Paid:</span>
            </div>
            <div className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
              {formatCurrency(purchaseOrder.paidAmount || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderCard;
