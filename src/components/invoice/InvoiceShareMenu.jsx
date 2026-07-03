"use client";
import { Copy, Download, Mail, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AddActionButton } from "@/components/ui";
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
        t("invoice.copyLinkNotAvailable") || "Invoice link not available. Sync invoice first.",
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
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <AddActionButton
        onClick={() => setIsOpen((open) => !open)}
        Icon={Send}
        label={t("common.send")}
        size="sm"
        title={t("common.send")}
        className={buttonClassName}
      />
      {isOpen ? (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
          {showDownload && onDownloadPDF ? (
            <>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                {t("invoice.downloadPDF")}
              </button>
              <div className="my-1 border-t border-[rgb(var(--color-border-primary))]" />
            </>
          ) : null}
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
            {t("common.whatsapp")}
          </button>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200"
            onClick={handleEmail}
          >
            <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {t("common.email")}
          </button>
          <div className="my-1 border-t border-[rgb(var(--color-border-primary))]" />
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-2 cursor-pointer transition-colors duration-200"
            onClick={handleCopyLink}
          >
            <Copy className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            {t("common.copyLink")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default InvoiceShareMenu;
