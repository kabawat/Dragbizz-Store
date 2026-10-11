"use client";
import { PurchaseOrderCardView } from "@dragorbit/features/purchase-orders";

import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  normalizePurchaseOrder,
  getPurchaseOrderStatus,
} from "@/utils/purchaseOrder";
import { getStatusBadge as getBaseStatusBadge } from "@/utils/statusBadge";

const PurchaseOrderCard = ({
  purchaseOrder,
  onEdit,
  onDelete,
  onViewDetails,
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
  const normalizedData = normalizePurchaseOrder(purchaseOrder);
  const { status, icon: StatusIcon } = getPurchaseOrderStatus(normalizedData);
  const statusConfig = getBaseStatusBadge(status, "purchase-order");

  const poStatus = (normalizedData.status || "").toUpperCase();
  const isDeleted = poStatus === "DELETED";

  const hasAdvancePayments = (normalizedData.payments || []).some(
    (payment) => payment.paymentType === "ADVANCE_PAYMENT",
  );
  const hasAdvancePayment =
    normalizedData.advanceAmount > 0 || hasAdvancePayments;

  const actions = [];
  if (canRead) actions.push("view");
  if (!hasAdvancePayment && !isDeleted && canEdit) {
    actions.push("advancePayment");
  }
  if (!isDeleted && canEdit) {
    actions.push("createBill", "edit");
  }
  if (canDelete) actions.push("delete");

  return (
    <PurchaseOrderCardView
      model={{
        purchaseOrder,
        onMenuAction,
        openMenuId,
        onMenuToggle,
        menuRefs,
        actions,
        enableSendMenu,
        getShareUrl,
        formatCurrency,
        formatDate,
        showToast,
        onViewDetails,
        normalizedData,
        statusConfig,
        StatusIcon,
        t,
      }}
    />
  );
};

export default PurchaseOrderCard;
