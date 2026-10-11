"use client";
import { InventoryTableView } from "@dragorbit/features/inventory";

import { Copy, Eye, Trash2, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { renderStatusBadge } from "@/utils/statusBadge";

const InventoryTable = ({
  inventories = [],
  onDelete,
  onDuplicate,
  onViewDetails,
  onStockIn,
  loading = false,
  emptyMessage,
  className = "",
  // Infinite scroll props
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  canEdit = false,
  canDelete = false,
  canCreate = false,
}) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);
  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } =
    useRowActionMenu();

  const _defaultEmptyMessage = emptyMessage || t("inventory.noInventory");

  const handleMenuAction = useCallback(
    (inventoryId, action) => {
      closeMenu();
      switch (action) {
        case "view":
          onViewDetails?.(inventoryId);
          break;
        case "stock-in":
          onStockIn?.(inventoryId);
          break;
        case "duplicate":
          onDuplicate?.(inventoryId);
          break;
        case "delete":
          onDelete?.(inventoryId);
          break;
        default:
          break;
      }
    },
    [closeMenu, onViewDetails, onStockIn, onDuplicate, onDelete],
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
      if (canEdit) {
        items.push({
          key: "stock-in",
          label: t("inventory.addStock"),
          icon: TrendingUp,
          tone: "success",
          onClick: run("stock-in"),
        });
      }
      if (canCreate) {
        items.push({
          key: "duplicate",
          label: t("common.duplicate"),
          icon: Copy,
          onClick: run("duplicate"),
        });
      }
      if (canDelete) {
        items.push({ type: "separator" });
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
    [t, canEdit, canCreate, canDelete, handleMenuAction],
  );

  const getInventoryStatusBadge = (inventory) => {
    let status = "INACTIVE";
    if (inventory.status?.isOutOfStock) {
      status = "OUT_OF_STOCK";
    } else if (inventory.status?.isLowStock) {
      status = "LOW_STOCK";
    } else if (inventory.status?.isActive) {
      status = "ACTIVE";
    }

    return renderStatusBadge(status, "general");
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    if (!paymentStatus) return null;
    return renderStatusBadge(paymentStatus, "bill");
  };

  return (
    <InventoryTableView
      model={{
        className,
        inventories,
        hoveredRow,
        setHoveredRow,
        openContextMenu,
        imageError,
        Image,
        setImageError,
        getInventoryStatusBadge,
        getPaymentStatusBadge,
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

export default InventoryTable;
