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
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AddActionButton } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { formatCurrencySimple as formatCurrency } from "@/utils/currencyFormatter";
import { formatDateLong as formatDate } from "@/utils/dateFormatter";
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
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openSendMenuId, setOpenSendMenuId] = useState(null);
  const menuRefs = useRef({});
  const sendMenuRefs = useRef({});

  const defaultEmptyMessage = emptyMessage || t("invoice.noInvoices");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId].contains(event.target)
      ) {
        setOpenMenuId(null);
      }
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
  }, [openMenuId, openSendMenuId]);

  const buildShareUrl = (row) => {
    if (typeof window === "undefined") return "";
    const publicId = row.publicId;
    if (!publicId) return "";
    const base = window.location.origin;
    return `${base}/view/invoice/${publicId}`;
  };

  const handleCopy = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback for non-secure context (e.g. HTTP)
    }
    // Fallback: execCommand works in HTTP and older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  };

  const handleCopyLink = async (row) => {

    const shareUrl = buildShareUrl(row);
    if (!shareUrl) {
      showError(t("invoice.copyLinkNotAvailable") || "Invoice link not available");
      return;
    }
    const ok = await handleCopy(shareUrl);
    setOpenMenuId(null);
    setOpenSendMenuId(null);
    if (ok) {
      showSuccess(t("common.copied") || "Copied to clipboard");
    } else {
      showError(t("invoice.copyFailed") || "Failed to copy");
    }
  };

  const handleWhatsAppShare = (row) => {
    const shareUrl = buildShareUrl(row);
    if (!shareUrl) return;
    const message = `Hello *${row.customer?.name || "Customer"}*, Thanks for your business! *Invoice: ${row.invoiceNumber || "N/A"}* *Link:* ${shareUrl} Thanks *${row.store?.name || "DragBizz Store"}* *${row.store?.phone || "N/A"}* Sent using *DragBizz: Simple Store Management* (dragbizz.com)`;

    const customerPhone = row.customer?.phone;
    if (customerPhone) {
      const cleanPhone = customerPhone.replace(/\D/g, "");
      const whatsappPhone = cleanPhone.startsWith("91")
        ? cleanPhone
        : `91${cleanPhone}`;
      window.open(
        `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }

    setOpenMenuId(null);
    setOpenSendMenuId(null);
  };

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
            <th className="px-4 py-4 text-center text-[10px] font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("common.status")}
            </th>
            <th className="px-4 py-4 text-center text-[10px] font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
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
            const isMenuOpen = openMenuId === invoiceId;
            const isLastItems = index >= invoices.length - 2 && invoices.length > 3;

            return (
              <tr key={invoiceId} className="transition-colors">
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
                      <span className="text-[9px] text-[rgb(var(--color-text-tertiary))] leading-none">
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
                          <button className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200">
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
                        onClick={() =>
                          setOpenMenuId(isMenuOpen ? null : invoiceId)
                        }
                        className="p-2 rounded-md hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                      </button>
                      {isMenuOpen && (
                        <div className={`absolute right-0 ${isLastItems ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-50`}>
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onViewDetails?.(invoiceId);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              {t("common.viewDetails")}
                            </button>
                            {invoice.invoiceStatus === "DRAFT" && (
                              <>
                                <button
                                  onClick={() => {
                                    onEdit?.(invoiceId);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  {t("common.edit")}
                                </button>
                                <button
                                  onClick={() => {
                                    onRelease?.(invoice);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {t("invoice.release")}
                                </button>
                              </>
                            )}
                            {invoice.invoiceStatus === "RELEASED" && invoice.paymentStatus !== "PAID" && (
                              <button
                                onClick={() => {
                                  onUpdatePaymentStatus?.(invoiceId, invoice);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2"
                              >
                                <CreditCard className="w-4 h-4" />
                                {t("invoice.paymentStatus")}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                onPrint?.(invoiceId);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2"
                            >
                              <Printer className="w-4 h-4" />
                              {t("common.print")}
                            </button>
                            {invoice.invoiceStatus === "DRAFT" && (
                              <>
                                <div className="my-1 border-t border-[rgb(var(--color-border-primary))]" />
                                <button
                                  onClick={() => {
                                    onDelete?.(invoice);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {t("common.delete")}
                                </button>
                              </>
                            )}
                          </div>
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
    </div>
  );
};

export default InvoicesListTable;
