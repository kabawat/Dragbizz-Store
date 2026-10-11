"use client";
import { InvoiceShareMenuPresentation } from "@dragorbit/features/invoices";

import { useEffect, useRef, useState } from "react";

import { useGlobalToast } from "@/contexts/ToastContext";
import {
  buildInvoiceShareUrl,
  copyInvoiceShareLink,
  openInvoiceEmailShare,
  openWhatsAppShare,
} from "@/utils/invoice/invoiceShare.utils";

export function InvoiceShareMenu({
  invoice,
  onDownloadPDF,
  disabled = false,
  showDownload = true,
  t,
  className = "",
  buttonClassName = "h-9 px-3 rounded-lg",
}) {
  const { showSuccess, showError } = useGlobalToast();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const requireShareUrl = () => {
    const shareUrl = buildInvoiceShareUrl(invoice);
    if (!shareUrl) {
      showError(
        t("invoice.copyLinkNotAvailable") ||
          "Invoice link not available. Sync invoice first.",
      );
      return null;
    }
    return shareUrl;
  };

  const handleWhatsApp = () => {
    const shareUrl = requireShareUrl();
    if (!shareUrl) return;
    openWhatsAppShare(invoice, shareUrl, t);
    setIsOpen(false);
  };

  const handleEmail = () => {
    const shareUrl = buildInvoiceShareUrl(invoice);
    openInvoiceEmailShare(invoice, shareUrl);
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    const shareUrl = requireShareUrl();
    if (!shareUrl) return;
    const ok = await copyInvoiceShareLink(shareUrl);
    setIsOpen(false);
    if (ok) {
      showSuccess(t("common.copied") || "Copied to clipboard");
    } else {
      showError(t("invoice.copyFailed") || "Failed to copy");
    }
  };

  const handleDownload = () => {
    onDownloadPDF?.(invoice);
    setIsOpen(false);
  };

  if (disabled) return null;

  return (
    <InvoiceShareMenuPresentation
      model={{
        className,
        menuRef,
        setIsOpen,
        t,
        buttonClassName,
        isOpen,
        showDownload,
        onDownloadPDF,
        handleDownload,
        handleWhatsApp,
        handleEmail,
        handleCopyLink,
      }}
    />
  );
}

export default InvoiceShareMenu;
