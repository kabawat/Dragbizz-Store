"use client";
import {
  BookOpen,
  Edit,
  Eye,
  Mail,
  Phone,
  Receipt,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback } from "react";
import CustomerSourceBadge from "@/components/customer/CustomerSourceBadge";
import CopyableContactValue from "@/components/customer/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import KhataDueBadge from "@/components/khata/KhataDueBadge";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { formatDateDash, getRecordCreatedAt } from "@/utils/dateFormatter";
import { IconButton } from "../ui";

const CustomerCard = ({
  customer,
  onEdit,
  onDelete,
  onViewDetails,
  onManageKhata,
  onQuickKhataEntry,
  className = "",
  canEdit = true,
  canDelete = true,
  canManageKhata = true,
  canQuickKhataEntry = true,
  ...props
}) => {
  const { t } = useTranslation();
  const { menu, menuRefs, closeMenu, toggleDropdown } = useRowActionMenu();

  const handleMenuAction = useCallback((customerId, action) => {
    closeMenu();
    switch (action) {
      case "view":
        onViewDetails?.(customerId);
        break;
      case "edit":
        onEdit?.(customerId);
        break;
      case "khata":
        onManageKhata?.(customerId);
        break;
      case "quickKhata":
        onQuickKhataEntry?.(customerId);
        break;
      case "delete":
        onDelete?.(customerId);
        break;
      default:
        break;
    }
  }, [closeMenu, onViewDetails, onEdit, onManageKhata, onQuickKhataEntry, onDelete]);

  const buildMenuItems = useCallback((rowId) => {
    const run = (action) => () => handleMenuAction(rowId, action);
    const items = [
      { key: "view", label: t("common.viewDetails"), icon: Eye, onClick: run("view") },
    ];
    if (canQuickKhataEntry && onQuickKhataEntry) {
      items.push({ key: "quickKhata", label: t("khata.quickEntry"), icon: Receipt, onClick: run("quickKhata") });
    }
    if (canManageKhata && onManageKhata) {
      items.push({ key: "khata", label: t("khata.manageKhata"), icon: BookOpen, onClick: run("khata") });
    }
    if (canEdit) {
      items.push({ key: "edit", label: t("common.edit"), icon: Edit, onClick: run("edit") });
    }
    if (canEdit && canDelete) {
      items.push({ type: "separator" });
    }
    if (canDelete) {
      items.push({ key: "delete", label: t("common.delete"), icon: Trash2, tone: "danger", onClick: run("delete") });
    }
    return items;
  }, [t, canQuickKhataEntry, onQuickKhataEntry, canManageKhata, onManageKhata, canEdit, canDelete, handleMenuAction]);

  // Grid view - Modern Card Design
  return (
    <div
      className={`w-full max-w-sm mx-auto rounded-xl border border-[rgb(var(--color-border-primary))] group overflow-hidden ${className}`}
      {...props}
    >
      {/* Customer Avatar Section with Gradient Background */}
      <div className="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 via-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-bg-secondary))] relative">
        {/* Customer Avatar */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-t-xl">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center border-2 sm:border-3 border-[rgb(var(--color-primary))]/20 shadow-lg">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[rgb(var(--color-primary))]" />
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-t-xl"></div>

        {/* Action Menu */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative" ref={(el) => (menuRefs.current[customer.id] = el)}>
            <IconButton onClick={() => toggleDropdown(customer.id)} />

            {menu?.rowId === customer.id && menu.mode === "dropdown" ? (
              <RowActionsMenu items={buildMenuItems(customer.id)} mode="dropdown" />
            ) : null}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 md:bottom-4 md:left-4">
          <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
            Active
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
        {/* Customer Name */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-md sm:text-xl text-[rgb(var(--color-text-primary))]">
              {customer.name || t("common.notAvailable")}
            </h3>
            <KhataDueBadge totalDue={customer.account?.totalDue ?? customer.totalDue} />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 sm:space-y-3">
          {/* Phone */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate text-[rgb(var(--color-text-primary))]">
                <CopyableContactValue value={customer.phone} fallback={t("common.notAvailable")} />
              </p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                {t("common.phone")}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-500/10 rounded-full flex items-center justify-center">
              <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate text-[rgb(var(--color-text-primary))]">
                <CopyableContactValue value={customer.email} fallback={t("common.notAvailable")} />
              </p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                {t("common.email")}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Stats Section */}
        <div className="rounded-lg p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-1.5 md:space-y-2 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
              {t("customers.source")}
            </span>
            <CustomerSourceBadge source={customer.source} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
              {t("common.status")}
            </span>
            <span className="text-xs sm:text-sm font-medium text-green-600">
              {t("customers.activeCustomer")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
              {t("customers.memberSince")}
            </span>
            <span className="text-xs sm:text-sm font-medium text-[rgb(var(--color-text-primary))]">
              {formatDateDash(getRecordCreatedAt(customer))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
