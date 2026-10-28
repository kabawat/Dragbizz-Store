"use client";
import { BillTableView } from "@dragorbit/features/bills";

import { CreditCard, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { renderStatusBadge } from "@/utils/statusBadge";

const BillTable = ({
  bills,
  onEdit,
  onDelete,
  onViewDetails,
  loading,
  emptyMessage,
  hasMore,
  onLoadMore,
  isLoadingMore,
  onMenuAction,
  formatCurrency,
  formatDate,
  enableSendMenu = false,
  getShareUrl,
}) => {
  const { t } = useTranslation();
  const _defaultEmptyMessage = emptyMessage || t("bills.noBills");

  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } =
    useRowActionMenu();

  const [openSendMenuId, setOpenSendMenuId] = useState(null);
  const sendMenuRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openSendMenuId &&
        sendMenuRefs.current[openSendMenuId] &&
        !sendMenuRefs.current[openSendMenuId].contains(event.target) &&
        !event.target.closest(".table-share-menu")
      ) {
        setOpenSendMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openSendMenuId]);

  const buildShareUrl = (bill) => {
    if (typeof window === "undefined") return "";
    const base = window.location.origin;
    const path = getShareUrl
      ? getShareUrl(bill)
      : `/dashboard/bills/${bill._id || bill.id}`;
    return `${base}${path}`;
  };

  const handleCopy = async (text) => {
    try {
      if (navigator?.clipboard?.writeText)
        await navigator.clipboard.writeText(text);
    } catch {}
  };

  const buildMenuItems = useCallback(
    (rowId) => {
      const bill = bills.find((b) => (b._id || b.id) === rowId);
      if (!bill) return [];

      const run = (action) => () => {
        closeMenu();
        onMenuAction?.(rowId, action);
      };

      const items = [
        {
          key: "view",
          label: t("common.viewDetails"),
          icon: Eye,
          onClick: run("view"),
        },
      ];
      if (onEdit) {
        items.push({
          key: "edit",
          label: t("common.edit"),
          icon: Edit,
          onClick: run("edit"),
        });
      }
      if (onEdit && bill.paymentStatus !== "PAID") {
        items.push({
          key: "payment",
          label: t("bills.payBill"),
          icon: CreditCard,
          tone: "success",
          onClick: run("payment"),
        });
      }
      if (onDelete) {
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
    [bills, onEdit, onDelete, closeMenu, onMenuAction, t],
  );

  return (
    <BillTableView
      model={{
        t,
        bills,
        openContextMenu,
        formatDate,
        formatCurrency,
        renderStatusBadge,
        enableSendMenu,
        sendMenuRefs,
        setOpenSendMenuId,
        openSendMenuId,
        buildShareUrl,
        handleCopy,
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

export default BillTable;
