"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import CustomerDetailsTemplate from "@/components/templates/customer/CustomerDetailsTemplate";
import CustomerViewHeader from "@/components/customer/view/CustomerViewHeader";
import CustomerViewLayout from "@/components/customer/view/CustomerViewLayout";
import ErrorState from "@/components/customer/view/components/ErrorState";
import LoadingState from "@/components/customer/view/components/LoadingState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { customerService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useCustomerDetailsPrint } from "./hooks/useCustomerDetailsPrint";
import useApiResponse from "@/hooks/useApiResponse";
import { SideDrawer } from "@/components/ui";
import { EditCustomer } from "@/components/customer";
import { Users } from "lucide-react";

const ViewCustomerPage = ({ customerId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const { execute, data: customerData, loading } = useApiResponse();
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // Edit drawer state
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const { handleDownloadPDF } = useCustomerDetailsPrint(loading || (!customerData && !error), customerData);

  const fetchCustomerData = async (forceRefetch = false) => {
    if (!customerId || !storeId) return;
    if (!forceRefetch && hasFetched.current) return;
    hasFetched.current = true;

    const result = await execute(
      customerService.getCustomers({ id: customerId, store: storeId }),
      { showToast: false }
    );

    if (!result?.success) {
      setError(result?.message || t("errors.failedToFetchData", { item: t("common.customer") }));
    }
  };

  useEffect(() => {
    fetchCustomerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, storeId, t]);

  const handleEditSuccess = (updatedData) => {
    setIsEditDrawerOpen(false);
    fetchCustomerData(true); // Refetch customer data after edit
  };

  // Page-level Shortcuts
  useCommonHotkeys({
    onEdit: () => setIsEditDrawerOpen(true),
    onDownload: () => handleDownloadPDF(customerData),
    onBack: () => router.push("/dashboard/customers"),
    onClose: () => setIsEditDrawerOpen(false),
  });

  if (loading && !customerData) return <LoadingState />;

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <Sidebar />
      <div className="min-h-screen w-full flex flex-col">
        <Header
          title={t("customers.viewCustomer")}
          description={t("customers.viewCustomerDescription")}
        />
        <div className="flex-1 p-6">
          <CustomerViewHeader t={t} />

          {error && <ErrorState error={error} />}

          {!error && customerData && (
            <>
              <div id="customer-details-report-area" className="hidden">
                <CustomerDetailsTemplate
                  customerData={customerData}
                  selectedStore={selectedStore}
                />
              </div>

              <CustomerViewLayout
                customerData={customerData}
                customerId={customerId}
                storeId={storeId}
                onEdit={() => setIsEditDrawerOpen(true)}
                onDownloadPDF={handleDownloadPDF}
                t={t}
              />
            </>
          )}
        </div>
      </div>

      {/* Edit Customer Drawer */}
      <SideDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={t("customers.editCustomer") || "Edit Customer"}
        icon={Users}
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-6 h-full">
          {isEditDrawerOpen && (
            <EditCustomer
              customerId={customerId}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditDrawerOpen(false)}
              showCancelButton={true}
              mode="drawer"
            />
          )}
        </div>
      </SideDrawer>
    </div>
  );
};

export default ViewCustomerPage;
