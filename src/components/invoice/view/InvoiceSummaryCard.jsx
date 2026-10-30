"use client";
import { ViewInvoiceSummaryCardPresentation } from "@dragorbit/features/invoices";
import { memo, useMemo } from "react";
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

  const model = useMemo(
    () => ({
      invoiceData,
      getStatusColor,
      getPaymentStatusColor,
      t,
      calculatedSubtotal,
      calculatedGstAmount,
    }),
    [invoiceData, t, calculatedSubtotal, calculatedGstAmount]
  );

  return <ViewInvoiceSummaryCardPresentation model={model} />;
};

export default memo(InvoiceSummaryCard);
