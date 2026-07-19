"use client";

import { Badge, Button } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import storeService from "@/service/retailer/store.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getRetailerDetails, setSelectedStore } from "@/store/slices/profileSlice";
import { pickStoreId } from "@/utils/tallyIntegration.util";
import { Check, FileText, Hash, Info, Loader2, Save } from "lucide-react";
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
        storeService.getInvoiceNumberTemplates(),
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

  const handleSave = async () => {
    if (!storeId) return;
    setSaving(true);
    try {
      const response = await storeService.updateStore(storeId, {
        invoiceNumberConfig: {
          templateId: form.templateId || null,
        },
      });
      const updated = response?.data?.data;
      if (updated?.invoiceNumberConfig && selectedStore) {
        dispatch(
          setSelectedStore({
            ...selectedStore,
            invoiceNumberConfig: updated.invoiceNumberConfig,
          }),
        );
      }
      await dispatch(getRetailerDetails({ forceRefresh: true })).unwrap();
      showSuccess(t("invoiceNumber.saveSuccess"));
      await loadData();
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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedTemplate = templates.find((item) => String(item.id) === String(form.templateId));
  const templateTokens = [
    ...new Set(
      Array.from(selectedTemplate?.template?.matchAll(/\{([A-Z_]+)(?::\d+)?\}/g) || []).map(
        (match) => match[1],
      ),
    ),
  ];
  const hasUnsavedChanges = String(form.templateId) !== String(savedTemplateId);

  return (
    <div className="w-full space-y-7 pb-6 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:gap-6 lg:space-y-0 lg:overflow-hidden lg:pb-0">
      <div className="flex shrink-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
          <Hash className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{t("invoiceNumber.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("invoiceNumber.description")}</p>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-primary))]/30 p-10 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("invoiceNumber.noTemplates")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 items-start gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)] lg:overflow-hidden">
            <section className="lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {templates.map((item) => {
                const isSelected = String(item.id) === String(form.templateId);
                const isCurrent = String(item.id) === String(savedTemplateId);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => updateField("templateId", item.id)}
                    className={`relative flex min-h-44 flex-col overflow-hidden rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]/40 ${
                      isSelected
                        ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 ring-1 ring-[rgb(var(--color-primary))]/20"
                        : "border-[rgb(var(--color-border-primary))]/80 bg-[rgb(var(--color-bg-primary))] hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-bg-secondary))]/30"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute inset-x-0 top-0 h-0.5 bg-[rgb(var(--color-primary))]" />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold leading-5 text-[rgb(var(--color-text-primary))]">
                          {item.name}
                        </span>
                        {isCurrent && (
                          <Badge variant="primary" size="xs">
                            {t("invoiceNumber.currentFormat")}
                          </Badge>
                        )}
                        {item.isDefault && !isCurrent && (
                          <Badge variant="outline" size="xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-white"
                            : "border-[rgb(var(--color-text-tertiary))] bg-[rgb(var(--color-bg-primary))]"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </span>
                    </div>
                    <p className="mt-2 min-h-10 line-clamp-2 text-xs leading-5 text-[rgb(var(--color-text-secondary))]">
                      {item.description}
                    </p>
                    <div
                      className={`mt-auto rounded-lg border px-3 py-2.5 font-mono text-xs font-bold text-[rgb(var(--color-text-primary))] ${
                        isSelected
                          ? "border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10"
                          : "border-[rgb(var(--color-border-primary))]/50 bg-[rgb(var(--color-bg-secondary))]"
                      }`}
                    >
                      {item.example}
                    </div>
                    <div className="mt-2 flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-[rgb(var(--color-text-tertiary))]">
                        Pattern
                      </span>
                      <code className="truncate text-[10px] text-[rgb(var(--color-text-secondary))]">
                        {item.template}
                      </code>
                    </div>
                  </button>
                );
              })}
            </div>
            </section>

            <section className="self-start rounded-2xl border border-[rgb(var(--color-border-primary))]/50 bg-[rgb(var(--color-bg-primary))] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--color-text-tertiary))]">
                    {t("invoiceNumber.livePreview")}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                      {t("invoiceNumber.previewLabel")}
                    </h3>
                    <Badge variant="primary" size="xs">
                      {selectedTemplate?.name}
                    </Badge>
                  </div>
                </div>
                {previewing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>

              <div className="mt-4 rounded-xl border border-[rgb(var(--color-border-primary))]/50 bg-[rgb(var(--color-bg-secondary))] px-4 py-5">
                <p className="overflow-x-auto whitespace-nowrap font-mono text-lg font-bold tracking-wide text-[rgb(var(--color-primary))]">
                  {preview || t("invoiceNumber.preview")}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[rgb(var(--color-border-primary))]/40 pt-3">
                {templateTokens.map((token) => (
                  <span
                    key={token}
                    className="inline-flex items-center gap-2 text-xs font-medium text-[rgb(var(--color-text-secondary))]"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${TOKEN_STYLES[token] || "bg-[rgb(var(--color-primary))]"}`}
                    />
                    {token.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-[rgb(var(--color-text-tertiary))]">
                {t("invoiceNumber.previewHint")}
              </p>
            </section>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 rounded-xl border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-primary))] px-5 py-4">
            <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text-secondary))]">
              <Info className="h-4 w-4 shrink-0" />
              {selectedTemplate?.name}{" "}
              {t(
                hasUnsavedChanges
                  ? "invoiceNumber.selectedSaveHint"
                  : "invoiceNumber.currentFormatHint",
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={!hasUnsavedChanges || saving}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={!hasUnsavedChanges || saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="ml-2">{t("invoiceNumber.save")}</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceNumberSettings;
