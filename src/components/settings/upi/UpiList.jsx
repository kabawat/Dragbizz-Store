"use client";
import { EmptyState, TableSkeleton } from "@dragorbit/ui";
import { UpiListView } from "@dragorbit/features/integrations";

import { Plus, Wallet } from "lucide-react";
import React from "react";
import { UpiQrModal } from "@/components/common";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { copyToClipboard } from "@/utils/clipboard";
import { pickStoreId } from "@/utils/store.util";

const COPIED_DURATION_MS = 2500;

const UpiList = ({
  upiIds = [],
  stores = [],
  isLoading = false,
  onAddUpi,
  onEditUpi,
  onDeleteUpi,
}) => {
  const { t } = useTranslation();
  const [qrModalItem, setQrModalItem] = React.useState(null);
  const [copiedUpiId, setCopiedUpiId] = React.useState(null);

  const getStoreNames = (storeIds = []) => {
    if (!storeIds.length || !stores.length) return "-";
    return (
      storeIds
        .map((storeId) => {
          const store = stores.find(
            (entry) => pickStoreId(entry) === String(storeId),
          );
          return store?.storeName ?? storeId;
        })
        .filter(Boolean)
        .join(", ") || "-"
    );
  };

  const handleCopyUpi = async (upiId, itemId) => {
    const ok = await copyToClipboard(upiId);
    if (ok) {
      setCopiedUpiId(itemId);
      setTimeout(() => setCopiedUpiId(null), COPIED_DURATION_MS);
    }
  };

  if (isLoading && upiIds.length === 0) {
    return (
      <TableSkeleton />
    );
  }

  if (!isLoading && upiIds.length === 0) {
    return <EmptyState fullHeight icon={Wallet} title={t("settings.upi.noUpiAdded")} description={t("settings.upi.addFirstUpiDescription")} actionButton={true ? { label: t("settings.upi.addNewUpi"), onClick: onAddUpi, icon: Plus } : null} />;
  }

  return (
    <UpiListView
      model={{
        upiIds,
        t,
        onEditUpi,
        onDeleteUpi,
        getStoreNames,
        handleCopyUpi,
        copiedUpiId,
        setQrModalItem,
        onAddUpi,
        UpiQrModal,
        qrModalItem,
      }}
    />
  );
};

export default UpiList;
