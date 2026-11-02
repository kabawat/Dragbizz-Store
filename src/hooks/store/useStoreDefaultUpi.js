import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getStoreUpi } from "@/store/slices/storeUpiSlice";
import { isValidStoreId } from "@/utils/store.util";

export function resolveDefaultUpi(upiIds = []) {
  return upiIds.find((entry) => entry.isDefault === true) ?? null;
}

export function useStoreDefaultUpi(storeId, { enabled = true } = {}) {
  const dispatch = useAppDispatch();
  const cacheKey = storeId && isValidStoreId(String(storeId)) ? storeId : null;
  const upiData = useAppSelector((state) =>
    cacheKey ? state.storeUpi?.byStoreId?.[cacheKey] : null,
  );
  const isLoading = useAppSelector(
    (state) =>
      state.storeUpi?.loadingStoreId === storeId && state.storeUpi?.isLoading,
  );

  useEffect(() => {
    if (!enabled || !cacheKey) return;
    dispatch(getStoreUpi({ storeId: cacheKey, scope: "store", forceRefresh: true }));
  }, [enabled, cacheKey, dispatch]);

  const upiIds = upiData?.upiIds || [];
  const defaultUpi = resolveDefaultUpi(upiIds);
  const missingDefault = !isLoading && upiIds.length > 0 && !defaultUpi;
  const noUpiConfigured = !isLoading && upiIds.length === 0;

  return {
    defaultUpi,
    isLoading,
    missingDefault,
    noUpiConfigured,
    error: noUpiConfigured || missingDefault,
  };
}
