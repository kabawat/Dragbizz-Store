"use client";
import { EmptyState, TableSkeleton } from "@dragorbit/ui";
import { StoreListView } from "@dragorbit/features/settings";

import { Building2, Plus } from "lucide-react";
import CopyableContactValue from "@/components/common/CopyableContactValue";
import { useTranslation } from "@/hooks/ui/useTranslation";

const StoreList = ({
  stores = [],
  isLoading = false,
  selectedStore,
  onAddStore,
  canAddStore = true,
  storeLimit = null,
  onEditStore,
  onDeleteStore,
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
  if (isLoading && stores.length === 0) {
    return (
      <TableSkeleton />
    );
  }

  // Empty state
  if (!isLoading && stores.length === 0) {
    return <EmptyState fullHeight icon={Building2} title={t("settings.noStoresFound")} description={t("settings.getStartedByAddingFirstStore")} actionButton={true ? { label: t("settings.addNewStore"), onClick: onAddStore, icon: Plus } : null} />;
  }

  // Grid of store cards
  return (
    <StoreListView
      model={{
        stores,
        currentStoreId,
        handleEditStore,
        handleDeleteStore,
        t,
        CopyableContactValue,
        onAddStore,
        canAddStore,
        storeLimit,
      }}
    />
  );
};

export default StoreList;
