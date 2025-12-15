"use client"
import React from 'react';
import PurchaseOrderCard from './PurchaseOrderCard';

const PurchaseOrderGrid = ({
  purchaseOrders,
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
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {purchaseOrders.map((purchaseOrder) => (
          <PurchaseOrderCard
            key={purchaseOrder._id || purchaseOrder.id || purchaseOrder.billNumber}
            purchaseOrder={purchaseOrder}
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
