"use client";
import { GatewayListView } from "@dragorbit/features/integrations";

import { CreditCard, Loader2, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { pickStoreId } from "@/utils/store.util";
import { maskCredentialDisplay } from "@/constants/paymentGateway.config";

const GatewayList = ({
  gateways = [],
  stores = [],
  isLoading = false,
  onAddGateway,
  onEditGateway,
  onDeleteGateway,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}) => {
  const { t } = useTranslation();

  const getStoreNames = (storeIds = []) => {
    if (!storeIds.length || !stores.length) return "-";
    return (
      storeIds
        .map((storeId) => {
          const store = stores.find(
            (entry) => pickStoreId(entry) === String(storeId),
          );
          return store?.storeName ?? storeId;
        })
        .filter(Boolean)
        .join(", ") || "-"
    );
  };

  const getMaskedIdentifier = (gateway) => {
    const fields = gateway.credentials?.fields || {};
    const raw = fields.keyId || fields.merchantId || fields.appId;
    if (raw) return maskCredentialDisplay(raw);
    if ((gateway.credentials?.secretsConfigured?.length ?? 0) > 0) {
      return t("settings.paymentGateway.credentialsConfigured");
    }
    return t("settings.paymentGateway.credentialsConfigured");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-primary))]" />
          <span className="text-sm text-[rgb(var(--color-text-secondary))]">
            {t("settings.loadingStores")}
          </span>
        </div>
      </div>
    );
  }

  if (!isLoading && gateways.length === 0) {
    return (
      <div className="backdrop-blur-[1px] rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-12 text-center">
        <CreditCard className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--color-text-tertiary))]" />
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          {t("settings.paymentGateway.noGateways")}
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
          {t("settings.paymentGateway.addFirstGatewayDescription")}
        </p>
        {canCreate && (
          <button
            onClick={onAddGateway}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer mx-auto"
          >
            <Plus className="w-5 h-5" />
            {t("settings.paymentGateway.addGateway")}
          </button>
        )}
      </div>
    );
  }

  return (
    <GatewayListView
      model={{
        gateways,
        t,
        canEdit,
        onEditGateway,
        canDelete,
        onDeleteGateway,
        getMaskedIdentifier,
        getStoreNames,
        canCreate,
        onAddGateway,
      }}
    />
  );
};

export default GatewayList;
