"use client";
import { BookOpen, Edit, Eye, MoreVertical, Receipt, Trash2, Users } from "lucide-react";
import CustomerSourceBadge from "@/components/customer/CustomerSourceBadge";
import CopyableContactValue from "@/components/customer/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDateDash, getRecordCreatedAt } from "@/utils/dateFormatter";
import { useCallback } from "react";

function CustomerBalanceAmount({ totalDue }) {
  const amount = Number(totalDue) || 0;
  if (amount === 0) {
    return <span className="text-sm text-[rgb(var(--color-text-secondary))]">—</span>;
  }

  const valueClass = amount < 0 ? "text-green-600" : "text-orange-600";

  return (
    <span className={`text-sm font-semibold tabular-nums ${valueClass}`}>
      {formatCurrency(Math.abs(amount))}
    </span>
  );
}

const CustomerTable = ({
  customers = [],
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
}) => {
  const { t } = useTranslation();
  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } = useRowActionMenu();

  const handleMenuAction = useCallback((customerId, action) => {
    closeMenu();
    switch (action) {
      case "view": onViewDetails?.(customerId); break;
      case "edit": onEdit?.(customerId); break;
      case "khata": onManageKhata?.(customerId); break;
      case "quickKhata": onQuickKhataEntry?.(customerId); break;
      case "delete": onDelete?.(customerId); break;
      default: break;
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

  return (
    <div className={`${className}`}>
      {/* Sticky Header */}
      <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
        <table className="w-full min-w-[880px] table-fixed">
          <thead>
            <tr>
              <th className="w-[22%] px-6 py-4 text-left">
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  {t("customers.customer")}
                </span>
              </th>
              <th className="w-[12%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("khata.balance")}
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("customers.phone")}
              </th>
              <th className="w-[18%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("customers.email")}
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("customers.source")}
              </th>
              <th className="w-[12%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.status")}
              </th>
              <th className="w-[4%] px-1 py-4 text-center">
                <MoreVertical className="w-4 h-4 mx-auto" />
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full min-w-[880px] table-fixed">
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => {
              const totalDue = customer.account?.totalDue ?? customer.totalDue;
              const rowId = customer.id;

              return (
              <tr
                key={customer.id}
                className="transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"
                onContextMenu={(event) => openContextMenu(event, rowId)}
              >
                {/* Customer Column */}
                <td
                  className="w-[22%] px-6 py-4 cursor-pointer group/cell"
                  onClick={() => onViewDetails?.(customer.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 rounded-lg flex-shrink-0 flex items-center justify-center border border-[rgb(var(--color-primary))]/20 group-hover/cell:border-[rgb(var(--color-primary))]/40 transition-colors">
                      <Users className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate group-hover/cell:text-[rgb(var(--color-primary))] transition-colors">
                        {customer.name || "N/A"}
                      </h3>
                      <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {t("common.added")}:{" "}
                        {formatDateDash(getRecordCreatedAt(customer))}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Balance Column */}
                <td className="w-[12%] px-6 py-4">
                  <CustomerBalanceAmount totalDue={totalDue} />
                </td>

                {/* Phone Column */}
                <td className="w-[14%] px-6 py-4">
                  <CopyableContactValue
                    value={customer.phone}
                    className="text-sm font-semibold text-[rgb(var(--color-text-primary))]"
                  />
                </td>

                {/* Email Column */}
                <td className="w-[18%] px-6 py-4">
                  <CopyableContactValue
                    value={customer.email}
                    className="text-sm text-[rgb(var(--color-text-primary))]"
                  />
                </td>

                {/* Source Column */}
                <td className="w-[14%] px-6 py-4">
                  <CustomerSourceBadge source={customer.source} />
                </td>

                {/* Status Column */}
                <td className="w-[12%] px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    customer.isActive === false
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : "bg-green-500/10 text-green-600 border-green-500/20"
                  }`}>
                    {customer.isActive === false ? t("common.inactive") : t("common.active")}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="w-[4%] px-1 py-4 text-center">
                  <div
                    className="relative inline-block"
                    ref={(el) => (menuRefs.current[rowId] = el)}
                  >
                    <button
                      onClick={() => toggleDropdown(rowId)}
                      className="p-1.5 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                      title={t("common.actions")}
                    >
                      <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                    </button>

                    {menu?.rowId === rowId && menu.mode === "dropdown" ? (
                      <RowActionsMenu items={buildMenuItems(rowId)} mode="dropdown" />
                    ) : null}
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      <RowContextMenuLayer open={menu?.mode === "context"} onClose={closeMenu} />
      {menu?.mode === "context" ? (
        <RowActionsMenu
          mode="context"
          anchorPoint={{ x: menu.x, y: menu.y }}
          items={buildMenuItems(menu.rowId)}
          className="w-48"
        />
      ) : null}
    </div>
  );
};

export default CustomerTable;
