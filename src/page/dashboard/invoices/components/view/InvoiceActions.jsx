"use client";

import { InvoiceActionsView } from "@dragorbit/features/invoices";
import { memo } from "react";
import OpenCustomerPaymentButton from "@/components/payment/OpenCustomerPaymentButton";
import SendInvoicePaymentLinkButton from "@/components/payment/SendInvoicePaymentLinkButton";
import { useTranslation } from "@/hooks/ui/useTranslation";
import InvoiceShareMenu from "../InvoiceShareMenu";

const InvoiceActions = ({
  invoiceData,
  storeId,
  onEditInvoice,
  onReleaseInvoice,
  onPrintInvoice,
  onDownloadPDF,
  onUpdatePaymentStatus,
  onCancelInvoice,
  formatCurrency,
  formatDate,
  formatDateTime,
}) => {
  const { t } = useTranslation();

  const isReleased = invoiceData?.invoiceStatus === "RELEASED";
  const isPaid = invoiceData?.paymentStatus === "PAID";

  const extraActions = (
    <div className="w-full flex flex-wrap items-center gap-2">
      {isReleased && !isPaid && (
        <>
          <OpenCustomerPaymentButton className="flex-1 h-8 text-[0.625rem] font-bold uppercase" />
          <SendInvoicePaymentLinkButton
            storeId={storeId}
            invoice={invoiceData}
            className="flex-1 h-8 text-[0.625rem] font-bold uppercase"
          />
        </>
      )}
      {onDownloadPDF && (
        <InvoiceShareMenu
          invoice={invoiceData}
          onDownloadPDF={onDownloadPDF}
          t={t}
        />
      )}
    </div>
  );

  return (
    <InvoiceActionsView
      invoiceData={invoiceData}
      onEditInvoice={onEditInvoice}
      onReleaseInvoice={onReleaseInvoice}
      onPrintInvoice={onPrintInvoice}
      onDownloadPDF={onDownloadPDF}
      onUpdatePaymentStatus={onUpdatePaymentStatus}
      onCancelInvoice={onCancelInvoice}
      extraActions={extraActions}
      formatCurrency={formatCurrency}
      formatDate={formatDate}
      formatDateTime={formatDateTime}
      t={t}
    />
  );
};

export default memo(InvoiceActions);
