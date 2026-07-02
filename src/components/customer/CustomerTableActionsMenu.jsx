"use client";

import { BookOpen, Edit, Eye, Receipt, Trash2 } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { clampFloatingMenuPosition } from "@/utils/ui/floatingMenuPosition.util";

const MENU_WIDTH = 192;

const actionButtonClass =
  "w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors cursor-pointer focus:outline-none";

export function CustomerTableActionsMenu({
  customerId,
  mode = "dropdown",
  anchorPoint = null,
  onAction,
  canEdit = true,
  canDelete = true,
  canManageKhata = true,
  canQuickKhataEntry = true,
  onManageKhata,
  onQuickKhataEntry,
}) {
  const { t } = useTranslation();
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ left: anchorPoint?.x ?? 0, top: anchorPoint?.y ?? 0 });

  useLayoutEffect(() => {
    if (mode !== "context" || !anchorPoint) return;
    const el = menuRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPosition(clampFloatingMenuPosition(anchorPoint.x, anchorPoint.y, width || MENU_WIDTH, height));
  }, [mode, anchorPoint, customerId, canEdit, canDelete, canManageKhata, canQuickKhataEntry]);

  const menuBody = (
    <>
      <button type="button" onClick={() => onAction("view")} className={actionButtonClass}>
        <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
        {t("common.viewDetails")}
      </button>
      {canQuickKhataEntry && onQuickKhataEntry ? (
        <button type="button" onClick={() => onAction("quickKhata")} className={actionButtonClass}>
          <Receipt className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
          {t("khata.quickEntry")}
        </button>
      ) : null}
      {canManageKhata && onManageKhata ? (
        <button type="button" onClick={() => onAction("khata")} className={actionButtonClass}>
          <BookOpen className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
          {t("khata.manageKhata")}
        </button>
      ) : null}
      {canEdit ? (
        <button type="button" onClick={() => onAction("edit")} className={actionButtonClass}>
          <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
          {t("common.edit")}
        </button>
      ) : null}
      {canEdit && canDelete ? (
        <div className="border-t border-[rgb(var(--color-border-primary))] my-1" />
      ) : null}
      {canDelete ? (
        <button
          type="button"
          onClick={() => onAction("delete")}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors cursor-pointer focus:outline-none"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          {t("common.delete")}
        </button>
      ) : null}
    </>
  );

  if (mode === "dropdown") {
    return (
      <div
        ref={menuRef}
        data-customer-context-menu
        className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50"
      >
        {menuBody}
      </div>
    );
  }

  return createPortal(
    <div
      ref={menuRef}
      data-customer-context-menu
      style={{ left: position.left, top: position.top }}
      className="fixed z-[10051] w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1"
    >
      {menuBody}
    </div>,
    document.body,
  );
}

export default CustomerTableActionsMenu;
