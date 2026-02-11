"use client";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  Edit,
  Printer,
  Receipt,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

const InvoiceActionButtons = ({
  invoiceData,
  onEdit,
  onRelease,
  onPrint,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPrintMenu, setShowPrintMenu] = useState(false);

  return (
    <div className="mt-auto space-y-3 no-print action-buttons">
      {/* Main Status Actions or Total Amount */}
      {invoiceData?.invoiceStatus === "DRAFT" ? (
        <div className="flex gap-2 mb-3">
          <Button
            onClick={onEdit}
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            <span>{t("invoices.editInvoice")}</span>
          </Button>
          <Button
            onClick={onRelease}
            variant="success"
            className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t("invoices.releaseInvoice")}</span>
          </Button>
        </div>
      ) : (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-4 mb-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--color-primary))] mb-1">
              ₹{invoiceData.totalAmount?.toLocaleString()}
            </div>
            <div className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("invoices.totalAmount")}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Row - Only for non-drafts */}
      {invoiceData?.invoiceStatus !== "DRAFT" && (
        <div className="flex gap-2">
          {/* Template Settings */}
          <Button
            onClick={() => router.push("/dashboard/invoices/print-preview")}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium border-dashed"
          >
            <Settings className="w-4 h-4" />
            <span>{t("invoices.templateSettings")}</span>
          </Button>

          {/* Print Action */}
          <div className="flex-1 relative print-menu-container">
            <Button
              onClick={() => setShowPrintMenu(!showPrintMenu)}
              variant="primary"
              className="w-full flex items-center justify-center gap-2 h-10 text-sm font-medium text-white"
            >
              <Printer className="w-4 h-4" />
              <span>{t("invoices.print")}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${showPrintMenu ? "rotate-180" : ""}`}
              />
            </Button>

            {showPrintMenu && (
              <div className="absolute bottom-full right-0 w-64 mb-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-50 overflow-hidden print-menu-container">
                <button
                  onClick={() => {
                    onPrint("standard");
                    setShowPrintMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">{t("invoices.standardPrint")}</span>
                </button>
                <button
                  onClick={() => {
                    onPrint("mini");
                    setShowPrintMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors border-t border-[rgb(var(--color-border-primary))]"
                >
                  <Receipt className="w-4 h-4" />
                  <span className="text-sm">
                    {t("invoices.miniThermalPrint")}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceActionButtons;
