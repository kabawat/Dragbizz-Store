"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppSelector } from "@/store/hooks";
import { supplierService } from "@/service";
import useApiResponse from "@/hooks/useApiResponse";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

import SupplierViewHeader from "@/components/supplier/view/SupplierViewHeader";
import SupplierViewLayout from "./SupplierViewLayout";
import SupplierDetailsTemplate from "@/components/templates/supplier/SupplierDetailsTemplate";
import { useSupplierDetailsPrint } from "./hooks/useSupplierDetailsPrint";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";
import { EditSupplierDrawer } from "@/components/supplier";

const ViewSupplierPage = ({ supplierId }) => {
  const { t } = useTranslation();

  useDashboardHeader(t("suppliers.viewSupplier"), t("suppliers.viewSupplierDescription"));
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const { can } = useModulePermissions("supplier");
  const canEdit = can("edit");

  const [error, setError] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const hasFetched = useRef(false);

  const { execute: executeFetch, loading: fetching } = useApiResponse();

  const { handleDownloadPDF } = useSupplierDetailsPrint(
    fetching,
    supplierData
  );

  useCommonHotkeys({
    onEdit: canEdit ? () => setShowEditDrawer(true) : undefined,
    onBack: () => router.push("/dashboard/suppliers"),
    onClose: () => setShowEditDrawer(false),
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

  const handleEditSuccess = (updatedData) => {
    setSupplierData(updatedData);
  };

  if (fetching && !supplierData) return <LoadingState />;


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
  )
};

export default ViewSupplierPage;
