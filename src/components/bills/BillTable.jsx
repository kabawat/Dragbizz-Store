"use client";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Edit,
  Eye,
  Mail,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { renderStatusBadge } from "@/utils/statusBadge";

const BillTable = ({
  bills,
  onEdit,
  onDelete,
  onViewDetails,
  loading,
  emptyMessage,
  hasMore,
  onLoadMore,
  isLoadingMore,
  openMenuId,
  onMenuToggle,
  onMenuAction,
  menuRefs,
  formatCurrency,
  formatDate,
  enableSendMenu = false,
  getShareUrl,
}) => {
  const { t } = useTranslation();
  const [openSendMenuId, setOpenSendMenuId] = useState(null);
  const sendMenuRefs = useRef({});

  const _defaultEmptyMessage = emptyMessage || t("bills.noBills");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openSendMenuId &&
        sendMenuRefs.current[openSendMenuId] &&
        !sendMenuRefs.current[openSendMenuId].contains(event.target)
      ) {
        setOpenSendMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openSendMenuId]);

  const buildShareUrl = (bill) => {
    if (typeof window === "undefined") return "";
    const base = window.location.origin;
    const path = getShareUrl
      ? getShareUrl(bill)
      : `/dashboard/bills/${bill._id || bill.id}`;
    return `${base}${path}`;
  };

  const handleCopy = async (text) => {
    try {
      if (navigator?.clipboard?.writeText)
        await navigator.clipboard.writeText(text);
    } catch { }
  };

  return (
    <div className="h-full">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
        <table className="w-full min-w-[800px] table-fixed">
          <thead>
            <tr>
              <th className="w-[15%] px-6 py-4 text-left">
                <span className="text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                  {t("bills.title")}
                </span>
              </th>
              <th className="w-[20%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("bills.supplier")}
              </th>
              <th className="w-[12%] px-6 py-4 text-left text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("common.date")}
              </th>
              <th className="w-[12%] px-6 py-4 text-right text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("invoice.total")}
              </th>
              <th className="w-[12%] px-6 py-4 text-right text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("bills.paid")}
              </th>
              <th className="w-[12%] px-6 py-4 text-right text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                {t("bills.due")}
              </th>
              <th className="w-[12%] px-6 py-4 text-center text-xs font-bold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
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
      <div className="overflow-auto min-h-[calc(100vh-400px)]">
        <table className="w-full min-w-[800px] table-fixed">
          <tbody className="divide-y divide-gray-100">
            {bills.map((bill, _index) => {
              // Determine status for renderStatusBadge
              let status = bill.paymentStatus || "UNPAID";
              if (new Date(bill.dueDate) < new Date() && bill.dueAmount > 0) {
                status = "OVERDUE";
              }

              // Map icons for bills
              const iconMap = {
                PAID: CheckCircle,
                PARTIAL: Clock,
                UNPAID: Clock,
                OVERDUE: AlertTriangle,
              };
              const StatusIcon = iconMap[status] || Clock;

              return (
                <tr
                  key={bill._id || bill.id || bill.billNumber}
                  className="group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]"
                >
                  <td className="w-[15%] px-6 py-4">
                    <div className="font-semibold text-sm text-[rgb(var(--color-text-primary))]">
                      {bill.billNumber}
                    </div>
                  </td>
                  <td className="w-[20%] px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-3.5 h-3.5 text-[rgb(var(--color-text-tertiary))] mr-2 shrink-0" />
                      <span className="text-sm text-[rgb(var(--color-text-primary))] truncate">
                        {bill.supplier?.name || t("common.notAvailable")}
                      </span>
                    </div>
                  </td>
                  <td className="w-[12%] px-6 py-4 text-sm text-[rgb(var(--color-text-secondary))]">
                    {formatDate(bill.billDate)}
                  </td>
                  <td className="w-[12%] px-6 py-4 text-right">
                    <div className="font-bold text-sm text-[rgb(var(--color-text-primary))]">
                      {formatCurrency(bill.totalAmount)}
                    </div>
                    <div className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-medium mt-0.5 leading-tight">
                      Sub: {formatCurrency(bill.subtotal || 0)}
                    </div>
                  </td>
                  <td className="w-[12%] px-6 py-4 text-right text-sm text-[rgb(var(--color-text-secondary))] font-medium">
                    {formatCurrency(bill.paidAmount || 0)}
                  </td>
                  <td className="w-[12%] px-6 py-4 text-right">
                    <div className="text-sm font-bold text-[rgb(var(--color-danger))]">
                      {formatCurrency(
                        bill.dueAmount ||
                        Math.max(
                          (bill.totalAmount || 0) - (bill.paidAmount || 0),
                          0
                        )
                      )}
                    </div>
                  </td>
                  <td className="w-[12%] px-6 py-4 text-center">
                    <div className="inline-flex">
                      {renderStatusBadge(status, "bill", StatusIcon)}
                    </div>
                  </td>
                  <td className="w-24 px-6 py-4 text-center">
                    <div className="relative inline-flex items-center gap-2">
                      {enableSendMenu && (
                        <div
                          className="relative"
                          ref={(el) =>
                            (sendMenuRefs.current[bill._id || bill.id] = el)
                          }
                        >
                          <button
                            onClick={() =>
                              setOpenSendMenuId(
                                openSendMenuId === (bill._id || bill.id)
                                  ? null
                                  : bill._id || bill.id
                              )
                            }
                            className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 cursor-pointer"
                            title={t("common.send")}
                          >
                            <Send className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                          </button>

                          {openSendMenuId === (bill._id || bill.id) && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                              <button
                                onClick={() => {
                                  const url = buildShareUrl(bill);
                                  const text = encodeURIComponent(
                                    `${bill.billNumber || bill.poNumber || "Details"}\n${url}`
                                  );
                                  window.open(
                                    `https://wa.me/?text=${text}`,
                                    "_blank"
                                  );
                                  setOpenSendMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4" />{" "}
                                {t("common.whatsapp")}
                              </button>
                              <button
                                onClick={() => {
                                  const url = buildShareUrl(bill);
                                  const subject = encodeURIComponent(
                                    bill.billNumber ||
                                    bill.poNumber ||
                                    "Details"
                                  );
                                  const body = encodeURIComponent(
                                    `Please review:\n${url}`
                                  );
                                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                  setOpenSendMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer"
                              >
                                <Mail className="w-4 h-4" /> {t("common.email")}
                              </button>
                              <button
                                onClick={() => {
                                  const url = buildShareUrl(bill);
                                  const body = encodeURIComponent(
                                    `${bill.billNumber || bill.poNumber || ""} ${url}`
                                  );
                                  window.location.href = `sms:?&body=${body}`;
                                  setOpenSendMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer"
                              >
                                <MessageSquare className="w-4 h-4" />{" "}
                                {t("common.message")}
                              </button>
                              <div className="my-1 border-t border-[rgb(var(--color-border-primary))]" />
                              <button
                                onClick={() => {
                                  handleCopy(buildShareUrl(bill));
                                  setOpenSendMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-4 h-4" />{" "}
                                {t("common.copyLink")}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className="relative inline-block"
                        ref={(el) =>
                          (menuRefs.current[bill._id || bill.id] = el)
                        }
                      >
                        <button
                          onClick={() => onMenuToggle(bill._id || bill.id)}
                          className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                          title={t("common.actions")}
                        >
                          <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                        </button>

                        {/* Popup Menu */}
                        {openMenuId === (bill._id || bill.id) && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                            <button
                              onClick={() =>
                                onMenuAction(bill._id || bill.id, "view")
                              }
                              className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                            >
                              <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                              {t("common.viewDetails")}
                            </button>
                            <button
                              onClick={() =>
                                onMenuAction(bill._id || bill.id, "edit")
                              }
                              className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                            >
                              <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                              {t("common.edit")}
                            </button>
                            {bill.paymentStatus !== "PAID" && (
                              <button
                                onClick={() =>
                                  onMenuAction(bill._id || bill.id, "payment")
                                }
                                className="w-full px-4 py-2 text-left text-sm text-green-700 dark:text-green-500 hover:bg-green-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-green-500/10"
                              >
                                <CreditCard className="w-4 h-4 text-green-700 dark:text-green-500" />
                                {t("bills.payBill")}
                              </button>
                            )}
                            <button
                              onClick={() =>
                                onMenuAction(bill._id || bill.id, "delete")
                              }
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              {t("common.delete")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("bills.loadingMore")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillTable;
