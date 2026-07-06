"use client";

import { Button, Input } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import storeService from "@/service/retailer/store.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getRetailerDetails, setSelectedStore } from "@/store/slices/profileSlice";
import {
  buildTallyFormState,
  buildTallyIntegrationPayload,
  DEFAULT_PAYMENT_METHOD_LEDGERS,
  LEDGER_FIELD_KEYS,
  pickStoreId,
} from "@/utils/tallyIntegration.util";
import { ChevronDown, ChevronUp, Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const TallyIntegrationSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = pickStoreId(selectedStore);

  const [form, setForm] = useState(() => buildTallyFormState(selectedStore));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", ledger: "" });

  const loadStore = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const response = await storeService.getStore(storeId);
      const store = response?.data?.data;
      if (store) setForm(buildTallyFormState(store));
    } catch (err) {
      showError(err?.message || t("integrations.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [storeId, showError, t]);

  useEffect(() => {
    if (storeId) loadStore();
  }, [storeId, loadStore]);

  const handleSave = async () => {
    if (!storeId) return;
    if (form.enabled && !form.companyName?.trim()) {
      showError(t("integrations.companyNameRequired"));
      return;
    }

    setSaving(true);
    try {
      const payload = buildTallyIntegrationPayload(form);
      const response = await storeService.updateStore(storeId, payload);
      const updated = response?.data?.data;
      if (updated?.tallyIntegration && selectedStore) {
        dispatch(
          setSelectedStore({
            ...selectedStore,
            tallyIntegration: updated.tallyIntegration,
          }),
        );
      }
      await dispatch(getRetailerDetails({ forceRefresh: true })).unwrap();
      showSuccess(t("integrations.saveSuccess"));
      await loadStore();
    } catch (err) {
      showError(err?.message || t("integrations.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const addExpenseCategory = () => {
    const name = newCategory.name.trim();
    const ledger = newCategory.ledger.trim();
    if (!name || !ledger) return;
    setForm((prev) => ({
      ...prev,
      expenseCategoryLedgers: { ...prev.expenseCategoryLedgers, [name]: ledger },
    }));
    setNewCategory({ name: "", ledger: "" });
  };

  const removeExpenseCategory = (key) => {
    setForm((prev) => {
      const next = { ...prev.expenseCategoryLedgers };
      delete next[key];
      return { ...prev, expenseCategoryLedgers: next };
    });
  };

  if (!storeId || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t("integrations.tallySettings")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("integrations.tallySettingsDesc")}</p>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-5">
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="font-medium">{t("integrations.enableTally")}</p>
            <p className="text-sm text-muted-foreground">{t("integrations.enableTallyHint")}</p>
          </div>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
            className="h-5 w-5 accent-primary"
          />
        </label>

        <Input
          label={t("integrations.companyName")}
          value={form.companyName}
          onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
          placeholder={selectedStore?.name || t("integrations.companyNamePlaceholder")}
        />

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-primary"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {t("integrations.ledgerMapping")}
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LEDGER_FIELD_KEYS.map((key) => (
                <Input
                  key={key}
                  label={t(`integrations.ledger.${key}`, key)}
                  value={form.defaultLedgers[key] || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      defaultLedgers: { ...prev.defaultLedgers, [key]: e.target.value },
                    }))
                  }
                />
              ))}
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{t("integrations.paymentMethodLedgers")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(DEFAULT_PAYMENT_METHOD_LEDGERS).map((method) => (
                  <Input
                    key={method}
                    label={method}
                    value={form.paymentMethodLedgers[method] || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        paymentMethodLedgers: {
                          ...prev.paymentMethodLedgers,
                          [method]: e.target.value,
                        },
                      }))
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{t("integrations.expenseCategoryLedgers")}</p>
              <div className="space-y-2">
                {Object.entries(form.expenseCategoryLedgers).map(([name, ledger]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-sm flex-1">
                      {name} → {ledger}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => removeExpenseCategory(name)}>
                      {t("common.remove")}
                    </Button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 items-end">
                  <Input
                    label={t("integrations.categoryName")}
                    value={newCategory.name}
                    onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                  />
                  <Input
                    label={t("integrations.ledgerName")}
                    value={newCategory.ledger}
                    onChange={(e) => setNewCategory((p) => ({ ...p, ledger: e.target.value }))}
                  />
                  <Button variant="secondary" onClick={addExpenseCategory}>
                    {t("common.add")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">{t("integrations.importGuideHint")}</p>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            {t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TallyIntegrationSettings;
