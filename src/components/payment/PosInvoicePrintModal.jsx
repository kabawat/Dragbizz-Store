"use client";

import { memo, useMemo } from "react";
import { InvoicePrintModal } from "@dragorbit/features/invoices";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { pickStoreId } from "@/utils/store.util";

const PosInvoicePrintModal = ({ open, invoiceId, onClose }) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const signatures = useAppSelector((state) => state.signatures?.items || []);
  const storeId = useMemo(() => pickStoreId(selectedStore), [selectedStore]);

  return (
    <InvoicePrintModal
      open={open}
      invoiceId={invoiceId}
      selectedStore={selectedStore}
      signatures={signatures}
      fetchInvoice={async (id) => {
        const res = await invoiceService.getInvoices({ id, store: storeId });
        const raw = res?.data ?? res;
        return raw?.data ?? raw;
      }}
      onClose={onClose}
      onCreateNew={onClose}
      t={t}
    />
  );
};

export default memo(PosInvoicePrintModal);
