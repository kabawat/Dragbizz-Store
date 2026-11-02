"use client";
import { PurchaseOrderGridPresentation } from "@dragorbit/features/purchase-orders";

import { useTranslation } from "@/hooks/ui/useTranslation";
import PurchaseOrderCard from "./PurchaseOrderCard";

const PurchaseOrderGrid = ({
  purchaseOrders,
  onEdit,
  onDelete,
  onViewDetails,
  isLoadingMore,
  openMenuId,
  onMenuToggle,
  onMenuAction,
  menuRefs,
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

  return (
    <PurchaseOrderGridPresentation
      model={{
        purchaseOrders,
        PurchaseOrderCard,
        onEdit,
        onDelete,
        onViewDetails,
        openMenuId,
        onMenuToggle,
        onMenuAction,
        menuRefs,
        formatCurrency,
        formatDate,
        enableSendMenu,
        getShareUrl,
        showToast,
        canRead,
        canEdit,
        canDelete,
        isLoadingMore,
        t,
      }}
    />
  );
};

export default PurchaseOrderGrid;
