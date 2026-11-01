"use client";
import { Building2, Mail, Phone, Truck } from "lucide-react";

const BillSupplierInfo = ({ supplier }) => {
  return (
    <div className="w-full px-5 sm:px-6 py-4 border-b border-[rgb(var(--color-border-primary))]/30 bg-[rgb(var(--color-bg-secondary))]/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 min-w-0">
        {/* Left: Supplier Identity */}
        <div className="min-w-0 flex-1 flex items-start gap-3">
          <div className="p-2 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] rounded-lg hidden sm:flex items-center justify-center shrink-0 mt-0.5">
            <Truck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-bold text-[rgb(var(--color-text-primary))] truncate max-w-full">
              {supplier?.name || "Not Provided"}
            </h2>
            <p
              className="text-xs text-[rgb(var(--color-text-secondary))] font-medium truncate max-w-md"
              title={supplier?.address || "No official address on file"}
            >
              {supplier?.address || "No official address on file"}
            </p>
          </div>
        </div>

        {/* Right: Contact & Identity Grid */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-[rgb(var(--color-border-primary))]/20 min-w-0 shrink-0">
          <div className="min-w-0 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-tertiary))] shrink-0">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
                Phone
              </p>
              <p
                className="text-xs font-semibold text-[rgb(var(--color-text-primary))] truncate max-w-[120px] sm:max-w-[150px]"
                title={supplier?.phone || "N/A"}
              >
                {supplier?.phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="min-w-0 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-tertiary))] shrink-0">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
                Email
              </p>
              <p
                className="text-xs font-semibold text-[rgb(var(--color-text-primary))] lowercase truncate max-w-[140px] sm:max-w-[180px]"
                title={supplier?.email || "N/A"}
              >
                {supplier?.email || "N/A"}
              </p>
            </div>
          </div>

          {supplier?.gstNumber && (
            <div className="min-w-0 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
                  GSTIN
                </p>
                <p
                  className="text-xs font-bold text-[rgb(var(--color-primary))] font-mono tracking-wide truncate max-w-[140px]"
                  title={supplier.gstNumber}
                >
                  {supplier.gstNumber}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillSupplierInfo;
