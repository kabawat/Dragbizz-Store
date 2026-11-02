"use client";

import { InvoiceBatchesView } from "@dragorbit/features/invoices";
import { memo } from "react";

const InvoiceBatches = ({ batches, formatCurrency }) => {
  return (
    <InvoiceBatchesView batches={batches} formatCurrency={formatCurrency} />
  );
};

export default memo(InvoiceBatches);
