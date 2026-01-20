"use client";
import { FileText, Mail, Phone } from "lucide-react";

const BillSupplierInfo = ({ supplier }) => {
  return (
    <div className="px-6 py-6 space-y-4">
      <p className="text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--color-text-tertiary))]">
        Bill To
      </p>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            {supplier?.name || "Not Provided"}
          </p>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            {supplier?.address || "No address on file"}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-[rgb(var(--color-text-secondary))]">
          <div className="space-y-1">
            <p className="text-[rgb(var(--color-text-tertiary))] uppercase text-[11px] tracking-[0.3em]">
              Phone
            </p>
            <p className="font-medium flex items-center gap-2 text-[rgb(var(--color-text-primary))]">
              <Phone className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
              {supplier?.phone || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[rgb(var(--color-text-tertiary))] uppercase text-[11px] tracking-[0.3em]">
              Email
            </p>
            <p className="font-medium flex items-center gap-2 text-[rgb(var(--color-text-primary))]">
              <Mail className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
              {supplier?.email || "N/A"}
            </p>
          </div>
          {supplier?.gstNumber && (
            <div className="space-y-1 sm:col-span-2">
              <p className="text-[rgb(var(--color-text-tertiary))] uppercase text-[11px] tracking-[0.3em]">
                GST Number
              </p>
              <p className="font-medium flex items-center gap-2 text-[rgb(var(--color-text-primary))]">
                <FileText className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                {supplier.gstNumber}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillSupplierInfo;
