"use client";
import { ToastProvider as SharedToastProvider } from "@dragorbit/ui/app";
import { useCallback } from "react";

export { useGlobalToast } from "@dragorbit/ui/app";

import { useAppSelector } from "@/store/hooks";
import {
  consumePendingStoreIdToastSuppress,
  shouldSuppressStoreIdToast,
} from "@/utils/bootstrapStoreGuard";
import { isValidStoreId, pickStoreId } from "@/utils/store.util";

const STORE_ID_ERROR = /invalid or missing store id/i;

export function ToastProvider({ children }) {
  const { isInitialized, isLoading, selectedStore, stores } = useAppSelector(
    (state) => state.profile
  );
  const storeBootstrapReady =
    isInitialized &&
    !isLoading &&
    isValidStoreId(pickStoreId(selectedStore)) &&
    Array.isArray(stores) &&
    stores.length > 0;

  const shouldShowError = useCallback(
    (message) => {
      if (
        STORE_ID_ERROR.test(String(message || "")) &&
        shouldSuppressStoreIdToast({ storeBootstrapReady })
      ) {
        consumePendingStoreIdToastSuppress();
        return false;
      }
      return true;
    },
    [storeBootstrapReady]
  );
  return (
    <SharedToastProvider shouldShowError={shouldShowError}>
      {children}
    </SharedToastProvider>
  );
}
