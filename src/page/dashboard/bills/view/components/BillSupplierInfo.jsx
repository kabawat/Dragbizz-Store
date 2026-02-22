"use client";
import { FileText, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui";

const BillSupplierInfo = ({ supplier }) => {
  return (
    <div className="w-full px-6 py-4 border-b border-[rgb(var(--color-border-primary))]/30 bg-[rgb(var(--color-bg-secondary))]/5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-12">
        {/* Left: Supplier Identity */}
        <div className="min-w-0 flex-1 flex items-start gap-4">
          <div className="w-1.5 h-10 bg-[rgb(var(--color-primary))]/20 rounded-full mt-1 hidden sm:block" />
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[rgb(var(--color-text-primary))]">
              {supplier?.name || "Not Provided"}
            </h2>
            <p className="text-xs text-[rgb(var(--color-text-secondary))] font-medium line-clamp-1 max-w-xl">
              {supplier?.address || "No official address on file"}
            </p>
          </div>
        </div>

        {/* Right: Contact & Identity Grid */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest">Phone</p>
              <p className="text-xs font-bold text-[rgb(var(--color-text-primary))]">{supplier?.phone || "N/A"}</p>
            </div>
            <div className="h-6 w-px bg-[rgb(var(--color-border-primary))]/40 hidden sm:block" />
          </div>

          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest">Email</p>
              <p className="text-xs font-bold text-[rgb(var(--color-text-primary))] lowercase">{supplier?.email || "N/A"}</p>
            </div>
            <div className="h-6 w-px bg-[rgb(var(--color-border-primary))]/40 hidden sm:block" />
          </div>

          {supplier?.gstNumber && (
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-widest">GSTIN</p>
              <p className="text-xs font-black text-[rgb(var(--color-primary))] tracking-wide">{supplier.gstNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillSupplierInfo;
