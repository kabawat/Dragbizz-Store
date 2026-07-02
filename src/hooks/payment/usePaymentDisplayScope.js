"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { buildSessionScope } from "@/utils/payment/paymentDisplaySession";
import { pickStoreId } from "@/utils/store.util";

export function usePaymentDisplayScope() {
  const { authProfile, selectedStore } = useAppSelector((state) => state.profile);

  const scope = useMemo(() => {
    const tenantId =
      authProfile?.tenantId ||
      authProfile?.tenant ||
      authProfile?.tenant?.id ||
      authProfile?.organization?.id ||
      authProfile?.orgId ||
      null;

    const storeId =
      pickStoreId(selectedStore) ||
      authProfile?.storeId ||
      authProfile?.store?.id ||
      authProfile?.store?._id ||
      null;

    const userId =
      authProfile?.id ||
      authProfile?.userId ||
      authProfile?._id ||
      authProfile?.user?.id ||
      authProfile?.user?._id ||
      null;

    return buildSessionScope({ tenantId, storeId, userId });
  }, [
    authProfile?.tenantId,
    authProfile?.tenant,
    authProfile?.organization?.id,
    authProfile?.orgId,
    authProfile?.storeId,
    authProfile?.store?.id,
    authProfile?.store?._id,
    authProfile?.id,
    authProfile?.userId,
    authProfile?._id,
    authProfile?.user?.id,
    authProfile?.user?._id,
    selectedStore,
  ]);

  const ready = typeof window !== "undefined";

  return { scope, ready, tenantId: scope?.tenantId, storeId: scope?.storeId };
}

export default usePaymentDisplayScope;
