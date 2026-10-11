"use client";
import { UpiListView } from "@dragorbit/features/integrations";

import { Loader2, Plus, Wallet } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-primary))]" />
          <span className="text-sm text-[rgb(var(--color-text-secondary))]">
            {t("settings.loadingStores")}
          </span>
        </div>
      </div>
    );
  }

  if (!isLoading && upiIds.length === 0) {
    return (
      <div className="backdrop-blur-[1px] rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-12 text-center">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--color-text-tertiary))]" />
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          {t("settings.upi.noUpiAdded")}
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
          {t(
            "settings.upi.addFirstUpiDescription",
            "Add your first UPI ID to accept payments",
          )}
        </p>
        <button
          type="button"
          onClick={onAddUpi}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer mx-auto"
        >
          <Plus className="w-5 h-5" />
          {t("settings.upi.addNewUpi")}
        </button>
      </div>
    );
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
