"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { isValidStoreId, pickStoreId } from "@/utils/store.util";

/**
 * Returns the active store id only after profile bootstrap finished
 * and the id is a valid MongoDB ObjectId string.
 */
export function useSelectedStoreId() {
  const { selectedStore, stores, isInitialized, isLoading } = useAppSelector(
    (state) => state.profile
  );

  const storeId = useMemo(() => pickStoreId(selectedStore), [selectedStore]);

  const ready =
    isInitialized &&
    !isLoading &&
    isValidStoreId(storeId) &&
    Array.isArray(stores) &&
    stores.length > 0;

  return {
    storeId: ready ? storeId : null,
    ready,
    selectedStore,
    stores,
    isInitialized,
    isLoading,
  };
}

export default useSelectedStoreId;
