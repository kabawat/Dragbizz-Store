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
  onDeleteInvoice,
  onPrintInvoice,
  onDownloadPDF,
  onPrintAndSave,
  onCreateNewInvoice,
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
    <div className="w-full flex flex-col gap-2">
      {isReleased && !isPaid && (
        <div className="flex items-center gap-2 w-full">
          <OpenCustomerPaymentButton className="flex-1 h-8 text-[0.625rem] font-bold uppercase" />
          <SendInvoicePaymentLinkButton
            storeId={storeId}
            invoice={invoiceData}
            className="flex-1 h-8 text-[0.625rem] font-bold uppercase"
          />
        </div>
      )}
      <div className="w-full">
        <InvoiceShareMenu
          invoice={invoiceData}
          onDownloadPDF={onDownloadPDF}
          className="w-full"
          buttonClassName="w-full h-8 text-[0.625rem] font-bold uppercase"
          align="left"
          t={t}
        />
      </div>
    </div>
  );

  return (
    <InvoiceActionsView
      invoiceData={invoiceData}
      onEditInvoice={onEditInvoice}
      onReleaseInvoice={onReleaseInvoice}
      onDeleteInvoice={onDeleteInvoice}
      onPrintInvoice={onPrintInvoice}
      onDownloadPDF={onDownloadPDF}
      onPrintAndSave={onPrintAndSave}
      onCreateNewInvoice={onCreateNewInvoice}
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
