"use client";

import { InvoiceNotesView } from "@dragorbit/features/invoices";
import { memo } from "react";

const InvoiceNotes = ({ notes, terms, cancellationReason }) => {
  return (
    <InvoiceNotesView
      notes={notes}
      terms={terms}
      cancellationReason={cancellationReason}
    />
  );
};

export default memo(InvoiceNotes);
