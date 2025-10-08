"use client"
import React from 'react';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Building2,
  Calendar,
  CreditCard
} from 'lucide-react';

const BillTable = ({
  bills,
  selectedBills,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onViewDetails,
  loading,
  emptyMessage = "No bills found",
  hasMore,
  onLoadMore,
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
    <div className="h-full">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
        <table className="w-full min-w-[800px] table-fixed">
          <thead>
            <tr>
              <th className="w-1/6 px-6 py-4 text-left">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedBills.length === bills.length && bills.length > 0}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                  />
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                    Bill
                  </span>
                </div>
              </th>
              <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Supplier
              </th>
              <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Date
              </th>
              <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Due Date
              </th>
              <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Total
              </th>
              <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Paid
              </th>
              <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Due
              </th>
              <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Status
              </th>
              <th className="w-24 px-6 py-4 text-center">
                <MoreVertical className="w-4 h-4 mx-auto" />
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-auto min-h-[calc(100vh-400px)]">
        <table className="w-full min-w-[800px] table-fixed">
          <tbody className="divide-y divide-gray-100">
            {bills.map((bill, index) => {
              const statusBadge = getStatusBadge(bill);
              const StatusIcon = statusBadge.icon;
              const isSelected = selectedBills.includes(bill._id || bill.id);

              return (
                <tr
                  key={bill._id || bill.id || bill.billNumber}
                  className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${isSelected ? 'bg-[rgb(var(--color-bg-tertiary))] border-l-4 border-l-[rgb(var(--color-primary))]' : ''
                    }`}
                >
                  <td className="w-1/6 px-6 py-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(bill._id || bill.id)}
                        className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                      />
                      <div className="font-medium text-[rgb(var(--color-text-primary))]">{bill.billNumber}</div>
                    </div>
                  </td>
                  <td className="w-1/6 px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] mr-2" />
                      <span className="text-[rgb(var(--color-text-primary))]">{bill.supplier?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="w-1/6 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatDate(bill.billDate)}</td>
                  <td className="w-1/6 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatDate(bill.dueDate)}</td>
                  <td className="w-1/6 px-6 py-4 font-medium text-[rgb(var(--color-text-primary))]">{formatCurrency(bill.totalAmount)}</td>
                  <td className="w-1/6 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatCurrency(bill.paidAmount || 0)}</td>
                  <td className="w-1/6 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatCurrency(bill.dueAmount || Math.max((bill.totalAmount || 0) - (bill.paidAmount || 0), 0))}</td>
                  <td className="w-1/6 px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="w-24 px-6 py-4 text-center">
                    <div className="relative inline-block" ref={(el) => menuRefs.current[bill._id || bill.id] = el}>
                      <button
                        onClick={() => onMenuToggle(bill._id || bill.id)}
                        className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
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
                          <button
                            onClick={() => onMenuAction(bill._id || bill.id, 'payment')}
                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                          >
                            <CreditCard className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                            Pay Bill
                          </button>
                          <button
                            onClick={() => onMenuAction(bill._id || bill.id, 'delete')}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more bills...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillTable;
