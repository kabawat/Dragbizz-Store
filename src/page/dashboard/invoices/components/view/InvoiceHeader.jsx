"use client";

import { InvoiceHeaderView } from "@dragorbit/features/invoices";
import { memo } from "react";
import {
  getPaymentStatusColor,
  getStatusColor,
} from "@/page/dashboard/invoices/utils/invoiceView.utils";

const InvoiceHeader = ({ invoiceData, formatDate }) => {
  return (
    <InvoiceHeaderView
      invoiceData={invoiceData}
      formatDate={formatDate}
      getStatusColor={getStatusColor}
      getPaymentStatusColor={getPaymentStatusColor}
    />
  );
};

export default memo(InvoiceHeader);
