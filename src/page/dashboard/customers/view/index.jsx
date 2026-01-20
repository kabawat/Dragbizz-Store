"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { useTranslation } from "@/hooks/useTranslation";
import { customerService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import AccountDetails from "./components/AccountDetails";
import Addresses from "./components/Addresses";
import CompanyDetails from "./components/CompanyDetails";
import CustomerActions from "./components/CustomerActions";
import CustomerBasicInfo from "./components/CustomerBasicInfo";
import DeleteModal from "./components/DeleteModal";
import DeleteSuccessModal from "./components/DeleteSuccessModal";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";

const ViewCustomerPage = ({ customerId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId =
    selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedCustomerName, setDeletedCustomerName] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const result = await customerService.getCustomers({
          id: customerId,
          store: storeId,
        });
        if (result.success && result.data) {
          setCustomerData(result.data);
        } else {
          setError(
            result.message ||
              t("errors.failedToFetchData", { item: t("common.customer") })
          );
        }
      } catch (_error) {
        setError(
          t("errors.failedToFetchDataTryAgain", { item: t("common.customer") })
        );
      } finally {
        setFetching(false);
      }
    };

    fetchCustomerData();
  }, [customerId, storeId, t]);

  const handleEditCustomer = () => {
    router.push(`/dashboard/customers/edit/${customerId}`);
  };

  const handleDeleteCustomer = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await customerService.deleteCustomer(customerId, storeId);

      if (result.success) {
        setDeletedCustomerName(customerData?.name || "Customer");
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        setError(
          result.message ||
            t("errors.failedToDelete", { item: t("common.customer") })
        );
        setShowDeleteModal(false);
      }
    } catch (_error) {
      setError(
        t("errors.failedToDeleteTryAgain", { item: t("common.customer") })
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
    router.push("/dashboard/customers");
  };

  if (fetching) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <Sidebar />
      <div className="min-h-screen w-full flex flex-col">
        <Header
          title={t("customers.viewCustomer")}
          description={t("customers.viewCustomerDescription")}
        />
        <div className="flex-1 p-6">
          <div className="">
            <div className="mb-6">
              <Link
                href="/dashboard/customers"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("common.backTo", { item: t("common.customers") })}
                </span>
              </Link>
            </div>

            {error && <ErrorState error={error} />}

            {!error && customerData && (
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
                    <CustomerBasicInfo customerData={customerData} />

                    <CompanyDetails
                      companyDetails={customerData.companyDetails}
                    />

                    <AccountDetails account={customerData.account} />

                    <Addresses addresses={customerData.addresses} />
                  </div>
                </div>

                <CustomerActions
                  customerData={customerData}
                  onEdit={handleEditCustomer}
                  onDelete={handleDeleteCustomer}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        customerName={customerData?.name}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <DeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        customerName={deletedCustomerName}
        onClose={handleDeleteSuccess}
      />
    </div>
  );
};

export default ViewCustomerPage;
