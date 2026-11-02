"use client";
import { PaymentTableView } from "@dragorbit/features/payments";

import { PaymentTableRowView } from "@dragorbit/features/payments";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit, Eye, Trash2 } from "lucide-react";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  formatCurrency,
  formatDate,
  getPaymentMethodBadge,
  getPaymentTypeBadge,
  getStatusBadge,
} from "./utils";

const PaymentTableRow = ({
  rowNumber,
  payment,
  menuRefs,
  menu,
  toggleDropdown,
  openContextMenu,
  buildMenuItems,
  canEdit,
  canDelete,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const paymentId = payment._id || payment.id;
  const statusBadge = useMemo(
    () => getStatusBadge(payment.paymentStatus || payment.status),
    [payment.paymentStatus, payment.status]
  );
  const methodBadge = useMemo(
    () => getPaymentMethodBadge(payment.paymentMethod, t),
    [payment.paymentMethod, t]
  );
  const typeBadge = useMemo(
    () => getPaymentTypeBadge(payment.paymentType, t),
    [payment.paymentType, t]
  );
  const StatusIcon = statusBadge.icon;

  return (
    <PaymentTableRowView
      model={{
        openContextMenu,
        paymentId,
        rowNumber,
        payment,
        formatDate,
        formatCurrency,
        typeBadge,
        methodBadge,
        statusBadge,
        StatusIcon,
        menuRefs,
        toggleDropdown,
        menu,
        RowActionsMenu,
        buildMenuItems,
        onRoute0: (value0) =>
          router.push("/dashboard/payments/" + String(value0) + ""),
        onRoute1: (value0) =>
          router.push("/dashboard/suppliers/" + String(value0) + ""),
      }}
    />
  );
};

const PaymentTable = ({
  variant,
  showNumOfData = true,
  rowNumberOffset = 0,
  payments = [],
  isLoadingMore = false,
  handleMenuAction,
  canEdit,
  canDelete,
}) => {
  const { t } = useTranslation();
  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } =
    useRowActionMenu();

  const buildMenuItems = useCallback(
    (rowId) => {
      const run = (action) => () => {
        closeMenu();
        handleMenuAction?.(rowId, action);
      };
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
    [t, canEdit, canDelete, closeMenu, handleMenuAction]
  );

  return (
    <PaymentTableView
      model={{
        variant,
        showNumOfData,
        rowNumberOffset,
        payments,
        PaymentTableRow,
        menuRefs,
        menu,
        toggleDropdown,
        openContextMenu,
        buildMenuItems,
        canEdit,
        canDelete,
        isLoadingMore,
        t,
        RowContextMenuLayer,
        closeMenu,
        RowActionsMenu,
      }}
    />
  );
};

export default PaymentTable;
