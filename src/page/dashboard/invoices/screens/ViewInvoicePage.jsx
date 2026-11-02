"use client";

import { InvoicePrintModal } from "@dragorbit/features/invoices";
import { ArrowLeft, FileQuestion, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import PaymentConfirmModal from "@/components/payment/PaymentConfirmModal";
import { EmptyState } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDate, formatDateTime } from "@/utils/dateFormatter";
import { DeleteInvoiceModal, UpdatePaymentStatusModal } from "../components";
import InvoiceActions from "../components/view/InvoiceActions";
import InvoiceCustomerInfo from "../components/view/InvoiceCustomerInfo";
import InvoiceHeader from "../components/view/InvoiceHeader";
import InvoiceItemsTable from "../components/view/InvoiceItemsTable";
import InvoiceLoadingState from "../components/view/InvoiceLoadingState";
import InvoiceNotes from "../components/view/InvoiceNotes";
import InvoicePageLayout from "../components/view/InvoicePageLayout";
import { useInvoicePrint } from "../hooks/useInvoicePrint";
import { useMiniInvoicePrint } from "../hooks/useMiniInvoicePrint";
import {
  calculateGstAmount,
  calculateSubtotal,
  getItemsWithGst,
} from "../utils/invoiceCalculations.utils";

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
  const signatures = useAppSelector((state) => state.signatures);
  const storeId = selectedStore?.storeId;

  // Permission Management
  const { can, loading: permissionLoading } = useModulePermissions("invoice");
  const canRead = can("read");
  const canEdit = can("edit");
  const canCreate = can("create");
  const canDelete = can("delete");

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard/invoices");
    }
  }, [canRead, permissionLoading, router]);

  const { execute, data: invoiceData, loading: fetching } = useApiResponse();
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const hasFetched = useRef(false);
  const hasAutoPrinted = useRef(false);

  const handleDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const isMiniTemplate = selectedTemplate?.startsWith("thermal");

  const standardPrint = useInvoicePrint(fetching, invoiceData, isMiniTemplate, {
    selectedTemplate,
    selectedStore,
    signatures: signatures?.items || [],
  });
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

  const handlePrintAndSave = useCallback(() => {
    setShowPrintModal(true);
  }, []);

  const handleCreateNewInvoice = useCallback(() => {
    const isPos = searchParams.get("redirect") === "pos";
    router.push(isPos ? "/dashboard/pos" : "/dashboard/invoices/add");
  }, [router, searchParams]);

  const handleDownloadPDFAction = useCallback(
    (inv) => {
      handleDownloadPDF(inv || invoiceData, invoiceId, {
        selectedTemplate,
        selectedStore,
        signatures: signatures?.items || [],
      });
    },
    [
      handleDownloadPDF,
      invoiceData,
      invoiceId,
      selectedTemplate,
      selectedStore,
      signatures?.items,
    ]
  );

  // Global actions for this page
  useCommonHotkeys({
    onPrint: canRead ? handlePrintWithRedirect : undefined,
    onDownload: canRead ? handleDownloadPDFAction : undefined,
    onEdit: canEdit ? handleEdit : undefined,
    onNew: canCreate ? handleCreateNewInvoice : undefined,
    onClose: showPaymentStatusModal ? handleClosePaymentStatusModal : undefined,
    onBack: handleNavigateToPosOrInvoices,
  });

  const isDraft =
    invoiceData?.invoiceStatus === "DRAFT" || invoiceData?.status === "DRAFT";
  const isReleased =
    invoiceData?.invoiceStatus === "RELEASED" ||
    invoiceData?.status === "RELEASED";
  const isPaid = invoiceData?.paymentStatus === "PAID";
  const isPos = searchParams.get("redirect") === "pos";

  const itemsSummary = useMemo(() => {
    if (!invoiceData) return null;
    return {
      subtotal:
        calculatedSubtotal > 0 ? calculatedSubtotal : invoiceData.subtotal,
      taxableAmount:
        calculatedSubtotal > 0 ? calculatedSubtotal : invoiceData.subtotal,
      totalDiscount: invoiceData.totalDiscount || 0,
      gstAmount:
        calculatedGstAmount > 0
          ? calculatedGstAmount
          : invoiceData.gst?.amount || invoiceData.gstAmount || 0,
      totalValue: invoiceData.totalAmount,
      totalAmount: invoiceData.totalAmount,
      paidAmount: invoiceData.paidAmount,
      dueAmount: invoiceData.dueAmount,
    };
  }, [invoiceData, calculatedSubtotal, calculatedGstAmount]);

  if (fetching || permissionLoading) return <InvoiceLoadingState t={t} />;

  if (!canRead) return null;

  return (
    <div className="flex h-screen relative w-full overflow-hidden bg-[rgb(var(--color-bg-primary))]">
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
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
            <div className="h-full flex flex-col">
              {/* Back Link & Create New Invoice */}
              <div className="mb-4 sm:mb-6 shrink-0 no-print flex items-center justify-between gap-4">
                <Link
                  href={isPos ? "/dashboard/pos" : "/dashboard/invoices"}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isPos
                      ? t("invoice.backToPos", { defaultValue: "Back to POS" })
                      : t("invoice.backToInvoices", {
                        defaultValue: "Back to Invoices",
                      })}
                  </span>
                </Link>

                {canCreate && (
                  <button
                    type="button"
                    onClick={handleCreateNewInvoice}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10 transition-colors cursor-pointer"
                    title={t("invoice.createNewInvoice", { defaultValue: "Create New Invoice" })}
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {t("invoice.createNewInvoice", { defaultValue: "Create New Invoice" })}
                    </span>
                  </button>
                )}
              </div>

              {/* Offscreen Printable Template (used by html2canvas for PDF and window.print) */}
              <InvoicePageLayout
                invoiceData={invoiceData}
                selectedTemplate={selectedTemplate}
                selectedStore={selectedStore}
                itemsWithGst={itemsWithGst}
                calculatedSubtotal={calculatedSubtotal}
                calculatedGstAmount={calculatedGstAmount}
              />

              {/* Main 2-Column Responsive Layout matching Bill View */}
              <div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1 min-h-0 no-print"
              >
                {/* Left: Document details (2 cols) */}
                <div className="lg:col-span-2 flex flex-col overflow-y-auto pe-0 lg:pe-4 space-y-5 custom-scrollbar">
                  {/* Main Invoice Sheet (Document Style Header + Customer Info) */}
                  <div className="bg-white dark:bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]/60 overflow-hidden">
                    <InvoiceHeader
                      invoiceData={invoiceData}
                      formatDate={formatDate}
                    />
                    <div className="w-full">
                      <InvoiceCustomerInfo
                        customer={invoiceData.customer}
                        invoiceData={invoiceData}
                      />
                    </div>
                  </div>

                  {/* Line Items List with GST Breakdown & Totals */}
                  <div className="w-full">
                    <InvoiceItemsTable
                      items={
                        itemsWithGst?.length > 0
                          ? itemsWithGst
                          : invoiceData.items
                      }
                      itemsSummary={itemsSummary}
                      gstBreakdown={
                        invoiceData.gst?.breakdown || invoiceData.gstBreakdown
                      }
                      formatCurrency={formatCurrency}
                    />
                  </div>

                  {/* Notes & Terms */}
                  <InvoiceNotes
                    notes={invoiceData.notes}
                    terms={invoiceData.termsAndConditions}
                    cancellationReason={invoiceData.cancellationReason}
                  />
                </div>

                {/* Right: Actions & Financial Summary Sidebar (1 col) */}
                <div className="lg:col-span-1 h-full overflow-y-auto px-1 custom-scrollbar">
                  <InvoiceActions
                    invoiceData={invoiceData}
                    storeId={storeId}
                    onEditInvoice={canEdit && isDraft ? handleEdit : undefined}
                    onReleaseInvoice={
                      canEdit && isDraft && invoiceData?.id
                        ? handleRelease
                        : undefined
                    }
                    onDeleteInvoice={
                      canDelete && isDraft ? handleDelete : undefined
                    }
                    onPrintAndSave={canRead ? handlePrintAndSave : undefined}
                    onPrintInvoice={canRead ? handlePrintAndSave : undefined}
                    onDownloadPDF={
                      canRead ? handleDownloadPDFAction : undefined
                    }
                    onUpdatePaymentStatus={
                      canEdit && isReleased && !isPaid
                        ? handleOpenPaymentStatusModal
                        : undefined
                    }
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPaymentStatusModal && (
        <UpdatePaymentStatusModal
          onClose={handleClosePaymentStatusModal}
          onSuccess={handlePaymentStatusSuccess}
          invoice={invoiceData}
        />
      )}

      {showDeleteModal && (
        <DeleteInvoiceModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          invoiceId={invoiceId}
          invoiceNumber={invoiceData?.invoiceNumber}
        />
      )}

      <PaymentConfirmModal
        open={Boolean(paymentInvoiceId)}
        invoiceId={paymentInvoiceId}
        source="release"
        onClose={handleClosePaymentConfirmModal}
      />

      {showPrintModal && (
        <InvoicePrintModal
          open={showPrintModal}
          invoiceId={invoiceId}
          invoice={invoiceData}
          selectedStore={selectedStore}
          signatures={signatures?.items || signatures || []}
          fetchInvoice={async (id) => {
            const res = await invoiceService.getInvoices({
              id,
              store: storeId,
            });
            const raw = res?.data ?? res;
            return raw?.data ?? raw;
          }}
          onClose={() => setShowPrintModal(false)}
          onCreateNew={handleCreateNewInvoice}
          t={t}
        />
      )}
    </div>
  );
};

export default memo(ViewInvoicePage);
