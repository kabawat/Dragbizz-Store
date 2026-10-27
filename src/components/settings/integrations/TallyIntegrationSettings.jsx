"use client";
import { TableSkeleton } from "@dragorbit/ui";
import { TallyIntegrationSettingsView } from "@dragorbit/features/integrations";

import { useCallback, useEffect, useState } from "react";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { settingService } from "@/service/retailer/setting.service";
import storeService from "@/service/retailer/store.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getRetailerDetails,
  setSelectedStore,
} from "@/store/slices/profileSlice";
import {
  buildTallyFormState,
  buildTallyIntegrationPayload,
  DEFAULT_PAYMENT_METHOD_LEDGERS,
  LEDGER_FIELD_KEYS,
  pickStoreId,
} from "@/utils/tallyIntegration.util";

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
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", ledger: "" });

  const loadStore = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const response = await settingService.getTallySetting(storeId);
      const setting = response?.data?.data;
      if (setting) setForm(buildTallyFormState(setting));
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
      const response = await settingService.updateTallySetting(
        storeId,
        payload?.tallyIntegration || payload,
      );
      const updated = response?.data?.data;
      if (updated && selectedStore) {
        dispatch(
          setSelectedStore({
            ...selectedStore,
            tallyIntegration: updated,
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
      expenseCategoryLedgers: {
        ...prev.expenseCategoryLedgers,
        [name]: ledger,
      },
    }));
    setNewCategory({ name: "", ledger: "" });
    setIsExpenseModalOpen(false);
  };

  const closeExpenseModal = () => {
    setNewCategory({ name: "", ledger: "" });
    setIsExpenseModalOpen(false);
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
      <TableSkeleton />
    );
  }

  const expenseMappings = Object.entries(form.expenseCategoryLedgers);

  return (
    <TallyIntegrationSettingsView
      model={{
        t,
        form,
        setForm,
        selectedStore,
        setShowAdvanced,
        showAdvanced,
        LEDGER_FIELD_KEYS,
        DEFAULT_PAYMENT_METHOD_LEDGERS,
        setIsExpenseModalOpen,
        expenseMappings,
        removeExpenseCategory,
        isExpenseModalOpen,
        closeExpenseModal,
        newCategory,
        setNewCategory,
        addExpenseCategory,
        handleSave,
        saving,
      }}
    />
  );
};

export default TallyIntegrationSettings;
