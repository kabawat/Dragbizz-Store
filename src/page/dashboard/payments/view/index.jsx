"use client";
import {
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CreditCard,
  Download,
  Edit,
  FileText,
  Hash,
  IndianRupee,
  Smartphone,
  Wallet,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
// Import components
import Sidebar from "@/components/dashboard/sidebar";
import PaymentDetailsTemplate from "@/components/templates/payment/PaymentDetailsTemplate";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { paymentService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { usePaymentDetailsPrint } from "./hooks/usePaymentDetailsPrint";
import useApiResponse from "@/hooks/useApiResponse";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const ViewPaymentPage = ({ paymentId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const hasFetched = useRef(false);

  // API hooks
  const { execute, loading: fetching } = useApiResponse();

  // Permission Management
  const { can, loading: permissionLoading } = useModulePermissions("billing");
  const canRead = can("read");
  const canEdit = can("edit");

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard/payments");
    }
  }, [canRead, permissionLoading, router]);

  const { handleDownloadPDF } = usePaymentDetailsPrint(
    fetching,
    paymentData
  );

  // Fetch payment data on component mount
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!paymentId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      setError(null);

      const params = {
        store: storeId,
        id: paymentId,
      };

      const result = await execute(paymentService.getPayments(params), {
        showToast: false,
      });

      if (result?.success) {
        const data =
          result.data?.data?.payment ||
          result.data?.payment ||
          result.data;

        if (data) {
          setPaymentData(data);
        } else {
          setError(t("errors.failedToFetchData", { item: t("payments.payment") }));
        }
      } else {
        setError(
          result?.message ||
          t("errors.failedToFetchData", { item: t("payments.payment") })
        );
      }
    };

    fetchPaymentData();
  }, [paymentId, storeId, t]);

  // Handle edit payment
  const handleEditPayment = () => {
    router.push(`/dashboard/payments/${paymentId}/edit`);
  };

  // Get payment method label
  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      CASH: t("payments.cash", { defaultValue: "Cash" }),
      UPI: t("payments.upi", { defaultValue: "UPI" }),
      BANK_TRANSFER: t("payments.bankTransfer", { defaultValue: "Bank Transfer" }),
      CHEQUE: t("payments.cheque", { defaultValue: "Cheque" }),
      CREDIT: t("payments.credit", { defaultValue: "Credit" }),
    };
    return methodMap[method] || method || t("common.na");
  };

  // Get payment type label
  const getPaymentTypeLabel = (type) => {
    const typeMap = {
      BILL_PAYMENT: t("payments.billPayment", { defaultValue: "Bill Payment" }),
      ADVANCE: t("payments.advancePayment", { defaultValue: "Advance Payment" }),
      OTHER: t("common.other", { defaultValue: "Other" }),
    };
    return typeMap[type] || type || t("common.na");
  };

  // Loading state
  if (fetching || permissionLoading) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title={t("payments.viewPayment")}
            description={t("payments.paymentInformationAndDetails")}
          />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      {t("modals.loadingData", { item: t("payments.payment") })}
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      {t("common.pleaseWaitWhileWeFetch", {
                        item: t("payments.payment"),
                      })}
                      Please wait while we fetch the payment information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print,
          nav,
          header,
          .sidebar,
          .header,
          button,
          .btn,
          .action-buttons {
            display: none !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>

      <div
        id="payment-details-report-area"
        className="hidden"
        data-variant="light"
        data-theme="default"
      >
        {paymentData && (
          <PaymentDetailsTemplate
            paymentData={paymentData}
            selectedStore={selectedStore}
          />
        )}
      </div>

      <div className="flex h-screen relative w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="min-h-screen w-full flex flex-col">
          {/* Header */}
          <Header
            title={t("payments.viewPayment", { defaultValue: "View Payment" })}
            description={t("payments.paymentInformationAndDetails", { defaultValue: "Payment information and details" })}
          />

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="">
              {/* Back Button */}
              <div className="mb-6">
                <Link
                  href="/dashboard/payments"
                  className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {t("payments.backToPayments", { defaultValue: "Back to Payments" })}
                  </span>
                </Link>
              </div>

              {/* Error State - Full Page */}
              {error && (
                <div className="w-full">
                  <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                      <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CreditCard className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                          Payment Not Found
                        </h2>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                          The payment you're looking for doesn't exist or has been
                          removed. Please check the payment ID and try again.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/payments")}
                            className="px-6 py-3"
                          >
                            {t("payments.backToPayments", { defaultValue: "Back to Payments" })}
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => window.location.reload()}
                            className="px-6 py-3"
                          >
                            {t("common.tryAgain", { defaultValue: "Try Again" })}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details - Only show when no error */}
              {!error && paymentData && (
                <div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  style={{ height: "calc(100vh - 300px)" }}
                >
                  {/* Left Side - Payment Info */}
                  <div className="lg:col-span-2 flex flex-col h-full">
                    <div
                      className="overflow-y-auto pe-3 space-y-6"
                      style={{
                        height: "calc(100vh - 200px)",
                        maxHeight: "calc(100vh - 200px)",
                      }}
                    >
                      {/* Payment Summary Card */}
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {t("payments.paymentSummary", { defaultValue: "Payment Summary" })}
                            </h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                              {t("payments.paymentOverview", { defaultValue: "Payment overview" })}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Payment Number */}
                          {paymentData.paymentNumber && (
                            <div className="relative p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-primary))]/10 dark:from-[rgb(var(--color-primary))]/5 dark:to-[rgb(var(--color-primary))]/3 rounded-lg overflow-hidden">
                              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-[rgb(var(--color-primary))]/35 dark:!text-[rgb(var(--color-primary))] dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  {t("payments.paymentNumber", { defaultValue: "Payment Number" })}
                                </p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] font-mono">
                                  {paymentData.paymentNumber || t("common.na")}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Total Amount */}
                          <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-lg overflow-hidden">
                            <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                            <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  {t("payments.totalAmount", { defaultValue: "Total Amount" })}
                                </p>
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                ₹
                                {paymentData.totalAmount?.toLocaleString(
                                  "en-IN",
                                  { maximumFractionDigits: 2 }
                                ) || "0.00"}
                              </p>
                            </div>
                          </div>

                          {/* Payment Type */}
                          <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                            <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                            <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  {t("payments.paymentType", { defaultValue: "Payment Type" })}
                                </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {getPaymentTypeLabel(paymentData.paymentType)}
                              </p>
                            </div>
                          </div>

                          {/* Payment Date */}
                          {paymentData.paymentDate && (
                            <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-lg overflow-hidden">
                              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  {t("payments.paymentDate", { defaultValue: "Payment Date" })}
                                </p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                  {moment(paymentData.paymentDate).format(
                                    "DD MMM YYYY"
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Supplier Information Card */}
                      {paymentData.supplier && (
                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                  {t("payments.supplierInformation", { defaultValue: "Supplier Information" })}
                                </h2>
                                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                  {t("payments.supplierDetails", { defaultValue: "Supplier details" })}
                                </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Supplier Name */}
                            <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-lg overflow-hidden">
                              <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  {t("payments.supplierName", { defaultValue: "Supplier Name" })}
                                </p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                  {paymentData.supplier?.name || t("common.na")}
                                </p>
                              </div>
                            </div>

                            {/* Supplier Phone */}
                            {paymentData.supplier?.phone && (
                              <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-lg overflow-hidden">
                                <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                                <div className="relative z-10">
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                    {t("common.phone", { defaultValue: "Phone" })}
                                  </p>
                                  <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                    {paymentData.supplier.phone}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Supplier Email */}
                            {paymentData.supplier?.email && (
                              <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-lg overflow-hidden">
                                <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                                <div className="relative z-10">
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                    {t("common.email", { defaultValue: "Email" })}
                                  </p>
                                  <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] break-all">
                                    {paymentData.supplier.email}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payment Methods Card */}
                      {paymentData.paymentMethods &&
                        paymentData.paymentMethods.length > 0 && (
                          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-green-500" />
                              </div>
                              <div>
                                <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                  {t("payments.paymentMethods", { defaultValue: "Payment Methods" })}
                                </h2>
                                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                  {t("payments.paymentMethodDetails", { defaultValue: "Payment method details" })}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {paymentData.paymentMethods.map((method, index) => (
                                <div
                                  key={index}
                                  className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      {method.method === "CASH" && (
                                        <Banknote className="w-5 h-5 text-green-500" />
                                      )}
                                      {method.method === "UPI" && (
                                        <Smartphone className="w-5 h-5 text-blue-500" />
                                      )}
                                      {method.method === "BANK_TRANSFER" && (
                                        <CreditCard className="w-5 h-5 text-purple-500" />
                                      )}
                                      {method.method === "CHEQUE" && (
                                        <FileText className="w-5 h-5 text-orange-500" />
                                      )}
                                      {method.method === "CREDIT" && (
                                        <CreditCard className="w-5 h-5 text-indigo-500" />
                                      )}
                                      <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                        {getPaymentMethodLabel(method.method)}
                                      </span>
                                    </div>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                      ₹
                                      {method.amount?.toLocaleString("en-IN", {
                                        maximumFractionDigits: 2,
                                      }) || "0.00"}
                                    </span>
                                  </div>
                                  {method.reference && (
                                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                      {t("payments.reference", { defaultValue: "Reference" })}:{" "}
                                      <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                        {method.reference}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Notes Card */}
                      {paymentData.notes && (
                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-500/20 to-gray-500/10 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                  {t("payments.notes", { defaultValue: "Notes" })}
                                </h2>
                                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                  {t("payments.additionalInformation", { defaultValue: "Additional information" })}
                                </p>
                            </div>
                          </div>
                          <p className="text-[rgb(var(--color-text-primary))] leading-relaxed">
                            {paymentData.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Quick Actions */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-6">
                      <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                              {t("common.quickActions", { defaultValue: "Quick Actions" })}
                            </h3>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                              {t("payments.manageThisPayment", { defaultValue: "Manage this payment" })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          {canEdit && (
                            <Button
                              variant="primary"
                              className="flex-1"
                              onClick={handleEditPayment}
                              leftIcon={Edit}
                            >
                              {t("common.edit", { defaultValue: "Edit" })}
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            className="flex-1"
                            leftIcon={Download}
                            onClick={() => handleDownloadPDF(paymentData)}
                            disabled={fetching || !paymentData || !canRead}
                          >
                            <span className="hidden sm:inline">{t("common.download", { defaultValue: "Download" })}</span>
                            <span className="sm:hidden">{t("common.download", { defaultValue: "Download" })}</span>
                          </Button>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                            {t("common.quickStats", { defaultValue: "Quick Stats" })}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                {t("payments.totalAmount", { defaultValue: "Total Amount" })}:
                              </span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                ₹
                                {paymentData.totalAmount?.toLocaleString(
                                  "en-IN",
                                  { maximumFractionDigits: 2 }
                                ) || "0.00"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">
                                {t("payments.paymentMethods", { defaultValue: "Payment Methods" })}:
                              </span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                {paymentData.paymentMethods?.length || 0}
                              </span>
                            </div>
                            {paymentData.paymentDate && (
                              <div className="flex justify-between">
                                <span className="text-[rgb(var(--color-text-secondary))]">
                                  {t("payments.paymentDate", { defaultValue: "Payment Date" })}:
                                </span>
                                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                  {moment(paymentData.paymentDate).format(
                                    "DD MMM YYYY"
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewPaymentPage;