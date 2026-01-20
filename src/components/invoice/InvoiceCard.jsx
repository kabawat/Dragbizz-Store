"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, Badge, Button, Dropdown } from "../ui";
import {
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  FileText,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  User,
  Printer,
  CheckCircle,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { getStatusBadge } from "@/utils/statusBadge";
import { useTranslation } from "@/hooks/useTranslation";

const InvoiceCard = ({
  invoice,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onPrint,
  onRelease,
  onUpdatePaymentStatus,
  onSelect,
  selected = false,
  className = "",
  ...props
}) => {
  const { t } = useTranslation();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const { currentVariant, themeConfig } = useTheme();

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

  const actionMenuItems = [
    {
      value: "view",
      label: t("common.viewDetails"),
      icon: Eye,
      onClick: () => onViewDetails?.(invoice.id || invoice._id),
    },
    {
      value: "print",
      label: t("invoice.printInvoice"),
      icon: Printer,
      onClick: () => onPrint?.(invoice.id || invoice._id),
    },
    {
      value: "whatsapp",
      label: t("invoice.shareOnWhatsApp"),
      icon: MessageCircle,
      onClick: () => {
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
        const message = t("invoice.whatsappShareMessage", {
          invoiceNumber,
          customerName,
          totalAmount,
        });
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      },
    },
    {
      value: "release",
      label: t("invoice.release"),
      icon: CheckCircle,
      onClick: () => onRelease?.(invoice),
      disabled: !isDraft,
      className: "cursor-pointer text-green-600 hover:text-green-700",
    },
    {
      value: "edit",
      label: t("common.edit"),
      icon: Edit,
      onClick: () => onEdit?.(invoice.id || invoice._id),
      disabled: !isDraft,
    },
    {
      value: "duplicate",
      label: t("common.duplicate"),
      icon: Copy,
      onClick: () => onDuplicate?.(invoice.id || invoice._id),
    },
    // Show payment status update for RELEASED invoices
    ...(isReleased && onUpdatePaymentStatus
      ? [
          {
            value: "paymentStatus",
            label: t("invoice.paymentStatus"),
            icon: CreditCard,
            onClick: () =>
              onUpdatePaymentStatus?.(invoice.id || invoice._id, invoice),
            className: "cursor-pointer",
          },
        ]
      : []),
    // Only show delete if invoice is DRAFT
    ...(isDraft
      ? [
          {
            value: "delete",
            label: t("common.delete"),
            icon: Trash2,
            onClick: () => onDelete?.(invoice),
            className: "cursor-pointer text-red-600 hover:text-red-700",
          },
        ]
      : []),
  ];

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

  return (
    <Card
      className={`relative transition-all duration-200 group ${
        selected
          ? "ring-2 ring-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5 border-l-4 border-l-[rgb(var(--color-primary))]"
          : "hover:bg-[rgb(var(--color-bg-tertiary))]"
      } ${className}`}
      {...props}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect?.(invoiceId)}
          className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
        />
      </div>

      {/* Action Menu */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={() => setOpenMenuId(openMenuId ? null : invoiceId)}
          className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
          title={t("common.actions")}
        >
          <svg
            className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {openMenuId === invoiceId && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-50">
            <div className="py-1">
              {actionMenuItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setOpenMenuId(null);
                    item.onClick();
                  }}
                  disabled={item.disabled}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200 ${
                    item.disabled
                      ? "text-[rgb(var(--color-text-tertiary))] cursor-not-allowed"
                      : item.className ||
                        "text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                  }`}
                >
                  <item.icon className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] rounded-lg flex items-center justify-center border border-[rgb(var(--color-border-primary))] flex-shrink-0">
              <FileText className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] truncate">
                {invoice.invoiceNumber || `INV-${invoiceId?.slice(-6)}`}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                  {t("common.created")}: {formatDate(invoice.createdAt)}
                </span>
              </div>
            </div>
          </div>
          {/* Status Badge */}
          <div className="flex-shrink-0">
            {(() => {
              const config = getStatusBadge(
                invoice.paymentStatus || invoice.invoiceStatus,
                "invoice",
              );
              return (
                <span
                  className="invoice-status-badge px-2 py-1 text-xs font-medium rounded-full border"
                  style={config.style}
                >
                  {config.text}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-2">
          <div className="text-sm text-[rgb(var(--color-text-primary))] font-medium mb-1">
            {invoice.customer?.name || t("invoice.walkInCustomer")}
          </div>
          {invoice.customer?.email && (
            <div className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">
              {invoice.customer.email}
            </div>
          )}
          {invoice.customer?.phone && (
            <div className="text-xs text-[rgb(var(--color-text-secondary))]">
              {invoice.customer.phone}
            </div>
          )}
        </div>

        {/* Invoice Details */}
        <div className="space-y-1 pt-3 border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(var(--color-text-secondary))]">
              {t("invoice.items")}:
            </span>
            <span className="font-medium text-[rgb(var(--color-text-primary))]">
              {invoice.items?.length || 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(var(--color-text-secondary))]">
              {t("invoice.subtotal")}:
            </span>
            <span className="font-medium text-[rgb(var(--color-text-primary))]">
              {formatCurrency(invoice.subtotal || invoice.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(var(--color-text-secondary))]">
              {t("products.gst")}:
            </span>
            <span className="font-medium text-[rgb(var(--color-text-primary))]">
              {formatCurrency(invoice.gstAmount || 0)}
            </span>
          </div>
          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[rgb(var(--color-text-secondary))]">
                {t("invoice.discount")}:
              </span>
              <span className="font-medium text-[rgb(var(--color-danger))]">
                -{formatCurrency(invoice.totalDiscount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-[rgb(var(--color-border-primary))]">
            <span className="text-[rgb(var(--color-text-primary))]">
              {t("invoice.total")}:
            </span>
            <span className="text-[rgb(var(--color-primary))] text-base">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InvoiceCard;
