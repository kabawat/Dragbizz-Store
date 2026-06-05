"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BillDetailsTemplate from "@/components/templates/bill/BillDetailsTemplate";
import { billService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDate, formatDateTime } from "@/utils/dateFormatter";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import BillActions from "./components/BillActions";
import BillBatches from "./components/BillBatches";
import BillHeader from "./components/BillHeader";
import BillItemsTable from "./components/BillItemsTable";
import BillNotes from "./components/BillNotes";
import BillSupplierInfo from "./components/BillSupplierInfo";
import DeleteModal from "./components/DeleteModal";
import DeleteSuccessModal from "./components/DeleteSuccessModal";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";
import { useBillDetailsPrint } from "./hooks/useBillDetailsPrint";

const ViewBillPage = ({ billId }) => {
  const { t } = useTranslation();

    useDashboardHeader(t("bills.viewBill"), t("bills.viewBillDescription"));
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const { can } = useModulePermissions("billing");
  const canEdit = can("edit");
  const canDelete = can("delete");
  const canRead = can("read");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedBillNumber, setDeletedBillNumber] = useState("");
  const fetchedBillRef = useRef(null);

  const { execute: executeFetch, data: billData, loading: fetching, error: activeError } = useApiResponse();
  const { execute: executeDelete, loading: isDeleting } = useApiResponse();

  const { handleDownloadPDF } = useBillDetailsPrint(fetching, billData);

  useEffect(() => {
    if (billId && storeId && fetchedBillRef.current !== billId) {
      fetchedBillRef.current = billId;
      executeFetch(
        billService.getBills({ store: storeId, id: billId }),
        { showToast: false }
      );
    }
  }, [billId, storeId, executeFetch]);

  const handleEditBill = () => {
    router.push(`/dashboard/bills/${billId}/edit`);
  };

  const handleDeleteBill = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!billId || !storeId) return;

    const result = await executeDelete(
      billService.deleteBill(billId, storeId),
      { message: billData?.billNumber ? `${billData.billNumber} deleted successfully` : "Bill deleted successfully" }
    );

    if (result?.success) {
      setDeletedBillNumber(billData?.billNumber || "Bill");
      setShowDeleteSuccessModal(true);
      setShowDeleteModal(false);
    } else {
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteSuccessModal(false);
    router.push("/dashboard/bills");
  };

  if (fetching) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      
      <div className="h-screen w-full flex flex-col overflow-hidden">
        
        <div className="flex-1 p-6 overflow-hidden">
          <div className="">
            <div className="mb-6">
              <Link
                href="/dashboard/bills"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t("bills.backToBills", { defaultValue: "Back to Bills" })}</span>
              </Link>
            </div>

            {activeError && <ErrorState error={activeError} />}

            {!activeError && billData && (
              <>
                <div
                  id="bill-details-report-area"
                  className="hidden"
                  data-variant="light"
                  data-theme="default"
                >
                  <BillDetailsTemplate
                    billData={billData}
                    selectedStore={selectedStore}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ height: "calc(100vh - 184px)" }}>
                  <div className="lg:col-span-2 flex flex-col overflow-y-auto pe-4 space-y-5 custom-scrollbar">
                    {/* Main Bill Sheet (Document Style) */}
                    <div className="bg-white dark:bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]/60">
                      <BillHeader billData={billData} formatDate={formatDate} />
                      <div className="w-full">
                        <BillSupplierInfo supplier={billData.supplier} />
                      </div>
                    </div>

                    <div className="w-full">
                      <BillItemsTable
                        items={billData.items}
                        itemsSummary={{
                          ...billData.itemsSummary,
                          subtotal: billData.subtotal,
                          gstAmount: billData.gstAmount,
                          totalValue: billData.totalAmount
                        }}
                        gstBreakdown={billData.gstBreakdown}
                        formatCurrency={formatCurrency}
                      />
                    </div>

                    <BillBatches
                      batches={billData.batches}
                      formatCurrency={formatCurrency}
                    />

                    <BillNotes notes={billData.notes} />
                  </div>

                  <div className="lg:col-span-1 h-full overflow-y-auto px-1">
                    <BillActions
                      billData={billData}
                      onEditBill={canEdit ? handleEditBill : undefined}
                      onDeleteBill={canDelete ? handleDeleteBill : undefined}
                      onDownloadPDF={canRead ? handleDownloadPDF : undefined}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      formatDateTime={formatDateTime}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        billNumber={billData?.billNumber}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <DeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        billNumber={deletedBillNumber}
        onClose={handleDeleteSuccess}
      />
    </div>
  );
};

export default ViewBillPage;
