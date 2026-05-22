"use client";
import {
  Calendar,
  Edit,
  Eye,
  FileText,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getCategoryLabel,
  getPaymentMethodIcon,
  getPaymentMethodLabel,
} from "@/data/constants/expenses";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { renderStatusBadge } from "@/utils/statusBadge";

const ExpenseTable = ({
  expenses = [],
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  sortBy,
  sortOrder,
  onSort,
  loading = false,
  emptyMessage,
  className = "",
  headerOnly = false,
  bodyOnly = false,
}) => {
  const { t } = useTranslation();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  const defaultEmptyMessage = emptyMessage || t("expenses.noExpenses");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId].contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleMenuAction = (expenseId, action) => {
    setOpenMenuId(null);
    const expense = expenses.find((e) => e.id === expenseId);
    switch (action) {
      case "view":
        onView?.(expense?.id?.toString());
        break;
      case "edit":
        onEdit?.(expense?.id?.toString());
        break;
      case "delete":
        onDelete?.(expense?.id?.toString());
        break;
      default:
        break;
    }
  };

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

  // headerOnly: sirf header render karo (fixed, non-scrolling)
  if (headerOnly) {
    return (
      <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] shrink-0 overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed">
          <thead>
            <tr>
              <th className="w-[22%] px-6 py-4 text-left">
                <span className="text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  {t("expenses.expenseTitle")}
                </span>
              </th>
              <th className="w-[12%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.date")}
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("expenses.category")}
              </th>
              <th className="w-[12%] px-6 py-4 text-right text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.amount")}
              </th>
              <th className="w-[16%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("expenses.paymentMethod")}
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("expenses.vendor")}
              </th>
              <th className="w-[10%] px-6 py-4 text-center text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.status")}
              </th>
              <th className="w-24 px-6 py-4 text-center text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
        </table>
      </div>
    );
  }

  // bodyOnly: sirf rows render karo (scrollable container mein hoga)
  if (bodyOnly) {
    if (isLoading || loading) {
      return (
        <table className="w-full min-w-[900px] table-fixed">
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-[rgb(var(--color-border-primary))]">
                <td className="w-[22%] px-6 py-4">
                  <div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-3/4 animate-pulse mb-2" />
                  <div className="h-3 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/2 animate-pulse" />
                </td>
                <td className="w-[12%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-20 animate-pulse" /></td>
                <td className="w-[14%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-20 animate-pulse" /></td>
                <td className="w-[12%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-16 animate-pulse" /></td>
                <td className="w-[16%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-24 animate-pulse" /></td>
                <td className="w-[14%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-20 animate-pulse" /></td>
                <td className="w-[10%] px-6 py-4"><div className="h-6 bg-[rgb(var(--color-bg-tertiary))] rounded-full w-16 animate-pulse" /></td>
                <td className="w-24 px-6 py-4" />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="w-full min-w-[900px] table-fixed">
        <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"
            >
              <td
                className="w-[22%] px-6 py-4 cursor-pointer group/cell"
                onClick={() => onView?.(expense?.id)}
              >
                <div className="font-semibold text-sm text-[rgb(var(--color-text-primary))] group-hover/cell:text-[rgb(var(--color-primary))] transition-colors duration-200 truncate">
                  {expense.title}
                </div>
                <div className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-medium mt-0.5 leading-tight">
                  {expense.billNumber || t("expenses.noBillNumber")}
                </div>
              </td>
              <td className="w-[12%] px-6 py-4 text-sm text-[rgb(var(--color-text-secondary))]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[rgb(var(--color-text-tertiary))] shrink-0" />
                  <span>{formatDate(expense.date)}</span>
                </div>
              </td>
              <td className="w-[14%] px-6 py-4 text-sm text-[rgb(var(--color-text-primary))]">
                {getCategoryLabel(expense.category?.name || expense.category)}
              </td>
              <td className="w-[12%] px-6 py-4 text-right">
                <div className="font-bold text-sm text-[rgb(var(--color-text-primary))]">₹{formatCurrency(expense.amount)}</div>
              </td>
              <td className="w-[16%] px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm shrink-0">{getPaymentMethodIcon(expense.paymentMethod)}</span>
                  <span className="text-sm text-[rgb(var(--color-text-primary))] truncate">{getPaymentMethodLabel(expense.paymentMethod)}</span>
                </div>
              </td>
              <td className="w-[14%] px-6 py-4 text-sm text-[rgb(var(--color-text-primary))] truncate">
                {expense.vendor?.name || (typeof expense.vendor === "string" ? expense.vendor : "") || "-"}
              </td>
              <td className="w-[10%] px-6 py-4 text-center">
                <div className="inline-flex">{renderStatusBadge(expense.status, "general")}</div>
              </td>
              <td className="w-24 px-6 py-4 text-center">
                <div
                  className="relative inline-block"
                  ref={(el) => (menuRefs.current[expense.id] = el)}
                >
                  <button
                    onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
                    className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                    title={t("common.actions")}
                  >
                    <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                  </button>
                  {openMenuId === expense.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                      <button
                        onClick={() => handleMenuAction(expense.id, "view")}
                        className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                      >
                        <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                        {t("common.viewDetails")}
                      </button>
                      {onEdit && (
                        <button
                          onClick={() => handleMenuAction(expense.id, "edit")}
                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                        >
                          <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          {t("common.edit")}
                        </button>
                      )}
                      {onDelete && (
                        <>
                          <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                          <button
                            onClick={() => handleMenuAction(expense.id, "delete")}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            {t("common.delete")}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Default full render (standalone use without headerOnly/bodyOnly)
  if (isLoading || loading) {
    return (
      <div className={`h-full ${className}`}>
        {/* Fixed Header Skeleton */}
        <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
          <table className="w-full min-w-[900px] table-fixed">
            <thead>
              <tr>
                <th className="w-[22%] px-6 py-4"><div className="h-3 bg-[rgb(var(--color-bg-secondary))] rounded w-20 animate-pulse" /></th>
                <th className="w-[12%] px-6 py-4"><div className="h-3 bg-[rgb(var(--color-bg-secondary))] rounded w-14 animate-pulse" /></th>
                <th className="w-[14%] px-6 py-4"><div className="h-3 bg-[rgb(var(--color-bg-secondary))] rounded w-16 animate-pulse" /></th>
                <th className="w-[12%] px-6 py-4"><div className="h-3 bg-[rgb(var(--color-bg-secondary))] rounded w-16 animate-pulse" /></th>
                <th className="w-[16%] px-6 py-4"><div className="h-3 bg-[rgb(var(--color-bg-secondary))] rounded w-20 animate-pulse" /></th>
                <th className="w-[14%] px-6 py-4"><div className="h-3 bg-[rgb(var(--color-bg-secondary))] rounded w-16 animate-pulse" /></th>
                <th className="w-[10%] px-6 py-4"><div className="h-3 bg-[rgb(var(--color-bg-secondary))] rounded w-12 animate-pulse" /></th>
                <th className="w-24 px-6 py-4" />
              </tr>
            </thead>
          </table>
        </div>
        {/* Body Skeleton */}
        <div>
          <table className="w-full min-w-[900px] table-fixed">
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-[rgb(var(--color-border-primary))]">
                  <td className="w-[22%] px-6 py-4">
                    <div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-3/4 animate-pulse mb-2" />
                    <div className="h-3 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/2 animate-pulse" />
                  </td>
                  <td className="w-[12%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-20 animate-pulse" /></td>
                  <td className="w-[14%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-20 animate-pulse" /></td>
                  <td className="w-[12%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-16 animate-pulse" /></td>
                  <td className="w-[16%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-24 animate-pulse" /></td>
                  <td className="w-[14%] px-6 py-4"><div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-20 animate-pulse" /></td>
                  <td className="w-[10%] px-6 py-4"><div className="h-6 bg-[rgb(var(--color-bg-tertiary))] rounded-full w-16 animate-pulse" /></td>
                  <td className="w-24 px-6 py-4" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {defaultEmptyMessage}
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))]">
              {t("expenses.startAddingExpense")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
        <table className="w-full min-w-[900px] table-fixed">
          <thead>
            <tr>
              <th className="w-[22%] px-6 py-4 text-left">
                <span className="text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  {t("expenses.expenseTitle")}
                </span>
              </th>
              <th className="w-[12%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.date")}
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("expenses.category")}
              </th>
              <th className="w-[12%] px-6 py-4 text-right text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.amount")}
              </th>
              <th className="w-[16%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("expenses.paymentMethod")}
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("expenses.vendor")}
              </th>
              <th className="w-[10%] px-6 py-4 text-center text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.status")}
              </th>
              <th className="w-24 px-6 py-4 text-center text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div>
        <table className="w-full min-w-[900px] table-fixed">
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
            {expenses.map((expense) => {
              return (
                <tr
                  key={expense.id}
                  className="group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"
                >
                  {/* Title + Bill Number */}
                  <td
                    className="w-[22%] px-6 py-4 cursor-pointer group/cell"
                    onClick={() => onView?.(expense?.id)}
                  >
                    <div className="font-semibold text-sm text-[rgb(var(--color-text-primary))] group-hover/cell:text-[rgb(var(--color-primary))] transition-colors duration-200 truncate">
                      {expense.title}
                    </div>
                    <div className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-medium mt-0.5 leading-tight">
                      {expense.billNumber || t("expenses.noBillNumber")}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="w-[12%] px-6 py-4 text-sm text-[rgb(var(--color-text-secondary))]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[rgb(var(--color-text-tertiary))] shrink-0" />
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="w-[14%] px-6 py-4 text-sm text-[rgb(var(--color-text-primary))]">
                    {getCategoryLabel(expense.category?.name || expense.category)}
                  </td>

                  {/* Amount */}
                  <td className="w-[12%] px-6 py-4 text-right">
                    <div className="font-bold text-sm text-[rgb(var(--color-text-primary))]">
                      ₹{formatCurrency(expense.amount)}
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td className="w-[16%] px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm shrink-0">
                        {getPaymentMethodIcon(expense.paymentMethod)}
                      </span>
                      <span className="text-sm text-[rgb(var(--color-text-primary))] truncate">
                        {getPaymentMethodLabel(expense.paymentMethod)}
                      </span>
                    </div>
                  </td>

                  {/* Vendor */}
                  <td className="w-[14%] px-6 py-4 text-sm text-[rgb(var(--color-text-primary))] truncate">
                    {expense.vendor?.name || (typeof expense.vendor === "string" ? expense.vendor : "") || "-"}
                  </td>

                  {/* Status */}
                  <td className="w-[10%] px-6 py-4 text-center">
                    <div className="inline-flex">
                      {renderStatusBadge(expense.status, "general")}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="w-24 px-6 py-4 text-center">
                    <div
                      className="relative inline-block"
                      ref={(el) => (menuRefs.current[expense.id] = el)}
                    >
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === expense.id ? null : expense.id
                          )
                        }
                        className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                        title={t("common.actions")}
                      >
                        <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                      </button>

                      {/* Popup Menu */}
                      {openMenuId === expense.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                          <button
                            onClick={() => handleMenuAction(expense.id, "view")}
                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                          >
                            <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                            {t("common.viewDetails")}
                          </button>
                          {onEdit && (
                            <button
                              onClick={() => handleMenuAction(expense.id, "edit")}
                              className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                            >
                              <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                              {t("common.edit")}
                            </button>
                          )}
                          {onDelete && (
                            <>
                              <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                              <button
                                onClick={() => handleMenuAction(expense.id, "delete")}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                                {t("common.delete")}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;
