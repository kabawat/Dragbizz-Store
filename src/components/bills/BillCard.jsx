"use client";
import { BillCardView } from "@dragorbit/features/bills";

import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { renderStatusBadge } from "@/utils/statusBadge";
import { IconButton } from "../ui";

const BillCard = ({
  bill,
  onEdit,
  onDelete,
  onViewDetails,
  openMenuId,
  onMenuToggle,
  onMenuAction,
  menuRefs,
  formatCurrency,
  formatDate,
}) => {
  const { t } = useTranslation();

  // Determine status for renderStatusBadge
  let status = bill.paymentStatus || "UNPAID";
  if (new Date(bill.dueDate) < new Date() && bill.dueAmount > 0) {
    status = "OVERDUE";
  }

  // Map icons for bills
  const iconMap = {
    PAID: CheckCircle,
    PARTIAL: Clock,
    UNPAID: Clock,
    OVERDUE: AlertTriangle,
  };
  const StatusIcon = iconMap[status] || Clock;

  return (
    <BillCardView
      model={{
        menuRefs,
        bill,
        IconButton,
        onMenuToggle,
        t,
        openMenuId,
        onMenuAction,
        onEdit,
        onDelete,
        renderStatusBadge,
        status,
        StatusIcon,
        formatDate,
        formatCurrency,
      }}
    />
  );
};

export default BillCard;
