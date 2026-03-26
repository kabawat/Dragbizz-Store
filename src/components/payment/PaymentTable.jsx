"use client";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  formatCurrency,
  formatDate,
  getPaymentMethodBadge,
  getPaymentTypeBadge,
  getStatusBadge,
} from "./utils";

const PaymentTableHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
      <table className="w-full min-w-[1000px] table-fixed">
        <thead>
          <tr>
            <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              {t("payments.payment", { defaultValue: "Payment" })}
            </th>
            <th className="w-[14.28%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              {t("payments.supplier", { defaultValue: "Supplier" })}
            </th>
            <th className="w-[14.28%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              {t("common.date", { defaultValue: "Date" })}
            </th>
            <th className="w-[14.28%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              {t("payments.amount", { defaultValue: "Amount" })}
            </th>
            <th className="w-[14.28%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              {t("payments.type", { defaultValue: "Type" })}
            </th>
            <th className="w-[14.28%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              {t("payments.method", { defaultValue: "Method" })}
            </th>
            <th className="w-[14.28%] px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              {t("common.status", { defaultValue: "Status" })}
            </th>
            <th className="w-32 px-6 py-4 text-center text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
              <MoreVertical className="w-4 h-4 mx-auto" />
            </th>
          </tr>
        </thead>
      </table>
    </div>
  );
};

const PaymentTableRow = ({
  payment,
  menuRefs,
  openMenuId,
  handleMenuToggle,
  handleMenuAction,
  canEdit,
  canDelete,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const paymentId = payment._id || payment.id;
  const statusBadge = useMemo(() => getStatusBadge(payment.paymentStatus || payment.status), [payment.paymentStatus, payment.status]);
  const methodBadge = useMemo(() => getPaymentMethodBadge(payment.paymentMethod, t), [payment.paymentMethod, t]);
  const typeBadge = useMemo(() => getPaymentTypeBadge(payment.paymentType, t), [payment.paymentType, t]);
  const StatusIcon = statusBadge.icon;

  return (
    <tr className="group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]">
      <td className="w-1/6 px-6 py-4">
        <div
          onClick={() => router.push(`/dashboard/payments/${paymentId}`)}
          className="font-medium text-[rgb(var(--color-primary))] cursor-pointer hover:underline"
        >
          {payment.paymentNumber}
        </div>
      </td>
      <td className="w-[14.28%] px-6 py-4">
        {payment.supplier?._id || payment.supplier?.id ? (
          <div
            onClick={() =>
              router.push(
                `/dashboard/suppliers/${payment.supplier._id || payment.supplier.id}`,
              )
            }
            className="flex items-center text-[rgb(var(--color-primary))] hover:underline cursor-pointer"
          >
            <Building2 className="w-4 h-4 mr-2" />
            <span>{payment.supplier.name}</span>
          </div>
        ) : (
          <div className="flex items-center text-[rgb(var(--color-text-primary))]">
            <Building2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] mr-2" />
            <span>{payment.supplier?.name || "N/A"}</span>
          </div>
        )}
      </td>
      <td className="w-[14.28%] px-6 py-4 text-[rgb(var(--color-text-secondary))]">
        {formatDate(payment.paymentDate)}
      </td>
      <td className="w-[14.28%] px-6 py-4 font-medium text-[rgb(var(--color-text-primary))]">
        {formatCurrency(payment.totalAmount || payment.amount)}
      </td>
      <td className="w-[14.28%] px-6 py-4">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
          style={typeBadge.style}
        >
          {typeBadge.text}
        </span>
      </td>
      <td className="w-[14.28%] px-6 py-4">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
          style={methodBadge.style}
        >
          {methodBadge.text}
        </span>
      </td>
      <td className="w-[14.28%] px-6 py-4">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
          style={statusBadge.style}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusBadge.text}
        </span>
      </td>
      <td className="w-32 px-6 py-4 text-center">
        <div
          className="relative inline-block"
          ref={(el) => (menuRefs.current[paymentId] = el)}
        >
          <button
            onClick={() => handleMenuToggle(paymentId)}
            className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
            title="More Actions"
          >
            <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
          </button>

          {openMenuId === paymentId && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
              <button
                onClick={() => handleMenuAction(paymentId, "view")}
                className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
              >
                <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                {t("common.viewDetails")}
              </button>
              {canEdit && (
                <button
                  onClick={() => handleMenuAction(paymentId, "edit")}
                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                >
                  <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  {t("common.edit")}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleMenuAction(paymentId, "delete")}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  {t("common.delete")}
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const PaymentTable = ({
  payments = [],
  isLoadingMore = false,
  menuRefs,
  openMenuId,
  handleMenuToggle,
  handleMenuAction,
  canEdit,
  canDelete,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <PaymentTableHeader />

      <div className="overflow-auto min-h-[calc(100vh-400px)]">
        <table className="w-full min-w-[1000px] table-fixed">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {payments && payments.map((payment) => (
              <PaymentTableRow
                key={payment._id || payment.id}
                payment={payment}
                menuRefs={menuRefs}
                openMenuId={openMenuId}
                handleMenuToggle={handleMenuToggle}
                handleMenuAction={handleMenuAction}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </tbody>
        </table>

        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                {t("payments.loadingMore", {
                  defaultValue: "Loading more payments...",
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentTable;
