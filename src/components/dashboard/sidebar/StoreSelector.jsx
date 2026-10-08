"use client";
import { StoreSelector as SharedStoreSelector } from "@dragorbit/ui/app";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedStore } from "@/store/slices/profileSlice";
import {
  buildSessionScope,
  clearPaymentDisplaySession,
} from "@/utils/payment/paymentDisplaySession";
import { pickStoreId } from "@/utils/store.util";

const StoreSelector = ({ isCollapsed, onStoreChange }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    stores: reduxStores,
    selectedStore,
    authProfile,
  } = useAppSelector((state) => state.profile);

  // Handle store selection
  const handleStoreSelect = (store) => {
    const currentStoreId = pickStoreId(selectedStore);
    const newStoreId = pickStoreId(store);

    if (currentStoreId === newStoreId) {
      return;
    }

    const previousScope = buildSessionScope({
      tenantId: authProfile?.tenant,
      storeId: currentStoreId,
      userId: authProfile?.id,
    });
    if (previousScope) clearPaymentDisplaySession(previousScope);

    dispatch(setSelectedStore(store));
    if (onStoreChange) {
      onStoreChange(store);
    }
    window.location.reload();
  };

  return (
    <SharedStoreSelector
      stores={reduxStores || []}
      selectedId={pickStoreId(selectedStore)}
      onChange={handleStoreSelect}
      isCollapsed={isCollapsed}
      busy={false}
      selectLabel={t("sidebar.selectStore")}
      unavailableLabel={t("common.notAvailable")}
      getId={pickStoreId}
      getName={(store) => store.storeName || store.name}
      getSubtitle={(store) => `GST: ${store.gst || t("common.notAvailable")}`}
    />
  );
};
export default StoreSelector;
