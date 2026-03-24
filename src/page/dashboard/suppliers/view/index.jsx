"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useApiResponse from "@/hooks/useApiResponse";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import SupplierDetailsTemplate from "@/components/templates/supplier/SupplierDetailsTemplate";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useSupplierDetailsPrint } from "./hooks/useSupplierDetailsPrint";
import DeleteModal from "./components/DeleteModal";
import DeleteSuccessModal from "./components/DeleteSuccessModal";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";
import SupplierAccountDetails from "./components/SupplierAccountDetails";
import SupplierActions from "./components/SupplierActions";
import SupplierAddress from "./components/SupplierAddress";
import SupplierBasicInfo from "./components/SupplierBasicInfo";
import { EditSupplierDrawer } from "@/components/supplier";

const ViewSupplierPage = ({ supplierId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [error, setError] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedSupplierName, setDeletedSupplierName] = useState("");
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const hasFetched = useRef(false);

  const { execute: executeFetch, loading: fetching } = useApiResponse();
  const { execute: executeDelete, loading: isDeleting } = useApiResponse();

  const { handleDownloadPDF } = useSupplierDetailsPrint(
    fetching,
    supplierData
  );

  useCommonHotkeys({
    onEdit: () => setShowEditDrawer(true),
    onDelete: () => setShowDeleteModal(true),
    onBack: () => router.push("/dashboard/suppliers"),
    onClose: () => {
      if (showEditDrawer) setShowEditDrawer(false);
      if (showDeleteModal) setShowDeleteModal(false);
      if (showDeleteSuccessModal) setShowDeleteSuccessModal(false);
    },
    onPrint: () => handleDownloadPDF(),
  });

  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!supplierId || !storeId || hasFetched.current) return;
      hasFetched.current = true;

      const result = await executeFetch(
        supplierService.getSuppliers({ id: supplierId, store: storeId }),
        { showToast: false }
      );

      if (result?.success && result?.data) {
        setSupplierData(result.data);
      } else {
        setError(
          result?.message ||
          t("errors.failedToFetchData", { item: t("common.supplier") })
        );
      }
    };

    fetchSupplierData();
  }, [supplierId, storeId, t, executeFetch]);

  const handleEditSupplier = () => {
    setShowEditDrawer(true);
  };

  const handleEditSuccess = (updatedData) => {
    setSupplierData(updatedData);
  };

  const handleDeleteSupplier = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierId || !storeId) return;

    const result = await executeDelete(
      supplierService.deleteSupplier(supplierId, storeId),
      { message: t("suppliers.deleteSuccess") }
    );

    if (result?.success) {
      setDeletedSupplierName(supplierData?.name || t("common.supplier"));
      setShowDeleteSuccessModal(true);
      setShowDeleteModal(false);
    } else {
      setError(
        result?.message ||
        t("errors.failedToDelete", { item: t("common.supplier") })
      );
      setShowDeleteModal(false);
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
      <div
        id="supplier-details-report-area"
        className="hidden"
        data-variant="light"
        data-theme="default"
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

      <EditSupplierDrawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        supplierId={supplierId}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default ViewSupplierPage;
