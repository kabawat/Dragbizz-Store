"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { UpdatePaymentStatusModal } from "@/components/invoice";
import InvoiceLoadingState from "@/components/invoice/view/InvoiceLoadingState";
import InvoicePageLayout from "@/components/invoice/view/InvoicePageLayout";
import InvoiceViewHeader from "@/components/invoice/view/InvoiceViewHeader";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useCommonHotkeys } from "@/hooks/useCommonHotkeys";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useInvoicePrint } from "@/hooks/invoice/useInvoicePrint";
import { useMiniInvoicePrint } from "@/hooks/invoice/useMiniInvoicePrint";
import {
  calculateGstAmount,
  calculateSubtotal,
  getItemsWithGst,
} from "@/utils/invoice/invoiceCalculations.utils";

const ViewInvoicePage = ({ invoiceId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showSuccess, showError } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [fetching, setFetching] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  const isMiniTemplate = selectedTemplate?.startsWith("thermal");

  const standardPrint = useInvoicePrint(fetching, invoiceData, isMiniTemplate);
  const miniPrint = useMiniInvoicePrint(fetching, invoiceData, !isMiniTemplate);

  const { handlePrint, handleDownloadPDF } = isMiniTemplate ? miniPrint : standardPrint;

  const calculatedGstAmount = invoiceData ? calculateGstAmount(invoiceData) : 0;
  const itemsWithGst = invoiceData ? getItemsWithGst(invoiceData) : [];
  const calculatedSubtotal = invoiceData ? calculateSubtotal(invoiceData, calculatedGstAmount, itemsWithGst) : 0;

  // Fetch invoice data
  const fetchInvoiceData = useCallback(async () => {
    if (!invoiceId || !storeId) return;
    try {
      setFetching(true);
      const result = await invoiceService.getInvoices({ id: invoiceId, store: storeId });
      if (result.success && result.data) setInvoiceData(result.data);
      else showError(result.message || t("errors.failedToFetchData", { item: t("common.invoice") }));
    } catch (_error) {
      showError(t("errors.failedToFetchDataTryAgain", { item: t("common.invoice") }));
    } finally { setFetching(false); }
  }, [invoiceId, storeId, showError, t]);

  useEffect(() => { fetchInvoiceData(); }, [fetchInvoiceData]);

  useEffect(() => {
    const savedTemplate = localStorage.getItem("invoice-template");
    if (savedTemplate) setSelectedTemplate(savedTemplate);
  }, []);

  // Global actions for this page
  useCommonHotkeys({
    onPrint: handlePrint,
    onDownload: () => handleDownloadPDF(invoiceData, invoiceId),
    onEdit: () => router.push(`/dashboard/invoices/edit/${invoiceId}`),
    onNew: () => router.push("/dashboard/invoices/add"),
    onClose: () => { if (showPaymentStatusModal) setShowPaymentStatusModal(false); },
    onBack: () => router.push("/dashboard/invoices"),
  });

  if (fetching) return <InvoiceLoadingState t={t} />;

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
              onUpdatePaymentStatus={() => setShowPaymentStatusModal(true)}
              onDownloadPDF={handleDownloadPDF}
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
              onEdit={() => router.push(`/dashboard/invoices/edit/${invoiceId}`)}
              onUpdatePaymentStatus={() => setShowPaymentStatusModal(true)}
              onPrint={handlePrint}
            />
          </div>
        </div>
      </div>

      {showPaymentStatusModal && (
        <UpdatePaymentStatusModal
          onClose={() => setShowPaymentStatusModal(false)}
          onSuccess={() => {
            showSuccess(t("invoice.paymentStatusUpdated"));
            fetchInvoiceData();
            setShowPaymentStatusModal(false);
          }}
          invoice={invoiceData}
        />
      )}
    </div>
  );
};

export default ViewInvoicePage;
