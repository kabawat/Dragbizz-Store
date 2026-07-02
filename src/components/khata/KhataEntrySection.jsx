"use client";

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
  const { loading, error, recordYouGave, recordYouGot, clearError } = useKhataEntry({
    storeId,
    customerId,
    customerName,
    customerAccountId,
    onSuccess,
  });

  return (
    <KhataRecordTransaction
      customerId={customerId}
      disabled={disabled}
      loading={loading}
      error={error}
      onYouGave={recordYouGave}
      onYouGot={recordYouGot}
      onClearError={clearError}
      autoFocusAmount={autoFocusAmount}
      footer={collectActions}
      hideHeader={hideHeader}
      variant={variant}
    />
  );
}

export default KhataEntrySection;
