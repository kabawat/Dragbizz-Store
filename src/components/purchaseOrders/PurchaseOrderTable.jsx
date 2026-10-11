"use client";
import { PurchaseOrderTableView } from "@dragorbit/features/purchase-orders";

import { Edit, Eye, IndianRupee, Receipt, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

import CopyableContactValue from "@/components/common/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import logger from "@/utils/logger";
import { renderStatusBadge } from "@/utils/statusBadge";
import {
  normalizePurchaseOrder,
  getPurchaseOrderStatus,
} from "@/utils/purchaseOrder";

const PurchaseOrderTable = ({
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
  enableSendMenu = true,
  getShareUrl,
  showToast,
  canRead = false,
  canEdit = false,
  canDelete = false,
}) => {
  const { t } = useTranslation();
  const _defaultEmptyMessage =
    emptyMessage || t("purchaseOrders.noPurchaseOrders");

  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } =
    useRowActionMenu();

  const [openSendMenuId, setOpenSendMenuId] = useState(null);
  const sendMenuRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openSendMenuId &&
        sendMenuRefs.current[openSendMenuId] &&
        !sendMenuRefs.current[openSendMenuId].contains(event.target)
      ) {
        setOpenSendMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openSendMenuId]);

  const buildShareUrl = (row) => {
    if (typeof window === "undefined") return "";
    const base = window.location.origin;
    // Use publicId for public sharing, fallback to _id if publicId doesn't exist
    const publicId = row.publicId || row._id || row.id;
    const path = `/view/purchase-order/${publicId}`;
    return `${base}${path}`;
  };

  const handleCopy = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        if (showToast) showToast("Link copied to clipboard!", "success");
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          if (showToast) showToast("Link copied to clipboard!", "success");
        } catch (err) {
          if (showToast) showToast("Failed to copy link", "error");
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      logger.error("Failed to copy to clipboard:", error);
      if (showToast) showToast("Failed to copy link", "error");
    }
  };

  const handleWhatsAppShare = (row) => {
    const shareUrl = buildShareUrl(row);
    const message = `Hello *${row.supplier?.name || t("common.supplier")}*, Thanks for your business! *Purchase Order: ${row.billNumber || row.poNumber || t("common.na")}* *Link:* ${shareUrl} Thanks *${row.store?.name || t("common.retailManager")}* *${row.store?.phone || t("common.na")}* Sent using *DragBizz: Simple Store Management* (dragbizz.com)`;

    // Get supplier's phone number and format it for WhatsApp
    const supplierPhone = row.supplier?.phone;
    if (supplierPhone) {
      // Remove any non-digit characters and ensure it starts with country code
      const cleanPhone = supplierPhone.replace(/\D/g, "");
      const whatsappPhone = cleanPhone.startsWith("91")
        ? cleanPhone
        : `91${cleanPhone}`;
      window.open(
        `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    } else {
      // Fallback to general WhatsApp if no phone number
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    }

    setOpenSendMenuId(null);
  };

  const handleCopyLink = (row) => {
    const shareUrl = buildShareUrl(row);
    handleCopy(shareUrl);
    setOpenSendMenuId(null);
  };

  const buildMenuItems = useCallback(
    (rowId) => {
      const row = bills.find((b) => (b._id || b.id) === rowId);
      if (!row) return [];
      const normalizedData = normalizePurchaseOrder(row);
      const poStatus = (normalizedData.status || "").toUpperCase();
      const isDeleted = poStatus === "DELETED";
      const hasAdvancePayments = (normalizedData.payments || []).some(
        (payment) => payment.paymentType === "ADVANCE_PAYMENT",
      );
      const hasAdvancePayment =
        normalizedData.advanceAmount > 0 || hasAdvancePayments;

      const run = (action) => () => {
        closeMenu();
        onMenuAction?.(rowId, action);
      };

      const items = [];
      if (canRead) {
        items.push({
          key: "view",
          label: t("common.viewDetails"),
          icon: Eye,
          onClick: run("view"),
        });
      }
      if (!hasAdvancePayment && !isDeleted && canEdit) {
        items.push({
          key: "advancePayment",
          label: t("purchaseOrders.advancePayment"),
          icon: IndianRupee,
          onClick: run("advancePayment"),
        });
      }
      if (!isDeleted && canEdit) {
        items.push({
          key: "createBill",
          label: t("purchaseOrders.createBill"),
          icon: Receipt,
          onClick: run("createBill"),
        });
        items.push({
          key: "edit",
          label: t("common.edit"),
          icon: Edit,
          onClick: run("edit"),
        });
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
    [bills, canRead, canEdit, canDelete, closeMenu, onMenuAction, t],
  );

  return (
    <PurchaseOrderTableView
      model={{
        t,
        bills,
        normalizePurchaseOrder,
        getPurchaseOrderStatus,
        openContextMenu,
        onViewDetails,
        CopyableContactValue,
        formatDate,
        formatCurrency,
        renderStatusBadge,
        enableSendMenu,
        sendMenuRefs,
        setOpenSendMenuId,
        openSendMenuId,
        handleWhatsAppShare,
        handleCopyLink,
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

export default PurchaseOrderTable;
