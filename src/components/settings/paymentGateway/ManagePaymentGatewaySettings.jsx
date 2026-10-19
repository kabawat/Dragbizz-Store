"use client";
import { EmptyState, TableSkeleton } from "@dragorbit/ui";
import { ManagePaymentGatewaySettingsView } from "@dragorbit/features/integrations";

import { useCallback, useEffect, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getStorePaymentGateways } from "@/store/slices/storePaymentGatewaySlice";
import GatewayHeader from "./GatewayHeader";
import GatewayList from "./GatewayList";
import GatewayAddDrawer from "./GatewayAddDrawer";
import GatewayEditDrawer from "./GatewayEditDrawer";
import GatewayDeleteModal from "./GatewayDeleteModal";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";

const ManagePaymentGatewaySettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useGlobalToast();
  const { can, loading: permLoading } = useModulePermissions("store");
  const { stores } = useAppSelector((state) => state.profile);
  const { storeId, ready: storeReady } = useSelectedStoreId();

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gatewayToDelete, setGatewayToDelete] = useState(null);

  const agencyKey = storeId ? `agency_${storeId}` : null;
  const gatewayData = useAppSelector((state) =>
    agencyKey ? state.storePaymentGateway?.byStoreId?.[agencyKey] : null,
  );
  const gateways = gatewayData?.gateways || [];
  const requestLoading = useAppSelector(
    (state) =>
      state.storePaymentGateway?.loadingStoreId === storeId &&
      state.storePaymentGateway?.isLoading,
  );
  const requestError = useAppSelector((state) => state.storePaymentGateway?.error);
  const isGatewayLoading = requestLoading || (!gatewayData && !requestError);

  const canRead = can("read");
  const canCreate = can("create");
  const canEdit = can("edit");
  const canDelete = can("delete");

  useEffect(() => {
    if (storeReady && storeId && canRead && !permLoading) {
      dispatch(getStorePaymentGateways({ storeId, scope: "agency" }));
    }
  }, [storeReady, storeId, dispatch, canRead, permLoading]);

  const handleAddGateway = () => {
    if (canCreate) setIsAddDrawerOpen(true);
  };
  const handleEditGateway = (item) => {
    if (canEdit) {
      setEditingGateway(item);
      setIsEditDrawerOpen(true);
    }
  };
  const handleDeleteGateway = (item) => {
    if (canDelete) {
      setGatewayToDelete(item);
      setIsDeleteModalOpen(true);
    }
  };

  const handleMutationSuccess = useCallback(
    (message) => {
      showSuccess(message);
      if (storeId) {
        dispatch(
          getStorePaymentGateways({
            storeId,
            scope: "agency",
            forceRefresh: true,
          }),
        );
      }
    },
    [dispatch, showSuccess, storeId],
  );

  if (!storeReady || permLoading) {
    return (
      <TableSkeleton />
    );
  }

  if (!canRead) {
    return (
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-12 text-center">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          {t("settings.paymentGateway.noPermission")}
        </h3>
      </div>
    );
  }

  if (stores.length === 0) {
    return <EmptyState fullHeight title={t("settings.noStoresFound")} description={t("settings.getStartedByAddingFirstStore")} />;
  }

  if (requestError && !gatewayData) return <EmptyState fullHeight type="error" title={t("common.error")} description={String(requestError)} />;

  return (
    <ManagePaymentGatewaySettingsView
      model={{
        GatewayHeader,
        gateways,
        isGatewayLoading,
        handleAddGateway,
        canCreate,
        GatewayList,
        stores,
        handleEditGateway,
        handleDeleteGateway,
        canEdit,
        canDelete,
        GatewayAddDrawer,
        isAddDrawerOpen,
        storeId,
        setIsAddDrawerOpen,
        handleMutationSuccess,
        showError,
        GatewayEditDrawer,
        isEditDrawerOpen,
        editingGateway,
        setIsEditDrawerOpen,
        setEditingGateway,
        GatewayDeleteModal,
        isDeleteModalOpen,
        gatewayToDelete,
        setIsDeleteModalOpen,
        setGatewayToDelete,
      }}
    />
  );
};

export default ManagePaymentGatewaySettings;
