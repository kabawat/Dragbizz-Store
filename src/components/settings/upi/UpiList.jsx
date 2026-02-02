"use client";

import React, { useState } from "react";
import {
  Copy,
  Edit2,
  Loader2,
  Plus,
  QrCode,
  Trash2,
  Wallet,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { copyToClipboard } from "@/utils/clipboard";
import { UpiQrModal } from "@/components/common";

const COPIED_DURATION_MS = 2500;

const UpiList = ({
  upiIds = [],
  stores = [],
  isLoading = false,
  onAddUpi,
  onEditUpi,
  onDeleteUpi,
  showSuccess,
}) => {
  const { t } = useTranslation();
  const [qrModalItem, setQrModalItem] = React.useState(null);
  const [copiedUpiId, setCopiedUpiId] = React.useState(null);

  const getStoreNames = (storeIds = []) => {
    if (!storeIds?.length || !stores?.length) return "-";
    return storeIds
      .map((sid) => {
        const s = stores.find(
          (st) =>
            (st._id || st.id)?.toString() === (sid?.toString?.() || sid)
        );
        return s?.name || sid;
      })
      .filter(Boolean)
      .join(", ") || "-";
  };

  const handleCopyUpi = async (upiId, itemId) => {
    const ok = await copyToClipboard(upiId);
    if (ok) {
      setCopiedUpiId(itemId);
      setTimeout(() => setCopiedUpiId(null), COPIED_DURATION_MS);
    }
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

  if (!isLoading && upiIds.length === 0) {
    return (
      <div className="backdrop-blur-[1px] rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-12 text-center">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--color-text-tertiary))]" />
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          {t("settings.upi.noUpiAdded")}
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
          {t("settings.upi.addFirstUpiDescription", "Add your first UPI ID to accept payments")}
        </p>
        <button
          onClick={onAddUpi}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer mx-auto"
        >
          <Plus className="w-5 h-5" />
          {t("settings.upi.addNewUpi")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upiIds.map((item) => {
          const id = item.id || item._id;
          return (
            <div
              key={id}
              className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/70 p-6 relative flex flex-col h-full"
            >
              {/* Card Header - Icon + Label + Action Buttons (like Store card) */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                  </div>
                  {item.label && (
                    <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))] truncate">
                      {item.label}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onEditUpi?.(item)}
                    className="w-8 h-8 flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer"
                    title={t("settings.upi.edit")}
                  >
                    <Edit2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  </button>
                  <button
                    onClick={() => onDeleteUpi?.(item)}
                    className="w-8 h-8 flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer"
                    title={t("settings.upi.delete")}
                  >
                    <Trash2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  </button>
                </div>
              </div>

              {/* UPI ID - prominent like Store name */}
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-3 break-all">
                {item.upiId}
              </h3>

              {/* Accessible by stores - like GST, PAN (bold label + value) */}
              <div className="space-y-1 mb-4">
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    {t("settings.upi.accessibleByStores", "Accessible by stores")}:
                  </span>{" "}
                  {getStoreNames(item.storeIds)}
                </p>
              </div>

              {/* Divider + Action buttons (like Manage UPI & Public Catalog) */}
              <div className="mt-auto pt-4 border-t border-[rgb(var(--color-border-primary))]/40 space-y-2">
                <button
                  type="button"
                  onClick={() => handleCopyUpi(item.upiId, id)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    copiedUpiId === id
                      ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/15"
                      : "bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))]/50 hover:bg-[rgb(var(--color-bg-tertiary))]"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      copiedUpiId === id
                        ? "text-green-600 dark:text-green-400"
                        : "text-[rgb(var(--color-text-primary))]"
                    }`}
                  >
                    {copiedUpiId === id
                      ? t("settings.upi.copied", "Copied")
                      : t("settings.upi.copy")}
                  </span>
                  <Copy
                    className={`w-4 h-4 ${
                      copiedUpiId === id
                        ? "text-green-600 dark:text-green-400"
                        : "text-[rgb(var(--color-text-secondary))]"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setQrModalItem(item)}
                  className="w-full bg-[rgb(var(--color-primary))]/5 px-3 py-2 rounded-lg border border-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/10 transition-all flex items-center justify-between gap-2 overflow-hidden group cursor-pointer"
                >
                  <div className="flex flex-col items-start truncate text-left">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[rgb(var(--color-primary))] mb-0.5">
                      {t("settings.upi.upiQrCode")}
                    </span>
                    <span className="text-xs text-[rgb(var(--color-primary))] truncate">
                      {item.upiId}
                    </span>
                  </div>
                  <div className="flex-shrink-0 p-1.5 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] rounded-md group-hover:bg-[rgb(var(--color-primary))] group-hover:text-white transition-all">
                    <QrCode className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          );
        })}

        {/* Add New UPI Card - dashed border like Create New Store */}
        <button
          type="button"
          onClick={onAddUpi}
          className="bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-dashed border-[rgb(var(--color-border-primary))]/70 p-6 relative flex flex-col items-center justify-center h-full min-h-[220px] hover:border-[rgb(var(--color-primary))]/60 hover:bg-[rgb(var(--color-primary))]/5 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 mb-4 rounded-full bg-[rgb(var(--color-primary))]/10 flex items-center justify-center">
            <Plus className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          </div>
          <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-1">
            {t("settings.upi.addNewUpi")}
          </h3>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] text-center max-w-[220px]">
            {t("settings.upi.addAnotherUpi", "Add another UPI ID")}
          </p>
        </button>
      </div>

      <UpiQrModal
        isOpen={!!qrModalItem}
        onClose={() => setQrModalItem(null)}
        upiId={qrModalItem?.upiId}
        label={qrModalItem?.label}
      />
    </>
  );
};

export default UpiList;
