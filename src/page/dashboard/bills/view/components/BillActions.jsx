"use client";
import { Download, Edit, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";

const BillActions = ({
  billData,
  onEditBill,
  onDeleteBill,
  onDownloadPDF,
  formatCurrency,
  formatDate,
  formatDateTime,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]/60 overflow-hidden">
        {/* Actions Header */}
        <div className="p-5 border-b border-[rgb(var(--color-border-primary))]/30">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-tight">
              Bill Actions
            </h3>
          </div>
        </div>

        <div className="p-5 flex flex-row items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 h-8 font-bold text-[10px] uppercase px-2"
            onClick={onEditBill}
            leftIcon={Edit}
            size="sm"
          >
            Edit
          </Button>

          <Button
            variant="outline"
            className="flex-1 h-8 text-red-600 border-red-600/10 hover:bg-red-600/5 font-bold text-[10px] uppercase px-2"
            onClick={onDeleteBill}
            leftIcon={Trash2}
            size="sm"
          >
            Delete
          </Button>

          <Button
            variant="primary"
            className="flex-1 h-8 font-bold text-[10px] uppercase px-2"
            onClick={() => onDownloadPDF?.(billData)}
            leftIcon={Download}
            size="sm"
          >
            PDF
          </Button>
        </div>

        {/* Financial Summary Card */}
        <div className="px-5 pb-5">
          <div className="py-4 space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-tertiary))] mb-1">Total Outstanding</p>
                <h2 className="text-2xl font-black text-[rgb(var(--color-text-primary))] tracking-tighter">
                  {formatCurrency(billData.dueAmount)}
                </h2>
              </div>

              <div className="pt-4 border-t border-[rgb(var(--color-border-primary))]/20 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-[rgb(var(--color-text-tertiary))] mb-0.5">Bill Total</p>
                  <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{formatCurrency(billData.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-[rgb(var(--color-text-tertiary))] mb-0.5">Tax (ITC)</p>
                  <p className="text-sm font-bold text-[rgb(var(--color-primary))]">{formatCurrency(billData.gstAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 pt-0 space-y-3">
          <div className="pt-3 border-t border-[rgb(var(--color-border-primary))]/30 space-y-1.5">
            <div className="flex justify-between text-[10px] text-[rgb(var(--color-text-tertiary))]">
              <span className="font-bold uppercase">Created</span>
              <span className="font-medium">{formatDate(billData.createdAt)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[rgb(var(--color-text-tertiary))]">
              <span className="font-bold uppercase">Updated</span>
              <span className="font-medium">{formatDateTime(billData.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log / Note section */}
      <div className="p-5 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-3">
        <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
          <Edit className="w-4 h-4 text-orange-600" />
        </div>
        <p className="text-[10px] leading-relaxed text-orange-800 dark:text-orange-200 font-medium">
          Audit Logs: This document is digitally signed and any changes made will be recorded in the system audit trail.
        </p>
      </div>
    </div>
  );
};

export default BillActions;
