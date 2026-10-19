"use client";
import { EmptyState, TableSkeleton } from "@dragorbit/ui";
import { GatewayListView } from "@dragorbit/features/integrations";

import { CreditCard, Plus } from "lucide-react";
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

  if (isLoading && gateways.length === 0) {
    return (
      <TableSkeleton />
    );
  }

  if (!isLoading && gateways.length === 0) {
    return <EmptyState fullHeight icon={CreditCard} title={t("settings.paymentGateway.noGateways")} description={t("settings.paymentGateway.addFirstGatewayDescription")} actionButton={canCreate ? { label: t("settings.paymentGateway.addGateway"), onClick: onAddGateway, icon: Plus } : null} />;
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
