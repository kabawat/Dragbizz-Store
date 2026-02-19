"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import CustomerDetailsTemplate from "@/components/templates/customer/CustomerDetailsTemplate";
import CustomerViewHeader from "@/components/customer/view/CustomerViewHeader";
import CustomerViewLayout from "@/components/customer/view/CustomerViewLayout";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";
import { useTranslation } from "@/hooks/useTranslation";
import { useCommonHotkeys } from "@/hooks/useCommonHotkeys";
import { customerService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useCustomerDetailsPrint } from "./hooks/useCustomerDetailsPrint";

const ViewCustomerPage = ({ customerId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const hasFetched = useRef(false);

  const { handleDownloadPDF } = useCustomerDetailsPrint(fetching, customerData);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId || !storeId || hasFetched.current) return;
      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);
        const result = await customerService.getCustomers({ id: customerId, store: storeId });
        if (result.success && result.data) setCustomerData(result.data);
        else setError(result.message || t("errors.failedToFetchData", { item: t("common.customer") }));
      } catch (_error) {
        setError(t("errors.failedToFetchDataTryAgain", { item: t("common.customer") }));
      } finally { setFetching(false); }
    };
    fetchCustomerData();
  }, [customerId, storeId, t]);

  // Page-level Shortcuts
  useCommonHotkeys({
    onEdit: () => router.push(`/dashboard/customers/edit/${customerId}`),
    onDownload: () => handleDownloadPDF(customerData),
    onBack: () => router.push("/dashboard/customers"),
    // onClose is handled in Child Layout for Delete Modal
  });

  if (fetching) return <LoadingState />;

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
                onEdit={() => router.push(`/dashboard/customers/edit/${customerId}`)}
                onDownloadPDF={handleDownloadPDF}
                t={t}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCustomerPage;
