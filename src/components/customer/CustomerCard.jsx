"use client";
import {
  Edit,
  Eye,
  Mail,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { IconButton } from "../ui";

const CustomerCard = ({
  customer,
  onEdit,
  onDelete,
  onViewDetails,
  className = "",
  canEdit = true,
  canDelete = true,
  ...props
}) => {
  const { t } = useTranslation();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const handleMenuToggle = (customerId) => {
    setOpenMenuId(openMenuId === customerId ? null : customerId);
  };

  const handleMenuAction = (customerId, action) => {
    setOpenMenuId(null);
    switch (action) {
      case "view":
        onViewDetails?.(customerId);
        break;
      case "edit":
        onEdit?.(customerId);
        break;
      case "delete":
        onDelete?.(customerId);
        break;
      default:
        break;
    }
  };

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
          <div className="relative" ref={menuRef}>
            <IconButton
              onClick={() => handleMenuToggle(customer.id)}
            />

            {/* Popup Menu */}
            {openMenuId === customer.id && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-[9999]">
                <button
                  onClick={() => handleMenuAction(customer.id, "view")}
                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                >
                  <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  {t("common.viewDetails")}
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleMenuAction(customer.id, "edit")}
                    className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                  >
                    <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                    {t("common.edit")}
                  </button>
                )}
                {canEdit && canDelete && (
                  <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleMenuAction(customer.id, "delete")}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10 dark:focus:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                    {t("common.delete")}
                  </button>
                )}
              </div>
            )}
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
          <h3 className="font-bold text-md sm:text-xl mb-1 text-[rgb(var(--color-text-primary))]">
            {customer.name || t("common.notAvailable")}
          </h3>
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
                {customer.phone || t("common.notAvailable")}
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
                {customer.email || t("common.notAvailable")}
              </p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                {t("common.email")}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Stats Section */}
        <div className="rounded-lg p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-1.5 md:space-y-2 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))]">
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
              {new Date(customer.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
