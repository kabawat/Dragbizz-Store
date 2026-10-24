"use client";
import { TableSkeleton } from "@dragorbit/ui";
import { InvoiceNumberSettingsView } from "@dragorbit/features/settings";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import storeService from "@/service/retailer/store.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedStore,
} from "@/store/slices/profileSlice";
import { pickStoreId } from "@/utils/tallyIntegration.util";
import { useCallback, useEffect, useState } from "react";

function buildFormState(store, templates = []) {
  const config = store?.invoiceNumberConfig || {};
  const defaultTemplate = templates.find((t) => t.isDefault) || templates[0];
  const configuredTemplate = templates.find(
    (item) => String(item.id) === String(config.templateId),
  );
  return {
    templateId: configuredTemplate?.id || defaultTemplate?.id || "",
  };
}

const TOKEN_STYLES = {
  SEQ: "bg-violet-500",
  FY: "bg-amber-500",
  FY_SHORT: "bg-amber-500",
  STORE: "bg-emerald-500",
  BRANCH: "bg-emerald-500",
  POS: "bg-cyan-500",
  TYPE: "bg-orange-500",
  YYYY: "bg-pink-500",
  YY: "bg-pink-500",
  MM: "bg-pink-500",
  DD: "bg-pink-500",
  DATE: "bg-pink-500",
};

const InvoiceNumberSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = pickStoreId(selectedStore);

  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(() => buildFormState(selectedStore));
  const [savedTemplateId, setSavedTemplateId] = useState(
    selectedStore?.invoiceNumberConfig?.templateId || "",
  );
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const loadPreview = useCallback(
    async (nextForm) => {
      if (!storeId) return;
      setPreviewing(true);
      try {
        const response = await storeService.getInvoiceNumberPreview(storeId, {
          templateId: nextForm.templateId || undefined,
        });
        setPreview(response?.data?.data?.invoiceNumber || "");
      } catch {
        setPreview("");
      } finally {
        setPreviewing(false);
      }
    },
    [storeId],
  );

  const loadData = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const [templatesRes, storeRes] = await Promise.all([
        storeService.getInvoiceNumberTemplates(storeId),
        storeService.getStore(storeId),
      ]);
      const list = templatesRes?.data?.data?.templates || [];
      setTemplates(list);
      const store = storeRes?.data?.data;
      const nextForm = buildFormState(store || selectedStore, list);
      setForm(nextForm);
      setSavedTemplateId(nextForm.templateId);
    } catch (err) {
      showError(err?.message || t("invoiceNumber.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [storeId, selectedStore, showError, t]);

  useEffect(() => {
    if (storeId) loadData();
  }, [storeId, loadData]);

  useEffect(() => {
    if (!storeId || loading) return undefined;
    const timer = setTimeout(() => {
      loadPreview(form);
    }, 400);
    return () => clearTimeout(timer);
  }, [storeId, loading, form, loadPreview]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setForm((prev) => ({ ...prev, templateId: savedTemplateId }));
  };

  const handleSave = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (!storeId) return;
    setSaving(true);
    try {
      const response = await storeService.updateStore(storeId, {
        invoiceNumberConfig: {
          templateId: form.templateId || null,
        },
      });
      const updated = response?.data?.data;
      const savedId = updated?.invoiceNumberConfig?.templateId;
      const normalizedSavedId = String(savedId?._id || savedId?.id || savedId || "");
      if (!updated?.invoiceNumberConfig || normalizedSavedId !== String(form.templateId || "")) {
        throw new Error(t("invoiceNumber.saveFailed"));
      }
      if (selectedStore) dispatch(setSelectedStore({ ...selectedStore, ...updated }));
      setSavedTemplateId(normalizedSavedId);
      showSuccess(t("invoiceNumber.saveSuccess"));
    } catch (err) {
      showError(err?.message || t("invoiceNumber.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (!storeId) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {t("invoiceNumber.selectStore")}
      </div>
    );
  }

  if (loading) {
    return (
      <TableSkeleton />
    );
  }

  const selectedTemplate = templates.find(
    (item) => String(item.id) === String(form.templateId),
  );
  const templateTokens = [
    ...new Set(
      Array.from(
        selectedTemplate?.template?.matchAll(/\{([A-Z_]+)(?::\d+)?\}/g) || [],
      ).map((match) => match[1]),
    ),
  ];
  const hasUnsavedChanges = String(form.templateId) !== String(savedTemplateId);

  return (
    <InvoiceNumberSettingsView
      model={{
        t,
        templates,
        form,
        savedTemplateId,
        updateField,
        selectedTemplate,
        previewing,
        preview,
        templateTokens,
        TOKEN_STYLES,
        hasUnsavedChanges,
        handleCancel,
        saving,
        handleSave,
      }}
    />
  );
};

export default InvoiceNumberSettings;
