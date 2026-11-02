"use client";

import { getCatalogUrl } from "@dragorbit/core/domain";
import {
  Copy,
  ExternalLink,
  Globe,
  Pencil,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { Badge, Button, EmptyState, SideDrawer } from "@/components/ui";
import { CATALOG_STATUSES } from "@/utils/catalog.util";
import { formatDateTime } from "@/utils/dateFormatter";
import { pickStoreId } from "@/utils/store.util";

export default function CatalogDetailsDrawer({
  catalog,
  stores,
  onClose,
  onEdit,
  onDelete,
  onCopyLink,
}) {
  const storeNames = new Map(
    stores.map((store) => [pickStoreId(store), store.storeName || store.name])
  );
  const shopUrl = getCatalogUrl(catalog.subdomain);
  const status =
    CATALOG_STATUSES.find((option) => option.value === catalog.status)?.label ||
    catalog.status;
  return (
    <SideDrawer
      isOpen
      onClose={onClose}
      title="Digital shop details"
      icon={Store}
      position="center"
      width="w-full sm:w-[560px]"
      autoHeight
      closeOnEscape
      draggable={false}
      resizable={false}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="!text-red-500 hover:!bg-red-500/10"
            leftIcon={Trash2}
            onClick={() => onDelete(catalog)}
          >
            Delete shop
          </Button>
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button leftIcon={Pencil} onClick={() => onEdit(catalog)}>
              Edit shop
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 p-4 sm:p-6 text-[rgb(var(--color-text-primary))]">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
            <Store className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-xl font-semibold leading-tight">
              {catalog.name}
            </h2>
            <p className="mt-1 break-all text-sm text-[rgb(var(--color-text-secondary))]">
              {catalog.subdomain}
            </p>
          </div>
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
        <section
          className="space-y-3 rounded-xl border border-[rgb(var(--color-primary))]/15 bg-[rgb(var(--color-primary))]/5 p-4"
          aria-label="Shop link"
        >
          <div className="flex items-start gap-2.5">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--color-primary))]" />
            <div className="min-w-0">
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                Shop address
              </p>
              <p className="mt-1 break-all text-sm font-medium">{shopUrl}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              leftIcon={Copy}
              onClick={() => onCopyLink(catalog)}
            >
              Copy link
            </Button>
            <Button
              leftIcon={ExternalLink}
              onClick={() =>
                window.open(shopUrl, "_blank", "noopener,noreferrer")
              }
            >
              Open digital shop
            </Button>
          </div>
        </section>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs text-[rgb(var(--color-text-secondary))]">
              Shop ID
            </dt>
            <dd className="mt-1 break-all font-mono text-sm font-medium">
              {catalog.catalogId}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-[rgb(var(--color-text-secondary))]">
              Default Store
            </dt>
            <dd className="mt-1 break-words text-sm font-medium">
              {catalog.defaultStore
                ? storeNames.get(catalog.defaultStore) || "Unavailable Store"
                : "Not selected"}
            </dd>
          </div>
        </dl>
        <section className="space-y-3 border-t border-[rgb(var(--color-border-primary))] pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Linked Stores</h3>
            <Badge size="xs" variant="secondary">
              {catalog.stores.length}
            </Badge>
          </div>
          {catalog.stores.length ? (
            <ul className="space-y-2">
              {catalog.stores.map((id) => (
                <li
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-[rgb(var(--color-border-primary))] p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-bg-secondary))]">
                    <Store className="h-4 w-4 text-[rgb(var(--color-text-secondary))]" />
                  </span>
                  <span className="min-w-0 flex-1 break-words text-sm font-medium">
                    {storeNames.get(id) || `Unavailable Store (${id})`}
                  </span>
                  {catalog.defaultStore === id && (
                    <Badge variant="primary" size="xs">
                      Default
                    </Badge>
                  )}
                </li>
              ))}
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
        <dl className="grid grid-cols-1 gap-3 border-t border-[rgb(var(--color-border-primary))] pt-4 sm:grid-cols-2">
          {[
            ["Created", catalog.createdAt],
            ["Last updated", catalog.updatedAt],
          ].map(([label, date]) => (
            <div key={label}>
              <dt className="text-xs text-[rgb(var(--color-text-tertiary))]">
                {label}
              </dt>
              <dd className="mt-1 text-xs text-[rgb(var(--color-text-secondary))]">
                {formatDateTime(date)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </SideDrawer>
  );
}
