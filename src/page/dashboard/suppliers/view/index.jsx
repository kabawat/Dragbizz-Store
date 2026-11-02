"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditSupplierDrawer } from "@/components/supplier";
import SupplierViewHeader from "@/components/supplier/view/SupplierViewHeader";
import SupplierDetailsTemplate from "@/components/templates/supplier/SupplierDetailsTemplate";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";
import { useSupplierDetailsPrint } from "./hooks/useSupplierDetailsPrint";
import SupplierViewLayout from "./SupplierViewLayout";

const ViewSupplierPage = ({ supplierId }) => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("suppliers.viewSupplier"),
    t("suppliers.viewSupplierDescription")
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const { can } = useModulePermissions("supplier");
  const canEdit = can("edit");

  const {
    execute: executeFetch,
    data: supplierData,
    loading: fetching,
    error,
  } = useApiResponse();
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const fetchedSupplierRef = useRef(null);

  const { handleDownloadPDF } = useSupplierDetailsPrint(fetching, supplierData);

  useCommonHotkeys({
    onEdit: canEdit ? () => setShowEditDrawer(true) : undefined,
    onBack: () => router.push("/dashboard/suppliers"),
    onClose: () => setShowEditDrawer(false),
    onPrint: () => handleDownloadPDF(),
  });

  const fetchSupplierData = useCallback(() => {
    if (!supplierId || !storeId) return;
    executeFetch(
      supplierService.getSuppliers({ id: supplierId, store: storeId }),
      { showToast: false }
    );
  }, [supplierId, storeId, executeFetch]);

  useEffect(() => {
    if (supplierId && storeId && fetchedSupplierRef.current !== supplierId) {
      fetchedSupplierRef.current = supplierId;
      fetchSupplierData();
    }
  }, [supplierId, storeId, fetchSupplierData]);

  const handleEditSuccess = () => {
    setShowEditDrawer(false);
    fetchSupplierData();
  };

  if (fetching || (!supplierData && !error)) return <LoadingState />;

  return (
    <div className="overflow-hidden">
      <div className="w-full">
        <SupplierViewHeader t={t} />

        <div className="px-5">
          {error && <ErrorState error={error} />}

          {!error && supplierData && (
            <div>
              <div id="customer-details-report-area" className="hidden">
                <SupplierDetailsTemplate
                  supplierData={supplierData}
                  selectedStore={selectedStore}
                />
              </div>

              <SupplierViewLayout
                supplierData={supplierData}
                supplierId={supplierId}
                storeId={storeId}
                onEdit={canEdit ? () => setShowEditDrawer(true) : undefined}
                onDownloadPDF={handleDownloadPDF}
                fetching={fetching}
                t={t}
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Customer Drawer */}
      <EditSupplierDrawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        supplierId={supplierId}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default ViewSupplierPage;
