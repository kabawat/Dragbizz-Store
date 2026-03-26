"use client";
import { Building, Calendar, CreditCard, Edit, Eye, FileText, IndianRupee, Trash2, } from "lucide-react";
import { getCategoryLabel, getPaymentMethodIcon, getPaymentMethodLabel, getStatusLabel, } from "@/data/constants/expenses";
import { useState, useRef, useEffect } from "react";
import { renderStatusBadge } from "@/utils/statusBadge";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { IconButton } from "../ui";

const ExpenseCard = ({
  expense,
  onEdit,
  onDelete,
  onView,
}) => {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const {
    id,
    title,
    billNumber,
    date,
    category,
    amount,
    gst,
    netAmount,
    paymentMethod,
    vendor,
    status,
  } = expense;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setOpenMenu(!openMenu);
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    setOpenMenu(false);
    if (action === "view") onView?.(expense);
    if (action === "edit") onEdit?.(expense);
    if (action === "delete") onDelete?.(expense);
  };

  return (
    <div className="w-full max-w-sm mx-auto rounded-xl border border-[rgb(var(--color-border-primary))] transition-all duration-300 ease-out group overflow-hidden bg-[rgb(var(--color-bg-primary))] cursor-pointer" onClick={() => onView?.(expense)}
    >
      {/* Header with Gradient */}
      <div className="w-full h-32 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 relative flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center border-2 border-[rgb(var(--color-primary))]/20 shadow-lg relative z-10">
          <IndianRupee className="w-8 h-8 text-[rgb(var(--color-primary))]" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>

        {/* Action Menu */}
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <IconButton onClick={handleMenuToggle} />
          {openMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-xl border border-[rgb(var(--color-border-primary))] py-1 z-50">
              <button
                onClick={(e) => handleAction(e, "view")}
                className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200"
              >
                <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                {t("common.viewDetails")}
              </button>
              {onEdit && (
                <button
                  onClick={(e) => handleAction(e, "edit")}
                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  {t("common.edit")}
                </button>
              )}
              {onDelete && (
                <>
                  <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                  <button
                    onClick={(e) => handleAction(e, "delete")}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    {t("common.delete")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-3 left-3">
          {renderStatusBadge(status, "general")}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Title & Vendor */}
        <div>
          <h3 className="font-bold text-lg text-[rgb(var(--color-text-primary))] line-clamp-1 mb-0.5" title={title}>
            {title}
          </h3>
          <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 opacity-70" />
            <span className="truncate">{vendor?.name || vendor || "No Vendor"}</span>
          </p>
        </div>

        {/* Info Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-[rgb(var(--color-text-secondary))]">
              <Calendar className="w-4 h-4 mr-2 opacity-70" />
              <span>{t("common.date")}</span>
            </div>
            <span className="font-medium text-[rgb(var(--color-text-primary))]">{formatDate(date)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-[rgb(var(--color-text-secondary))]">
              <FileText className="w-4 h-4 mr-2 opacity-70" />
              <span>{t("expenses.category")}</span>
            </div>
            <span className="font-medium text-[rgb(var(--color-text-primary))] truncate max-w-[120px]">
              {getCategoryLabel(category?.name || category)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-[rgb(var(--color-text-secondary))]">
              <CreditCard className="w-4 h-4 mr-2 opacity-70" />
              <span>{t("expenses.payment")}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-[rgb(var(--color-text-primary))]">
              <span>{getPaymentMethodIcon(paymentMethod)}</span>
              <span>{getPaymentMethodLabel(paymentMethod)}</span>
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="pt-3 border-t border-[rgb(var(--color-border-primary))]/30">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("expenses.totalAmount")}
            </div>
            <div className="text-xl font-black text-[rgb(var(--color-primary))]">
              ₹{formatCurrency(netAmount || amount)}
            </div>
          </div>
          {gst && gst.amount > 0 && (
            <div className="flex justify-end mt-0.5">
              <span className="text-[10px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase">
                Incl. GST ({gst.percentage}%): ₹{formatCurrency(gst.amount)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;

