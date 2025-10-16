"use client"
import React from 'react';
import PurchaseOrderCard from './PurchaseOrderCard';

const PurchaseOrderGrid = ({
  purchaseOrders,
  selectedPurchaseOrders,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onViewDetails,
  isLoadingMore,
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
  return (
    <div>
      {/* Select all header */}
      {purchaseOrders.length > 0 && (
        <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedPurchaseOrders.length === purchaseOrders.length && purchaseOrders.length > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
            />
            <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Select all {purchaseOrders.length} purchase orders
            </span>
            {selectedPurchaseOrders.length > 0 && (
              <span className="text-xs text-[rgb(var(--color-primary))] font-medium">
                ({selectedPurchaseOrders.length} selected)
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {purchaseOrders.map((purchaseOrder) => (
          <PurchaseOrderCard
            key={purchaseOrder._id || purchaseOrder.id || purchaseOrder.billNumber}
            purchaseOrder={purchaseOrder}
            onSelect={onSelect}
            selected={selectedPurchaseOrders.includes(purchaseOrder._id || purchaseOrder.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
            openMenuId={openMenuId}
            onMenuToggle={onMenuToggle}
            onMenuAction={onMenuAction}
            menuRefs={menuRefs}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            enableSendMenu={enableSendMenu}
            getShareUrl={getShareUrl}
          />
        ))}

        {/* Infinite scroll loading */}
        {isLoadingMore && (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more purchase orders...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderGrid;
