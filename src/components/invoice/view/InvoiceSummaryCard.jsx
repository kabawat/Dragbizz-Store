"use client";
import { ViewInvoiceSummaryCardPresentation } from "@dragorbit/features/invoices";

import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  getPaymentStatusColor,
  getStatusColor,
} from "@/utils/invoice/invoiceView.utils";

const InvoiceSummaryCard = ({
  invoiceData,
  calculatedSubtotal,
  calculatedGstAmount,
}) => {
  const { t } = useTranslation();

  return (
    <ViewInvoiceSummaryCardPresentation
      model={{
        invoiceData,
        getStatusColor,
        getPaymentStatusColor,
        t,
        calculatedSubtotal,
        calculatedGstAmount,
      }}
    />
  );
};

export default InvoiceSummaryCard;
