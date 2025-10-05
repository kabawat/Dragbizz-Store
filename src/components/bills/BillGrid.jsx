"use client"
import React from 'react';
import BillCard from './BillCard';

const BillGrid = ({
  bills,
  selectedBills,
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
  formatDate
}) => {
  return (
    <div>
      {/* Select all header */}
      {bills.length > 0 && (
        <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedBills.length === bills.length && bills.length > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
            />
            <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              Select all {bills.length} bills
            </span>
            {selectedBills.length > 0 && (
              <span className="text-xs text-[rgb(var(--color-primary))] font-medium">
                ({selectedBills.length} selected)
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bills.map((bill) => (
          <BillCard
            key={bill._id || bill.id || bill.billNumber}
            bill={bill}
            onSelect={onSelect}
            selected={selectedBills.includes(bill._id || bill.id)}
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
          />
        ))}

        {/* Infinite scroll loading */}
        {isLoadingMore && (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more bills...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillGrid;
