"use client";
import {
  Calendar,
  CheckCircle,
  Copy,
  CreditCard,
  Edit,
  Eye,
  Mail,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Printer,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AddActionButton } from "@/components/ui";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { formatCurrencySimple as formatCurrency } from "@/utils/currencyFormatter";
import { formatDateLong as formatDate } from "@/utils/dateFormatter";
import {
  buildInvoiceShareUrl,
  copyInvoiceShareLink,
  openInvoiceEmailShare,
  openWhatsAppShare,
} from "@/utils/invoice/invoiceShare.utils";
import logger from "@/utils/logger";
import { renderStatusBadge } from "@/utils/statusBadge";

const InvoicesListTable = ({
  invoices = [],
  onEdit,
  onDelete,
  onViewDetails,
  onPrint,
  onRelease,
  onUpdatePaymentStatus,
  loading = false,
  emptyMessage,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  ...props
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showSuccess, showError } = useGlobalToast();
  const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } = useRowActionMenu();
  const [openSendMenuId, setOpenSendMenuId] = useState(null);
  const sendMenuRefs = useRef({});

  const defaultEmptyMessage = emptyMessage || t("invoice.noInvoices");

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSendMenuId]);

  const handleCopyLink = async (row) => {
    const shareUrl = buildInvoiceShareUrl(row);
    if (!shareUrl) {
      showError(t("invoice.copyLinkNotAvailable") || "Invoice link not available");
      return;
    }
    const ok = await copyInvoiceShareLink(shareUrl);
    setOpenSendMenuId(null);
    if (ok) {
      showSuccess(t("common.copied") || "Copied to clipboard");
    } else {
      showError(t("invoice.copyFailed") || "Failed to copy");
    }
  };

  const handleWhatsAppShare = (row) => {
    const shareUrl = buildInvoiceShareUrl(row);
    if (!shareUrl) {
      showError(t("invoice.copyLinkNotAvailable") || "Invoice link not available");
      return;
    }
    openWhatsAppShare(row, shareUrl, t);
    setOpenSendMenuId(null);
  };

  const handleEmailShare = (row) => {
    const shareUrl = buildInvoiceShareUrl(row);
    openInvoiceEmailShare(row, shareUrl);
    setOpenSendMenuId(null);
  };

  const buildMenuItems = useCallback((rowId) => {
    const invoice = invoices.find((inv) => (inv.id || inv._id) === rowId);
    if (!invoice) return [];

    const run = (action, handler) => () => {
      closeMenu();
      handler?.();
    };

    const items = [];
    if (onViewDetails) {
      items.push({
        key: "view",
        label: t("common.viewDetails"),
        icon: Eye,
        onClick: run("view", () => onViewDetails(rowId)),
      });
    }
    if (invoice.invoiceStatus === "DRAFT") {
      if (onEdit) {
        items.push({
          key: "edit",
          label: t("common.edit"),
          icon: Edit,
          onClick: run("edit", () => onEdit(rowId)),
        });
      }
      if (onRelease) {
        items.push({
          key: "release",
          label: t("invoice.release"),
          icon: CheckCircle,
          onClick: run("release", () => onRelease(invoice)),
        });
      }
    }
    if (invoice.invoiceStatus === "RELEASED" && invoice.paymentStatus !== "PAID" && onUpdatePaymentStatus) {
      items.push({
        key: "payment",
        label: t("invoice.paymentStatus"),
        icon: CreditCard,
        onClick: run("payment", () => onUpdatePaymentStatus(rowId, invoice)),
      });
    }
    if (onPrint) {
      items.push({
        key: "print",
        label: t("common.print"),
        icon: Printer,
        onClick: run("print", () => onPrint(rowId)),
      });
    }
    if (invoice.invoiceStatus === "DRAFT" && onDelete) {
      items.push({ type: "separator" });
      items.push({
        key: "delete",
        label: t("common.delete"),
        icon: Trash2,
        tone: "danger",
        onClick: run("delete", () => onDelete(invoice)),
      });
    }
    return items;
  }, [invoices, onViewDetails, onEdit, onRelease, onUpdatePaymentStatus, onPrint, onDelete, closeMenu, t]);

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-primary))] mx-auto mb-4"></div>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            {t("invoice.loadingInvoices")}
          </p>
        </div>
      </div>
    );
  }

  if (!loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            {defaultEmptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full">
        <thead className="bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-10">
          <tr>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("invoice.invoiceNumber")}
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("invoice.customer")}
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("common.date")}
            </th>
            <th className="px-4 py-4 text-right text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("invoice.subtotal")}
            </th>
            <th className="px-4 py-4 text-right text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("common.gst")}
            </th>
            <th className="px-4 py-4 text-right text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("common.amount")}
            </th>
            <th className="px-4 py-4 text-center text-[0.625rem] font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("common.status")}
            </th>
            <th className="px-4 py-4 text-center text-[0.625rem] font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("invoice.payment")}
            </th>
            <th className="px-4 py-4 text-center text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("common.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
          {invoices.map((invoice, index) => {
            const invoiceId = invoice.id || invoice._id;
            const isLastItems = index >= invoices.length - 2 && invoices.length > 3;

            return (
              <tr
                key={invoiceId}
                className="transition-colors"
                onContextMenu={(event) => openContextMenu(event, invoiceId)}
              >
                <td
                  className="px-4 py-2 cursor-pointer transition-colors hover:bg-[rgb(var(--color-bg-secondary))]"
                  onClick={() => onViewDetails?.(invoiceId)}
                  title={t("common.viewDetails")}
                >
                  <div className="font-medium text-[rgb(var(--color-text-primary))]">
                    {invoice.invoiceNumber || `INV-${invoiceId?.slice(-6)}`}
                  </div>
                </td>
                <td
                  className={`px-4 py-2 ${invoice?.customer?.id && 'cursor-pointer'} `}
                  onClick={(e) => {
                    if (invoice.customer?.id) {
                      e.stopPropagation();
                      router.push(`/dashboard/customers/${invoice.customer.id}`);
                    }
                  }}
                  title={invoice.customer?.id ? t("customers.viewDetails", { defaultValue: "View Customer Details" }) : ""}
                >
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4`} />
                    <span className={`text-sm truncate`}>
                      {invoice.customer?.name || t("invoice.walkInCustomer")}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {formatDate(invoice.createdAt)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                    {formatCurrency(invoice.subtotal || (invoice.totalAmount - (invoice.gstAmount || 0)))}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                      {formatCurrency(invoice.gstAmount || (invoice.gst?.amount || 0))}
                    </span>
                    {invoice.gst?.breakdown?.total > 0 && (
                      <span className="text-[0.5625rem] text-[rgb(var(--color-text-tertiary))] leading-none">
                        {[
                          invoice.gst.breakdown.cgst > 0 ? "CGST" : "",
                          invoice.gst.breakdown.sgst > 0 ? "SGST" : "",
                          invoice.gst.breakdown.igst > 0 ? "IGST" : ""
                        ].filter(Boolean).join(" + ")}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  {renderStatusBadge(invoice.invoiceStatus || invoice.status, "invoice")}
                </td>
                <td className="px-4 py-2 text-center">
                  {renderStatusBadge(invoice.paymentStatus || invoice.payment, "invoice")}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* Send / Share menu */}
                    <div
                      className="relative inline-block"
                      ref={(el) => {
                        if (el) sendMenuRefs.current[invoiceId] = el;
                      }}
                    >
                      <AddActionButton
                        onClick={() =>
                          setOpenSendMenuId(
                            openSendMenuId === invoiceId ? null : invoiceId
                          )
                        }
                        Icon={Send}
                        label={t("common.send")}
                        size="sm"
                        title={t("common.send")}
                        className="h-9 px-3 rounded-lg"
                      />
                      {openSendMenuId === invoiceId && (
                        <div className={`absolute right-0 ${isLastItems ? 'bottom-full mb-1' : 'top-full mt-1'} w-44 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50`}>
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200"
                            onClick={() => handleWhatsAppShare(invoice)}
                          >
                            <MessageCircle className="w-4 h-4 text-green-500 dark:text-green-400" />{" "}
                            {t("common.whatsapp")}
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200"
                            onClick={() => handleEmailShare(invoice)}
                          >
                            <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400" />{" "}
                            {t("common.email")}
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200">
                            <MessageSquare className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />{" "}
                            {t("common.message")}
                          </button>
                          <div className="my-1 border-t border-[rgb(var(--color-border-primary))]" />
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200"
                            onClick={() => handleCopyLink(invoice)}
                          >
                            <Copy className="w-4 h-4 text-purple-500 dark:text-purple-400" />{" "}
                            {t("common.copyLink")}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions menu */}
                    <div
                      className="relative inline-block"
                      ref={(el) => {
                        if (el) menuRefs.current[invoiceId] = el;
                      }}
                    >
                      <button
                        onClick={() => toggleDropdown(invoiceId)}
                        className="p-2 rounded-md hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                      </button>
                      {menu?.rowId === invoiceId && menu.mode === "dropdown" ? (
                        <RowActionsMenu
                          items={buildMenuItems(invoiceId)}
                          mode="dropdown"
                          className={`${isLastItems ? "bottom-full mb-2" : ""} w-48`}
                        />
                      ) : null}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLoadingMore && (
        <div className="flex items-center justify-center py-8 border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
            <span className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("invoice.loadingMore")}
            </span>
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

export default InvoicesListTable;
