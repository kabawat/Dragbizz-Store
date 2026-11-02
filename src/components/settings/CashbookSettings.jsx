"use client";
import { CashbookSettingsView } from "@dragorbit/features/settings";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { settingService } from "@/service/retailer/setting.service";
import { useAppSelector } from "@/store/hooks";

function StoreCashbookSettings({ storeId, storeName }) {
  const { t } = useTranslation();
  const { execute } = useApiResponse();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const savingRef = useRef(false);
  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError("");
    const result = await execute(settingService.getCashbookSetting(storeId), {
      showToast: false,
    });
    if (requestId.current !== current) return;
    if (result?.success) setSettings(result.data);
    else setError(result?.message || t("cashbook.settings.loadFailed"));
    setLoading(false);
  }, [execute, storeId, t]);
  useEffect(() => {
    load();
    return () => {
      requestId.current++;
    };
  }, [load]);
  const onSave = async (event) => {
    event.preventDefault();
    if (savingRef.current) return false;
    const maxAmount = Number(settings.maxAmount);
    if (!Number.isFinite(maxAmount) || maxAmount < 0.01 || maxAmount > 100000000) {
      setError(t("cashbook.settings.invalidLimit"));
      return false;
    }
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await execute(
        settingService.updateCashbookSetting(storeId, { ...settings, maxAmount }),
        { showToast: false },
      );
      if (result?.success) setSettings(result.data);
      else setError(result?.message || t("cashbook.saveFailed"));
      return Boolean(result?.success);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <CashbookSettingsView
      {...{
        t,
        storeName,
        settings,
        setSettings,
        loading,
        saving,
        error,
        onSave,
      }}
      onRetry={load}
    />
  );
}
export default function CashbookSettings() {
  const { selectedStore, authProfile } = useAppSelector((state) => state.profile);
  const { t } = useTranslation();
  if (authProfile?.role !== "store_owner")
    return <p className="p-6 text-sm">{t("cashbook.settings.ownerOnly")}</p>;
  if (!selectedStore?.storeId) return <p className="p-6 text-sm">{t("cashbook.storeRequired")}</p>;
  return (
    <StoreCashbookSettings
      key={selectedStore.storeId}
      storeId={selectedStore.storeId}
      storeName={selectedStore.name || ""}
    />
  );
}
