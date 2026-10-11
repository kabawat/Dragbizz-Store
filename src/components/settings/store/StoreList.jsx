"use client";
import { StoreListView } from "@dragorbit/features/settings";

import { Building2, Loader2, Plus } from "lucide-react";
import CopyableContactValue from "@/components/common/CopyableContactValue";
import { useTranslation } from "@/hooks/ui/useTranslation";

const StoreList = ({
  stores = [],
  isLoading = false,
  selectedStore,
  onAddStore,
  onEditStore,
  onDeleteStore,
  onShowCatalog,
  onManageUpi,
}) => {
  const { t } = useTranslation();
  const currentStoreId =
    selectedStore?._id || selectedStore?.id || selectedStore || null;

  // Handle edit store - open edit drawer
  const handleEditStore = (store) => {
    onEditStore?.(store);
  };

  // Handle delete store - open delete modal
  const handleDeleteStore = (storeId) => {
    if (!storeId) return;

    const store = stores.find((s) => (s._id || s.id) === storeId);
    onDeleteStore?.(store);
  };

  // Loading state
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

  // Empty state
  if (!isLoading && stores.length === 0) {
    return (
      <div className="backdrop-blur-[1px] rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-12 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--color-text-tertiary))]" />
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          {t("settings.noStoresFound")}
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
          {t("settings.getStartedByAddingFirstStore")}
        </p>
        <button
          onClick={onAddStore}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer mx-auto"
        >
          <Plus className="w-5 h-5" />
          {t("settings.addNewStore")}
        </button>
      </div>
    );
  }

  // Grid of store cards
  return (
    <StoreListView
      model={{
        catalogHost: typeof window !== "undefined" ? window.location.host : "",
        stores,
        currentStoreId,
        handleEditStore,
        handleDeleteStore,
        t,
        CopyableContactValue,
        onShowCatalog,
        onAddStore,
      }}
    />
  );
};

export default StoreList;
