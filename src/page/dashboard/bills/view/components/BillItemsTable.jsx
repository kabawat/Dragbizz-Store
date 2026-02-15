"use client";
import { FileText, Package } from "lucide-react";
import { Badge } from "@/components/ui";

const BillItemsTable = ({ items, itemsSummary, formatCurrency, gstBreakdown }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]/60">
      <div className="px-6 py-4 border-b border-[rgb(var(--color-border-primary))]/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[rgb(var(--color-text-primary))]">
              Bill Line Items
            </h2>
          </div>
        </div>
        <div className="hidden sm:block">
          <Badge variant="secondary">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[rgb(var(--color-text-tertiary))] border-b border-[rgb(var(--color-border-primary))]/40">
              <th className="py-3 px-6 font-bold uppercase tracking-wider text-[10px]">Product</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">HSN</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center">Qty</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Unit Price</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center">GST %</th>
              <th className="py-3 px-6 font-bold uppercase tracking-wider text-[10px] text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]/20">
            {items.map((item, index) => (
              <tr key={`${item.product || index}-${index}`} className="hover:bg-[rgb(var(--color-bg-secondary))]/5 transition-colors group">
                <td className="py-3 px-6">
                  <p className="font-bold text-[rgb(var(--color-text-primary))]">
                    {item.productName || "Unnamed Product"}
                  </p>
                </td>
                <td className="py-3 px-4 text-[rgb(var(--color-text-secondary))] font-medium">
                  {item.hsnCode || "-"}
                </td>
                <td className="py-3 px-4 text-[rgb(var(--color-text-primary))] font-semibold text-center">
                  {item.quantity || 0}
                </td>
                <td className="py-3 px-4 text-[rgb(var(--color-text-primary))] font-medium text-right">
                  {formatCurrency(item.unitPrice || 0)}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge variant="primary" size="xs">{item.gstRate ? `${item.gstRate}%` : "0%"}</Badge>
                </td>
                <td className="py-3 px-6 text-right text-[rgb(var(--color-text-primary))] font-bold">
                  {formatCurrency(item.totalAmount || (item.quantity || 0) * (item.unitPrice || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 flex flex-col md:flex-row justify-between items-start gap-8 border-t border-[rgb(var(--color-border-primary))]/30">
        {/* GST Breakdown Section */}
        <div className="w-full md:w-1/2">
          {gstBreakdown && (gstBreakdown.cgst > 0 || gstBreakdown.sgst > 0 || gstBreakdown.igst > 0) ? (
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest">Inward GST Summary</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 py-2">
                {gstBreakdown.cgst > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[rgb(var(--color-text-secondary))]">CGST:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-bold">{formatCurrency(gstBreakdown.cgst)}</span>
                  </div>
                )}
                {gstBreakdown.sgst > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[rgb(var(--color-text-secondary))]">SGST:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-bold">{formatCurrency(gstBreakdown.sgst)}</span>
                  </div>
                )}
                {gstBreakdown.igst > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[rgb(var(--color-text-secondary))]">IGST:</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-bold">{formatCurrency(gstBreakdown.igst)}</span>
                  </div>
                )}
                <div className="col-span-2 pt-2 border-t border-[rgb(var(--color-border-primary))]/20 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[rgb(var(--color-primary))] uppercase">Total Tax (ITC)</span>
                  <span className="text-sm text-[rgb(var(--color-primary))] font-black">{formatCurrency(gstBreakdown.total || itemsSummary?.gstAmount || 0)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Totals Section */}
        <div className="w-full md:w-1/3 py-2 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[rgb(var(--color-text-tertiary))] uppercase">Taxable Value:</span>
            <span className="font-bold text-[rgb(var(--color-text-primary))]">
              {formatCurrency(itemsSummary?.subtotal || itemsSummary?.taxableAmount || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[rgb(var(--color-text-tertiary))] uppercase">Total GST:</span>
            <span className="font-bold text-[rgb(var(--color-primary))]">
              {formatCurrency(itemsSummary?.gstAmount || 0)}
            </span>
          </div>
          <div className="pt-3 border-t border-[rgb(var(--color-border-primary))]/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[rgb(var(--color-text-primary))] uppercase tracking-tighter">Grand Total</span>
              <div className="text-xl font-black text-[rgb(var(--color-primary))] tracking-tighter">
                {formatCurrency(itemsSummary?.totalValue || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillItemsTable;
