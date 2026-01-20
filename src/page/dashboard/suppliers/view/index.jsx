"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  Hash,
  IndianRupee,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Shield,
  FileText,
  DollarSign,
  Wallet,
  Receipt,
  AlertCircle,
  Download,
} from "lucide-react";
import moment from "moment";

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { useAnalyticsReportPrint } from "@/hooks/useAnalyticsReportPrint";
import SupplierDetailsTemplate from "@/components/templates/supplier/SupplierDetailsTemplate";

const ViewSupplierPage = ({ supplierId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedSupplierName, setDeletedSupplierName] = useState("");
  const hasFetched = useRef(false);
  const { handleDownloadPDF } = useAnalyticsReportPrint(
    fetching,
    supplierData,
    "supplier-details-area",
    "supplier-details-report",
  );

  // Fetch supplier data on component mount
  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!supplierId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const result = await supplierService.getSuppliers({
          id: supplierId,
          store: storeId,
        });
        if (result.success && result.data) {
          setSupplierData(result.data);
        } else {
          setError(
            result.message ||
              t("errors.failedToFetchData", { item: t("common.supplier") }),
          );
        }
      } catch (error) {
        setError(
          t("errors.failedToFetchDataTryAgain", { item: t("common.supplier") }),
        );
      } finally {
        setFetching(false);
      }
    };

    fetchSupplierData();
  }, [supplierId, storeId]);

  // Handle edit supplier
  const handleEditSupplier = () => {
    router.push(`/dashboard/suppliers/edit/${supplierId}`);
  };

  // Handle delete supplier
  const handleDeleteSupplier = () => {
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!supplierId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await supplierService.deleteSupplier(supplierId, storeId);

      if (result.success) {
        setDeletedSupplierName(supplierData?.name || t("common.supplier"));
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        setError(
          result.message ||
            t("errors.failedToDelete", { item: t("common.supplier") }),
        );
        setShowDeleteModal(false);
      }
    } catch (error) {
      setError(
        t("errors.failedToDeleteTryAgain", { item: t("common.supplier") }),
      );
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    setShowDeleteSuccessModal(false);
    router.push("/dashboard/suppliers");
  };

  // Loading state while fetching supplier data
  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title={t("suppliers.viewSupplier")}
            description={t("suppliers.supplierInformationAndDetails")}
          />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      {t("modals.loadingData", { item: t("common.supplier") })}
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      {t("common.pleaseWaitWhileWeFetch", {
                        item: t("common.supplier"),
                      })}
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
        id="supplier-details-area"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "850px",
        }}
      >
        {supplierData && (
          <SupplierDetailsTemplate
            supplierData={supplierData}
            selectedStore={selectedStore}
          />
        )}
      </div>

      <div className="flex h-screen relative w-full overflow-hidden">
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="View Supplier"
            description="Supplier information and details"
          />

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="">
              {/* Back Button */}
              <div className="mb-6">
                <Link
                  href="/dashboard/suppliers"
                  className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {t("common.backTo", { item: t("common.suppliers") })}
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
                          <Building className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                          {t("modals.notFound", { item: t("common.supplier") })}
                        </h2>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                          {t("common.doesntExistOrRemoved", {
                            item: t("common.supplier"),
                          })}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/suppliers")}
                            className="px-6 py-3"
                          >
                            {t("common.backTo", {
                              item: t("common.suppliers"),
                            })}
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => window.location.reload()}
                            className="px-6 py-3"
                          >
                            {t("common.tryAgain")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Supplier Details - Only show when no error */}
              {!error && supplierData && (
                <div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  style={{ height: "calc(100vh - 300px)" }}
                >
                  {/* Left Side - Supplier Info */}
                  <div className="lg:col-span-2 flex flex-col h-full">
                    <div
                      className="overflow-y-auto pe-3 space-y-6"
                      style={{
                        height: "calc(100vh - 200px)",
                        maxHeight: "calc(100vh - 200px)",
                      }}
                    >
                      {/* Basic Information Card */}
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                              <Building className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                            </div>
                            <div>
                              <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                Supplier Information
                              </h2>
                              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                Basic supplier details
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Supplier Name */}
                          <div className="relative p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-primary))]/10 dark:from-[rgb(var(--color-primary))]/5 dark:to-[rgb(var(--color-primary))]/3 rounded-xl overflow-hidden">
                            <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-[rgb(var(--color-primary))]/35 dark:!text-[rgb(var(--color-primary))] dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Supplier Name
                              </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {supplierData.name || t("common.na")}
                              </p>
                            </div>
                          </div>

                          {/* Phone Number */}
                          <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-xl overflow-hidden">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Phone Number
                              </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {supplierData.phone || t("common.na")}
                              </p>
                            </div>
                          </div>

                          {/* Email Address */}
                          <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-xl overflow-hidden">
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Email Address
                              </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] break-all">
                                {supplierData.email || t("common.na")}
                              </p>
                            </div>
                          </div>

                          {/* Agency */}
                          {supplierData.agency && (
                            <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-xl overflow-hidden">
                              <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  Agency
                                </p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                  {supplierData.agency || t("common.na")}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* GST Number */}
                          {supplierData.gstNumber && (
                            <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-xl overflow-hidden">
                              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  GST Number
                                </p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] font-mono">
                                  {supplierData.gstNumber || t("common.na")}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address Information Card */}
                      {supplierData.address && (
                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                              <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                Address
                              </h2>
                              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                Supplier location details
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {supplierData.address?.addressLine1 && (
                              <div>
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                  Address Line 1
                                </p>
                                <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                  {supplierData.address.addressLine1}
                                </p>
                              </div>
                            )}
                            {supplierData.address?.addressLine2 && (
                              <div>
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                  Address Line 2
                                </p>
                                <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                  {supplierData.address.addressLine2}
                                </p>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {supplierData.address?.city && (
                                <div>
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                    City
                                  </p>
                                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                    {supplierData.address.city}
                                  </p>
                                </div>
                              )}
                              {supplierData.address?.state && (
                                <div>
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                    State
                                  </p>
                                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                    {supplierData.address.state}
                                  </p>
                                </div>
                              )}
                              {supplierData.address?.pincode && (
                                <div>
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                    Pincode
                                  </p>
                                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                    {supplierData.address.pincode}
                                  </p>
                                </div>
                              )}
                              {supplierData.address?.country && (
                                <div>
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                    Country
                                  </p>
                                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                    {supplierData.address.country}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Account Details Card */}
                      {supplierData.account && (
                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                              <Wallet className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                              <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                Account Details
                              </h2>
                              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                Supplier purchase and payment information
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Purchases */}
                            <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-xl overflow-hidden">
                              <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  Total Purchases
                                </p>
                                <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                  ₹
                                  {supplierData.account.totalPurchases?.toLocaleString(
                                    "en-IN",
                                    { maximumFractionDigits: 2 },
                                  ) || "0.00"}
                                </p>
                              </div>
                            </div>

                            {/* Total Paid */}
                            <div className="relative p-4 bg-gradient-to-br from-emerald-50/15 to-emerald-100/10 dark:from-emerald-900/5 dark:to-emerald-800/3 rounded-xl overflow-hidden">
                              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-emerald-500/35 dark:text-emerald-400/40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  Total Paid
                                </p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                  ₹
                                  {supplierData.account.totalPaid?.toLocaleString(
                                    "en-IN",
                                    { maximumFractionDigits: 2 },
                                  ) || "0.00"}
                                </p>
                              </div>
                            </div>

                            {/* Due Amount */}
                            <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-xl overflow-hidden">
                              <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  Due Amount
                                </p>
                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                  ₹
                                  {supplierData.account.dueAmount?.toLocaleString(
                                    "en-IN",
                                    { maximumFractionDigits: 2 },
                                  ) || "0.00"}
                                </p>
                              </div>
                            </div>

                            {/* Total Bills */}
                            <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-xl overflow-hidden">
                              <Receipt
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-purple-500/35 dark:!text-purple-400"
                                style={{ opacity: "0.4" }}
                              />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                  Total Bills
                                </p>
                                <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                  {supplierData.account.totalBills || 0}
                                </p>
                              </div>
                            </div>

                            {/* Credit Limit */}
                            {supplierData.account.creditLimit !== undefined && (
                              <div className="relative p-4 bg-gradient-to-br from-indigo-50/15 to-indigo-100/10 dark:from-indigo-900/5 dark:to-indigo-800/3 rounded-xl overflow-hidden">
                                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-indigo-500/35 dark:!text-indigo-400 dark:opacity-40" />
                                <div className="relative z-10">
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                    Credit Limit
                                  </p>
                                  <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                    ₹
                                    {supplierData.account.creditLimit?.toLocaleString(
                                      "en-IN",
                                      { maximumFractionDigits: 2 },
                                    ) || "0.00"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Available Credit */}
                            {supplierData.account.availableCredit !==
                              undefined && (
                              <div className="relative p-4 bg-gradient-to-br from-teal-50/15 to-teal-100/10 dark:from-teal-900/5 dark:to-teal-800/3 rounded-xl overflow-hidden">
                                <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-teal-500/35 dark:!text-teal-400 dark:opacity-40" />
                                <div className="relative z-10">
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                    Available Credit
                                  </p>
                                  <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                    ₹
                                    {supplierData.account.availableCredit?.toLocaleString(
                                      "en-IN",
                                      { maximumFractionDigits: 2 },
                                    ) || "0.00"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Account Status */}
                            {supplierData.account.accountStatus && (
                              <div className="relative p-4 bg-gradient-to-br from-gray-50/15 to-gray-100/10 dark:from-gray-900/5 dark:to-gray-800/3 rounded-xl overflow-hidden">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center">
                                  <div
                                    className={`w-8 h-8 rounded-full ${supplierData.account.accountStatus === "ACTIVE" ? "bg-green-500/35 dark:!bg-green-400 dark:opacity-40" : supplierData.account.accountStatus === "BLOCKED" ? "bg-red-500/35 dark:!bg-red-400 dark:opacity-40" : "bg-gray-500/35 dark:!bg-gray-400 dark:opacity-40"}`}
                                  ></div>
                                </div>
                                <div className="relative z-10">
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                    Account Status
                                  </p>
                                  <p
                                    className={`text-lg font-bold ${supplierData.account.accountStatus === "ACTIVE" ? "text-green-600 dark:text-green-400" : supplierData.account.accountStatus === "BLOCKED" ? "text-red-600 dark:text-red-400" : "text-[rgb(var(--color-text-primary))]"}`}
                                  >
                                    {supplierData.account.accountStatus ||
                                      "ACTIVE"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* On-Time Payment Rate */}
                            {supplierData.account.onTimePaymentRate !==
                              undefined && (
                              <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-xl overflow-hidden">
                                <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                                <div className="relative z-10">
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                    On-Time Payment
                                  </p>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {supplierData.account.onTimePaymentRate ||
                                      0}
                                    %
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Additional Account Info */}
                          {(supplierData.account.creditUtilized !== undefined ||
                            supplierData.account.paymentTerms ||
                            supplierData.account.riskLevel ||
                            supplierData.account.lastPaymentDate ||
                            supplierData.account.lastPaymentAmount !==
                              undefined ||
                            supplierData.account.averagePaymentDays !==
                              undefined ||
                            supplierData.account.totalTransactions !==
                              undefined ||
                            supplierData.account.averageTransactionValue !==
                              undefined ||
                            supplierData.account.riskScore !== undefined ||
                            supplierData.account.totalOrders !== undefined ||
                            supplierData.account.paidBills !== undefined ||
                            supplierData.account.pendingBills !==
                              undefined) && (
                            <div className="mt-6 pt-6 border-t border-[rgb(var(--color-border-primary))]">
                              <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-4">
                                Additional Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {supplierData.account.creditUtilized !==
                                  undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Credit Utilized
                                    </p>
                                    <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                      ₹
                                      {supplierData.account.creditUtilized?.toLocaleString(
                                        "en-IN",
                                        { maximumFractionDigits: 2 },
                                      ) || "0.00"}
                                    </p>
                                  </div>
                                )}
                                {supplierData.account.paymentTerms && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Payment Terms
                                    </p>
                                    <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                      {supplierData.account.paymentTerms?.replace(
                                        "_",
                                        " ",
                                      ) || t("common.na")}
                                    </p>
                                  </div>
                                )}
                                {supplierData.account.riskLevel && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Risk Level
                                    </p>
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        supplierData.account.riskLevel === "LOW"
                                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                                          : supplierData.account.riskLevel ===
                                              "MEDIUM"
                                            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20"
                                            : supplierData.account.riskLevel ===
                                                "HIGH"
                                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                      }`}
                                    >
                                      {supplierData.account.riskLevel}
                                    </span>
                                  </div>
                                )}
                                {supplierData.account.riskScore !==
                                  undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Risk Score
                                    </p>
                                    <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                      {supplierData.account.riskScore || 0}/100
                                    </p>
                                  </div>
                                )}
                                {supplierData.account.lastPaymentDate && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Last Payment Date
                                    </p>
                                    <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                      {moment(
                                        supplierData.account.lastPaymentDate,
                                      ).format("DD MMM YYYY")}
                                    </p>
                                  </div>
                                )}
                                {supplierData.account.lastPaymentAmount !==
                                  undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Last Payment Amount
                                    </p>
                                    <p className="text-base font-semibold text-green-600 dark:text-green-400">
                                      ₹
                                      {supplierData.account.lastPaymentAmount?.toLocaleString(
                                        "en-IN",
                                        { maximumFractionDigits: 2 },
                                      ) || "0.00"}
                                    </p>
                                  </div>
                                )}
                                {supplierData.account.averagePaymentDays !==
                                  undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Avg Payment Days
                                    </p>
                                    <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                      {supplierData.account
                                        .averagePaymentDays || 0}{" "}
                                      days
                                    </p>
                                  </div>
                                )}
                                {supplierData.account.totalTransactions !==
                                  undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Total Transactions
                                    </p>
                                    <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                      {supplierData.account.totalTransactions ||
                                        0}
                                    </p>
                                  </div>
                                )}
                                {supplierData.account
                                  .averageTransactionValue !== undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Avg Transaction Value
                                    </p>
                                    <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                      ₹
                                      {supplierData.account.averageTransactionValue?.toLocaleString(
                                        "en-IN",
                                        { maximumFractionDigits: 2 },
                                      ) || "0.00"}
                                    </p>
                                  </div>
                                )}
                                {supplierData.account.totalOrders !==
                                  undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Total Orders
                                    </p>
                                    <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                      {supplierData.account.totalOrders || 0}
                                    </p>
                                  </div>
                                )}
                                {supplierData.account.paidBills !==
                                  undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Paid Bills
                                    </p>
                                    <p className="text-base font-semibold text-green-600 dark:text-green-400">
                                      {supplierData.account.paidBills || 0}
                                    </p>
                                  </div>
                                )}
                                {supplierData.account.pendingBills !==
                                  undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">
                                      Pending Bills
                                    </p>
                                    <p className="text-base font-semibold text-orange-600 dark:text-orange-400">
                                      {supplierData.account.pendingBills || 0}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
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
                            <Building className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                              Quick Actions
                            </h3>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                              Manage this supplier
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleEditSupplier}
                            leftIcon={Edit}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="danger"
                            className="flex-1"
                            onClick={handleDeleteSupplier}
                            leftIcon={Trash2}
                          >
                            Delete
                          </Button>

                          <Button
                            variant="outline"
                            className="flex-1"
                            leftIcon={Download}
                            onClick={() => handleDownloadPDF(supplierData)}
                            disabled={fetching || !supplierData}
                          >
                            <span className="hidden sm:inline">Download</span>
                            <span className="sm:hidden">Download</span>
                          </Button>
                        </div>

                        {/* Supplier Stats */}
                        <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                            Quick Stats
                          </h4>
                          <div className="space-y-2 text-sm">
                            {supplierData.account ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-[rgb(var(--color-text-secondary))]">
                                    Total Bills:
                                  </span>
                                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    {supplierData.account.totalBills || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[rgb(var(--color-text-secondary))]">
                                    Total Purchases:
                                  </span>
                                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    ₹
                                    {supplierData.account.totalPurchases?.toLocaleString(
                                      "en-IN",
                                      { maximumFractionDigits: 2 },
                                    ) || "0.00"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[rgb(var(--color-text-secondary))]">
                                    Total Due:
                                  </span>
                                  <span
                                    className={`font-medium ${supplierData.account.dueAmount > 0 ? "text-orange-500" : "text-[rgb(var(--color-text-primary))]"}`}
                                  >
                                    ₹
                                    {supplierData.account.dueAmount?.toLocaleString(
                                      "en-IN",
                                      { maximumFractionDigits: 2 },
                                    ) || "0.00"}
                                  </span>
                                </div>
                                {supplierData.account.onTimePaymentRate !==
                                  undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-[rgb(var(--color-text-secondary))]">
                                      On-Time Payment:
                                    </span>
                                    <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                      {supplierData.account.onTimePaymentRate ||
                                        0}
                                      %
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-[rgb(var(--color-text-secondary))]">
                                    Total Orders:
                                  </span>
                                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    0
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[rgb(var(--color-text-secondary))]">
                                    Total Purchases:
                                  </span>
                                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    ₹0
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[rgb(var(--color-text-secondary))]">
                                    Last Order:
                                  </span>
                                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                    Never
                                  </span>
                                </div>
                              </>
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              Delete Supplier
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Are you sure you want to delete "
              {supplierData?.name || "Supplier"}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                loading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                {t("modals.deletedSuccessfully", {
                  item: t("common.supplier"),
                })}
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                {t("common.hasBeenRemovedFromList", {
                  name: deletedSupplierName,
                  item: t("common.suppliers"),
                })}
              </p>
              <Button variant="primary" onClick={handleDeleteSuccess}>
                Back to Suppliers
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewSupplierPage;
