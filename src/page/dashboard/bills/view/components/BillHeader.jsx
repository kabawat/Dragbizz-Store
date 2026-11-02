"use client";
import { CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui";

const BillHeader = ({ billData, formatDate }) => {
  return (
    <div className="px-6 py-5 border-b border-[rgb(var(--color-border-primary))]/30">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-[rgb(var(--color-primary))]/10 rounded-lg hidden sm:block">
            <CheckCircle2 className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          </div>
          <div className="space-y-1">
            <p className="text-[0.625rem] uppercase tracking-[0.3em] font-bold text-[rgb(var(--color-text-tertiary))]">
              Supplier Bill
            </p>
            <h1 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
              #{billData.billNumber || "N/A"}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgb(var(--color-text-secondary))]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Issued: {formatDate(billData.billDate)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BillHeader;
