"use client";
import {
  CheckCircle,
  Edit,
  Printer,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const InvoiceActionButtons = ({
  invoiceData,
  onEdit,
  onRelease,
  onPrint,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const isDraft = invoiceData?.invoiceStatus === "DRAFT";

  return (
    <div className="mt-auto space-y-3 no-print action-buttons">
      {/* Main Status Actions or Total Amount */}
      {isDraft ? (
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
              ₹{invoiceData?.totalAmount?.toLocaleString()}
            </div>
            <div className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("invoices.totalAmount")}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Row - Only for non-drafts */}
      {!isDraft && (
        <div className="flex flex-col gap-2">
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
            <Button
              onClick={() => onPrint()}
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium text-white"
            >
              <Printer className="w-4 h-4" />
              <span>{t("invoices.print")}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceActionButtons;
