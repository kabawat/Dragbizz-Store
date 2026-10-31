"use client";

import { BillItemsListView } from "@dragorbit/features/bills";

const BillItemsTable = ({
  items,
  itemsSummary,
  formatCurrency,
  gstBreakdown,
}) => {
  return (
    <BillItemsListView
      items={items}
      itemsSummary={itemsSummary}
      formatCurrency={formatCurrency}
      gstBreakdown={gstBreakdown}
      title="Bill Line Items"
    />
  );
};

export default BillItemsTable;
