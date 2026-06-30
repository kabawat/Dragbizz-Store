"use client";

import { CreditCard, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
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
          const store = stores.find((entry) => pickStoreId(entry) === String(storeId));
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gateways.map((gateway) => {
        const id = gateway.id;
        const secretsCount = gateway.credentials?.secretsConfigured?.length ?? 0;
        return (
          <div
            key={id}
            className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/70 p-6 relative flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))]">
                  {gateway.gatewayType}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${
                    gateway.mode === "LIVE"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {gateway.mode === "LIVE"
                    ? t("settings.paymentGateway.modeLive")
                    : t("settings.paymentGateway.modeTest")}
                </span>
                {gateway.isDefault && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] flex-shrink-0">
                    {t("settings.paymentGateway.defaultBadge")}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {canEdit && (
                  <button
                    onClick={() => onEditGateway?.(gateway)}
                    className="w-8 h-8 flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer"
                    title={t("settings.paymentGateway.edit")}
                  >
                    <Edit2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDeleteGateway?.(gateway)}
                    className="w-8 h-8 flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer"
                    title={t("settings.paymentGateway.delete")}
                  >
                    <Trash2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
              {gateway.label || gateway.gatewayType}
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-3 font-mono break-all">
              {getMaskedIdentifier(gateway)}
            </p>

            <div className="space-y-1 mb-4">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {t("settings.paymentGateway.accessibleByStores")}:
                </span>{" "}
                {getStoreNames(gateway.storeIds)}
              </p>
              {secretsCount > 0 && (
                <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                  {t("settings.paymentGateway.secretsConfigured", { count: secretsCount })}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {canCreate && (
        <button
          type="button"
          onClick={onAddGateway}
          className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-dashed border-[rgb(var(--color-border-primary))]/70 p-6 relative flex flex-col items-center justify-center h-full min-h-[220px] hover:border-[rgb(var(--color-primary))]/60 hover:bg-[rgb(var(--color-primary))]/5 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 mb-4 rounded-full bg-[rgb(var(--color-primary))]/10 flex items-center justify-center">
            <Plus className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          </div>
          <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-1">
            {t("settings.paymentGateway.addGateway")}
          </h3>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] text-center max-w-[220px]">
            {t("settings.paymentGateway.addAnotherGateway")}
          </p>
        </button>
      )}
    </div>
  );
};

export default GatewayList;
