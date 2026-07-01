"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { buildSessionScope } from "@/utils/payment/paymentDisplaySession";
import { pickStoreId } from "@/utils/store.util";

export function usePaymentDisplayScope() {
  const { authProfile, selectedStore } = useAppSelector((state) => state.profile);

  const scope = useMemo(() => {
    const tenantId = authProfile?.tenant;
    const storeId = pickStoreId(selectedStore);
    const userId = authProfile?.id;
    return buildSessionScope({ tenantId, storeId, userId });
  }, [authProfile?.tenant, authProfile?.id, selectedStore]);

  const ready = Boolean(scope);

  return { scope, ready, tenantId: scope?.tenantId, storeId: scope?.storeId };
}

export default usePaymentDisplayScope;
