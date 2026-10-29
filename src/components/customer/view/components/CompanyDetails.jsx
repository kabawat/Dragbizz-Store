"use client";

import { useState } from "react";
import { Building2, Check, Copy, FileText } from "lucide-react";

const CompanyDetails = ({ companyDetails }) => {
  const [copiedGstin, setCopiedGstin] = useState(false);

  if (!companyDetails || (!companyDetails.companyName && !companyDetails.gstin)) {
    return null;
  }

  const handleCopyGstin = () => {
    if (!companyDetails.gstin || typeof window === "undefined" || !navigator?.clipboard) return;
    navigator.clipboard.writeText(companyDetails.gstin);
    setCopiedGstin(true);
    setTimeout(() => setCopiedGstin(false), 2000);
  };

  return (
    <div className="bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[rgb(var(--color-text-primary))]">
            Company & Business Details
          </h2>
          <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
            Organization name and tax identification
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {companyDetails.companyName && (
          <div className="p-4 rounded-xl border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/30">
            <p className="text-[11px] font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider mb-1">
              Company Name
            </p>
            <p className="text-base font-bold text-[rgb(var(--color-text-primary))] break-words">
              {companyDetails.companyName}
            </p>
          </div>
        )}

        {companyDetails.gstin && (
          <div className="p-4 rounded-xl border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/30 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider mb-1">
                GSTIN / Tax ID
              </p>
              <p className="text-base font-bold font-mono text-[rgb(var(--color-text-primary))] truncate">
                {companyDetails.gstin}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyGstin}
              className="p-2 rounded-lg text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors shrink-0"
              title="Copy GSTIN"
            >
              {copiedGstin ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
