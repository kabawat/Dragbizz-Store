"use client";
import { ArrowLeft, Download, Plus, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  ReleaseInvoiceModal,
  UpdatePaymentStatusModal,
  InvoiceActionButtons,
  InvoiceSummaryCard,
} from "@/components/invoice";
import { Button } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useInvoicePrint } from "@/hooks/invoice/useInvoicePrint";
import { useMiniInvoicePrint } from "@/hooks/invoice/useMiniInvoicePrint";
import {
  calculateGstAmount,
  calculateSubtotal,
  getItemsWithGst,
} from "@/utils/invoice/invoiceCalculations.utils";
import { getTemplateComponent } from "@/utils/invoice/invoiceView.utils";

const ViewInvoicePage = ({ invoiceId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [fetching, setFetching] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const { showError } = useGlobalToast();
  const isMiniTemplate = selectedTemplate?.startsWith("thermal");

  const standardPrint = useInvoicePrint(
    fetching,
    invoiceData,
    isMiniTemplate // skip if mini
  );

  const miniPrint = useMiniInvoicePrint(
    fetching,
    invoiceData,
    !isMiniTemplate // skip if standard
  );

  const { handlePrint, handleDownloadPDF } = isMiniTemplate
    ? miniPrint
    : standardPrint;

  const calculatedGstAmount = invoiceData ? calculateGstAmount(invoiceData) : 0;
  const itemsWithGst = invoiceData ? getItemsWithGst(invoiceData) : [];
  const calculatedSubtotal = invoiceData
    ? calculateSubtotal(invoiceData, calculatedGstAmount, itemsWithGst)
    : 0;

  // Fetch invoice data
  const fetchInvoiceData = useCallback(async () => {
    if (!invoiceId || !storeId) return;

    try {
      setFetching(true);
      const result = await invoiceService.getInvoices({
        id: invoiceId,
        store: storeId,
      });
      if (result.success && result.data) {
        setInvoiceData(result.data);
      } else {
        showError(
          result.message ||
          t("errors.failedToFetchData", { item: t("common.invoice") })
        );
      }
    } catch (_error) {
      showError(
        t("errors.failedToFetchDataTryAgain", { item: t("common.invoice") })
      );
    } finally {
      setFetching(false);
    }
  }, [invoiceId, storeId, showError, t]);

  useEffect(() => {
    fetchInvoiceData();
  }, [fetchInvoiceData]);

  // Load default template from localStorage
  useEffect(() => {
    const savedTemplate = localStorage.getItem("invoice-template");
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
  }, []);

  // Handle edit invoice
  const handleEditInvoice = () => {
    router.push(`/dashboard/invoices/edit/${invoiceId}`);
  };

  // Loading state
  if (fetching) {
    return (
      <div className="flex h-screen relative w-full overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex flex-col">
          <Header
            title={t("invoice.viewInvoice")}
            description={t("invoice.viewInvoiceDescription")}
          />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen relative w-full overflow-hidden">
        {/* Sidebar */}
        <div className="no-print">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="min-h-screen w-full flex flex-col main-content">
          {/* Header */}
          <div className="no-print">
            <Header
              title={t("invoice.viewInvoice")}
              description={t("invoice.viewInvoiceDescription")}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              {/* Back Button and Create New Invoice Button */}
              <div className="mb-4 no-print flex items-center justify-between">
                <Link
                  href="/dashboard/invoices"
                  className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Invoices</span>
                </Link>
                <div className="flex items-center gap-3">
                  {invoiceData?.invoiceStatus === "RELEASED" && (
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentStatusModal(true)}
                      leftIcon={CreditCard}
                      className="h-9"
                    >
                      {t("invoice.updatePaymentStatus")}
                    </Button>
                  )}
                  {invoiceData?.invoiceStatus !== "DRAFT" && (
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadPDF(invoiceData, invoiceId)}
                      leftIcon={Download}
                      className="h-9"
                    >
                      {t("invoice.downloadPDF")}
                    </Button>
                  )}
                  <Link href="/dashboard/invoices/add">
                    <Button variant="primary" leftIcon={Plus} className="h-9">
                      Create New Invoice
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Invoice Details - Two Column Layout */}
              {invoiceData && (
                <div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  style={{ height: "calc(100vh - 150px)" }}
                >
                  {/* Left Column - Invoice Format */}
                  <div className="lg:col-span-2 flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-150px)]">
                      {/* Invoice Document with Template */}
                      <div id="invoice-area" className="bg-white rounded-lg">
                        {invoiceData &&
                          React.createElement(
                            getTemplateComponent(selectedTemplate),
                            {
                              invoiceData: {
                                ...invoiceData,
                                items:
                                  itemsWithGst.length > 0
                                    ? itemsWithGst
                                    : invoiceData.items,
                                subtotal:
                                  calculatedSubtotal > 0
                                    ? calculatedSubtotal
                                    : invoiceData.subtotal,
                                gstAmount:
                                  calculatedGstAmount > 0
                                    ? calculatedGstAmount
                                    : invoiceData.gstAmount,
                              },
                              selectedStore,
                            }
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar - Compact Design */}
                  <div className="flex flex-col h-full no-print right-sidebar">
                    <div className="flex-1 overflow-y-auto px-3 max-h-[calc(100vh-204px)]">
                      <div className="space-y-4">
                        <InvoiceSummaryCard
                          invoiceData={invoiceData}
                          calculatedSubtotal={calculatedSubtotal}
                          calculatedGstAmount={calculatedGstAmount}
                        />
                        <InvoiceActionButtons
                          invoiceData={invoiceData}
                          onEdit={handleEditInvoice}
                          onRelease={() => setShowReleaseModal(true)}
                          onUpdatePaymentStatus={() =>
                            setShowPaymentStatusModal(true)
                          }
                          onPrint={handlePrint}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showReleaseModal && (
          <ReleaseInvoiceModal
            onClose={() => setShowReleaseModal(false)}
            onSuccess={fetchInvoiceData}
            invoice={invoiceData}
          />
        )}

        {showPaymentStatusModal && (
          <UpdatePaymentStatusModal
            onClose={() => setShowPaymentStatusModal(false)}
            onSuccess={fetchInvoiceData}
            invoice={invoiceData}
          />
        )}
      </div>
    </>
  );
};

export default ViewInvoicePage;
