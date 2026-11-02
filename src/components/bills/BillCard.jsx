"use client";
import { BillCardView } from "@dragorbit/features/bills";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { memo, useMemo } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { renderStatusBadge } from "@/utils/statusBadge";
import { IconButton } from "../ui";

const ICON_MAP = {
  PAID: CheckCircle,
  PARTIAL: Clock,
  UNPAID: Clock,
  OVERDUE: AlertTriangle,
};

const BillCard = ({
  bill,
  onEdit,
  onDelete,
  openMenuId,
  onMenuToggle,
  onMenuAction,
  menuRefs,
  formatCurrency,
  formatDate,
}) => {
  const { t } = useTranslation();

  // Determine status for renderStatusBadge
  const status = useMemo(() => {
    let s = bill.paymentStatus || "UNPAID";
    if (new Date(bill.dueDate) < new Date() && bill.dueAmount > 0) {
      s = "OVERDUE";
    }
    return s;
  }, [bill.paymentStatus, bill.dueDate, bill.dueAmount]);

  const StatusIcon = ICON_MAP[status] || Clock;

  const model = useMemo(
    () => ({
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
    }),
    [
      menuRefs,
      bill,
      onMenuToggle,
      t,
      openMenuId,
      onMenuAction,
      onEdit,
      onDelete,
      status,
      StatusIcon,
      formatDate,
      formatCurrency,
    ]
  );

  return <BillCardView model={model} />;
};

export default memo(BillCard);
