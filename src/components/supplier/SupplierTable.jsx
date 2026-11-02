"use client";
import { SupplierTableView } from "@dragorbit/features/suppliers";

import { Edit, Eye, Printer, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import CopyableContactValue from "@/components/common/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SupplierTable = ({
  suppliers = [],
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onPrint,
  canEdit = true,
  canDelete = true,
  loading = false,
  emptyMessage,
  className = "",
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}) => {
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState(null);
  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } =
    useRowActionMenu();

  const _defaultEmptyMessage = emptyMessage || t("suppliers.noSuppliers");

  const handleMenuAction = useCallback(
    (supplierId, action) => {
      closeMenu();
      switch (action) {
        case "view":
          onViewDetails?.(supplierId);
          break;
        case "print":
          onPrint?.(supplierId);
          break;
        case "edit":
          onEdit?.(supplierId);
          break;
        case "delete":
          onDelete?.(supplierId);
          break;
        default:
          break;
      }
    },
    [closeMenu, onViewDetails, onPrint, onEdit, onDelete],
  );

  const buildMenuItems = useCallback(
    (rowId) => {
      const run = (action) => () => handleMenuAction(rowId, action);
      const items = [
        {
          key: "view",
          label: t("common.viewDetails"),
          icon: Eye,
          onClick: run("view"),
        },
      ];
      if (onPrint) {
        items.push({
          key: "print",
          label: t("common.print"),
          icon: Printer,
          onClick: run("print"),
        });
      }
      if (canEdit) {
        items.push({
          key: "edit",
          label: t("common.edit"),
          icon: Edit,
          onClick: run("edit"),
        });
      }
      if (canEdit && canDelete) {
        items.push({ type: "separator" });
      }
      if (canDelete) {
        items.push({
          key: "delete",
          label: t("common.delete"),
          icon: Trash2,
          tone: "danger",
          onClick: run("delete"),
        });
      }
      return items;
    },
    [t, onPrint, canEdit, canDelete, handleMenuAction],
  );

  if (loading) {
    return (
      <div
        className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm overflow-hidden ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-16 bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-20 border-b border-[rgb(var(--color-border-primary))]"
            >
              <div className="flex items-center h-full px-6">
                <div className="w-4 h-4 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg mr-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/4"></div>
                  <div className="h-3 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/6"></div>
                </div>
                <div className="w-20 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-16 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-20 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-24 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SupplierTableView
      model={{
        className,
        suppliers,
        hoveredRow,
        setHoveredRow,
        openContextMenu,
        onViewDetails,
        CopyableContactValue,
        t,
        menuRefs,
        toggleDropdown,
        menu,
        RowActionsMenu,
        buildMenuItems,
        isLoadingMore,
        RowContextMenuLayer,
        closeMenu,
      }}
    />
  );
};

export default SupplierTable;
