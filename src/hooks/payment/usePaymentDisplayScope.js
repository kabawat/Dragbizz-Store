"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { buildSessionScope } from "@/utils/payment/paymentDisplaySession";
import { pickStoreId } from "@/utils/store.util";

export function usePaymentDisplayScope() {
  const { authProfile, selectedStore } = useAppSelector((state) => state.profile);

  const scope = useMemo(() => {
    const tenantId = authProfile?.tenant || null;
    const storeId = pickStoreId(selectedStore);
    const userId = authProfile?._id || null;

    return buildSessionScope({ tenantId, storeId, userId });
  }, [authProfile?.tenant, authProfile?._id, selectedStore]);

  const ready = typeof window !== "undefined";

  return { scope, ready, tenantId: scope?.tenantId, storeId: scope?.storeId };
}

export default usePaymentDisplayScope;
