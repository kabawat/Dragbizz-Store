"use client";
import { Tooltip as SharedTooltip } from "@dragorbit/ui";
import {
  Calendar,
  CheckCircle,
  Copy,
  CreditCard,
  Edit,
  Eye,
  FileText,
  MessageCircle,
  Printer,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { formatDateLong, formatTime } from "@/utils/dateFormatter";
import {
  buildInvoiceShareUrl,
  copyInvoiceShareLink,
  openWhatsAppShare,
} from "@/utils/invoice/invoiceShare.utils";
import { getStatusBadge } from "@/utils/statusBadge";
import { Badge, Card, IconButton } from "../ui";

const InvoiceCard = ({
  invoice,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onPrint,
  onRelease,
  onUpdatePaymentStatus,
  className = "",
  ...props
}) => {
  const { t } = useTranslation();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const { themeConfig } = useTheme();
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const invoiceStatus = invoice.invoiceStatus || invoice.status;
  const isDraft = invoiceStatus === "DRAFT";
  const isReleased = invoiceStatus === "RELEASED";

  const buildShareUrl = (inv) => buildInvoiceShareUrl(inv) || "";

  const handleCopy = async (text) => {
    if (!text) return false;
    return copyInvoiceShareLink(text);
  };

  const actionMenuItems = [
    {
      value: "view",
      label: t("common.viewDetails"),
      icon: Eye,
      onClick: () => onViewDetails?.(invoice.id || invoice._id),
      show: !!onViewDetails,
    },
    {
      value: "print",
      label: t("invoice.printInvoice"),
      icon: Printer,
      onClick: () => onPrint?.(invoice.id || invoice._id),
      show: !!onPrint,
    },
    {
      value: "whatsapp",
      label: t("invoice.shareOnWhatsApp"),
      icon: MessageCircle,
      onClick: () => {
        const shareUrl = buildShareUrl(invoice);
        if (!shareUrl) return;
        openWhatsAppShare(invoice, shareUrl, t);
      },
      show: true,
    },
    {
      value: "copyLink",
      label: t("common.copyLink"),
      icon: Copy,
      onClick: async () => {
        const shareUrl = buildShareUrl(invoice);
        if (!shareUrl) return;
        await handleCopy(shareUrl);
      },
      show: true,
    },
    {
      value: "release",
      label: t("invoice.release"),
      icon: CheckCircle,
      onClick: () => onRelease?.(invoice),
      disabled: !isDraft,
      className: "cursor-pointer text-green-600 hover:text-green-700",
      show: !!onRelease,
    },
    {
      value: "edit",
      label: t("common.edit"),
      icon: Edit,
      onClick: () => onEdit?.(invoice.id || invoice._id),
      disabled: !isDraft,
      show: !!onEdit,
    },
    {
      value: "duplicate",
      label: t("common.duplicate"),
      icon: FileText,
      onClick: () => onDuplicate?.(invoice.id || invoice._id),
      show: !!onDuplicate,
    },
    ...(isReleased && onUpdatePaymentStatus && invoice.paymentStatus !== "PAID"
      ? [
        {
          value: "paymentStatus",
          label: t("invoice.paymentStatus"),
          icon: CreditCard,
          onClick: () => onUpdatePaymentStatus?.(invoice.id || invoice._id, invoice),
          className: "cursor-pointer",
          show: true,
        },
      ]
      : []),
    ...(isDraft && onDelete
      ? [
        {
          value: "delete",
          label: t("common.delete"),
          icon: Trash2,
          onClick: () => onDelete?.(invoice),
          className: "cursor-pointer text-red-600 hover:text-red-700",
          show: true,
        },
      ]
      : []),
  ].filter((item) => item.show !== false);

  const formatDate = (dateString) => {
    if (!dateString) return t("common.notAvailable");
    return formatDateLong(dateString);
  };

  const formatInvoiceTime = (dateString) => {
    if (!dateString) return t("common.notAvailable");
    return formatTime(dateString);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const invoiceId = invoice.id || invoice._id;
  const invoiceNumber = invoice.invoiceNumber || `INV-${invoiceId?.slice(-6)}`;

  const getStatusDisplay = () => {
    const status = invoice.invoiceStatus || invoice.status || "DRAFT";
    const payment = invoice.paymentStatus || "UNPAID";

    const config = getStatusBadge(status, "invoice");
    const paymentConfig = getStatusBadge(payment, "invoice");

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge
          variant={config.variant || "outline"}
          style={config.style}
          size="xs"
          className="text-[0.625rem] px-2 py-0.5 rounded-full font-medium"
        >
          {config.text}
        </Badge>
        <Badge
          variant={paymentConfig.variant || "outline"}
          style={paymentConfig.style}
          size="xs"
          className="text-[0.625rem] px-2 py-0.5 rounded-full font-medium"
        >
          {paymentConfig.text}
        </Badge>
      </div>
    );
  };

  const gstAmount = invoice.gstAmount !== undefined ? invoice.gstAmount : (invoice.gst?.amount || 0);
  const subtotalAmount = invoice.subtotal || (invoice.totalAmount - (gstAmount || 0));

  return (
    <Card
      padding="none"
      className={`w-full h-full flex flex-col justify-between rounded-xl border border-[rgb(var(--color-border-primary))] group cursor-pointer shadow-none hover:shadow-md hover:border-[rgb(var(--color-primary))]/40 transition-all duration-200 bg-[rgb(var(--color-bg-primary))] ${className}`}
      onClick={(e) => {
        // Prevent routing if clicking on action menu or customer section
        if (e.target.closest('.action-menu-container') || e.target.closest('.customer-section')) return;
        onViewDetails?.(invoice.id || invoice._id);
      }}
      title={t("common.viewDetails")}
      {...props}
    >
      {/* Top Header: Invoice No + Badges + Action Menu */}
      <div className="rounded-t-xl bg-gradient-to-r from-[rgb(var(--color-primary))]/8 via-transparent to-transparent border-b border-[rgb(var(--color-border-primary))]/50 px-3.5 py-3 flex items-center justify-between gap-2.5">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs text-[rgb(var(--color-text-primary))] tracking-tight">
              {invoiceNumber}
            </span>
          </div>
          {getStatusDisplay()}
        </div>

        {/* Action Menu */}
        <div className="relative action-menu-container flex-shrink-0" ref={menuRef}>
          <IconButton onClick={() => setOpenMenuId(openMenuId ? null : invoiceId)} />

          {openMenuId === invoiceId && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-[rgb(var(--color-bg-primary))] rounded-xl shadow-xl border border-[rgb(var(--color-border-primary))] py-1.5 z-[100] animate-in fade-in zoom-in duration-200">
              {actionMenuItems.map((item, index) => (
                <div key={item.value}>
                  {index > 0 && item.value === "delete" && (
                    <div className="border-t border-[rgb(var(--color-border-primary))] my-1.5 mx-2" />
                  )}
                  <button
                    onClick={() => {
                      setOpenMenuId(null);
                      item.onClick();
                    }}
                    disabled={item.disabled}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 transition-colors duration-200 ${item.disabled
                      ? "text-[rgb(var(--color-text-tertiary))] cursor-not-allowed opacity-50"
                      : item.className ||
                      "text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer"
                      }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${item.className ? "" : "text-[rgb(var(--color-text-secondary))]"}`} />
                    <span>{item.label}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle Body: Customer & Date in clean dedicated lines */}
      <div className="px-3.5 py-3 space-y-2 flex-1">
        {/* Customer */}
        <div
          className={`flex items-center gap-2 customer-section rounded-md p-1 -ml-1 transition-colors ${invoice.customer?.id ? 'cursor-pointer group/customer hover:bg-[rgb(var(--color-bg-secondary))]' : ''}`}
          onClick={(e) => {
            if (invoice.customer?.id) {
              e.stopPropagation();
              router.push(`/dashboard/customers/${invoice.customer.id}`);
            }
          }}
          title={invoice.customer?.id ? t("customers.viewDetails", { defaultValue: "View Customer Details" }) : ""}
        >
          <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 text-blue-500 group-hover/customer:text-[rgb(var(--color-primary))]" />
          </div>
          <span className={`text-sm font-medium ${invoice.customer?.id ? 'text-[rgb(var(--color-primary))] group-hover/customer:underline' : 'text-[rgb(var(--color-text-primary))]'}`}>
            {invoice.customer?.name || t("invoice.walkInCustomer")}
          </span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text-secondary))] pl-0.5">
          <Calendar className="w-3.5 h-3.5 text-[rgb(var(--color-text-tertiary))] flex-shrink-0" />
          <span>
            {formatDate(invoice.createdAt)}
            <span className="mx-1.5 text-[rgb(var(--color-text-tertiary))]">•</span>
            <span className="text-[rgb(var(--color-text-tertiary))]">{formatInvoiceTime(invoice.createdAt)}</span>
          </span>
        </div>
      </div>

      {/* Footer: Compact Stats & Grand Total */}
      <div className="rounded-b-xl px-3.5 py-2.5 border-t border-[rgb(var(--color-border-primary))]/50 flex items-center justify-between gap-3">
        {/* Left: Key Stats */}
        <div className="flex items-center gap-3 text-xs text-[rgb(var(--color-text-secondary))] flex-wrap">
          <div>
            <span className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] block uppercase font-medium">
              {t("invoice.items")}
            </span>
            <span className="font-semibold text-[rgb(var(--color-text-primary))]">
              {invoice.items?.length || 0}
            </span>
          </div>

          <div className="h-5 w-px bg-[rgb(var(--color-border-primary))]/60" />

          <div>
            <span className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] block uppercase font-medium">
              {t("invoices.subtotal")}
            </span>
            <span className="font-semibold text-[rgb(var(--color-text-primary))] whitespace-nowrap">
              {formatCurrency(subtotalAmount)}
            </span>
          </div>

          {gstAmount > 0 && (
            <>
              <div className="h-5 w-px bg-[rgb(var(--color-border-primary))]/60" />
              <div>
                <span className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] block uppercase font-medium">
                  {t("products.gst")}
                </span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))] whitespace-nowrap">
                  {formatCurrency(gstAmount)}
                </span>
              </div>
            </>
          )}

          {invoice.totalDiscount > 0 && (
            <>
              <div className="h-5 w-px bg-[rgb(var(--color-border-primary))]/60" />
              <div>
                <span className="text-[0.625rem] text-red-500 block uppercase font-medium">
                  {t("invoice.discount")}
                </span>
                <span className="font-semibold text-red-500 whitespace-nowrap">
                  -{formatCurrency(invoice.totalDiscount)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right: Grand Total */}
        <div className="text-right flex-shrink-0">
          <span className="text-[0.625rem] uppercase font-bold tracking-wider text-[rgb(var(--color-text-tertiary))] block">
            {t("invoice.total")}
          </span>
          <span className="text-base font-bold text-[rgb(var(--color-primary))] whitespace-nowrap">
            {formatCurrency(invoice.totalAmount)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default InvoiceCard;
