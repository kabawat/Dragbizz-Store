"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CustomerDetailsTemplate from "@/components/templates/customer/CustomerDetailsTemplate";
import CustomerViewHeader from "@/components/customer/view/CustomerViewHeader";
import CustomerViewLayout from "@/components/customer/view/CustomerViewLayout";
import ErrorState from "@/components/customer/view/components/ErrorState";
import LoadingState from "@/components/customer/view/components/LoadingState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { customerService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useCustomerDetailsPrint } from "./hooks/useCustomerDetailsPrint";
import useApiResponse from "@/hooks/useApiResponse";
import { SideDrawer } from "@/components/ui";
import { EditCustomer } from "@/components/customer";
import { Users } from "lucide-react";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const ViewCustomerPage = ({ customerId }) => {
  const { t } = useTranslation();

  useDashboardHeader(t("customers.viewCustomer"), t("customers.viewCustomerDescription"));
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const customerPerm = useModulePermissions("customer");
  const canEdit = customerPerm.edit;

  const { execute, data: customerData, error: hookError, loading } = useApiResponse();
  const [error, setError] = useState(null);
  const fetchedCustomerRef = useRef(null);

  // Edit drawer state
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const { handleDownloadPDF } = useCustomerDetailsPrint(loading || (!customerData && !error), customerData);

  // Sync natively
  useEffect(() => {
    if (hookError) setError(hookError);
  }, [hookError]);

  const fetchCustomerData = () => {
    if (!customerId || !storeId) return;
    execute(
      customerService.getCustomers({ id: customerId, store: storeId }),
      { showToast: false }
    );
  };

  useEffect(() => {
    if (customerId && storeId && fetchedCustomerRef.current !== customerId) {
      fetchedCustomerRef.current = customerId;
      fetchCustomerData();
    }
  }, [customerId, storeId, execute]);

  const handleEditSuccess = (updatedData) => {
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

  if (loading && !customerData) return <LoadingState />;

  return (
    <div className="overflow-hidden">
      <div className="w-full">
        <CustomerViewHeader t={t} />

        <div className="px-5">
          {error && <ErrorState error={error} />}

          {!error && customerData && (
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
                onEdit={canEdit ? () => setIsEditDrawerOpen(true) : undefined}
                onDownloadPDF={handleDownloadPDF}
                onKhataSuccess={fetchCustomerData}
                t={t}
              />
            </div>
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
