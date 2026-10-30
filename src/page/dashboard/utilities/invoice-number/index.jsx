"use client";
import { memo } from "react";
import { InvoiceNumberSettings } from "@/components/settings";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

const InvoiceNumberUtilityPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("invoiceNumber.title") || "Invoice Number Format",
    t("invoiceNumber.description") ||
      "Configure invoice numbering sequence, prefix, and date format"
  );

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
      <div className="w-full h-full overflow-y-auto custom-scrollbar">
        <InvoiceNumberSettings />
      </div>
    </div>
  );
};

export default memo(InvoiceNumberUtilityPage);
