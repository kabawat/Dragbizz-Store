"use client";
import { Package } from "lucide-react";

const BillItemsTable = ({ items, itemsSummary, formatCurrency }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-500/15 text-blue-500 rounded-full flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
            Line Items
          </h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            Breakdown of products in this bill
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[rgb(var(--color-text-tertiary))] border-b border-[rgb(var(--color-border-primary))]/50">
              <th className="py-3 pr-4 font-medium">Product</th>
              <th className="py-3 pr-4 font-medium">Quantity</th>
              <th className="py-3 pr-4 font-medium">Unit Price</th>
              <th className="py-3 pr-4 font-medium text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]/30">
            {items.map((item, index) => (
              <tr key={`${item.product || index}-${index}`}>
                <td className="py-4 pr-4">
                  <p className="font-semibold text-[rgb(var(--color-text-primary))]">
                    {item.productName || "Unnamed Product"}
                  </p>
                </td>
                <td className="py-4 pr-4 text-[rgb(var(--color-text-primary))]">
                  {item.quantity || 0}
                </td>
                <td className="py-4 pr-4 text-[rgb(var(--color-text-primary))]">
                  {formatCurrency(item.unitPrice || 0)}
                </td>
                <td className="py-4 pr-0 text-right text-[rgb(var(--color-text-primary))] font-semibold">
                  {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {itemsSummary && (
        <div className="mt-6 space-y-3 text-sm text-[rgb(var(--color-text-secondary))]">
          <div className="flex items-center justify-end gap-2">
            <span>Subtotal:</span>
            <strong className="text-[rgb(var(--color-text-primary))]">
              {formatCurrency(itemsSummary.subtotal)}
            </strong>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span>GST:</span>
            <strong className="text-[rgb(var(--color-text-primary))]">
              {formatCurrency(itemsSummary.gstAmount)}
            </strong>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span>Items:</span>
            <strong className="text-[rgb(var(--color-text-primary))]">
              {itemsSummary.itemCount}
            </strong>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-[rgb(var(--color-border-primary))]/40 pt-3">
            <span>Total:</span>
            <strong className="text-lg text-[rgb(var(--color-text-primary))]">
              {formatCurrency(itemsSummary.totalValue)}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillItemsTable;
