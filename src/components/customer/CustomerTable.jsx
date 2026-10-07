"use client";
import {
  BookOpen,
  Edit,
  Eye,
  MoreVertical,
  Receipt,
  Trash2,
  Users,
} from "lucide-react";
import CustomerSourceBadge from "@/components/customer/CustomerSourceBadge";
import CopyableContactValue from "@/components/customer/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDateDash, getRecordCreatedAt } from "@/utils/dateFormatter";
import { useCallback } from "react";
import { DataTable, TableRowActions } from "@dragorbit/ui/table";

function CustomerBalanceAmount({ totalDue }) {
  const amount = Number(totalDue) || 0;
  if (amount === 0) {
    return (
      <span className="text-sm text-[rgb(var(--color-text-secondary))]">—</span>
    );
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
  maxHeight = "calc(100vh - 210px)",
  scrollFooter,
  loading = false,
  rowPinning,
}) => {
  const { t } = useTranslation();
  const { menu, closeMenu, openContextMenu } = useRowActionMenu();

  const handleMenuAction = useCallback(
    (customerId, action) => {
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
    },
    [
      closeMenu,
      onViewDetails,
      onEdit,
      onManageKhata,
      onQuickKhataEntry,
      onDelete,
    ]
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
      if (canQuickKhataEntry && onQuickKhataEntry) {
        items.push({
          key: "quickKhata",
          label: t("khata.quickEntry"),
          icon: Receipt,
          onClick: run("quickKhata"),
        });
      }
      if (canManageKhata && onManageKhata) {
        items.push({
          key: "khata",
          label: t("khata.manageKhata"),
          icon: BookOpen,
          onClick: run("khata"),
        });
      }
      if (canEdit) {
        items.push({
          key: "edit",
          label: t("common.edit"),
          icon: Edit,
          onClick: run("edit"),
        });
      }
      if (canEdit && canDelete) {
        items.push({ type: "separator" });
      }
      if (canDelete) {
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
    [
      t,
      canQuickKhataEntry,
      onQuickKhataEntry,
      canManageKhata,
      onManageKhata,
      canEdit,
      canDelete,
      handleMenuAction,
    ]
  );

  const columns = [
    {
      id: "customer",
      header: t("customers.customer"),
      width: "22%",
      cellProps: (customer) => ({
        className: "cursor-pointer group/cell",
        onClick: () => onViewDetails?.(customer.id),
      }),
      cell: (customer) => (
        <>
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
          </div>{" "}
        </>
      ),
    },
    {
      id: "balance",
      header: t("khata.balance"),
      width: "12%",
      cell: (customer) => (
        <>
          {" "}
          <CustomerBalanceAmount
            totalDue={customer.account?.totalDue ?? customer.totalDue}
          />{" "}
        </>
      ),
    },
    {
      id: "phone",
      header: t("customers.phone"),
      width: "14%",
      cell: (customer) => (
        <>
          {" "}
          <CopyableContactValue
            value={customer.phone}
            className="text-sm font-semibold text-[rgb(var(--color-text-primary))]"
          />{" "}
        </>
      ),
    },
    {
      id: "email",
      header: t("customers.email"),
      width: "18%",
      cell: (customer) => (
        <>
          {" "}
          <CopyableContactValue
            value={customer.email}
            className="text-sm text-[rgb(var(--color-text-primary))]"
          />{" "}
        </>
      ),
    },
    {
      id: "source",
      header: t("customers.source"),
      width: "14%",
      cell: (customer) => (
        <>
          {" "}
          <CustomerSourceBadge source={customer.source} />{" "}
        </>
      ),
    },
    {
      id: "status",
      header: t("common.status"),
      width: "12%",
      cell: (customer) => (
        <>
          {" "}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              customer.isActive === false
                ? "bg-red-500/10 text-red-600 border-red-500/20"
                : "bg-green-500/10 text-green-600 border-green-500/20"
            }`}
          >
            {customer.isActive === false
              ? t("common.inactive")
              : t("common.active")}
          </span>{" "}
        </>
      ),
    },
    {
      id: "actions",
      header: (
        <>
          <MoreVertical className="w-4 h-4 mx-auto" aria-hidden="true" />
          <span className="sr-only">{t("common.actions")}</span>
        </>
      ),
      width: 64,
      align: "center",
      pin: "right",
      cell: (customer) => (
        <TableRowActions
          label={`${t("common.actions")}: ${customer.name || "N/A"}`}
          actions={buildMenuItems(customer.id)
            .filter((item) => item.type !== "separator")
            .map(({ key, ...item }) => ({ id: key, ...item }))}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        caption={t("customers.title")}
        rows={customers}
        columns={columns}
        getRowKey={(customer) => customer.id}
        minWidth={880}
        maxHeight={maxHeight}
        rowPinning={rowPinning}
        loading={loading}
        loadingContent={t("common.loading")}
        emptyContent={t("common.noResults")}
        scrollFooter={scrollFooter}
        className={className}
        rowProps={(customer) => ({
          onContextMenu: (event) => openContextMenu(event, customer.id),
        })}
      />
      <RowContextMenuLayer
        open={menu?.mode === "context"}
        onClose={closeMenu}
      />
      {menu?.mode === "context" ? (
        <RowActionsMenu
          mode="context"
          anchorPoint={{ x: menu.x, y: menu.y }}
          items={buildMenuItems(menu.rowId)}
          className="w-48"
        />
      ) : null}
    </>
  );
};

export default CustomerTable;
