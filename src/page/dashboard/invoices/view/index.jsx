"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { UpdatePaymentStatusModal } from "@/components/invoice";
import InvoiceLoadingState from "@/components/invoice/view/InvoiceLoadingState";
import InvoiceNotFound from "@/components/invoice/view/InvoiceNotFound";
import InvoicePageLayout from "@/components/invoice/view/InvoicePageLayout";
import InvoiceViewHeader from "@/components/invoice/view/InvoiceViewHeader";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useInvoicePrint } from "@/hooks/print/invoice/useInvoicePrint";
import { useMiniInvoicePrint } from "@/hooks/print/invoice/useMiniInvoicePrint";
import {
  calculateGstAmount,
  calculateSubtotal,
  getItemsWithGst,
} from "@/utils/invoice/invoiceCalculations.utils";

const ViewInvoicePage = ({ invoiceId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoPrint = searchParams.get("autoPrint") === "true";
  const { showSuccess, showError } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // Permission Management
  const { can, loading: permissionLoading } = useModulePermissions("invoice");
  const canRead = can("read");
  const canEdit = can("edit");
  const canCreate = can("create");

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard/invoices");
    }
  }, [canRead, permissionLoading, router]);

  const { execute, data: invoiceData, loading: fetching } = useApiResponse();
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const hasFetched = useRef(false);
  const hasAutoPrinted = useRef(false);

  const isMiniTemplate = selectedTemplate?.startsWith("thermal");

  const standardPrint = useInvoicePrint(fetching, invoiceData, isMiniTemplate);
  const miniPrint = useMiniInvoicePrint(fetching, invoiceData, !isMiniTemplate);

  const { handlePrint, handleDownloadPDF } = isMiniTemplate ? miniPrint : standardPrint;

  const calculatedGstAmount = invoiceData ? calculateGstAmount(invoiceData) : 0;
  const itemsWithGst = invoiceData ? getItemsWithGst(invoiceData) : [];
  const calculatedSubtotal = invoiceData ? calculateSubtotal(invoiceData, calculatedGstAmount, itemsWithGst) : 0;

  // Fetch invoice data
  const fetchInvoiceData = useCallback(async (forceRefetch = false) => {
    if (!invoiceId || !storeId) return;
    if (!forceRefetch && hasFetched.current) return;
    hasFetched.current = true;

    const result = await execute(
      invoiceService.getInvoices({ id: invoiceId, store: storeId }),
      { showToast: false }
    );

    if (!result?.success) {
      showError(result?.message || t("errors.failedToFetchData", { item: t("common.invoice") }));
    }
  }, [invoiceId, storeId, execute, showError, t]);

  useEffect(() => { fetchInvoiceData(); }, [fetchInvoiceData]);
  // ── Redirect & Print Orchestration ─────────────────
  const setupRedirectAfterPrint = useCallback(() => {
    const redirectPath = searchParams.get("redirect") === "pos" ? "/dashboard/pos" : null;
    window.location.replace(redirectPath);
  }, [searchParams]);

  const handlePrintWithRedirect = useCallback(() => {
    handlePrint();
    setTimeout(() => {
      setupRedirectAfterPrint();
    }, 1000)
  }, [handlePrint, setupRedirectAfterPrint]);

  // Handle Auto-Print
  useEffect(() => {
    const shouldAutoPrint = searchParams.get("autoPrint") === "true";

    if (shouldAutoPrint && invoiceData && !fetching && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true;
      setTimeout(handlePrintWithRedirect, 1200);
    }
  }, [invoiceData, fetching, handlePrintWithRedirect, searchParams]);

  useEffect(() => {
    const savedTemplate = localStorage.getItem("invoice-template");
    if (savedTemplate) setSelectedTemplate(savedTemplate);
  }, []);

  // Global actions for this page
  useCommonHotkeys({
    onPrint: canRead ? handlePrintWithRedirect : undefined,
    onDownload: canRead ? () => handleDownloadPDF(invoiceData, invoiceId) : undefined,
    onEdit: canEdit ? () => router.push(`/dashboard/invoices/${invoiceId}/edit`) : undefined,
    onNew: canCreate ? () => router.push("/dashboard/invoices/create") : undefined,
    onClose: () => { if (showPaymentStatusModal) setShowPaymentStatusModal(false); },
    onBack: () => router.push(searchParams.get("redirect") === "pos" ? "/dashboard/pos" : "/dashboard/invoices"),
  });

  if (fetching || permissionLoading) return <InvoiceLoadingState t={t} />;

  if (!invoiceData) return <InvoiceNotFound t={t} />;

  if (!canRead) return null;

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <div className="no-print"><Sidebar /></div>
      <div className="min-h-screen w-full flex flex-col main-content">
        <div className="no-print"><Header title={t("invoice.viewInvoice")} description={t("invoice.viewInvoiceDescription")} /></div>
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto w-full">
            <InvoiceViewHeader
              invoiceData={invoiceData}
              invoiceId={invoiceId}
              onUpdatePaymentStatus={canEdit ? () => setShowPaymentStatusModal(true) : undefined}
              onDownloadPDF={canRead ? handleDownloadPDF : undefined}
              canCreate={canCreate}
              t={t}
            />
            <InvoicePageLayout
              invoiceData={invoiceData}
              fetchInvoiceData={fetchInvoiceData}
              selectedTemplate={selectedTemplate}
              selectedStore={selectedStore}
              itemsWithGst={itemsWithGst}
              calculatedSubtotal={calculatedSubtotal}
              calculatedGstAmount={calculatedGstAmount}
              onEdit={canEdit ? () => router.push(`/dashboard/invoices/${invoiceId}/edit`) : undefined}
              onUpdatePaymentStatus={canEdit ? () => setShowPaymentStatusModal(true) : undefined}
              onPrint={canRead ? handlePrintWithRedirect : undefined}
            />
          </div>
        </div>
      </div>

      {showPaymentStatusModal && (
        <UpdatePaymentStatusModal
          onClose={() => setShowPaymentStatusModal(false)}
          onSuccess={() => {
            showSuccess(t("invoice.paymentStatusUpdated"));
            fetchInvoiceData(true);
            setShowPaymentStatusModal(false);
          }}
          invoice={invoiceData}
        />
      )}
    </div>
  );
};

export default ViewInvoicePage;
