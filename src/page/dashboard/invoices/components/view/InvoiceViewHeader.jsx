"use client";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Edit,
  Plus,
  Printer,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { memo, useCallback } from "react";
import InvoiceShareMenu from "../InvoiceShareMenu";
import OpenCustomerPaymentButton from "@/components/payment/OpenCustomerPaymentButton";
import SendInvoicePaymentLinkButton from "@/components/payment/SendInvoicePaymentLinkButton";
import { Button } from "@/components/ui";

const InvoiceViewHeader = ({
  invoiceData,
  invoiceId,
  storeId,
  onUpdatePaymentStatus,
  onDownloadPDF,
  onEdit,
  onRelease,
  onPrint,
  canCreate,
  t,
}) => {
  const handleDownload = useCallback(() => {
    onDownloadPDF?.(invoiceData, invoiceId);
  }, [onDownloadPDF, invoiceData, invoiceId]);

  const isDraft = invoiceData?.invoiceStatus === "DRAFT";
  const isReleased = invoiceData?.invoiceStatus === "RELEASED";
  const isPaid = invoiceData?.paymentStatus === "PAID";

  return (
    <div className="mb-4 no-print flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Invoices</span>
      </Link>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
        <OpenCustomerPaymentButton className="h-9" />
        {isDraft && onEdit && (
          <Button
            variant="outline"
            onClick={onEdit}
            leftIcon={Edit}
            className="h-9"
          >
            {t("invoices.editInvoice")}
          </Button>
        )}
        {isDraft && onRelease && (
          <Button
            variant="success"
            onClick={onRelease}
            leftIcon={CheckCircle}
            className="h-9"
          >
            {t("invoices.releaseInvoice")}
          </Button>
        )}
        {!isDraft && (
          <>
            <Link href="/dashboard/invoices/print-preview">
              <Button variant="outline" leftIcon={Settings} className="h-9">
                {t("invoices.templateSettings")}
              </Button>
            </Link>
            {onPrint && (
              <Button
                variant="primary"
                onClick={onPrint}
                leftIcon={Printer}
                className="h-9"
              >
                {t("invoices.print")}
              </Button>
            )}
          </>
        )}
        {isReleased && !isPaid && (
          <>
            <SendInvoicePaymentLinkButton
              storeId={storeId}
              invoice={invoiceData}
              className="h-9"
            />
            <Button
              variant="outline"
              onClick={onUpdatePaymentStatus}
              leftIcon={CreditCard}
              className="h-9"
            >
              {t("invoice.updatePaymentStatus")}
            </Button>
          </>
        )}
        {!isDraft && (
          <InvoiceShareMenu
            invoice={invoiceData}
            onDownloadPDF={handleDownload}
            t={t}
          />
        )}
        {canCreate && (
          <Link href="/dashboard/invoices/create">
            <Button variant="primary" leftIcon={Plus} className="h-9">
              {t("invoice.createNewInvoice") || "Create New Invoice"}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default memo(InvoiceViewHeader);
