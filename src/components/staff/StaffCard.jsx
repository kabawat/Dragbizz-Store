"use client";
import { StaffCardView } from "@dragorbit/features/management";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";

import { useCallback, useState } from "react";
import {
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Trash2,
  Ban,
  Loader2,
} from "lucide-react";
import CopyableContactValue from "@/components/common/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";

const MODULE_LABELS = {
  billing: "Billing",
  invoice: "Invoice",
  product: "Products",
  inventory: "Inventory",
  supplier: "Suppliers",
  customer: "Customers",
  expense: "Expenses",
  purchase_order: "Purchase Orders",
  sales_order: "Sales Orders",
  reports: "Reports",
  analytics: "Analytics",
};

const ACTION_LABELS = [
  "create",
  "read",
  "edit",
  "delete",
  "report",
  "analytics",
];

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  INACTIVE: {
    label: "Inactive",
    icon: Ban,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  REMOVED: {
    label: "Removed",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
};

const StaffCard = ({
  staff,
  onDeleteTemp,
  onResendInvite,
  onRemoveStaff,
  onEditStaff,
  onRefresh,
}) => {
  const [showPermissions, setShowPermissions] = useState(false);
  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } =
    useRowActionMenu();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const isTempStaff = staff.type === "TEMP_STAFF";
  const statusInfo = STATUS_CONFIG[staff.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusInfo.icon;

  const initials = (staff.name || "??")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const activeModules = staff.permissions?.length || 0;

  const handleCancelInvite = async () => {
    if (!onDeleteTemp) return;
    setIsDeleting(true);
    closeMenu();
    try {
      await onDeleteTemp(staff._id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResendInviteLocal = async () => {
    if (!onResendInvite) return;
    setIsResending(true);
    closeMenu();
    try {
      await onResendInvite(staff._id);
    } finally {
      setIsResending(false);
    }
  };

  const handleRemoveStaff = async () => {
    if (!onRemoveStaff) return;
    setIsRemoving(true);
    closeMenu();
    try {
      await onRemoveStaff(staff._id);
    } finally {
      setIsRemoving(false);
    }
  };

  const isBusy = isDeleting || isRemoving || isResending;

  const buildMenuItems = useCallback(() => {
    const items = [];
    if (isTempStaff) {
      items.push({
        key: "resend",
        label: "Resend Invitation",
        icon: isResending ? Loader2 : Mail,
        onClick: handleResendInviteLocal,
      });
      items.push({
        key: "cancel",
        label: "Cancel Invitation",
        icon: Trash2,
        tone: "danger",
        onClick: handleCancelInvite,
      });
    }
    if (!isTempStaff && staff.status === "ACTIVE") {
      items.push({
        key: "edit",
        label: "Edit Permissions",
        icon: Shield,
        onClick: () => {
          closeMenu();
          onEditStaff?.(staff);
        },
      });
    }
    if (!isTempStaff && staff.status !== "REMOVED") {
      items.push({
        key: "remove",
        label: "Remove Staff",
        icon: Trash2,
        tone: "danger",
        onClick: handleRemoveStaff,
      });
    }
    return items;
  }, [
    isTempStaff,
    staff,
    isResending,
    closeMenu,
    onEditStaff,
    handleResendInviteLocal,
    handleCancelInvite,
    handleRemoveStaff,
  ]);

  return (
    <StaffCardView
      model={{
        isBusy,
        openContextMenu,
        rowId: staff._id,
        isTempStaff,
        staff,
        initials,
        CopyableContactValue,
        statusInfo,
        isRemoving,
        StatusIcon,
        setShowPermissions,
        showPermissions,
        activeModules,
        menuRefs,
        isOnline: true,
        toggleDropdown,
        menu,
        RowActionsMenu,
        buildActionItems: buildMenuItems,
        MODULE_LABELS,
        ACTION_LABELS,
        RowContextMenuLayer,
        closeMenu,
      }}
    />
  );
};

export default StaffCard;
