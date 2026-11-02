"use client";

import { InvoiceCustomerInfoView } from "@dragorbit/features/invoices";
import { memo } from "react";

const InvoiceCustomerInfo = ({ customer, invoiceData }) => {
  return (
    <InvoiceCustomerInfoView customer={customer} invoiceData={invoiceData} />
  );
};

export default memo(InvoiceCustomerInfo);
