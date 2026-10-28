"use client";

import { Tooltip as SharedTooltip } from "@dragorbit/ui";
import { DataTable } from "@dragorbit/ui/table";
import { Calendar, Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import { useCallback } from "react";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import {
  getCategoryLabel,
  getPaymentMethodIcon,
  getPaymentMethodLabel,
} from "@/data/constants/expenses";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { renderStatusBadge } from "@/utils/statusBadge";

const ExpenseTable = ({
  variant,
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
}) => {
  const { t } = useTranslation();
  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } =
    useRowActionMenu();
  const defaultEmptyMessage = emptyMessage || t("expenses.noExpenses");
  const handleMenuAction = useCallback(
    (expenseId, action) => {
      closeMenu();
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
    },
    [closeMenu, expenses, onView, onEdit, onDelete]
  );
  const buildMenuItems = useCallback(
    (rowId) => {
      const run = (action) => () => handleMenuAction(rowId, action);
      const items = [
        {
          key: "view",
          label: t("common.viewDetails"),
          icon: Eye,
          onClick: run("view"),
        },
      ];
      if (onEdit) {
        items.push({
          key: "edit",
          label: t("common.edit"),
          icon: Edit,
          onClick: run("edit"),
        });
      }
      if (onDelete) {
        items.push({
          type: "separator",
        });
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
    [t, onEdit, onDelete, handleMenuAction]
  );
  const renderActionsCell = (expense) => {
    const rowId = expense.id;
    return (
      <td className="w-24 px-6 py-4 text-center">
        <div
          className="relative inline-block"
          ref={(el) => (menuRefs.current[rowId] = el)}
        >
          <SharedTooltip content={t("common.actions")}><button aria-label={t("common.actions")}
            onClick={() => toggleDropdown(rowId)}
            className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"

          >
            <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
          </button></SharedTooltip>
          {menu?.rowId === rowId && menu.mode === "dropdown" ? (
            <RowActionsMenu items={buildMenuItems(rowId)} mode="dropdown" />
          ) : null}
        </div>
      </td>
    );
  };
  const contextMenuLayer = (
    <>
      <RowContextMenuLayer
        open={menu?.mode === "context"}
        onClose={closeMenu}
      />
      {menu?.mode === "context" ? (
        <RowActionsMenu
          mode="context"
          anchorPoint={{
            x: menu.x,
            y: menu.y,
          }}
          items={buildMenuItems(menu.rowId)}
          className="w-48"
        />
      ) : null}
    </>
  );
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

  return (
    <div className={`h-full ${className}`}>
      <div>
        <DataTable
          variant={variant}
          loading={isLoading || loading}
          className="min-w-0"
          minWidth={900}
          caption={t("expenses.expenseTitle")}
          emptyContent={defaultEmptyMessage}
        >
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
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
            {expenses.map((expense) => {
              return (
                <tr
                  key={expense.id}
                  className="group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"
                  onContextMenu={(event) => openContextMenu(event, expense.id)}
                >
                  {/* Title + Bill Number */}
                  <td
                    className="w-[22%] px-6 py-4 cursor-pointer group/cell"
                    onClick={() => onView?.(expense?.id)}
                  >
                    <div className="font-semibold text-sm text-[rgb(var(--color-text-primary))] group-hover/cell:text-[rgb(var(--color-primary))] transition-colors duration-200 truncate">
                      {expense.title}
                    </div>
                    <div className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] font-medium mt-0.5 leading-tight">
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
                    {getCategoryLabel(
                      expense.category?.name || expense.category
                    )}
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
                    {expense.vendor?.name ||
                      (typeof expense.vendor === "string"
                        ? expense.vendor
                        : "") ||
                      "-"}
                  </td>

                  {/* Status */}
                  <td className="w-[10%] px-6 py-4 text-center">
                    <div className="inline-flex">
                      {renderStatusBadge(expense.status, "general")}
                    </div>
                  </td>

                  {renderActionsCell(expense)}
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </div>
      {contextMenuLayer}
    </div>
  );
};
export default ExpenseTable;
