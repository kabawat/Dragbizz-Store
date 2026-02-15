"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import BillDetailsTemplate from "@/components/templates/bill/BillDetailsTemplate";
import { billService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDate, formatDateTime } from "@/utils/dateFormatter";
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
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId =
    selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [billData, setBillData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedBillNumber, setDeletedBillNumber] = useState("");
  const hasFetched = useRef(false);

  const { handleDownloadPDF } = useBillDetailsPrint(fetching, billData);

  useEffect(() => {
    const fetchBillData = async () => {
      if (!billId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const params = {
          store: storeId,
          id: billId,
        };
        const result = await billService.getBills(params);

        if (result.success && result.data) {
          setBillData(result.data);
        } else {
          setError(result.message || "Failed to fetch bill data");
        }
      } catch (_error) {
        setError("Failed to fetch bill data. Please try again.");
      } finally {
        setFetching(false);
      }
    };

    fetchBillData();
  }, [billId, storeId]);

  const handleEditBill = () => {
    router.push(`/dashboard/bills/${billId}/edit`);
  };

  const handleDeleteBill = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!billId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await billService.deleteBill(billId, storeId);

      if (result.success) {
        setDeletedBillNumber(billData?.billNumber || "Bill");
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        setError(result.message || "Failed to delete bill");
        setShowDeleteModal(false);
      }
    } catch (_error) {
      setError("Failed to delete bill. Please try again.");
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
    router.push("/dashboard/bills");
  };

  if (fetching) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <Sidebar />
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <Header title="View Bill" description="Bill information and details" />
        <div className="flex-1 p-6 overflow-hidden">
          <div className="">
            <div className="mb-6">
              <Link
                href="/dashboard/bills"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Bills</span>
              </Link>
            </div>

            {error && <ErrorState error={error} />}

            {!error && billData && (
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
                      onEditBill={handleEditBill}
                      onDeleteBill={handleDeleteBill}
                      onDownloadPDF={handleDownloadPDF}
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
