"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  CheckCircle,
  Printer,
  Download,
  BookOpen,
  Receipt,
  ChevronDown,
  Settings,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

const InvoiceActionButtons = ({
  invoiceData,
  onEdit,
  onRelease,
  onUpdatePaymentStatus,
  onDownloadPDF,
  onPrint,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPrintMenu, setShowPrintMenu] = useState(false);

  return (
    <div className="mt-auto space-y-3 no-print action-buttons">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={onDownloadPDF}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>{t("invoices.downloadPDF")}</span>
          </Button>

          <div className="relative print-menu-container flex-1">
            <Button
              onClick={() => setShowPrintMenu(!showPrintMenu)}
              variant="primary"
              className="w-full flex items-center justify-center gap-2 h-10 text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              <span>{t("invoices.print")}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${showPrintMenu ? "rotate-180" : ""}`}
              />
            </Button>

            {showPrintMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-50 overflow-hidden print-menu-container">
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

        <Button
          onClick={() => router.push("/dashboard/invoices/print-preview")}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 h-10 text-sm font-medium"
        >
          <Settings className="w-4 h-4" />
          <span>{t("invoices.templateSettings")}</span>
        </Button>
      </div>

      {invoiceData?.invoiceStatus === "DRAFT" ? (
        <div className="flex gap-2">
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
        <>
          {invoiceData?.invoiceStatus === "RELEASED" &&
            onUpdatePaymentStatus && (
              <Button
                onClick={onUpdatePaymentStatus}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-10 text-sm font-medium mb-3"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t("invoices.updatePaymentStatus")}</span>
              </Button>
            )}
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[rgb(var(--color-primary))] mb-1">
                ₹{invoiceData.totalAmount?.toLocaleString()}
              </div>
              <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                {t("invoices.totalAmount")}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceActionButtons;
