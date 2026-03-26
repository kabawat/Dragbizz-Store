"use client";
import {
  CheckCircle,
  Copy,
  CreditCard,
  Edit,
  Eye,
  FileText,
  MessageCircle,
  Printer,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getStatusBadge } from "@/utils/statusBadge";
import { Card, Badge, IconButton } from "../ui";
import { useTheme } from "@/contexts/ThemeContext";

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

  const buildShareUrl = (inv) => {
    if (typeof window === "undefined") return "";
    const publicId = inv.publicId;
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
      // Fallback
    }
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
        const invoiceNumber =
          invoice.invoiceNumber ||
          invoice.invoice_number ||
          invoice.id ||
          t("common.notAvailable");
        const totalAmount =
          invoice.totalAmount || invoice.total_amount || invoice.total || 0;
        const customerName =
          invoice.customer?.name ||
          invoice.customerName ||
          t("invoice.customer");

        let message = t("invoice.whatsappShareMessage", {
          invoiceNumber,
          customerName,
          totalAmount,
        });

        if (shareUrl) {
          message += `\n\nLink: ${shareUrl}`;
        }

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          message
        )}`;
        window.open(whatsappUrl, "_blank");
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
    ...(isReleased &&
      onUpdatePaymentStatus &&
      invoice.paymentStatus !== "PAID"
      ? [
        {
          value: "paymentStatus",
          label: t("invoice.paymentStatus"),
          icon: CreditCard,
          onClick: () =>
            onUpdatePaymentStatus?.(invoice.id || invoice._id, invoice),
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
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const invoiceId = invoice.id || invoice._id;

  const getStatusDisplay = () => {
    const status = invoice.invoiceStatus || invoice.status || "DRAFT";
    const payment = invoice.paymentStatus || "UNPAID";

    const config = getStatusBadge(status, "invoice");
    const paymentConfig = getStatusBadge(payment, "invoice");

    return (
      <div className="flex flex-col gap-1">
        <Badge variant={config.variant || "outline"} style={config.style} size="xs" className="text-[10px] px-2 py-0 w-fit">{config.text}</Badge>
        <Badge variant={paymentConfig.variant || "outline"} style={paymentConfig.style} size="xs" className="text-[10px] px-2 py-0 w-fit">{paymentConfig.text}</Badge>
      </div>
    );
  };

  const gstAmount = invoice.gstAmount !== undefined ? invoice.gstAmount : (invoice.gst?.amount || 0);

  return (
    <Card
      className={`w-full max-w-sm mx-auto rounded-xl border border-[rgb(var(--color-border-primary))] group overflow-hidden cursor-pointer shadow-none hover:shadow-md hover:border-[rgb(var(--color-primary))]/30 transition-all duration-300 ease-out ${className}`}
      onClick={(e) => {
        // Prevent routing if clicking on action menu or customer section
        if (e.target.closest('.action-menu-container') || e.target.closest('.customer-section')) return;
        onViewDetails?.(invoice.id || invoice._id);
      }}
      title={t("common.viewDetails")}
      {...props}
    >
      {/* Header with Background Pattern */}
      <div className="h-28 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 via-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-bg-secondary))] relative p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center border border-[rgb(var(--color-primary))]/20">
            <FileText className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[rgb(var(--color-text-primary))] leading-tight">
              {invoice.invoiceNumber || `INV-${invoiceId?.slice(-6)}`}
            </h3>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative action-menu-container" ref={menuRef}>
          <IconButton onClick={() => setOpenMenuId(openMenuId ? null : invoiceId)} />

          {openMenuId === invoiceId && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[rgb(var(--color-bg-primary))] rounded-xl shadow-xl border border-[rgb(var(--color-border-primary))] py-1.5 z-[100] animate-in fade-in zoom-in duration-200">
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
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200 ${item.disabled
                      ? "text-[rgb(var(--color-text-tertiary))] cursor-not-allowed opacity-50"
                      : item.className ||
                      "text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer"
                      }`}
                  >
                    <item.icon className={`w-4 h-4 ${item.className ? "" : "text-[rgb(var(--color-text-secondary))]"}`} />
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Customer & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`space-y-1 customer-section rounded-lg p-1.5 -ml-1.5 transition-colors ${invoice.customer?.id ? 'cursor-pointer group/customer hover:bg-[rgb(var(--color-bg-secondary))]' : ''}`}
            onClick={(e) => {
              if (invoice.customer?.id) {
                e.stopPropagation();
                router.push(`/dashboard/customers/${invoice.customer.id}`);
              }
            }}
            title={invoice.customer?.id ? t("customers.viewDetails", { defaultValue: "View Customer Details" }) : ""}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-[rgb(var(--color-text-tertiary))] block">
              {t("invoice.customer")}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-blue-500 group-hover/customer:text-[rgb(var(--color-primary))]" />
              </div>
              <span className={`text-sm font-semibold truncate ${invoice.customer?.id ? 'text-[rgb(var(--color-primary))] group-hover/customer:underline' : 'text-[rgb(var(--color-text-primary))]'}`}>
                {invoice.customer?.name || t("invoice.walkInCustomer")}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[rgb(var(--color-text-tertiary))] block">
              {t("common.date")}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3 h-3 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {formatDate(invoice.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgb(var(--color-border-primary))]/50">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[rgb(var(--color-text-tertiary))]">
              {t("common.status")}
            </span>
            {getStatusDisplay()}
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[rgb(var(--color-text-tertiary))] block mb-1">
              {t("invoice.total")}
            </span>
            <span className="text-xl font-bold text-[rgb(var(--color-primary))]">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] rounded-xl p-3 border border-[rgb(var(--color-border-primary))] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[rgb(var(--color-text-secondary))] font-medium">{t("invoices.subtotal")}</span>
            <span className="text-[rgb(var(--color-text-primary))] font-semibold">
              {formatCurrency(invoice.subtotal || (invoice.totalAmount - (gstAmount || 0)))}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[rgb(var(--color-text-secondary))]">{t("invoice.items")}</span>
            <Badge variant="secondary" className="px-1.5 py-0 min-w-[20px] text-center">
              {invoice.items?.length || 0}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-xs">
            <div className="flex flex-col">
              <span className="text-[rgb(var(--color-text-secondary))] font-medium">{t("products.gst")}</span>
              {invoice.gst?.breakdown?.total > 0 && (
                <span className="text-[9px] text-[rgb(var(--color-text-tertiary))] leading-none">
                  {[
                    invoice.gst.breakdown.cgst > 0 ? "C" : "",
                    invoice.gst.breakdown.sgst > 0 ? "S" : "",
                    invoice.gst.breakdown.igst > 0 ? "I" : ""
                  ].filter(Boolean).join("+")}
                </span>
              )}
            </div>
            <span className="text-[rgb(var(--color-text-primary))] font-semibold">
              {formatCurrency(gstAmount)}
            </span>
          </div>
          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-red-500 font-medium">{t("invoice.discount")}</span>
              <span className="text-red-500 font-semibold italic">
                -{formatCurrency(invoice.totalDiscount)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default InvoiceCard;
