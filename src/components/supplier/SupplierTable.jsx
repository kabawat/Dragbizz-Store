"use client";
import { Building, Edit, Eye, MoreVertical, Printer, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import CopyableContactValue from "@/components/common/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SupplierTable = ({
  suppliers = [],
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onPrint,
  canEdit = true,
  canDelete = true,
  loading = false,
  emptyMessage,
  className = "",
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}) => {
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState(null);
  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } = useRowActionMenu();

  const _defaultEmptyMessage = emptyMessage || t("suppliers.noSuppliers");

  const handleMenuAction = useCallback((supplierId, action) => {
    closeMenu();
    switch (action) {
      case "view":
        onViewDetails?.(supplierId);
        break;
      case "print":
        onPrint?.(supplierId);
        break;
      case "edit":
        onEdit?.(supplierId);
        break;
      case "delete":
        onDelete?.(supplierId);
        break;
      default:
        break;
    }
  }, [closeMenu, onViewDetails, onPrint, onEdit, onDelete]);

  const buildMenuItems = useCallback((rowId) => {
    const run = (action) => () => handleMenuAction(rowId, action);
    const items = [
      { key: "view", label: t("common.viewDetails"), icon: Eye, onClick: run("view") },
    ];
    if (onPrint) {
      items.push({ key: "print", label: t("common.print"), icon: Printer, onClick: run("print") });
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
  }, [t, onPrint, canEdit, canDelete, handleMenuAction]);

  if (loading) {
    return (
      <div
        className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-sm overflow-hidden ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-16 bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-20 border-b border-[rgb(var(--color-border-primary))]"
            >
              <div className="flex items-center h-full px-6">
                <div className="w-4 h-4 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg mr-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/4"></div>
                  <div className="h-3 bg-[rgb(var(--color-bg-tertiary))] rounded w-1/6"></div>
                </div>
                <div className="w-20 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-16 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-20 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded mr-4"></div>
                <div className="w-24 h-6 bg-[rgb(var(--color-bg-tertiary))] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="relative">
        <table className="w-full min-w-[800px]">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-10">
            <tr>
              <th className="px-4 py-4 text-left">
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  Supplier
                </span>
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Account
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Total Bills
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                Status
              </th>
              <th className="w-24 px-4 py-4 text-center">
                <MoreVertical className="w-4 h-4 mx-auto" />
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
            {suppliers.map((supplier, index) => {
              const rowId = supplier.id;
              return (
                <tr
                  key={supplier.id}
                  className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${hoveredRow === index
                    ? "bg-[rgb(var(--color-bg-tertiary))]"
                    : ""
                    }`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onContextMenu={(event) => openContextMenu(event, rowId)}
                >
                  {/* Supplier Column */}
                  <td className="px-4 py-2 cursor-pointer" onClick={() => onViewDetails?.(supplier.id)}>
                    <div className="flex items-center gap-4">
                      {/* Supplier Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-[rgb(var(--color-border-primary))]">
                        <Building className="w-6 h-6 text-[rgb(var(--color-text-tertiary))]" />
                      </div>

                      {/* Supplier Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[rgb(var(--color-text-primary))] text-sm truncate group-hover:text-[rgb(var(--color-primary))] transition-colors duration-200">
                          {supplier.name || "N/A"}
                        </h3>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] font-medium">
                          GST: {supplier.gstNumber || "N/A"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            Added:{" "}
                            {new Date(
                              supplier.createdAt || Date.now()
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Column */}
                  <td
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => onViewDetails?.(supplier.id)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))] transition-colors duration-200">
                          {supplier.agency || "N/A"}
                        </span>
                      </div>
                      <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {supplier.phone ? (
                          <CopyableContactValue value={supplier.phone} className="text-xs" />
                        ) : (
                          <CopyableContactValue value={supplier.email} className="text-xs" />
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Account Column */}
                  <td className="px-4 py-2">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-green-600">
                        Paid: ₹
                        {supplier.account?.totalPaid?.toLocaleString() || "0"}
                      </div>
                      <div className="text-sm font-semibold text-red-600">
                        Due: ₹
                        {supplier.account?.totalDue?.toLocaleString() ||
                          supplier.account?.dueAmount?.toLocaleString() ||
                          "0"}
                      </div>
                    </div>
                  </td>

                  {/* Total Bills Column */}
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                        {supplier.account?.totalBills || "0"}
                      </span>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-2">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${supplier.isActive
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                          }`}
                      >
                        {supplier.isActive
                          ? t("common.active")
                          : t("common.inactive")}
                      </span>
                      <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {supplier.account?.onTimePaymentRate || "0"}% on-time
                      </div>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="w-24 px-4 py-2 text-center">
                    <div
                      className="relative inline-block"
                      ref={(el) => (menuRefs.current[rowId] = el)}
                    >
                      <button
                        onClick={() => toggleDropdown(rowId)}
                        className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                        title={t("common.moreActions")}
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

      {/* Infinite Scroll Loading */}
      {isLoadingMore && (
        <div className="bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] px-4 py-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                Loading more suppliers...
              </span>
            </div>
          </div>
        </div>
      )}

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

export default SupplierTable;
