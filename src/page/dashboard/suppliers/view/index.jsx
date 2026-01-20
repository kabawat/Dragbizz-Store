"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useAnalyticsReportPrint } from "@/hooks/useAnalyticsReportPrint";
import SupplierDetailsTemplate from "@/components/templates/supplier/SupplierDetailsTemplate";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import SupplierBasicInfo from "./components/SupplierBasicInfo";
import SupplierAddress from "./components/SupplierAddress";
import SupplierAccountDetails from "./components/SupplierAccountDetails";
import SupplierActions from "./components/SupplierActions";
import DeleteModal from "./components/DeleteModal";
import DeleteSuccessModal from "./components/DeleteSuccessModal";

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
  }, [supplierId, storeId, t]);

  const handleEditSupplier = () => {
    router.push(`/dashboard/suppliers/edit/${supplierId}`);
  };

  const handleDeleteSupplier = () => {
    setShowDeleteModal(true);
  };

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

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteSuccessModal(false);
    router.push("/dashboard/suppliers");
  };

  if (fetching) {
    return <LoadingState />;
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
          <div className="flex-1 p-6">
            <div className="">
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

              {error && <ErrorState error={error} />}

              {!error && supplierData && (
                <div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  style={{ height: "calc(100vh - 300px)" }}
                >
                  <div className="lg:col-span-2 flex flex-col h-full">
                    <div
                      className="overflow-y-auto pe-3 space-y-6"
                      style={{
                        height: "calc(100vh - 200px)",
                        maxHeight: "calc(100vh - 200px)",
                      }}
                    >
                      <SupplierBasicInfo supplierData={supplierData} />

                      <SupplierAddress address={supplierData.address} />

                      <SupplierAccountDetails account={supplierData.account} />
                    </div>
                  </div>

                  <SupplierActions
                    supplierData={supplierData}
                    onEdit={handleEditSupplier}
                    onDelete={handleDeleteSupplier}
                    onDownload={handleDownloadPDF}
                    fetching={fetching}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        supplierName={supplierData?.name}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <DeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        supplierName={deletedSupplierName}
        onClose={handleDeleteSuccess}
      />
    </>
  );
};

export default ViewSupplierPage;
