"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
  const isGatewayLoading = useAppSelector(
    (state) =>
      state.storePaymentGateway?.loadingStoreId === storeId &&
      state.storePaymentGateway?.isLoading,
  );

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
        dispatch(getStorePaymentGateways({ storeId, scope: "agency", forceRefresh: true }));
      }
    },
    [dispatch, showSuccess, storeId],
  );

  if (!storeReady || permLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
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
    return (
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-12 text-center">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          {t("settings.noStoresFound")}
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
          {t("settings.getStartedByAddingFirstStore")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GatewayHeader
        gatewayCount={gateways.length}
        isLoading={isGatewayLoading}
        onAddGateway={handleAddGateway}
        canCreate={canCreate}
      />
      <GatewayList
        gateways={gateways}
        stores={stores}
        isLoading={isGatewayLoading}
        onAddGateway={handleAddGateway}
        onEditGateway={handleEditGateway}
        onDeleteGateway={handleDeleteGateway}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {canCreate && (
        <GatewayAddDrawer
          isOpen={isAddDrawerOpen}
          storeId={storeId}
          stores={stores}
          onClose={() => setIsAddDrawerOpen(false)}
          onSuccess={handleMutationSuccess}
          onError={showError}
        />
      )}

      {canEdit && (
        <GatewayEditDrawer
          isOpen={isEditDrawerOpen}
          storeId={storeId}
          editingGateway={editingGateway}
          stores={stores}
          onClose={() => {
            setIsEditDrawerOpen(false);
            setEditingGateway(null);
          }}
          onSuccess={handleMutationSuccess}
          onError={showError}
        />
      )}

      {canDelete && (
        <GatewayDeleteModal
          isOpen={isDeleteModalOpen}
          gatewayToDelete={gatewayToDelete}
          storeId={storeId}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setGatewayToDelete(null);
          }}
          onSuccess={handleMutationSuccess}
          onError={showError}
        />
      )}
    </div>
  );
};

export default ManagePaymentGatewaySettings;
