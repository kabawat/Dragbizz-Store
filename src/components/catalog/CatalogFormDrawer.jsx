"use client";

import { getCatalogUrl } from "@dragorbit/core/domain";
import { Globe, Link2, Save, Store } from "lucide-react";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Input,
  MultiSelect,
  Select,
  SideDrawer,
} from "@/components/ui";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import useApiResponse from "@/hooks/useApiResponse";
import catalogService from "@/service/retailer/catalog.service";
import {
  buildCatalogPayload,
  CATALOG_STATUSES,
  catalogFormValues,
  updateCatalogStores,
  validateCatalogSubdomain,
} from "@/utils/catalog.util";
import { pickStoreId } from "@/utils/store.util";

export default function CatalogFormDrawer({
  catalog,
  stores,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() => catalogFormValues(catalog));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const submitting = useRef(false);
  const formRef = useRef(null);
  const { execute, loading } = useApiResponse();
  const storeOptions = stores.map((store) => ({
    value: pickStoreId(store),
    label: store.storeName || store.name,
  }));
  const unavailableStores = form.stores.filter(
    (id) => !storeOptions.some((option) => option.value === id)
  );
  const options = [
    ...storeOptions,
    ...unavailableStores.map((id) => ({
      value: id,
      label: `Unavailable Store (${id})`,
    })),
  ];
  const subdomainError = form.subdomain
    ? validateCatalogSubdomain(form.subdomain)
    : null;
  const change = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };
  const close = () => {
    if (!submitting.current) onClose();
  };
  const save = async () => {
    if (submitting.current) return;
    const { payload, fields } = buildCatalogPayload(
      form,
      storeOptions.map((option) => option.value)
    );
    setErrors(fields);
    setMessage(null);
    if (Object.keys(fields).length) {
      setMessage("Please check the highlighted fields.");
      return;
    }
    submitting.current = true;
    const result = await execute(
      catalog
        ? catalogService.updateCatalog(catalog.id, payload)
        : catalogService.createCatalog(payload)
    );
    submitting.current = false;
    if (result.success) {
      onSuccess(result.data);
    } else {
      setErrors(result.fields || {});
      setMessage(result.message);
    }
  };

  useCommonHotkeys({
    onSave: () => {
      if (!submitting.current) formRef.current?.requestSubmit();
    },
  });

  return (
    <SideDrawer
      isOpen
      title={catalog ? "Edit digital shop" : "Create digital shop"}
      icon={Store}
      position="center"
      width="w-full sm:w-[560px]"
      autoHeight
      draggable={false}
      resizable={false}
      onClose={close}
      closeOnOutsideClick={false}
      closeOnEscape={!loading}
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="catalog-form"
            title="Save (Ctrl/Cmd+S or Ctrl/Cmd+Enter)"
            aria-keyshortcuts="Control+s Control+Enter Meta+s Meta+Enter"
            leftIcon={Save}
            loading={loading}
          >
            {catalog ? "Save changes" : "Create digital shop"}
          </Button>
        </>
      }
    >
      <form
        id="catalog-form"
        ref={formRef}
        className="space-y-5 p-4 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        {message && (
          <Alert variant="error" role="alert">
            {message}
          </Alert>
        )}
        <fieldset disabled={loading} className="min-w-0 space-y-5">
          <section className="space-y-4" aria-label="Shop details">
            <Input
              label="Shop name"
              required
              maxLength={200}
              value={form.name}
              onChange={(value) => change("name", value)}
              error={!!errors.name}
              errorMessage={errors.name}
            />
            <div className="space-y-2">
              <Input
                label="Subdomain"
                leftIcon={Link2}
                required
                maxLength={63}
                value={form.subdomain}
                onChange={(value) => change("subdomain", value.toLowerCase())}
                error={!!(errors.subdomain || subdomainError)}
                errorMessage={errors.subdomain || subdomainError}
                helperText="Lowercase letters, numbers and hyphens. Each shop needs a unique address."
              />
              {form.subdomain.trim() && !subdomainError && (
                <div className="flex items-start gap-3 rounded-xl border border-[rgb(var(--color-primary))]/15 bg-[rgb(var(--color-primary))]/5 p-3">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--color-primary))]" />
                  <div className="min-w-0">
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                      Shop address
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-[rgb(var(--color-text-primary))]">
                      {getCatalogUrl(form.subdomain.trim().toLowerCase())}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
          <section
            className="space-y-4 border-t border-[rgb(var(--color-border-primary))] pt-5"
            aria-label="Store access"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  Stores & availability
                </h3>
                <p className="mt-1 text-xs text-[rgb(var(--color-text-secondary))]">
                  Choose which Stores belong to this shop.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[rgb(var(--color-bg-secondary))] px-2.5 py-1 text-xs font-medium text-[rgb(var(--color-text-secondary))]">
                {form.stores.length} selected
              </span>
            </div>
            <MultiSelect
              label="Linked Stores"
              options={options}
              value={form.stores}
              onChange={(values) => {
                setForm((previous) => updateCatalogStores(previous, values));
                setErrors((previous) => ({
                  ...previous,
                  stores: undefined,
                  defaultStore: undefined,
                }));
              }}
              disabled={loading}
              error={!!errors.stores}
              errorMessage={errors.stores}
              helperText={
                stores.length
                  ? undefined
                  : "No Stores available in your Agency yet."
              }
              placeholder="Select Stores"
            />
            {unavailableStores.length > 0 && (
              <Alert variant="warning">
                Some linked Stores are no longer available. Remove them from the
                selection before saving.
              </Alert>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Default Store"
                value={form.defaultStore}
                onChange={(value) => change("defaultStore", value)}
                options={[
                  { value: "", label: "No default Store" },
                  ...storeOptions.filter((option) =>
                    form.stores.includes(option.value)
                  ),
                ]}
                disabled={loading || !form.stores.length}
                error={!!errors.defaultStore}
                errorMessage={errors.defaultStore}
                helperText={
                  form.stores.length
                    ? "Used as the shop’s default location."
                    : "Link a Store to choose a default."
                }
              />
              <Select
                label="Status"
                value={form.status}
                options={CATALOG_STATUSES}
                onChange={(value) => change("status", value)}
                disabled={loading}
                error={!!errors.status}
                errorMessage={errors.status}
              />
            </div>
          </section>
        </fieldset>
      </form>
    </SideDrawer>
  );
}
