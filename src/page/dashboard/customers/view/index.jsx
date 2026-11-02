"use client";
import { Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditCustomer } from "@/components/customer";
import CustomerViewHeader from "@/components/customer/view/CustomerViewHeader";
import CustomerViewLayout from "@/components/customer/view/CustomerViewLayout";
import ErrorState from "@/components/customer/view/components/ErrorState";
import LoadingState from "@/components/customer/view/components/LoadingState";
import CustomerDetailsTemplate from "@/components/templates/customer/CustomerDetailsTemplate";
import { SideDrawer } from "@/components/ui";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { customerService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useCustomerDetailsPrint } from "./hooks/useCustomerDetailsPrint";

const ViewCustomerPage = ({ customerId }) => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("customers.viewCustomer"),
    t("customers.viewCustomerDescription")
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [activeTab, setActiveTab] = useState("details");

  const customerPerm = useModulePermissions("customer");
  const canEdit = customerPerm.edit;

  const { execute, data: customerData, error, loading } = useApiResponse();
  const fetchedCustomerRef = useRef(null);

  // Edit drawer state
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const { handleDownloadPDF } = useCustomerDetailsPrint(
    loading || (!customerData && !error),
    customerData
  );

  useEffect(() => {
    setActiveTab(searchParams.get("tab") === "khata" ? "khata" : "details");
  }, [searchParams]);

  const fetchCustomerData = useCallback(() => {
    if (!customerId || !storeId) return;
    execute(customerService.getCustomers({ id: customerId, store: storeId }), {
      showToast: false,
    });
  }, [customerId, storeId, execute]);

  useEffect(() => {
    if (customerId && storeId && fetchedCustomerRef.current !== customerId) {
      fetchedCustomerRef.current = customerId;
      fetchCustomerData();
    }
  }, [customerId, storeId, fetchCustomerData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const href =
      tab === "khata"
        ? `/dashboard/customers/${customerId}?tab=khata`
        : `/dashboard/customers/${customerId}`;
    router.replace(href);
  };

  const handleEditSuccess = (_updatedData) => {
    setIsEditDrawerOpen(false);
    fetchCustomerData(); // Refetch customer data directly after edit
  };

  // Page-level Shortcuts
  useCommonHotkeys({
    onEdit: canEdit ? () => setIsEditDrawerOpen(true) : undefined,
    onDownload: () => handleDownloadPDF(customerData),
    onBack: () => router.push("/dashboard/customers"),
    onClose: () => setIsEditDrawerOpen(false),
  });

  if (loading || (!customerData && !error)) return <LoadingState />;

  return (
    <div className="min-h-full pb-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CustomerViewHeader
          t={t}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showTabs={!error && !!customerData}
        />

        <div>
          {error ? (
            <ErrorState error={error} />
          ) : (
            customerData && (
              <div>
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
                  activeTab={activeTab}
                  onEdit={canEdit ? () => setIsEditDrawerOpen(true) : undefined}
                  onDownloadPDF={handleDownloadPDF}
                  onKhataSuccess={fetchCustomerData}
                />
              </div>
            )
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
