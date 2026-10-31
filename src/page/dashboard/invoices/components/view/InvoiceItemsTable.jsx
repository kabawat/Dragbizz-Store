"use client";

import { InvoiceItemsTableView } from "@dragorbit/features/invoices";
import { memo } from "react";

const InvoiceItemsTable = ({
  items,
  itemsSummary,
  gstBreakdown,
  formatCurrency,
}) => {
  return (
    <InvoiceItemsTableView
      items={items}
      itemsSummary={itemsSummary}
      gstBreakdown={gstBreakdown}
      formatCurrency={formatCurrency}
    />
  );
};

export default memo(InvoiceItemsTable);
