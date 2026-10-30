"use client";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UpdatePaymentStatusModal } from "@/components/invoice";
import InvoiceLoadingState from "@/components/invoice/view/InvoiceLoadingState";
import InvoicePageLayout from "@/components/invoice/view/InvoicePageLayout";
import InvoiceViewHeader from "@/components/invoice/view/InvoiceViewHeader";
import PaymentConfirmModal from "@/components/payment/PaymentConfirmModal";
import { EmptyState } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useInvoicePrint } from "@/hooks/print/invoice/useInvoicePrint";
import { useMiniInvoicePrint } from "@/hooks/print/invoice/useMiniInvoicePrint";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import {
  calculateGstAmount,
  calculateSubtotal,
  getItemsWithGst,
} from "@/utils/invoice/invoiceCalculations.utils";

const ViewInvoicePage = ({ invoiceId }) => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("invoice.viewInvoice"),
    t("invoice.viewInvoiceDescription")
  );
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [paymentInvoiceId, setPaymentInvoiceId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const hasFetched = useRef(false);
  const hasAutoPrinted = useRef(false);

  const isMiniTemplate = selectedTemplate?.startsWith("thermal");

  const standardPrint = useInvoicePrint(fetching, invoiceData, isMiniTemplate);
  const miniPrint = useMiniInvoicePrint(fetching, invoiceData, !isMiniTemplate);

  const { handlePrint, handleDownloadPDF } = isMiniTemplate
    ? miniPrint
    : standardPrint;

  // Memoized expensive GST and Subtotal calculations
  const { calculatedGstAmount, itemsWithGst, calculatedSubtotal } =
    useMemo(() => {
      if (!invoiceData) {
        return {
          calculatedGstAmount: 0,
          itemsWithGst: [],
          calculatedSubtotal: 0,
        };
      }
      const gstAmount = calculateGstAmount(invoiceData);
      const items = getItemsWithGst(invoiceData);
      const subtotal = calculateSubtotal(invoiceData, gstAmount, items);
      return {
        calculatedGstAmount: gstAmount,
        itemsWithGst: items,
        calculatedSubtotal: subtotal,
      };
    }, [invoiceData]);

  // Fetch invoice data
  const fetchInvoiceData = useCallback(
    async (forceRefetch = false) => {
      if (!invoiceId || !storeId) return;
      if (!forceRefetch && hasFetched.current) return;
      hasFetched.current = true;

      const result = await execute(
        invoiceService.getInvoices({ id: invoiceId, store: storeId }),
        { showToast: false }
      );

      if (!result?.success) {
        showError(
          result?.message ||
            t("errors.failedToFetchData", { item: t("common.invoice") })
        );
      }
    },
    [invoiceId, storeId, execute, showError, t]
  );

  useEffect(() => {
    fetchInvoiceData();
  }, [fetchInvoiceData]);

  // ── Redirect & Print Orchestration ─────────────────
  const setupRedirectAfterPrint = useCallback(() => {
    const redirectPath =
      searchParams.get("redirect") === "pos" ? "/dashboard/pos" : null;
    if (redirectPath) {
      window.location.replace(redirectPath);
    }
  }, [searchParams]);

  const handlePrintWithRedirect = useCallback(() => {
    handlePrint();

    const isAutoPrint = searchParams.get("autoPrint") === "true";
    const isPosRedirect = searchParams.get("redirect") === "pos";

    // Redirect only if it's an auto-print from POS
    if (isAutoPrint && isPosRedirect) {
      setTimeout(() => {
        setupRedirectAfterPrint();
      }, 600);
    }
  }, [handlePrint, setupRedirectAfterPrint, searchParams]);

  // Handle Auto-Print
  useEffect(() => {
    const shouldAutoPrint = searchParams.get("autoPrint") === "true";

    if (
      shouldAutoPrint &&
      invoiceData &&
      !fetching &&
      !hasAutoPrinted.current
    ) {
      hasAutoPrinted.current = true;
      setTimeout(handlePrintWithRedirect, 1200);
    }
  }, [invoiceData, fetching, handlePrintWithRedirect, searchParams]);

  useEffect(() => {
    const savedTemplate = localStorage.getItem("invoice-template");
    if (savedTemplate) setSelectedTemplate(savedTemplate);
  }, []);

  const handleOpenPaymentStatusModal = useCallback(() => {
    setShowPaymentStatusModal(true);
  }, []);

  const handleClosePaymentStatusModal = useCallback(() => {
    setShowPaymentStatusModal(false);
  }, []);

  const handlePaymentStatusSuccess = useCallback(() => {
    showSuccess(t("invoice.paymentStatusUpdated"));
    fetchInvoiceData(true);
    setShowPaymentStatusModal(false);
  }, [fetchInvoiceData, showSuccess, t]);

  const handleClosePaymentConfirmModal = useCallback(() => {
    setPaymentInvoiceId(null);
  }, []);

  const handleEdit = useCallback(() => {
    router.push(`/dashboard/invoices/${invoiceId}/edit`);
  }, [router, invoiceId]);

  const handleRelease = useCallback(() => {
    if (invoiceData?.id) {
      setPaymentInvoiceId(invoiceData.id);
    }
  }, [invoiceData?.id]);

  const handleNavigateToPosOrInvoices = useCallback(() => {
    const isPos = searchParams.get("redirect") === "pos";
    router.push(isPos ? "/dashboard/pos" : "/dashboard/invoices");
  }, [router, searchParams]);

  const handleCreateNewInvoice = useCallback(() => {
    router.push("/dashboard/invoices/create");
  }, [router]);

  const handleDownloadPDFAction = useCallback(() => {
    handleDownloadPDF(invoiceData, invoiceId);
  }, [handleDownloadPDF, invoiceData, invoiceId]);

  // Global actions for this page
  useCommonHotkeys({
    onPrint: canRead ? handlePrintWithRedirect : undefined,
    onDownload: canRead ? handleDownloadPDFAction : undefined,
    onEdit: canEdit ? handleEdit : undefined,
    onNew: canCreate ? handleCreateNewInvoice : undefined,
    onClose: showPaymentStatusModal ? handleClosePaymentStatusModal : undefined,
    onBack: handleNavigateToPosOrInvoices,
  });

  if (fetching || permissionLoading) return <InvoiceLoadingState t={t} />;

  if (!canRead) return null;

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6">
        {!invoiceData ? (
          <EmptyState
            title={t("invoice.notFoundTitle") || "Invoice Not Found"}
            description={
              t("invoice.notFoundDescription") ||
              "The invoice you are looking for might have been deleted or does not exist."
            }
            icon={FileQuestion}
            type="error"
            fullHeight={true}
            actionButton={{
              label: t("invoice.backToInvoices") || "Go Back to Invoices",
              icon: ArrowLeft,
              onClick: handleNavigateToPosOrInvoices,
            }}
          />
        ) : (
          <div className="mx-auto w-full min-w-0 max-w-8xl">
            <InvoiceViewHeader
              invoiceData={invoiceData}
              invoiceId={invoiceId}
              storeId={storeId}
              onUpdatePaymentStatus={
                canEdit ? handleOpenPaymentStatusModal : undefined
              }
              onDownloadPDF={canRead ? handleDownloadPDF : undefined}
              onEdit={canEdit ? handleEdit : undefined}
              onRelease={canEdit && invoiceData?.id ? handleRelease : undefined}
              onPrint={canRead ? handlePrintWithRedirect : undefined}
              canCreate={canCreate}
              t={t}
            />
            <InvoicePageLayout
              invoiceData={invoiceData}
              selectedTemplate={selectedTemplate}
              selectedStore={selectedStore}
              itemsWithGst={itemsWithGst}
              calculatedSubtotal={calculatedSubtotal}
              calculatedGstAmount={calculatedGstAmount}
            />
          </div>
        )}
      </div>

      {showPaymentStatusModal && (
        <UpdatePaymentStatusModal
          onClose={handleClosePaymentStatusModal}
          onSuccess={handlePaymentStatusSuccess}
          invoice={invoiceData}
        />
      )}

      <PaymentConfirmModal
        open={Boolean(paymentInvoiceId)}
        invoiceId={paymentInvoiceId}
        source="release"
        onClose={handleClosePaymentConfirmModal}
      />
    </div>
  );
};

export default ViewInvoicePage;
