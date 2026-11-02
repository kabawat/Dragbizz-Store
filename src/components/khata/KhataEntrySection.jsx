"use client";
import { KhataEntrySectionPresentation } from "@dragorbit/features/khata";

import { useKhataEntry } from "@/hooks/khata/useKhataEntry";
import KhataRecordTransaction from "./KhataRecordTransaction";

export function KhataEntrySection({
  storeId,
  customerId,
  customerName,
  customerAccountId,
  onSuccess,
  autoFocusAmount = false,
  disabled = false,
  collectActions = null,
  hideHeader = false,
  variant = "card",
}) {
  const { loading, error, recordYouGave, recordYouGot, clearError } =
    useKhataEntry({
      storeId,
      customerId,
      customerName,
      customerAccountId,
      onSuccess,
    });

  return (
    <KhataEntrySectionPresentation
      model={{
        KhataRecordTransaction,
        customerId,
        disabled,
        loading,
        error,
        recordYouGave,
        recordYouGot,
        clearError,
        autoFocusAmount,
        collectActions,
        hideHeader,
        variant,
      }}
    />
  );
}

export default KhataEntrySection;
