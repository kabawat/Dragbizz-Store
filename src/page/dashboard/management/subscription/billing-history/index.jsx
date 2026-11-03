"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { BillingHistoryScreen } from "@dragorbit/features/management";
import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useToast } from "@/hooks/ui/useToast";
import { billingService } from "@/service/retailer";
import ToastContainer from "@/components/ui/ToastContainer";

const BillingHistoryPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { toasts, showSuccess, showError, showToast, removeToast } = useToast();

  useDashboardHeader(
    t("subscription.billingHistory.title") || "Billing History & Invoices",
    t("subscription.billingHistory.description") ||
      "View and download subscription invoices"
  );

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(null);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await billingService.getInvoices({ limit: 50 });
      if (response?.success) {
        setInvoices(Array.isArray(response.data) ? response.data : []);
      } else {
        const msg = response?.message || "Failed to load billing history";
        setError(msg);
      }
    } catch (err) {
      setError(err?.message || "Failed to load billing history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDownload = async (invoice) => {
    if (!invoice?.invoiceId) {
      showError(
        t("subscription.billingHistory.invoiceErrorToast") ||
          "Invoice ID missing"
      );
      return;
    }

    setIsDownloading(invoice.invoiceId);
    try {
      const res = await billingService.getInvoiceDownloadUrl(invoice.invoiceId);
      if (res?.success && res.data?.downloadUrl) {
        const link = document.createElement("a");
        link.href = res.data.downloadUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = `Invoice-${invoice.receipt || invoice.orderId || invoice.invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showSuccess(
          t("subscription.billingHistory.invoiceSuccessToast") ||
            "Invoice download URL generated successfully."
        );
      } else if (
        res?.status === 409 ||
        res?.code === "NOT_READY" ||
        res?.message?.toLowerCase().includes("not ready")
      ) {
        showToast(
          t("subscription.billingHistory.invoiceGeneratingToast") ||
            "Invoice PDF is still being generated. Please retry in a few moments.",
          "info"
        );
      } else {
        showError(
          res?.message ||
            t("subscription.billingHistory.invoiceErrorToast") ||
            "Failed to download invoice"
        );
      }
    } catch (err) {
      showError(
        err?.message ||
          t("subscription.billingHistory.invoiceErrorToast") ||
          "Failed to download invoice"
      );
    } finally {
      setIsDownloading(null);
    }
  };

  const onBack = () => {
    router.push("/dashboard/management/subscription");
  };

  return (
    <>
      <BillingHistoryScreen
        model={{
          t,
          isLoading,
          isDownloading,
          invoices,
          onDownload: handleDownload,
          onBack,
          onRefresh: fetchInvoices,
          error,
          ManagementShortcuts,
          moment,
        }}
      />
      {toasts && toasts.length > 0 && (
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      )}
    </>
  );
};

export default BillingHistoryPage;

