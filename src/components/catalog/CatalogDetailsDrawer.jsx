"use client";

import { getCatalogUrl } from "@dragorbit/core/domain";
import {
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  LayoutTemplate,
  Plus,
  Save,
  Store,
} from "lucide-react";
import { useState } from "react";
import { Badge, Button, EmptyState, Select, SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import catalogService from "@/service/retailer/catalog.service";
import {
  CATALOG_STATUSES,
  CATALOG_TEMPLATE_DETAILS,
  CATALOG_TEMPLATES,
} from "@/utils/catalog.util";
import { copyToClipboard } from "@/utils/clipboard";
import { formatDateTime } from "@/utils/dateFormatter";
import { pickStoreId } from "@/utils/store.util";

export default function CatalogDetailsDrawer({
  catalog,
  stores,
  onClose,
  onEdit,
  onUpdated,
}) {
  const [templateId, setTemplateId] = useState(catalog.templateId || "classic");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const { execute, loading } = useApiResponse();
  const { showSuccess } = useGlobalToast();

  const storeMap = new Map(stores.map((store) => [pickStoreId(store), store]));
  const shopUrl = getCatalogUrl(catalog.subdomain);
  const status =
    CATALOG_STATUSES.find((option) => option.value === catalog.status)?.label ||
    catalog.status;

  const currentTemplateDetails =
    CATALOG_TEMPLATE_DETAILS[templateId] ||
    CATALOG_TEMPLATE_DETAILS[catalog.templateId || "classic"];

  const handleCopyUrl = async () => {
    const copied = await copyToClipboard(shopUrl);
    if (copied) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleCopyId = async () => {
    const copied = await copyToClipboard(catalog.catalogId);
    if (copied) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSaveTemplate = async () => {
    const result = await execute(
      catalogService.updateCatalog(catalog.id, { templateId })
    );
    if (result.success) {
      showSuccess("Storefront template updated successfully");
      onUpdated?.(result.data);
    }
  };

  return (
    <SideDrawer
      isOpen
      onClose={onClose}
      title="Digital Shop Details"
      icon={Store}
      position="right"
      width="w-full sm:w-[560px]"
      closeOnEscape
      footer={
        <div className="flex w-full items-center justify-start">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5 p-4 sm:p-6 text-[rgb(var(--color-text-primary))]">
        {/* Shop Identity Header */}
        <div className="flex items-start gap-3.5 pb-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
            <Store className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="break-words text-xl font-bold text-[rgb(var(--color-text-primary))] leading-tight">
                {catalog.name}
              </h2>
              <Badge
                variant={
                  catalog.status === "ACTIVE"
                    ? "success"
                    : catalog.status === "SUSPENDED"
                      ? "danger"
                      : "secondary"
                }
                size="sm"
              >
                {status}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[rgb(var(--color-text-secondary))]">
              <span className="font-medium text-[rgb(var(--color-text-tertiary))]">
                Shop ID:
              </span>
              <span className="font-mono font-medium text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-secondary))] px-2 py-0.5 rounded border border-[rgb(var(--color-border-primary))]">
                {catalog.catalogId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                title={copiedId ? "Copied Shop ID!" : "Copy Shop ID"}
                aria-label="Copy Shop ID"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] hover:border-[rgb(var(--color-primary))]/40 transition-colors cursor-pointer"
              >
                {copiedId ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Storefront Link Banner */}
        <section
          className="rounded-xl border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/5 p-3.5"
          aria-label="Shop storefront link"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                <Globe className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-[rgb(var(--color-text-secondary))] leading-none">
                  Shop Address
                </p>
                <a
                  href={shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={shopUrl}
                  className="mt-1 inline-flex items-center gap-1.5 max-w-full font-mono text-sm font-semibold text-[rgb(var(--color-primary))] hover:underline transition-opacity group min-w-0 cursor-pointer"
                >
                  <span className="truncate">{shopUrl}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyUrl}
              title={copiedUrl ? "Copied to clipboard!" : "Copy link"}
              aria-label={copiedUrl ? "Copied to clipboard" : "Copy shop link"}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 cursor-pointer ${
                copiedUrl
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-primary))]/10 hover:text-[rgb(var(--color-primary))]"
              }`}
            >
              {copiedUrl ? (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </section>

        {/* Storefront Template Section */}
        <section
          className="space-y-3 border-t border-[rgb(var(--color-border-primary))] pt-4"
          aria-label="Storefront template"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
              Storefront Template
            </h3>
            {currentTemplateDetails?.badge && (
              <Badge size="xs" variant="primary">
                {currentTemplateDetails.badge}
              </Badge>
            )}
          </div>

          <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/40 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                  <LayoutTemplate className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-[rgb(var(--color-text-secondary))] leading-none">
                    Active Layout
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {currentTemplateDetails?.label || templateId}
                  </p>
                </div>
              </div>
              <div className="w-40 shrink-0">
                <Select
                  value={templateId}
                  options={CATALOG_TEMPLATES}
                  onChange={setTemplateId}
                  disabled={loading}
                  size="sm"
                />
              </div>
            </div>

            <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed pt-2 border-t border-[rgb(var(--color-border-primary))]/50">
              {currentTemplateDetails?.description ||
                "Storefront layout for your digital catalog."}
            </p>

            {templateId !== (catalog.templateId || "classic") && (
              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  leftIcon={Save}
                  loading={loading}
                  className="cursor-pointer"
                  onClick={handleSaveTemplate}
                >
                  Save layout
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Linked Stores Section */}
        <section className="space-y-3 border-t border-[rgb(var(--color-border-primary))] pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                Linked Stores
              </h3>
              <p className="mt-0.5 text-xs text-[rgb(var(--color-text-secondary))]">
                Agency Stores available in this Digital Shop.
              </p>
            </div>
            <Badge size="xs" variant="secondary">
              {catalog.stores.length}
            </Badge>
          </div>

          {catalog.stores.length ? (
            <ul className="space-y-2">
              {catalog.stores.map((id) => {
                const store = storeMap.get(id);
                const name =
                  store?.storeName ||
                  store?.name ||
                  `Unavailable Store (${id})`;
                const location = [store?.address?.city, store?.address?.state]
                  .filter(Boolean)
                  .join(", ");
                const isDefault = catalog.defaultStore === id;

                return (
                  <li
                    key={id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/30 p-3 hover:bg-[rgb(var(--color-bg-secondary))]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                        <Store className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                          {name}
                        </p>
                        {location ? (
                          <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">
                            {location}
                          </p>
                        ) : (
                          <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            {isDefault
                              ? "Primary store for orders"
                              : "Linked store location"}
                          </p>
                        )}
                      </div>
                    </div>
                    {isDefault ? (
                      <Badge variant="primary" size="xs">
                        Default Store
                      </Badge>
                    ) : (
                      <Badge variant="secondary" size="xs">
                        Linked
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={Store}
              title="No Stores linked"
              description="Link your Agency’s Stores to this shop."
              size="sm"
              className="!min-h-0 rounded-xl border border-dashed border-[rgb(var(--color-border-primary))] !p-5"
              actionButton={{
                label: "Link Stores",
                icon: Plus,
                onClick: () => onEdit(catalog),
              }}
            />
          )}
        </section>

        {/* Audit Timestamps */}
        <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/30 p-3 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-tertiary))]">
              <Calendar className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-[rgb(var(--color-text-tertiary))] tracking-wider">
                Created
              </span>
              <span className="text-[rgb(var(--color-text-secondary))] font-medium truncate block text-xs">
                {formatDateTime(catalog.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-tertiary))]">
              <Clock className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-[rgb(var(--color-text-tertiary))] tracking-wider">
                Last Updated
              </span>
              <span className="text-[rgb(var(--color-text-secondary))] font-medium truncate block text-xs">
                {formatDateTime(catalog.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
}
